import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitPayment = mutation({
  args: {
    courseId: v.id("courses"),
    amount: v.number(),
    upiTransactionId: v.string(),
    screenshotStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("courseId"), args.courseId),
          q.neq(q.field("status"), "rejected")
        )
      )
      .first();
    if (existing) throw new Error("Payment already submitted for this course");
    return await ctx.db.insert("payments", {
      userId,
      courseId: args.courseId,
      amount: args.amount,
      upiTransactionId: args.upiTransactionId,
      screenshotStorageId: args.screenshotStorageId,
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

export const getMyPayments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return Promise.all(
      payments.map(async (p) => {
        const course = await ctx.db.get(p.courseId);
        return { ...p, course };
      })
    );
  },
});

export const getPendingPayments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") return [];
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return Promise.all(
      payments.map(async (p) => {
        const course = await ctx.db.get(p.courseId);
        const studentProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", p.userId))
          .unique();
        const user = await ctx.db.get(p.userId);
        let screenshotUrl = null;
        if (p.screenshotStorageId) {
          screenshotUrl = await ctx.storage.getUrl(p.screenshotStorageId);
        }
        return {
          ...p,
          course,
          studentName: studentProfile?.name || user?.email || "Unknown",
          screenshotUrl,
        };
      })
    );
  },
});

export const verifyPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    action: v.union(v.literal("verify"), v.literal("reject")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    const newStatus = args.action === "verify" ? "verified" : "rejected";
    await ctx.db.patch(args.paymentId, {
      status: newStatus,
      verifiedAt: Date.now(),
      verifiedBy: userId,
      notes: args.notes,
    });
    if (args.action === "verify") {
      const existingEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId_courseId", (q) =>
          q.eq("userId", payment.userId).eq("courseId", payment.courseId)
        )
        .unique();
      if (!existingEnrollment) {
        await ctx.db.insert("enrollments", {
          userId: payment.userId,
          courseId: payment.courseId,
          paymentId: args.paymentId,
          enrolledAt: Date.now(),
          progress: 0,
          completedLectures: [],
        });
        const course = await ctx.db.get(payment.courseId);
        if (course) {
          await ctx.db.patch(payment.courseId, {
            totalStudents: course.totalStudents + 1,
          });
        }
        const studentProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
          .unique();
        if (studentProfile) {
          await ctx.db.patch(studentProfile._id, {
            enrolledCourses: [...studentProfile.enrolledCourses, payment.courseId],
          });
        }
        await ctx.db.insert("notifications", {
          userId: payment.userId,
          title: "Payment Verified!",
          message: `Your payment for "${(await ctx.db.get(payment.courseId))?.title}" has been verified. You can now access the course.`,
          type: "payment",
          isRead: false,
          isGlobal: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPaymentStatus = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();
  },
});
</parameter>
