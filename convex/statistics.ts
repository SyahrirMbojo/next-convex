import { v } from "convex/values";
import { QueryCtx, MutationCtx, query } from "./_generated/server";

export async function selectStatistics(
  ctx: QueryCtx | MutationCtx,
  key: string,
) {
  const statistic = await ctx.db
    .query("statistics")
    .withIndex("key", (q) => q.eq("key", key))
    .first();

  return statistic;
}

export const getStatistic = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const statis = await selectStatistics(ctx, args.key);
    return statis;
  },
});

export const saveStatistic = async (ctx: MutationCtx, key: string) => {
  const statis = await selectStatistics(ctx, key);
  if (statis) {
    await ctx.db.patch(statis._id, {
      value: statis.value + 1,
      updatedAt: Date.now(),
    });
  }
  return statis;
};

export const deleteStatistic = async (ctx: MutationCtx, key: string) => {
  const statis = await selectStatistics(ctx, key);
  if (statis) {
    await ctx.db.patch(statis._id, {
      value: statis.value - 1,
      updatedAt: Date.now(),
    });
  }
  return statis;
};
