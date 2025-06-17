import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    isVerified: v.optional(v.boolean()),
    followersCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    postsCount: v.optional(v.number()),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .searchIndex("search_users", {
      searchField: "username",
      filterFields: ["name"],
    }),

  posts: defineTable({
    authorId: v.id("users"),
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
    likesCount: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  })
    .index("by_author", ["authorId"])
    .searchIndex("search_posts", {
      searchField: "caption",
    }),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_and_user", ["postId", "userId"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    likesCount: v.optional(v.number()),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_and_following", ["followerId", "followingId"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    isRead: v.optional(v.boolean()),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_conversation", ["senderId", "receiverId"]),

  stories: defineTable({
    authorId: v.id("users"),
    imageId: v.id("_storage"),
    expiresAt: v.number(),
    viewsCount: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_expiry", ["expiresAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("like"),
      v.literal("comment"),
      v.literal("follow"),
      v.literal("mention")
    ),
    fromUserId: v.id("users"),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    isRead: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_read_status", ["userId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
