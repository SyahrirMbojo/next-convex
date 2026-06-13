"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { uploadFile } from "@/lib/global";
import { Role } from "@/convex/roles";
import { ComboboxRoot } from "@base-ui/react";
import CbxRoles from "@/components/cbxRoles";

export default function UserAdd() {
  const createUser = useMutation(api.users.createUser);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const hashPassword = useAction(api.auth.hashPassword);
  const listRole = useQuery(api.roles.getRoles) ?? [];

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    imageUrl: null as Id<"_storage"> | null,
    imageFile: null as File | null,
    role: null as Role | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetFormData = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      imageUrl: null,
      imageFile: null,
      role: null,
    });
    setPreviewUrl(null);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  const handleRoleChange = (
    value: Role | null,
    event: ComboboxRoot.ChangeEventDetails,
  ) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        role: value,
      }));
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      let idstorage: Id<"_storage"> | null = null;
      //   if file is exist than upload to server
      if (formData.imageFile) {
        const uploadUrl = await generateUploadUrl();
        const storageId = await uploadFile(uploadUrl, formData.imageFile);

        if (!storageId) {
          setError("Upload failed");
          throw new Error("Upload failed");
        }

        setFormData((prev) => ({ ...prev, imageUrl: storageId }));
        idstorage = storageId;
      }

      const hash = await hashPassword({ password: formData.password });

      // save user
      await createUser({
        email: formData.email,
        password: hash,
        name: formData.name,
        imageUrl: idstorage ?? undefined,
        roleId: formData.role?._id as Id<"roles">,
      });
      setCreateDialogOpen(false);
      resetFormData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
    }
    setCreateDialogOpen(open);
  };

  return (
    <Dialog onOpenChange={handleClose} open={createDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetFormData}>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-30 overflow-hidden rounded-full border">
                {previewUrl ? (
                  <Image
                    alt="Preview"
                    className="object-cover"
                    fill
                    src={previewUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <Input
                accept="image/*"
                className="max-w-xs"
                disabled={loading}
                id="image"
                onChange={handleFileChange}
                type="file"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="John Doe"
              value={formData.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="you@example.com"
              type="email"
              value={formData.email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="********"
              type="password"
              value={formData.password}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <CbxRoles
              roles={listRole}
              value={formData.role}
              onChanged={handleRoleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setCreateDialogOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleCreate}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
