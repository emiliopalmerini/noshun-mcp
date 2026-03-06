import { describe, test, expect, beforeEach } from "bun:test";
import { SchemaCache } from "./schema-cache";

describe("SchemaCache", () => {
  let cache: SchemaCache;

  beforeEach(() => {
    cache = new SchemaCache(1000); // 1 second TTL for tests
  });

  test("returns undefined on cache miss", () => {
    expect(cache.get("db-123")).toBeUndefined();
  });

  test("stores and retrieves schema", () => {
    const schema = { Name: { type: "title" }, Status: { type: "status" } };
    cache.set("db-123", schema);
    expect(cache.get("db-123")).toEqual(schema);
  });

  test("returns undefined after TTL expires", async () => {
    const schema = { Name: { type: "title" } };
    cache.set("db-123", schema);
    expect(cache.get("db-123")).toEqual(schema);

    await Bun.sleep(1100);

    expect(cache.get("db-123")).toBeUndefined();
  });

  test("different database IDs are independent", () => {
    const schema1 = { Name: { type: "title" } };
    const schema2 = { Priority: { type: "number" } };
    cache.set("db-1", schema1);
    cache.set("db-2", schema2);
    expect(cache.get("db-1")).toEqual(schema1);
    expect(cache.get("db-2")).toEqual(schema2);
  });

  test("overwriting resets TTL", async () => {
    const schema = { Name: { type: "title" } };
    cache.set("db-123", schema);

    await Bun.sleep(600);

    const updated = { Name: { type: "title" }, Status: { type: "status" } };
    cache.set("db-123", updated);

    await Bun.sleep(600);

    // Should still be valid because we reset the TTL
    expect(cache.get("db-123")).toEqual(updated);
  });
});
