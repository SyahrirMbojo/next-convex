import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export interface Role {
  _id: Id<"roles">;
  name: string;
  code: string;
}

export const defaultRole = query({
  args: {},
  handler: async (ctx, arg) => {
    const role = await ctx.db
      .query("roles")
      .withIndex("code", (q) => q.eq("code", "guest"))
      .unique();
    return role;
  },
});

export const getRoles = query({
  args: {},
  handler: async (ctx, _) => {
    const role = await ctx.db.query("roles").collect();
    return role;
  },
});
