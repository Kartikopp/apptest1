import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return Promise.all(
      enrollments.map(async (e) => {
        const course = await ctx.db.get(e.courseId);
        let thumbnailUrl = course?.thumbnailUrl || null;
        if (course?.thumbnailStorageId && !thumbnailUrl) {
          thumbnailUrl = await ctx.storage.getUrl(course.thumbnailStorageId);
        }
        return { ...e, course: course ? { ...course, thumbnailUrl } : null };
      })
    );
  },
});

export const isEnrolled = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();
    return !!enrollment;
  },
});

export const updateProgress = mutation({
  args: {
    courseId: v.id("courses"),
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();
    if (!enrollment) throw new Error("Not enrolled");
    const completed = enrollment.completedLectures.includes(args.lectureId)
      ? enrollment.completedLectures
      : [...enrollment.completedLectures, args.lectureId];
    const course = await ctx.db.get(args.courseId);
    const progress = course?.totalLectures
      ? Math.round((completed.length / course.totalLectures) * 100)
      : 0;
    await ctx.db.patch(enrollment._id, {
      completedLectures: completed,
      lastWatchedLectureId: args.lectureId,
      lastWatchedAt: Date.now(),
      progress,
    });
  },
});

export const getEnrollmentByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("enrollments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", userId).eq("courseId", args.courseId)
      )
      .unique();
  },
});
</parameter>
