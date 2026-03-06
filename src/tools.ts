import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NotionClient } from "./notion-client";
import { buildQueryRequest } from "./query-builder";
import type { SimpleFilter } from "./filter-builder";
import type { SimpleSort } from "./sort-builder";
import { formatQueryResponse, formatPageProperties } from "./response-formatter";
import { formatBlocks } from "./block-formatter";
import { SchemaCache } from "./schema-cache";

type FetchFn = typeof globalThis.fetch;

interface SchemaArgs {
  database_id: string;
}

interface QueryArgs {
  database_id: string;
  filters?: SimpleFilter[];
  filter_operator?: "and" | "or";
  sorts?: SimpleSort[];
  page_size?: number;
  start_cursor?: string;
}

export async function handleGetDatabaseSchema(
  args: SchemaArgs,
  token: string,
  fetchFn: FetchFn = globalThis.fetch,
) {
  const client = new NotionClient(token, fetchFn);
  const schema = await client.getDatabaseSchema(args.database_id);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(schema, null, 2) }],
  };
}

export async function handleQueryDatabase(
  args: QueryArgs,
  token: string,
  fetchFn: FetchFn = globalThis.fetch,
  cache?: SchemaCache,
) {
  const client = new NotionClient(token, fetchFn);
  let schema = cache?.get(args.database_id);
  if (!schema) {
    schema = await client.getDatabaseSchema(args.database_id);
    cache?.set(args.database_id, schema);
  }
  const body = buildQueryRequest(schema, {
    filters: args.filters,
    filter_operator: args.filter_operator,
    sorts: args.sorts,
    page_size: args.page_size,
    start_cursor: args.start_cursor,
  });
  const raw = await client.queryDatabase(args.database_id, body);
  const result = formatQueryResponse(raw);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleGetPage(
  args: { page_id: string },
  token: string,
  fetchFn: FetchFn = globalThis.fetch,
) {
  const client = new NotionClient(token, fetchFn);
  const [page, blocks] = await Promise.all([
    client.getPage(args.page_id),
    client.getBlockChildren(args.page_id),
  ]);
  const result = {
    id: page.id,
    url: page.url,
    properties: formatPageProperties(page.properties),
    content: formatBlocks(blocks.results),
  };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleListDatabases(
  args: { query?: string },
  token: string,
  fetchFn: FetchFn = globalThis.fetch,
) {
  const client = new NotionClient(token, fetchFn);
  const databases = await client.searchDatabases(args.query);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(databases, null, 2) }],
  };
}

export function registerTools(server: McpServer, token: string, fetchFn?: FetchFn) {
  const schemaCache = new SchemaCache();
  server.tool(
    "list-databases",
    "Search for Notion databases accessible to the integration. Returns database IDs, titles, and descriptions. Use this to find database IDs before using get-database-schema or query-database.",
    {
      query: z.string().optional().describe("Optional search query to filter databases by title. Omit to list all."),
    },
    async (args) => handleListDatabases(args, token, fetchFn),
  );

  server.tool(
    "get-database-schema",
    "Get the schema (property names and types) of a Notion database. Use this before query-database to know which properties and types are available for filtering.",
    { database_id: z.string().describe("The Notion database ID (UUID)") },
    async (args) => handleGetDatabaseSchema(args, token, fetchFn),
  );

  server.tool(
    "query-database",
    "Query a Notion database with deterministic filters, sorts, and pagination. Use get-database-schema first to discover available properties.",
    {
      database_id: z.string().describe("The Notion database ID (UUID)"),
      filters: z
        .array(
          z.object({
            property: z.string(),
          }).passthrough(),
        )
        .optional()
        .describe("Simplified filters. Each object has 'property' plus one condition (e.g. equals, contains, greater_than, before, etc.)"),
      filter_operator: z
        .enum(["and", "or"])
        .optional()
        .describe("How to combine multiple filters. Defaults to 'and'."),
      sorts: z
        .array(
          z.union([
            z.object({ property: z.string(), direction: z.enum(["ascending", "descending"]) }),
            z.object({ timestamp: z.enum(["created_time", "last_edited_time"]), direction: z.enum(["ascending", "descending"]) }),
          ]),
        )
        .optional()
        .describe("Sort results by property or timestamp."),
      page_size: z.number().optional().describe("Number of results per page (max 100)."),
      start_cursor: z.string().optional().describe("Cursor for pagination from a previous query."),
    },
    async (args) => handleQueryDatabase(args as QueryArgs, token, fetchFn, schemaCache),
  );

  server.tool(
    "get-page",
    "Get a Notion page's properties and body content. Returns flattened property values and the page content as markdown.",
    { page_id: z.string().describe("The Notion page ID (UUID)") },
    async (args) => handleGetPage(args, token, fetchFn),
  );
}
