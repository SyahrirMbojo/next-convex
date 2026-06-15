import { compare, hash } from "bcryptjs";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import type { ResultUser } from "../app/users/user-model";
import { Id } from "./_generated/dataModel";

// Register a new user
export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Check if user already exists
    const existingUser = await ctx.runQuery(api.users.checkUserByEmail, {
      email: args.email,
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const defaultrole = await ctx.runQuery(api.roles.defaultRole);
    const roleid = defaultrole?._id as Id<"roles">;
    const hash = await generatePassword(args.password);

    const userId = await ctx.runMutation(api.users.createUser, {
      email: args.email,
      name: args.name,
      password: hash,
      roleId: roleid,
    });

    return userId;
  },
});

// Login user
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<ResultUser> => {
    const user = await ctx.runQuery(api.users.checkUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(args.password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      created: user.createdAt,
      updated: user.updatedAt,
    };
  },
});

const verifyPassword = async (password: string, hash: string) =>
  await compare(password, hash);

const generatePassword = async (password: string) => await hash(password, 10);

export const hashPassword = action({
  args: {
    password: v.string(),
  },
  handler: async (_, args) => await generatePassword(args.password),
});
