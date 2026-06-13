"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { uploadFile } from "@/lib/global";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File | null>(null);

  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const userId = localStorage.getItem("blog_userId");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setFiles(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let idstorage: Id<"_storage"> | null = null;
      if (files) {
        const uploadUrl = await generateUploadUrl();
        const storageId = await uploadFile(uploadUrl, files);

        if (!storageId) {
          setError("Upload failed");
          throw new Error("Upload failed");
        }

        idstorage = storageId;
      }

      await createPost({
        title,
        content,
        published,
        imageUrl: idstorage ?? undefined,
        userId: userId as Id<"users">,
      });
      router.push("/posts");
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                required
                value={title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                value={content}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Cover Image</Label>
              <Input
                accept="image/*"
                disabled={loading}
                id="image"
                onChange={handleFileChange}
                type="file"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                checked={published}
                id="published"
                onChange={(e) => setPublished(e.target.checked)}
                type="checkbox"
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Creating..." : "Create Post"}
              </Button>
              <Button
                onClick={() => router.back()}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
