import type { PropertySchema } from "./filter-builder";

const ONE_HOUR = 60 * 60 * 1000;

interface CacheEntry {
  schema: PropertySchema;
  expiresAt: number;
}

export class SchemaCache {
  private cache = new Map<string, CacheEntry>();

  constructor(private ttlMs: number = ONE_HOUR) {}

  get(databaseId: string): PropertySchema | undefined {
    const entry = this.cache.get(databaseId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(databaseId);
      return undefined;
    }
    return entry.schema;
  }

  set(databaseId: string, schema: PropertySchema): void {
    this.cache.set(databaseId, {
      schema,
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}
