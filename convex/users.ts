import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      ...user,
      avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
    };
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    if (!user) return null;

    return {
      ...user,
      avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
    };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      ...user,
      avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
    };
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    // Search by username
    const usersByUsername = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => q.search("username", args.query))
      .take(10);

    // Search by name using filter
    const usersByName = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.neq(q.field("name"), undefined),
          q.gte(q.field("name"), args.query.toLowerCase()),
          q.lt(q.field("name"), args.query.toLowerCase() + "\uffff")
        )
      )
      .take(10);

    // Search by email (exact match for privacy)
    const usersByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.query))
      .take(5);

    // Combine and deduplicate results
    const allUsers = [...usersByUsername, ...usersByName, ...usersByEmail];
    const uniqueUsers = allUsers.filter((user, index, self) => 
      index === self.findIndex(u => u._id === user._id)
    );

    return Promise.all(
      uniqueUsers.slice(0, 20).map(async (user) => ({
        ...user,
        avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
      }))
    );
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUserId))
      .take(50);

    return Promise.all(
      users.map(async (user) => ({
        ...user,
        avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
      }))
    );
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.website !== undefined) updates.website = args.website;
    if (args.location !== undefined) updates.location = args.location;
    if (args.avatar !== undefined) updates.avatar = args.avatar;

    await ctx.db.patch(userId, updates);
    return userId;
  },
});

export const getSuggestedUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get users that the current user is not following
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();
    
    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Exclude self

    const allUsers = await ctx.db.query("users").collect();
    const suggestedUsers = allUsers
      .filter(user => !followingIds.includes(user._id))
      .slice(0, 5);

    return Promise.all(
      suggestedUsers.map(async (user) => ({
        ...user,
        avatarUrl: user.avatar ? await ctx.storage.getUrl(user.avatar) : null,
      }))
    );
  },
});
