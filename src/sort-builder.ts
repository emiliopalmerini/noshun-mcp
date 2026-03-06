export interface PropertySort {
  property: string;
  direction: "ascending" | "descending";
}

export interface TimestampSort {
  timestamp: "created_time" | "last_edited_time";
  direction: "ascending" | "descending";
}

export type SimpleSort = PropertySort | TimestampSort;

const VALID_DIRECTIONS = new Set(["ascending", "descending"]);
const VALID_TIMESTAMPS = new Set(["created_time", "last_edited_time"]);

export function buildSorts(sorts: SimpleSort[]) {
  return sorts.map(validateSort);
}

function validateSort(sort: SimpleSort) {
  if (!VALID_DIRECTIONS.has(sort.direction)) {
    throw new Error(`Invalid direction "${sort.direction}"`);
  }

  if ("timestamp" in sort) {
    if (!VALID_TIMESTAMPS.has(sort.timestamp)) {
      throw new Error(`Invalid timestamp "${sort.timestamp}"`);
    }
    return { timestamp: sort.timestamp, direction: sort.direction };
  }

  if ("property" in sort) {
    return { property: sort.property, direction: sort.direction };
  }

  throw new Error("Sort must specify either 'property' or 'timestamp'");
}
