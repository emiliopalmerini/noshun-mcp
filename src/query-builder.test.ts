import { describe, test, expect } from "bun:test";
import { buildQueryRequest } from "./query-builder";

const schema = {
  Status: { type: "status" },
  Priority: { type: "number" },
  Name: { type: "rich_text" },
};

describe("buildQueryRequest", () => {
  test("filter only", () => {
    const result = buildQueryRequest(schema, {
      filters: [{ property: "Status", equals: "Done" }],
    });
    expect(result).toEqual({
      filter: { property: "Status", status: { equals: "Done" } },
    });
  });

  test("sorts only", () => {
    const result = buildQueryRequest(schema, {
      sorts: [{ property: "Priority", direction: "descending" }],
    });
    expect(result).toEqual({
      sorts: [{ property: "Priority", direction: "descending" }],
    });
  });

  test("pagination only", () => {
    const result = buildQueryRequest(schema, {
      page_size: 10,
    });
    expect(result).toEqual({ page_size: 10 });
  });

  test("pagination with cursor", () => {
    const result = buildQueryRequest(schema, {
      page_size: 25,
      start_cursor: "abc-123",
    });
    expect(result).toEqual({ page_size: 25, start_cursor: "abc-123" });
  });

  test("filter + sorts + pagination combined", () => {
    const result = buildQueryRequest(schema, {
      filters: [
        { property: "Status", equals: "In Progress" },
        { property: "Priority", greater_than: 3 },
      ],
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      page_size: 50,
    });
    expect(result).toEqual({
      filter: {
        and: [
          { property: "Status", status: { equals: "In Progress" } },
          { property: "Priority", number: { greater_than: 3 } },
        ],
      },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      page_size: 50,
    });
  });

  test("empty options returns empty body", () => {
    const result = buildQueryRequest(schema, {});
    expect(result).toEqual({});
  });
});
