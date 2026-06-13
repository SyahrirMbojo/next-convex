"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as Id<"posts">;
  const [comment, setComment] = useState("");

  const data = useQuery(api.posts.getPost, { id: postId });
  const createComment = useMutation(api.posts.createComment);
  const deleteComment = useMutation(api.posts.deleteComment);

  const isLoading = data === undefined;
  const userId = localStorage.getItem("blog_userId") as Id<"users">;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      return;
    }

    await createComment({ content: comment, postId, userId });
    setComment("");
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    await deleteComment({ id: commentId, userId });
  };

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl p-6">Loading...</div>;
  }

  if (!data?.post) {
    return (
      <div className="container mx-auto max-w-4xl p-6">Post not found</div>
    );
  }

  const { post, comments } = data;

  const goBack = () => {
    router.back();
  };

  return (
    <div className="container">
      <article className="mb-8">
        <div className="flex flex-row gap-3">
          <Button onClick={goBack} variant="ghost">
            <CaretLeftIcon />
          </Button>

          <div className="flex flex-col">
            <h1 className="font-bold text-3xl">{post.title}</h1>
            <div className="mt-1 text-muted-foreground">
              By {post.author?.name ?? "Unknown"} on{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-center">
          {post.urlImage && (
            <Image
              alt={post.title}
              className="mt-4 rounded-lg object-cover"
              height={300}
              src={post.urlImage}
              width={500}
            />
          )}
        </div>
        <div className="mt-6 whitespace-pre-wrap">{post.content}</div>
      </article>

      <section>
        <h2 className="mb-4 font-semibold text-2xl">Comments</h2>

        {userId && (
          <form className="mb-6" onSubmit={handleSubmitComment}>
            <Textarea
              className="mb-2"
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              value={comment}
            />
            <Button type="submit">Post Comment</Button>
          </form>
        )}

        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <Card key={c._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {c.author?.name ?? "Unknown"}
                    </CardTitle>
                    {userId === c.authorId && (
                      <Button
                        onClick={() => handleDeleteComment(c._id)}
                        size="sm"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{c.content}</p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
