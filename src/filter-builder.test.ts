import { describe, test, expect } from "bun:test";
import { buildFilter } from "./filter-builder";

describe("buildFilter", () => {
  describe("status property", () => {
    test("equals", () => {
      const schema = { Status: { type: "status" } };
      const result = buildFilter(schema, [
        { property: "Status", equals: "Done" },
      ]);
      expect(result).toEqual({
        property: "Status",
        status: { equals: "Done" },
      });
    });

    test("does_not_equal", () => {
      const schema = { Status: { type: "status" } };
      const result = buildFilter(schema, [
        { property: "Status", does_not_equal: "Cancelled" },
      ]);
      expect(result).toEqual({
        property: "Status",
        status: { does_not_equal: "Cancelled" },
      });
    });
  });

  describe("rich_text property", () => {
    const schema = { Name: { type: "rich_text" } };

    test("contains", () => {
      const result = buildFilter(schema, [
        { property: "Name", contains: "hello" },
      ]);
      expect(result).toEqual({
        property: "Name",
        rich_text: { contains: "hello" },
      });
    });

    test("equals", () => {
      const result = buildFilter(schema, [
        { property: "Name", equals: "exact match" },
      ]);
      expect(result).toEqual({
        property: "Name",
        rich_text: { equals: "exact match" },
      });
    });

    test("starts_with", () => {
      const result = buildFilter(schema, [
        { property: "Name", starts_with: "pre" },
      ]);
      expect(result).toEqual({
        property: "Name",
        rich_text: { starts_with: "pre" },
      });
    });

    test("is_empty", () => {
      const result = buildFilter(schema, [
        { property: "Name", is_empty: true },
      ]);
      expect(result).toEqual({
        property: "Name",
        rich_text: { is_empty: true },
      });
    });
  });
});
