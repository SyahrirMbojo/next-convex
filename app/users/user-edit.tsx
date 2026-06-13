"use client";

import { useMutation, useQuery } from "convex/react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { uploadFile } from "@/lib/global";
import { Role } from "@/convex/roles";
import { ComboboxRoot } from "@base-ui/react";
import CbxRoles from "@/components/cbxRoles";
import { UserModel } from "./user-model";

export default function UserEdit({ user }: { user: UserModel }) {
  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const listRole = useQuery(api.roles.getRoles) ?? [];

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    imageUrl: null as Id<"_storage"> | null,
    role: null as Role | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File | null>(null);

  const openEditDialog = () => {
    setFormData({
      email: user.email,
      password: "",
      name: user.name,
      imageUrl: user.imageUrl as Id<"_storage"> | null,
      role: user.role as Role | null,
    });
    setPreviewUrl(null);
    setError("");
    setFiles(null);
    setEditDialogOpen(true);
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
    setFiles(file);
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

  const handleEdit = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      let idstorage: Id<"_storage"> | null = null;
      //   if file is exist than upload to server
      if (files) {
        const uploadUrl = await generateUploadUrl();
        const storageId = await uploadFile(uploadUrl, files);

        if (!storageId) {
          setError("Upload failed");
          throw new Error("Upload failed");
        }

        setFormData((prev) => ({ ...prev, imageUrl: storageId }));
        idstorage = storageId;
      }

      await updateUser({
        id: user._id,
        email: formData.email,
        name: formData.name,
        imageUrl: idstorage ?? undefined,
        roleId: formData.role ? (formData.role._id as Id<"roles">) : undefined,
      });
      setEditDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        name: "",
        imageUrl: null,
        role: null,
      });
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl = previewUrl || user.urlImage || null;

  return (
    <>
      <Button onClick={openEditDialog} size="sm" variant="outline">
        Edit
      </Button>

      <Dialog onOpenChange={setEditDialogOpen} open={editDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="edit-image">Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-30 overflow-hidden rounded-full border">
                  {currentImageUrl ? (
                    <Image
                      alt="Preview"
                      className="object-cover"
                      fill
                      src={currentImageUrl}
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
                  id="edit-image"
                  onChange={handleFileChange}
                  type="file"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                value={formData.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                type="email"
                value={formData.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <CbxRoles
                roles={listRole}
                value={formData.role}
                onChanged={handleRoleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleEdit}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
