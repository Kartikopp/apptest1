import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listPublished = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let courses;
    if (args.category) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isPublished"), true))
        .collect();
    } else {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .collect();
    }
    return Promise.all(
      courses.map(async (c) => {
        let thumbnailUrl = c.thumbnailUrl || null;
        if (c.thumbnailStorageId && !thumbnailUrl) {
          thumbnailUrl = await ctx.storage.getUrl(c.thumbnailStorageId);
        }
        return { ...c, thumbnailUrl };
      })
    );
  },
});

export const getById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    let thumbnailUrl = course.thumbnailUrl || null;
    if (course.thumbnailStorageId && !thumbnailUrl) {
      thumbnailUrl = await ctx.storage.getUrl(course.thumbnailStorageId);
    }
    return { ...course, thumbnailUrl };
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
    const courses = await ctx.db.query("courses").collect();
    return Promise.all(
      courses.map(async (c) => {
        let thumbnailUrl = c.thumbnailUrl || null;
        if (c.thumbnailStorageId && !thumbnailUrl) {
          thumbnailUrl = await ctx.storage.getUrl(c.thumbnailStorageId);
        }
        return { ...c, thumbnailUrl };
      })
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    teacherName: v.string(),
    price: v.number(),
    discountedPrice: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    totalDuration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    return await ctx.db.insert("courses", {
      ...args,
      isPublished: false,
      totalLectures: 0,
      totalStudents: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    teacherName: v.optional(v.string()),
    price: v.optional(v.number()),
    discountedPrice: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    totalDuration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    const { courseId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(courseId, filtered);
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    await ctx.db.delete(args.courseId);
  },
});
</parameter>
