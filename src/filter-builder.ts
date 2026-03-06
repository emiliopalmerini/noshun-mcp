export type PropertySchema = Record<string, { type: string }>;

export interface SimpleFilter {
  property: string;
  [condition: string]: string | number | boolean;
}

const CONDITIONS_BY_TYPE: Record<string, string[]> = {
  checkbox: ["equals", "does_not_equal"],
  select: ["equals", "does_not_equal", "is_empty", "is_not_empty"],
  multi_select: ["contains", "does_not_contain", "is_empty", "is_not_empty"],
  people: ["contains", "does_not_contain", "is_empty", "is_not_empty"],
  relation: ["contains", "does_not_contain", "is_empty", "is_not_empty"],
  status: ["equals", "does_not_equal", "is_empty", "is_not_empty"],
  number: [
    "equals", "does_not_equal",
    "greater_than", "greater_than_or_equal_to",
    "less_than", "less_than_or_equal_to",
    "is_empty", "is_not_empty",
  ],
  rich_text: [
    "equals", "does_not_equal",
    "contains", "does_not_contain",
    "starts_with", "ends_with",
    "is_empty", "is_not_empty",
  ],
  date: [
    "equals", "before", "after",
    "on_or_before", "on_or_after",
    "past_week", "past_month", "past_year",
    "next_week", "next_month", "next_year",
    "this_week",
    "is_empty", "is_not_empty",
  ],
};

const DATE_RELATIVE_CONDITIONS = new Set([
  "past_week", "past_month", "past_year",
  "next_week", "next_month", "next_year",
  "this_week",
]);

export function buildFilter(schema: PropertySchema, filters: SimpleFilter[]) {
  if (filters.length === 1) {
    return buildSingleFilter(schema, filters[0]);
  }
  throw new Error("Multiple filters not yet supported");
}

function buildSingleFilter(schema: PropertySchema, filter: SimpleFilter) {
  const { property, ...conditions } = filter;
  const propSchema = schema[property];
  if (!propSchema) {
    throw new Error(`Property "${property}" not found in schema`);
  }

  const conditionEntries = Object.entries(conditions);
  if (conditionEntries.length !== 1) {
    throw new Error(`Expected exactly one condition, got ${conditionEntries.length}`);
  }

  const [condition, value] = conditionEntries[0];
  const { type } = propSchema;

  const validConditions = CONDITIONS_BY_TYPE[type];
  if (!validConditions) {
    throw new Error(`Unsupported property type: ${type}`);
  }
  if (!validConditions.includes(condition)) {
    throw new Error(`Invalid condition "${condition}" for ${type} property`);
  }

  const conditionValue = DATE_RELATIVE_CONDITIONS.has(condition) ? {} : value;
  return { property, [type]: { [condition]: conditionValue } };
}
