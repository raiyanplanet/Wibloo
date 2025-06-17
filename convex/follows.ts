import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggleFollow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    if (currentUserId === args.userId) throw new Error("Cannot follow yourself");

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUserId).eq("followingId", args.userId)
      )
      .unique();

    const currentUser = await ctx.db.get(currentUserId);
    const targetUser = await ctx.db.get(args.userId);

    if (!currentUser || !targetUser) throw new Error("User not found");

    if (existingFollow) {
      // Unfollow
      await ctx.db.delete(existingFollow._id);
      
      await ctx.db.patch(currentUserId, {
        followingCount: Math.max(0, (currentUser.followingCount || 1) - 1),
      });
      
      await ctx.db.patch(args.userId, {
        followersCount: Math.max(0, (targetUser.followersCount || 1) - 1),
      });
      
      return false;
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: currentUserId,
        followingId: args.userId,
      });
      
      await ctx.db.patch(currentUserId, {
        followingCount: (currentUser.followingCount || 0) + 1,
      });
      
      await ctx.db.patch(args.userId, {
        followersCount: (targetUser.followersCount || 0) + 1,
      });
      
      return true;
    }
  },
});

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    return Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return {
          ...user,
          avatarUrl: user?.avatar ? await ctx.storage.getUrl(user.avatar) : null,
        };
      })
    );
  },
});

export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return {
          ...user,
          avatarUrl: user?.avatar ? await ctx.storage.getUrl(user.avatar) : null,
        };
      })
    );
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) => 
        q.eq("followerId", currentUserId).eq("followingId", args.userId)
      )
      .unique();

    return !!follow;
  },
});
