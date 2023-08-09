import { Nullable } from "../utils/types";

export const PAGE_SIZE = 20;

export interface Pagination<T> {
  data: T;
  next: number;
  count: number;
}

export function makePagination<T>(
  data: T,
  next: Nullable<string> | number,
  count: number
): Pagination<T> {
  let nextPage = 1;

  if (next != null) {
    if (typeof next === "string") {
      const url = new URL(next);
      const page = url.searchParams.get("page");
      nextPage = page ? parseInt(page) : -1;
    } else if (typeof next === "number") {
      nextPage = next;
    }
  } else {
    nextPage = -1;
  }

  return {
    data,
    next: nextPage,
    count,
  };
}
