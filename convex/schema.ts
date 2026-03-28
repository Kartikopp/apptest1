import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    role: v.union(v.literal("student"), v.literal("admin")),
    enrolledCourses: v.array(v.id("courses")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    teacherName: v.string(),
    price: v.number(),
    discountedPrice: v.optional(v.number()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    totalLectures: v.number(),
    totalDuration: v.optional(v.string()),
    tags: v.array(v.string()),
    rating: v.optional(v.number()),
    totalStudents: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  lectures: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_courseId_order", ["courseId", "order"]),

  studyMaterials: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    subject: v.string(),
    description: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileUrl: v.optional(v.string()),
    fileType: v.string(),
    fileSize: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_subject", ["subject"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    paymentId: v.optional(v.id("payments")),
    enrolledAt: v.number(),
    progress: v.number(),
    completedLectures: v.array(v.id("lectures")),
    lastWatchedLectureId: v.optional(v.id("lectures")),
    lastWatchedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"]),

  payments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    amount: v.number(),
    upiTransactionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    screenshotStorageId: v.optional(v.id("_storage")),
    submittedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_courseId", ["courseId"]),

  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("general"), v.literal("exam"), v.literal("holiday"), v.literal("result")),
    isImportant: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  liveClasses: defineTable({
    title: v.string(),
    courseId: v.optional(v.id("courses")),
    teacherName: v.string(),
    scheduledAt: v.number(),
    meetingLink: v.optional(v.string()),
    description: v.optional(v.string()),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  }).index("by_scheduledAt", ["scheduledAt"]),

  doubts: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    lectureId: v.optional(v.id("lectures")),
    question: v.string(),
    answer: v.optional(v.string()),
    answeredBy: v.optional(v.id("users")),
    answeredAt: v.optional(v.number()),
    status: v.union(v.literal("open"), v.literal("answered")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_courseId", ["courseId"]),

  ratings: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    rating: v.number(),
    review: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"]),

  notifications: defineTable({
    userId: v.optional(v.id("users")),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isRead: v.boolean(),
    isGlobal: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_global", ["isGlobal"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
