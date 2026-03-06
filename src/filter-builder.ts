export type PropertySchema = Record<string, { type: string }>;

export interface SimpleFilter {
  property: string;
  [condition: string]: string | number | boolean;
}

const STATUS_CONDITIONS = new Set(["equals", "does_not_equal", "is_empty", "is_not_empty"]);

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

  switch (propSchema.type) {
    case "status":
      if (!STATUS_CONDITIONS.has(condition)) {
        throw new Error(`Invalid condition "${condition}" for status property`);
      }
      return { property, status: { [condition]: value } };
    default:
      throw new Error(`Unsupported property type: ${propSchema.type}`);
  }
}
