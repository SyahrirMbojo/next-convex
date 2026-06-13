"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "../auth-provider";

export default function PostsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  const data = useQuery(api.posts.getPosts, {
    search: search || undefined,
    cursor: cursor ?? undefined,
    numItems: 10,
  });

  const loadMore = () => {
    if (data?.continueCursor) {
      setCursor(data.continueCursor);
    }
  };

  const posts = data?.items ?? [];
  const hasMore = !!data?.continueCursor;

  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Blog Posts</h1>
        {user && (
          <Link href="/posts/create">
            <Button>Create Post</Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <Input
          className="max-w-md"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          type="search"
          value={search}
        />
      </div>

      {data === undefined && (
        <div className="py-10 text-center">Loading...</div>
      )}

      {data !== undefined && posts.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          No posts found. Be the first to create one!
        </div>
      )}

      {data !== undefined && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/posts/${post._id}`} key={post._id}>
              <Card className="group overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden">
                  {post.urlImage ? (
                    <Image
                      alt={post.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fill
                      sizes="400px"
                      src={post.urlImage}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-gray-300">
                      No Image
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Title on Image */}
                  <div className="absolute right-0 bottom-0 left-0 p-4">
                    <CardTitle className="line-clamp-2 font-bold text-white">
                      {post.title}
                    </CardTitle>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="space-y-3 p-4">
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>
                      by{" "}
                      <span className="font-semibold text-foreground">
                        {post.author?.name}
                      </span>
                    </span>

                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
