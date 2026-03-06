export type PropertySchema = Record<string, { type: string }>;

export interface SimpleFilter {
  property: string;
  [condition: string]: string | number | boolean;
}

const CONDITIONS_BY_TYPE: Record<string, string[]> = {
  status: ["equals", "does_not_equal", "is_empty", "is_not_empty"],
  rich_text: [
    "equals", "does_not_equal",
    "contains", "does_not_contain",
    "starts_with", "ends_with",
    "is_empty", "is_not_empty",
  ],
};

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

  return { property, [type]: { [condition]: value } };
}
