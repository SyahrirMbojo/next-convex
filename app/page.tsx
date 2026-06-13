import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Suspense } from "react";
import HomeView from "@/components/home-view";

export default async function Page() {
  const data = await fetchQuery(api.posts.getPosts, { numItems: 5 });
  const posts = data?.items ?? [];

  return (
    <div className="container">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-xl">Latest Posts</h2>
          <Link href="/posts">
            <Button size="sm" variant="ghost">
              View All
            </Button>
          </Link>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <HomeView initialItems={posts} />
        </Suspense>
      </section>

      <div className="mt-8 text-center text-muted-foreground text-sm">
        Press <kbd className="font-mono">d</kbd> to toggle dark mode
      </div>
    </div>
  );
}
