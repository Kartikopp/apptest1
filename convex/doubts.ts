import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const doubts = await ctx.db
      .query("doubts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
    return Promise.all(
      doubts.map(async (d) => {
        const course = d.courseId ? await ctx.db.get(d.courseId) : null;
        return { ...d, course };
      })
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") return [];
    const doubts = await ctx.db
      .query("doubts")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(50);
    return Promise.all(
      doubts.map(async (d) => {
        const course = d.courseId ? await ctx.db.get(d.courseId) : null;
        const studentProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", d.userId))
          .unique();
        const user = await ctx.db.get(d.userId);
        return {
          ...d,
          course,
          studentName: studentProfile?.name || user?.email || "Unknown",
        };
      })
    );
  },
});

export const ask = mutation({
  args: {
    question: v.string(),
    courseId: v.optional(v.id("courses")),
    lectureId: v.optional(v.id("lectures")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("doubts", {
      userId,
      question: args.question,
      courseId: args.courseId,
      lectureId: args.lectureId,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const answer = mutation({
  args: {
    doubtId: v.id("doubts"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const doubt = await ctx.db.get(args.doubtId);
    if (!doubt) throw new Error("Doubt not found");
    await ctx.db.patch(args.doubtId, {
      answer: args.answer,
      answeredBy: userId,
      answeredAt: Date.now(),
      status: "answered",
    });
    await ctx.db.insert("notifications", {
      userId: doubt.userId,
      title: "Your doubt has been answered!",
      message: args.answer.substring(0, 100),
      type: "doubt",
      isRead: false,
      isGlobal: false,
      createdAt: Date.now(),
    });
  },
});
</parameter>
