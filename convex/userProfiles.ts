import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    let avatarUrl = null;
    if (profile.avatarStorageId) {
      avatarUrl = await ctx.storage.getUrl(profile.avatarStorageId);
    }
    const user = await ctx.db.get(userId);
    return { ...profile, avatarUrl, email: user?.email };
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name, phone: args.phone });
      return existing._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        name: args.name,
        phone: args.phone,
        role: "student",
        enrolledCourses: [],
        createdAt: Date.now(),
      });
    }
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return profile?.role === "admin";
  },
});

export const makeAdmin = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (myProfile?.role !== "admin") throw new Error("Not authorized");
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .unique();
    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, { role: "admin" });
    }
  },
});

export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (myProfile?.role !== "admin") return [];
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
    return Promise.all(
      profiles.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, email: user?.email };
      })
    );
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

export const updateAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { avatarStorageId: args.storageId });
    }
  },
});
</parameter>
