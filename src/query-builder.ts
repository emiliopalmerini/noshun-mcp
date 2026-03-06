import { buildFilter, type PropertySchema, type SimpleFilter } from "./filter-builder";
import { buildSorts, type SimpleSort } from "./sort-builder";

export interface QueryOptions {
  filters?: SimpleFilter[];
  filter_operator?: "and" | "or";
  sorts?: SimpleSort[];
  page_size?: number;
  start_cursor?: string;
}

export function buildQueryRequest(schema: PropertySchema, options: QueryOptions) {
  const body: Record<string, unknown> = {};

  if (options.filters?.length) {
    body.filter = buildFilter(schema, options.filters, options.filter_operator);
  }

  if (options.sorts?.length) {
    body.sorts = buildSorts(options.sorts);
  }

  if (options.page_size !== undefined) {
    body.page_size = options.page_size;
  }

  if (options.start_cursor !== undefined) {
    body.start_cursor = options.start_cursor;
  }

  return body;
}
