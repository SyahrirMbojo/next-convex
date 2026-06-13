"use client";
import { listRowPagination } from "@/lib/utils";
import { Field, FieldLabel } from "./ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function PaginationView({
  total,
  limit,
  noItem,
  hasMore,
  hasPrev,
  onChangeRowsPerPage,
  onNextPage,
  onPrevPage,
}: {
  total: number;
  limit: number;
  noItem: number;
  hasMore: boolean;
  hasPrev: boolean;
  onChangeRowsPerPage: (value: string) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}) {
  return (
    <Pagination className="border-t border-dashed p-2 flex flex-row justify-end">
      <PaginationContent>
        <PaginationItem>
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="select-rows-per-page">
              Rows per page
            </FieldLabel>
            <Select
              defaultValue={`${limit}`}
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
          {noItem}–{limit > total ? total : limit} of {total}
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            className={hasPrev ? "" : "pointer-events-none opacity-50"}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPrevPage();
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
                onNextPage();
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
