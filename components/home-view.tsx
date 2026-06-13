"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";

interface PostProps {
  initialItems: {
    author: {
      _id: Id<"users">;
      _creationTime: number;
      imageUrl?: Id<"_storage"> | undefined;
      email: string;
      name: string;
      roleId: Id<"roles">;
      searchText: string;
      createdAt: number;
      updatedAt: number;
      deletedAt: number | null;
    } | null;
    urlImage: string | null;
    _id: Id<"posts">;
    _creationTime: number;
    imageUrl?: Id<"_storage"> | undefined;
    createdAt: number;
    updatedAt: number;
    title: string;
    content: string;
    authorId: Id<"users">;
    published: boolean;
  }[];
}

export default function HomeView({ initialItems }: PostProps) {
  const data = useQuery(api.posts.getPosts, { numItems: 5 });
  const posts = data?.items ?? initialItems;

  return (
    <>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          No posts yet. Be the first to{" "}
          <Link className="text-primary hover:underline" href="/posts/create">
            create a post
          </Link>
          !
        </p>
      ) : (
        <div className="space-x-4 space-y-4">
          {posts.map((post) => (
            <Link href={`/posts/${post._id}`} key={post._id}>
              <article className="rounded-lg border transition-colors hover:bg-muted/50">
                <div className="flex flex-row gap-2">
                  <div className="relative aspect-video h-48 w-full shrink-0 overflow-hidden md:h-35 md:w-40">
                    {post.urlImage ? (
                      <Image
                        alt={post.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        src={post.urlImage}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-gray-300">
                        No Image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-medium text-lg">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">
                      {post.content}
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
