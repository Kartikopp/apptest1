import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("liveClasses")
      .withIndex("by_scheduledAt")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledAt"), now - 3600000),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .take(10);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("liveClasses")
      .withIndex("by_scheduledAt")
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    courseId: v.optional(v.id("courses")),
    teacherName: v.string(),
    scheduledAt: v.number(),
    meetingLink: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    return await ctx.db.insert("liveClasses", {
      ...args,
      isCompleted: false,
      createdAt: Date.now(),
    });
  },
});

export const deleteLiveClass = mutation({
  args: { liveClassId: v.id("liveClasses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    await ctx.db.delete(args.liveClassId);
  },
});
</parameter>
