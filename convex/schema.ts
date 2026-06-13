import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.id("_storage")),
    roleId: v.id("roles"),
    searchText: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.union(v.null(), v.number()),
  })
    .index("email", ["email"])
    .index("by_deletedAt_createdAt", ["deletedAt", "createdAt"])
    .index("by_role_deletedAt_createdAt", ["roleId", "deletedAt", "createdAt"])
    .searchIndex("search_user", {
      searchField: "searchText",
      filterFields: ["deletedAt", "roleId"],
    }),

  roles: defineTable({
    code: v.string(),
    name: v.string(),
  }).index("code", ["code"]),

  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
    imageUrl: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("authorId", ["authorId"])
    .index("published", ["published"])
    .index("createdAt", ["createdAt"]),

  comments: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("postId", ["postId"])
    .index("authorId", ["authorId"])
    .index("createdAt", ["createdAt"]),

  statistics: defineTable({
    key: v.string(),
    value: v.number(),
    updatedAt: v.number(),
  }).index("key", ["key"]),
});
