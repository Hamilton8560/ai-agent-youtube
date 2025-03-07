/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// For debugging messages
function sanitizeForLogging(messages: any[]) {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    contentLength: msg.content ? msg.content.length : 0,
    hasParts: !!msg.parts,
    partsCount: msg.parts ? msg.parts.length : 0,
  }));
}

// Get chat messages for a video
export const getChatByVideo = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting chat for video:", args);

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();

    if (chat) {
      console.log(
        `Chat found for video ${args.videoId} with ${chat.messages.length} messages`
      );
    } else {
      console.log(`No chat found for video ${args.videoId}`);
    }

    return chat;
  },
});

// Store a new message or update existing chat
export const storeMessages = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(),
        content: v.optional(v.string()),
        createdAt: v.number(),
        parts: v.optional(
          v.array(
            v.union(
              v.object({
                type: v.literal("text"),
                text: v.string(),
              }),
              v.object({
                type: v.literal("tool-invocation"),
                toolInvocation: v.object({
                  toolCallId: v.string(),
                  toolName: v.string(),
                  result: v.optional(v.any()),
                }),
              })
            )
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const sanitizedMessages = sanitizeForLogging(args.messages);
    console.log("Storing messages:", {
      videoId: args.videoId,
      userId: args.userId,
      messageCount: args.messages.length,
      messages: sanitizedMessages,
    });

    if (args.messages.length === 0) {
      console.error("Attempted to store empty messages array");
      throw new Error("Cannot store empty messages array");
    }

    // Validate that all messages have numerical timestamps
    for (const message of args.messages) {
      if (typeof message.createdAt !== "number") {
        console.error(
          "Message has non-numeric createdAt:",
          message.id,
          message.createdAt
        );
        throw new Error(
          `Message ${message.id} has invalid createdAt type: ${typeof message.createdAt}. Must be a number.`
        );
      }
    }

    try {
      // Check if chat already exists
      const existingChat = await ctx.db
        .query("chats")
        .withIndex("by_user_and_video", (q) =>
          q.eq("userId", args.userId).eq("videoId", args.videoId)
        )
        .unique();

      const timestamp = Date.now();
      let result;

      if (existingChat) {
        // Update existing chat
        console.log(`Updating existing chat: ${existingChat._id}`);
        result = await ctx.db.patch(existingChat._id, {
          messages: args.messages,
          lastUpdated: timestamp,
        });
        console.log("Chat updated with patch result:", result);
      } else {
        // Create new chat
        console.log("Creating new chat");
        result = await ctx.db.insert("chats", {
          videoId: args.videoId,
          userId: args.userId,
          messages: args.messages,
          lastUpdated: timestamp,
        });
        console.log("New chat created with ID:", result);
      }

      return result;
    } catch (error) {
      console.error("Error storing chat:", error);
      throw error; // Re-throw to propagate the error
    }
  },
});

// Delete chat for a video
export const deleteChat = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Deleting chat:", args);

    try {
      const chat = await ctx.db
        .query("chats")
        .withIndex("by_user_and_video", (q) =>
          q.eq("userId", args.userId).eq("videoId", args.videoId)
        )
        .unique();

      if (chat) {
        console.log(`Deleting chat with ID: ${chat._id}`);
        await ctx.db.delete(chat._id);
        return true;
      }

      console.log("No chat found to delete");
      return false;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  },
});
