import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const materials = await ctx.db
      .query("studyMaterials")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();
    return Promise.all(
      materials.map(async (m) => {
        let fileUrl = m.fileUrl || null;
        if (m.fileStorageId && !fileUrl) {
          fileUrl = await ctx.storage.getUrl(m.fileStorageId);
        }
        return { ...m, fileUrl };
      })
    );
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    subject: v.string(),
    description: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileType: v.string(),
    fileSize: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    return await ctx.db.insert("studyMaterials", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deleteMaterial = mutation({
  args: { materialId: v.id("studyMaterials") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    await ctx.db.delete(args.materialId);
  },
});
</parameter>
