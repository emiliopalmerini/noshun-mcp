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

  describe("select property", () => {
    const schema = { Category: { type: "select" } };

    test("equals", () => {
      const result = buildFilter(schema, [
        { property: "Category", equals: "Work" },
      ]);
      expect(result).toEqual({
        property: "Category",
        select: { equals: "Work" },
      });
    });

    test("does_not_equal", () => {
      const result = buildFilter(schema, [
        { property: "Category", does_not_equal: "Personal" },
      ]);
      expect(result).toEqual({
        property: "Category",
        select: { does_not_equal: "Personal" },
      });
    });

    test("is_empty", () => {
      const result = buildFilter(schema, [
        { property: "Category", is_empty: true },
      ]);
      expect(result).toEqual({
        property: "Category",
        select: { is_empty: true },
      });
    });
  });

  describe("multi_select property", () => {
    const schema = { Tags: { type: "multi_select" } };

    test("contains", () => {
      const result = buildFilter(schema, [
        { property: "Tags", contains: "urgent" },
      ]);
      expect(result).toEqual({
        property: "Tags",
        multi_select: { contains: "urgent" },
      });
    });

    test("does_not_contain", () => {
      const result = buildFilter(schema, [
        { property: "Tags", does_not_contain: "archived" },
      ]);
      expect(result).toEqual({
        property: "Tags",
        multi_select: { does_not_contain: "archived" },
      });
    });

    test("is_not_empty", () => {
      const result = buildFilter(schema, [
        { property: "Tags", is_not_empty: true },
      ]);
      expect(result).toEqual({
        property: "Tags",
        multi_select: { is_not_empty: true },
      });
    });
  });

  describe("people property", () => {
    const schema = { Assignee: { type: "people" } };

    test("contains", () => {
      const result = buildFilter(schema, [
        { property: "Assignee", contains: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      ]);
      expect(result).toEqual({
        property: "Assignee",
        people: { contains: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      });
    });

    test("does_not_contain", () => {
      const result = buildFilter(schema, [
        { property: "Assignee", does_not_contain: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      ]);
      expect(result).toEqual({
        property: "Assignee",
        people: { does_not_contain: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      });
    });

    test("is_empty", () => {
      const result = buildFilter(schema, [
        { property: "Assignee", is_empty: true },
      ]);
      expect(result).toEqual({
        property: "Assignee",
        people: { is_empty: true },
      });
    });
  });

  describe("relation property", () => {
    const schema = { Project: { type: "relation" } };

    test("contains", () => {
      const result = buildFilter(schema, [
        { property: "Project", contains: "b2c3d4e5-f6a7-8901-bcde-f12345678901" },
      ]);
      expect(result).toEqual({
        property: "Project",
        relation: { contains: "b2c3d4e5-f6a7-8901-bcde-f12345678901" },
      });
    });

    test("is_not_empty", () => {
      const result = buildFilter(schema, [
        { property: "Project", is_not_empty: true },
      ]);
      expect(result).toEqual({
        property: "Project",
        relation: { is_not_empty: true },
      });
    });
  });
});
