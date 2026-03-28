import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const personal = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
    const global = await ctx.db
      .query("notifications")
      .withIndex("by_global", (q) => q.eq("isGlobal", true))
      .order("desc")
      .take(10);
    const all = [...personal, ...global];
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, 30);
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();
    await Promise.all(
      notifications.map((n) => ctx.db.patch(n._id, { isRead: true }))
    );
  },
});

export const sendToAll = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.role !== "admin") throw new Error("Not authorized");
    await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      isGlobal: true,
      createdAt: Date.now(),
    });
  },
});
</parameter>
