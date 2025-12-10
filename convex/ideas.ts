import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createIdea = mutation({
    args: {
        userId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const ideaId = await ctx.db.insert("videoIdeas", {
            userId: args.userId,
            title: args.title,
            description: args.description,
            status: "idea",
            createdAt: Date.now(),
        });
        return ideaId;
    },
});

export const getIdeas = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("videoIdeas")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const updateIdeaStatus = mutation({
    args: {
        ideaId: v.id("videoIdeas"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ideaId, {
            status: args.status,
        });
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveVideoStorageId = mutation({
    args: {
        ideaId: v.id("videoIdeas"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ideaId, {
            storageId: args.storageId,
            status: "uploaded",
        });
    },
});

export const getVideoUrl = query({
    args: { storageId: v.optional(v.id("_storage")) },
    handler: async (ctx, args) => {
        if (!args.storageId) return null;
        return await ctx.storage.getUrl(args.storageId);
    },
});
