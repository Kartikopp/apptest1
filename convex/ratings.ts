import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(20);
    return Promise.all(
      ratings.map(async (r) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", r.userId))
          .unique();
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          studentName: profile?.name || user?.email || "Student",
        };
      })
    );
  },
});

export const submitRating = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
      });
    } else {
      await ctx.db.insert("ratings", {
        userId,
        courseId: args.courseId,
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    }
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();
    const avg =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await ctx.db.patch(args.courseId, { rating: Math.round(avg * 10) / 10 });
  },
});

export const getMyRating = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("ratings")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();
  },
});
</parameter>
