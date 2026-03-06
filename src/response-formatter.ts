export function formatQueryResponse(raw: any) {
  return {
    results: raw.results.map(formatPage),
    has_more: raw.has_more,
    next_cursor: raw.next_cursor,
  };
}

function formatPage(page: any) {
  const formatted: Record<string, unknown> = {
    id: page.id,
    url: page.url,
  };

  for (const [name, prop] of Object.entries(page.properties)) {
    formatted[name] = extractValue(prop as any);
  }

  return formatted;
}

function extractValue(prop: { type: string; [key: string]: any }): unknown {
  const val = prop[prop.type];

  switch (prop.type) {
    case "title":
    case "rich_text":
      return Array.isArray(val) ? val.map((t: any) => t.plain_text).join("") : "";

    case "number":
    case "checkbox":
      return val;

    case "select":
    case "status":
      return val?.name ?? null;

    case "multi_select":
      return Array.isArray(val) ? val.map((o: any) => o.name) : [];

    case "date":
      return val?.start ?? null;

    case "people":
      return Array.isArray(val) ? val.map((p: any) => p.name) : [];

    case "relation":
      return Array.isArray(val) ? val.map((r: any) => r.id) : [];

    default:
      return val;
  }
}
