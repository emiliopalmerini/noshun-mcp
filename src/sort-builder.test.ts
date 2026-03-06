import { describe, test, expect } from "bun:test";
import { buildSorts } from "./sort-builder";

describe("buildSorts", () => {
  test("sort by property ascending", () => {
    const result = buildSorts([{ property: "Name", direction: "ascending" }]);
    expect(result).toEqual([{ property: "Name", direction: "ascending" }]);
  });

  test("sort by property descending", () => {
    const result = buildSorts([{ property: "Priority", direction: "descending" }]);
    expect(result).toEqual([{ property: "Priority", direction: "descending" }]);
  });

  test("sort by timestamp", () => {
    const result = buildSorts([{ timestamp: "created_time", direction: "descending" }]);
    expect(result).toEqual([{ timestamp: "created_time", direction: "descending" }]);
  });

  test("sort by last_edited_time", () => {
    const result = buildSorts([{ timestamp: "last_edited_time", direction: "ascending" }]);
    expect(result).toEqual([{ timestamp: "last_edited_time", direction: "ascending" }]);
  });

  test("multiple sorts in priority order", () => {
    const result = buildSorts([
      { property: "Status", direction: "ascending" },
      { timestamp: "last_edited_time", direction: "descending" },
    ]);
    expect(result).toEqual([
      { property: "Status", direction: "ascending" },
      { timestamp: "last_edited_time", direction: "descending" },
    ]);
  });

  test("throws on invalid direction", () => {
    expect(() =>
      buildSorts([{ property: "Name", direction: "sideways" as any }])
    ).toThrow('Invalid direction "sideways"');
  });

  test("throws on invalid timestamp", () => {
    expect(() =>
      buildSorts([{ timestamp: "deleted_time" as any, direction: "ascending" }])
    ).toThrow('Invalid timestamp "deleted_time"');
  });

  test("throws when neither property nor timestamp provided", () => {
    expect(() =>
      buildSorts([{ direction: "ascending" } as any])
    ).toThrow("must specify either");
  });
});
