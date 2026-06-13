"use server";

import { api } from "@/convex/_generated/api";
import UserAdd from "./user-add";
import UserTable from "./user-table";
import { fetchQuery } from "convex/nextjs";
import { Suspense } from "react";
import { defaultRowPage } from "@/lib/utils";

export default async function UsersPage() {
  const paginatedResult = await fetchQuery(api.users.getAllUsers, {
    search: undefined,
    roleId: undefined,
    paginationOpts: {
      numItems: defaultRowPage,
      cursor: null,
    },
  });
  const totalUser = await fetchQuery(api.users.countUser, {
    search: undefined,
    roleId: undefined,
  });

  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Users</h1>
        <UserAdd />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UserTable initialData={paginatedResult!} initialTotal={totalUser!} />
      </Suspense>
    </div>
  );
}
