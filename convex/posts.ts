import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";

async function enrichPost(ctx: QueryCtx, post: Doc<"posts">) {
  const author = await ctx.db.get(post.authorId);

  const urlImage = post.imageUrl
    ? await ctx.storage.getUrl(post.imageUrl)
    : null;

  return {
    ...post,
    author,
    urlImage,
  };
}

async function getPostById(ctx: QueryCtx, postId: Id<"posts">) {
  const post = await ctx.db.get(postId);

  if (!post) {
    return null;
  }

  return await enrichPost(ctx, post);
}

// Get all published posts with pagination
export const getPosts = query({
  args: {
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const numItems = args.numItems ?? 10;

    let postsQuery = ctx.db.query("posts").withIndex("createdAt").order("desc");

    // Filter by published
    postsQuery = postsQuery.filter((q) => q.eq(q.field("published"), true));

    // Search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      const allPosts = await postsQuery.collect();

      const items = allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower),
      );

      const itemWithImage = await Promise.all(
        items.map(async (post) => enrichPost(ctx, post)),
      );

      return {
        itemWithImage,
        continueCursor: null,
      };
    }

    // Pagination
    if (args.cursor) {
      const cursor = Number.parseInt(args.cursor, 10);
      postsQuery = postsQuery.filter((q) =>
        q.lt(q.field("_creationTime"), cursor),
      );
    }

    const posts = await postsQuery.take(numItems + 1);

    const postsWithImages = await Promise.all(
      posts.map(async (post) => enrichPost(ctx, post)),
    );

    // const hasMore = posts.length > numItems;
    // const items = hasMore ? posts.slice(0, -1) : posts;
    const hasMore = postsWithImages.length > numItems;
    const items = hasMore ? postsWithImages.slice(0, -1) : postsWithImages;

    return {
      items,
      continueCursor: hasMore ? String(items.at(-1)?._creationTime) : null,
    };
  },
});

// Get single post by ID
export const getPost = query({
  args: {
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await getPostById(ctx, args.id);

    if (!post) {
      return null;
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("postId", (q) => q.eq("postId", args.id))
      .order("desc")
      .collect();

    // Get comment authors
    const commentAuthors = await Promise.all(
      comments.map((comment) => ctx.db.get(comment.authorId)),
    );

    const listComment = comments.map((comment, index) => ({
      ...comment,
      author: commentAuthors[index],
    }));

    return {
      post,
      comments: listComment,
    };
  },
});

// Create a new post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
    imageUrl: v.optional(v.id("_storage")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.userId,
      published: args.published,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return postId;
  },
});

// Update a post
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    published: v.optional(v.boolean()),
    imageUrl: v.optional(v.id("_storage")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== args.userId) {
      throw new Error("Not authorized to update this post");
    }

    await ctx.db.patch(args.id, {
      ...(args.title && { title: args.title }),
      ...(args.content && { content: args.content }),
      ...(args.published !== undefined && { published: args.published }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      updatedAt: Date.now(),
    });
  },
});

// Delete a post
export const deletePost = mutation({
  args: {
    id: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== args.userId) {
      throw new Error("Not authorized to delete this post");
    }

    // Delete all comments on this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("postId", (q) => q.eq("postId", args.id))
      .collect();

    await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)));

    await ctx.db.delete(args.id);
  },
});

// Get current user's posts
export const getMyPosts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("authorId", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();

    return posts;
  },
});

// Add a comment
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      content: args.content,
      authorId: args.userId,
      postId: args.postId,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    id: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== args.userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.id);
  },
});
