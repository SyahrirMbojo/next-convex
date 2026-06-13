"use client";

import { useQuery } from "convex/react";
import { ChangeEvent, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { getColorFromName, getShortText, listRowPagination } from "@/lib/utils";
import UserAdd from "./user-add";
import UserDelete from "./user-delete";
import UserEdit from "./user-edit";
import { Role } from "@/convex/roles";
import CbxRoles from "@/components/cbxRoles";
import { ComboboxRoot } from "@base-ui/react";
import { UserModel } from "./user-model";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersClientPage() {
  const [search, setSearch] = useState("");
  const [noItem, setNoItem] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 10,
    cursor: null as string | null,
  });

  const paginatedResult = useQuery(api.users.getAllUsers, {
    search: search || undefined,
    roleId: role?._id,
    paginationOpts,
  });
  const totalUser = useQuery(api.users.countUser, {
    search: search || undefined,
    roleId: role?._id,
  });
  const listRole = useQuery(api.roles.getRoles) ?? [];

  const users = paginatedResult?.page ?? [];
  // const hasMore = !paginatedResult?.isDone;
  const nextCursor = paginatedResult?.continueCursor;
  const isLoading = !paginatedResult;

  const hasPrev = cursorHistory.length > 1;
  const total = totalUser;
  const totalPages = total ? Math.ceil(total / paginationOpts.numItems) : 0;
  const currentPage = cursorHistory.length;
  const hasMore = currentPage < totalPages;

  const onChangeRowsPerPage = (value: string) => {
    resetPaginate();
    setPaginationOpts((prev) => ({
      ...prev,
      numItems: Number(value),
    }));
  };

  const setCursorPaginate = (nextcursor: string | null) => {
    setPaginationOpts((prev) => ({
      ...prev,
      cursor: nextcursor,
    }));
  };

  const resetPaginate = () => {
    setCursorPaginate(null);
    setCursorHistory([null]);
    setNoItem(1);
  };

  const setNomorItem = (pagenow: number) => {
    // set no page
    const indexpage = pagenow - 1;
    const noPage = indexpage * paginationOpts.numItems;
    setNoItem(noPage + 1);
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorPaginate(nextCursor);

      setCursorHistory((prev) => [...prev, nextCursor]);
      setCurrentCursor(nextCursor);

      setNomorItem(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 1) {
      const newHistory = [...cursorHistory];
      newHistory.pop();
      setCursorHistory(newHistory);

      const previousCursor = newHistory[newHistory.length - 1];
      setCurrentCursor(previousCursor);

      setCursorPaginate(previousCursor);

      setNomorItem(newHistory.length);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    resetPaginate();
    setSearch(e.target.value);
  };

  const handleRoleFilter = (
    value: Role | null,
    event: ComboboxRoot.ChangeEventDetails,
  ) => {
    resetPaginate();
    setRole(value);
  };

  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Users</h1>
        <UserAdd />
      </div>

      <div className="flex flex-row gap-2 mb-3">
        <Input
          className="max-w-xs"
          onChange={handleSearch}
          placeholder="Search users..."
          type="search"
          value={search}
        />
        <CbxRoles roles={listRole} value={role} onChanged={handleRoleFilter} />
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: UserModel) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-row items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-full">
                          <AvatarImage src={user.urlImage ?? ""} />
                          <AvatarFallback
                            className="text-primary-foreground"
                            style={{
                              background: `linear-gradient(to right bottom, oklch(${getColorFromName(
                                user.name,
                              )} / 0.3), oklch(${getColorFromName(
                                user.name,
                              )}))`,
                            }}
                          >
                            {getShortText(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.name}</TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-row items-center justify-end gap-2">
                        <UserEdit user={user} />
                        <UserDelete user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {total && (
            <Pagination className="border-t border-dashed p-2 flex flex-row justify-end">
              <PaginationContent>
                <PaginationItem>
                  <Field orientation="horizontal" className="w-fit">
                    <FieldLabel htmlFor="select-rows-per-page">
                      Rows per page
                    </FieldLabel>
                    <Select
                      defaultValue={`${paginationOpts.numItems}`}
                      onValueChange={onChangeRowsPerPage}
                    >
                      <SelectTrigger className="w-20" id="select-rows-per-page">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectGroup>
                          {listRowPagination.map((item) => (
                            <SelectItem key={item} value={`${item}`}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </PaginationItem>
                <PaginationItem className="px-3 text-gray-600">
                  {noItem}–
                  {paginationOpts.numItems > total
                    ? total
                    : paginationOpts.numItems}{" "}
                  of {total}
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    className={hasPrev ? "" : "pointer-events-none opacity-50"}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrevPage();
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    className={hasMore ? "" : "pointer-events-none opacity-50"}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasMore) {
                        handleNextPage();
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
