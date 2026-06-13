"use client";
import { useMutation } from "convex/react";
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
import { api } from "@/convex/_generated/api";
import { UserModel } from "./user-model";

export default function UserDelete({ user }: { user: UserModel }) {
  const deleteUser = useMutation(api.users.deleteUser);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteUser({ id: user._id });
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = () => {
    setError("");
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Button onClick={openDeleteDialog} size="sm" variant="destructive">
        Delete
      </Button>

      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{user?.name}</b>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={handleDelete}
              variant="destructive"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
