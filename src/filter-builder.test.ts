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
});
