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

  describe("number property", () => {
    const schema = { Priority: { type: "number" } };

    test("equals", () => {
      const result = buildFilter(schema, [
        { property: "Priority", equals: 5 },
      ]);
      expect(result).toEqual({
        property: "Priority",
        number: { equals: 5 },
      });
    });

    test("greater_than", () => {
      const result = buildFilter(schema, [
        { property: "Priority", greater_than: 3 },
      ]);
      expect(result).toEqual({
        property: "Priority",
        number: { greater_than: 3 },
      });
    });

    test("less_than_or_equal_to", () => {
      const result = buildFilter(schema, [
        { property: "Priority", less_than_or_equal_to: 10 },
      ]);
      expect(result).toEqual({
        property: "Priority",
        number: { less_than_or_equal_to: 10 },
      });
    });

    test("is_empty", () => {
      const result = buildFilter(schema, [
        { property: "Priority", is_empty: true },
      ]);
      expect(result).toEqual({
        property: "Priority",
        number: { is_empty: true },
      });
    });
  });
});
