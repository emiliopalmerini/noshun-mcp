import type { PropertySchema } from "./filter-builder";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

type FetchFn = typeof globalThis.fetch;

export class NotionClient {
  private headers: Record<string, string>;

  constructor(
    private token: string,
    private fetchFn: FetchFn = globalThis.fetch,
  ) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    };
  }

  async getDatabaseSchema(databaseId: string): Promise<PropertySchema> {
    const res = await this.fetchFn(`${NOTION_API_BASE}/databases/${databaseId}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(`Notion API error ${res.status}: ${body.message}`);
    }

    const data = await res.json();
    const schema: PropertySchema = {};
    for (const [name, prop] of Object.entries(data.properties)) {
      schema[name] = { type: (prop as any).type };
    }
    return schema;
  }

  async queryDatabase(databaseId: string, body: Record<string, unknown>) {
    const res = await this.fetchFn(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.json();
      throw new Error(`Notion API error ${res.status}: ${(errBody as any).message}`);
    }

    return res.json();
  }
}
