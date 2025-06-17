import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const messageId = await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      content: args.content,
      isRead: false,
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("senderId"), userId),
            q.eq(q.field("receiverId"), args.otherUserId)
          ),
          q.and(
            q.eq(q.field("senderId"), args.otherUserId),
            q.eq(q.field("receiverId"), userId)
          )
        )
      )
      .order("asc")
      .collect();

    return messages.map((message) => ({
      ...message,
      isFromCurrentUser: message.senderId === userId,
    }));
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all messages where user is sender or receiver
    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), userId),
          q.eq(q.field("receiverId"), userId)
        )
      )
      .order("desc")
      .collect();

    // Group by conversation and get the latest message for each
    const conversationMap = new Map();
    
    for (const message of messages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        const otherUser = await ctx.db.get(otherUserId);
        if (otherUser) {
          conversationMap.set(otherUserId, {
            otherUser: {
              ...otherUser,
              avatarUrl: otherUser.avatar ? await ctx.storage.getUrl(otherUser.avatar) : null,
            },
            lastMessage: message.content,
            lastMessageTime: message._creationTime,
          });
        }
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.receiverId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.messageId, { isRead: true });
    return true;
  },
});
