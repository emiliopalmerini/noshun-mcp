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

  describe("date property", () => {
    const schema = { "Due Date": { type: "date" } };

    test("before", () => {
      const result = buildFilter(schema, [
        { property: "Due Date", before: "2026-03-10" },
      ]);
      expect(result).toEqual({
        property: "Due Date",
        date: { before: "2026-03-10" },
      });
    });

    test("after", () => {
      const result = buildFilter(schema, [
        { property: "Due Date", after: "2026-01-01" },
      ]);
      expect(result).toEqual({
        property: "Due Date",
        date: { after: "2026-01-01" },
      });
    });

    test("on_or_before", () => {
      const result = buildFilter(schema, [
        { property: "Due Date", on_or_before: "2026-03-06" },
      ]);
      expect(result).toEqual({
        property: "Due Date",
        date: { on_or_before: "2026-03-06" },
      });
    });

    test("past_week (empty object value)", () => {
      const result = buildFilter(schema, [
        { property: "Due Date", past_week: true },
      ]);
      expect(result).toEqual({
        property: "Due Date",
        date: { past_week: {} },
      });
    });

    test("next_month (empty object value)", () => {
      const result = buildFilter(schema, [
        { property: "Due Date", next_month: true },
      ]);
      expect(result).toEqual({
        property: "Due Date",
        date: { next_month: {} },
      });
    });
  });

  describe("checkbox property", () => {
    const schema = { Done: { type: "checkbox" } };

    test("equals true", () => {
      const result = buildFilter(schema, [
        { property: "Done", equals: true },
      ]);
      expect(result).toEqual({
        property: "Done",
        checkbox: { equals: true },
      });
    });

    test("equals false", () => {
      const result = buildFilter(schema, [
        { property: "Done", equals: false },
      ]);
      expect(result).toEqual({
        property: "Done",
        checkbox: { equals: false },
      });
    });

    test("does_not_equal", () => {
      const result = buildFilter(schema, [
        { property: "Done", does_not_equal: true },
      ]);
      expect(result).toEqual({
        property: "Done",
        checkbox: { does_not_equal: true },
      });
    });
  });
});
