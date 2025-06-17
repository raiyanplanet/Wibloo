import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      imageId: args.imageId,
      caption: args.caption,
      likesCount: 0,
      commentsCount: 0,
      isPublic: args.isPublic ?? true,
    });

    // Update user's posts count
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        postsCount: (user.postsCount || 0) + 1,
      });
    }

    return postId;
  },
});

export const getFeed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    // Get all public posts for the feed
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(50);

    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        
        let isLiked = false;
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_post_and_user", (q) => 
              q.eq("postId", post._id).eq("userId", userId)
            )
            .unique();
          isLiked = !!like;
        }

        return {
          ...post,
          author: {
            ...author,
            avatarUrl: author?.avatar ? await ctx.storage.getUrl(author.avatar) : null,
          },
          imageUrl,
          isLiked,
        };
      })
    );
  },
});

export const searchPosts = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    const posts = await ctx.db
      .query("posts")
      .withSearchIndex("search_posts", (q) => q.search("caption", args.query))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(20);

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: await ctx.storage.getUrl(post.imageId),
      }))
    );
  },
});

export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: await ctx.storage.getUrl(post.imageId),
      }))
    );
  },
});

export const getMyPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: await ctx.storage.getUrl(post.imageId),
      }))
    );
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    // Delete associated likes and comments
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.postId);

    // Update user's posts count
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        postsCount: Math.max(0, (user.postsCount || 1) - 1),
      });
    }

    return true;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
