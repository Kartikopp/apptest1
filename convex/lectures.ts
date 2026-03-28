import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_courseId_order", (q) => q.eq("courseId", args.courseId))
      .collect();
    return lectures;
  },
});

export const getById = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lectureId);
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const lectureId = await ctx.db.insert("lectures", {
      ...args,
      createdAt: Date.now(),
    });
    const course = await ctx.db.get(args.courseId);
    if (course) {
      await ctx.db.patch(args.courseId, {
        totalLectures: course.totalLectures + 1,
      });
    }
    return lectureId;
  },
});

export const update = mutation({
  args: {
    lectureId: v.id("lectures"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const { lectureId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(lectureId, filtered);
  },
});

export const deleteLecture = mutation({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const lecture = await ctx.db.get(args.lectureId);
    if (lecture) {
      const course = await ctx.db.get(lecture.courseId);
      if (course) {
        await ctx.db.patch(lecture.courseId, {
          totalLectures: Math.max(0, course.totalLectures - 1),
        });
      }
    }
    await ctx.db.delete(args.lectureId);
  },
});
</parameter>
