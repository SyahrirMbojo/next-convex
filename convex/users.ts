import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";

const enrichUser = async (ctx: QueryCtx, user: Doc<"users">) => {
  const role = await ctx.db.get(user.roleId);
  const urlImage = user.imageUrl
    ? await ctx.storage.getUrl(user.imageUrl)
    : null;

  const { password, ...publicUser } = user;

  return {
    ...publicUser,
    role,
    urlImage,
  };
};

const getUserByEmail = async (ctx: QueryCtx, email: string) => {
  const users = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();

  return users;
};

export const checkUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByEmail(ctx, args.email);
    return user;
  },
});

const queryUser = (ctx: QueryCtx, search?: string, roleId?: Id<"roles">) => {
  let userQr = ctx.db
    .query("users")
    .withIndex("by_deletedAt_createdAt", (q) => q.eq("deletedAt", null))
    .order("desc");

  if (search) {
    const searchText = search;
    userQr = ctx.db.query("users").withSearchIndex("search_user", (q) => {
      let search = q.search("searchText", searchText).eq("deletedAt", null);

      if (roleId) {
        search = search.eq("roleId", roleId);
      }

      return search;
    });
  }

  if (roleId) {
    const valRoleid = roleId;
    userQr = ctx.db
      .query("users")
      .withIndex("by_role_deletedAt_createdAt", (q) =>
        q.eq("roleId", valRoleid).eq("deletedAt", null),
      )
      .order("desc");
  }

  return userQr;
};

export const getAllUsers = query({
  args: {
    search: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userQr = queryUser(ctx, args.search, args.roleId);

    const result = await userQr.paginate(args.paginationOpts);
    const resultdata = await Promise.all(
      result.page.map((user) => enrichUser(ctx, user)),
    );

    return {
      ...result,
      page: resultdata,
    };
  },
});

export const countUser = query({
  args: {
    search: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const userQr = queryUser(ctx, args.search, args.roleId);
    const users = await userQr.collect();

    return users.length;
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.id("_storage")),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const existingUser = await getUserByEmail(ctx, args.email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      imageUrl: args.imageUrl,
      searchText: `${args.name.toLowerCase()} ${args.email.toLowerCase()}`,
      roleId: args.roleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });

    return userId;
  },
});

// Get current user
export const currentUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    return await enrichUser(ctx, user);
  },
});

// Get user by ID
export const getUser = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      return null;
    }
    return await enrichUser(ctx, user);
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.id("_storage")),
    password: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if email is being changed and if it already exists
    if (args.email && args.email !== user.email) {
      const existingUser = await getUserByEmail(ctx, args.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.email && { email: args.email }),
      ...(args.name && { name: args.name }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.password && { password: args.password }),
      ...(args.roleId !== undefined && { roleId: args.roleId }),
      updatedAt: Date.now(),
    });
  },
});

// Delete user (soft delete)
export const deleteUser = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Soft delete - just mark deletedAt
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    });
  },
});
