import { Cursor } from "convex/server";
import { Id } from "../../convex/_generated/dataModel";
import { Role } from "../../convex/roles";

export interface ResultUser {
  userId: string;
  name: string;
  email: string;
  imageUrl?: string;
  created?: number;
  updated?: number;
  deleted?: string;
}

export interface UserModel {
  _id: Id<"users">;
  email: string;
  name: string;
  imageUrl?: string;
  urlImage?: string | null;
  roleId?: Id<"roles">;
  role: Role | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface PaginationResultModel {
  initialData: {
    page: UserModel[];
    isDone: boolean;
    continueCursor: Cursor;
    splitCursor?: Cursor | null;
    pageStatus?: "SplitRecommended" | "SplitRequired" | null;
  };
  initialTotal: number | null;
}
