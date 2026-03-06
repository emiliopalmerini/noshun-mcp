import { describe, test, expect, mock, beforeEach } from "bun:test";
import { handleGetDatabaseSchema, handleQueryDatabase, handleListDatabases, handleGetPage } from "./tools";
import { SchemaCache } from "./schema-cache";

const mockFetch = mock();

beforeEach(() => {
  mockFetch.mockReset();
});

describe("handleGetDatabaseSchema", () => {
  test("returns simplified schema", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: {
          Name: { id: "title", type: "title", title: {} },
          Status: { id: "abc", type: "status", status: {} },
        },
      }),
    });

    const result = await handleGetDatabaseSchema(
      { database_id: "db-123" },
      "test-token",
      mockFetch as any,
    );

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { Name: { type: "title" }, Status: { type: "status" } },
            null,
            2,
          ),
        },
      ],
    });
  });
});

describe("handleQueryDatabase", () => {
  test("fetches schema, builds query, returns results", async () => {
    // First call: getDatabaseSchema
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: {
          Status: { id: "abc", type: "status", status: {} },
        },
      }),
    });
    // Second call: queryDatabase
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ id: "page-1", url: "https://notion.so/page-1", properties: {} }],
        has_more: false,
        next_cursor: null,
      }),
    });

    const result = await handleQueryDatabase(
      {
        database_id: "db-123",
        filters: [{ property: "Status", equals: "Done" }],
      },
      "test-token",
      mockFetch as any,
    );

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].id).toBe("page-1");
    expect(parsed.results[0].url).toBe("https://notion.so/page-1");
    expect(parsed.has_more).toBe(false);

    // Verify the query call had the right filter
    const queryCall = mockFetch.mock.calls[1];
    const body = JSON.parse(queryCall![1].body);
    expect(body.filter).toEqual({
      property: "Status",
      status: { equals: "Done" },
    });
  });

  test("passes sorts and pagination", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: {
          Name: { id: "title", type: "rich_text", rich_text: {} },
        },
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        has_more: false,
        next_cursor: null,
      }),
    });

    await handleQueryDatabase(
      {
        database_id: "db-123",
        sorts: [{ property: "Name", direction: "ascending" }],
        page_size: 5,
        start_cursor: "cur-abc",
      },
      "test-token",
      mockFetch as any,
    );

    const queryCall = mockFetch.mock.calls[1];
    const body = JSON.parse(queryCall![1].body);
    expect(body.sorts).toEqual([{ property: "Name", direction: "ascending" }]);
    expect(body.page_size).toBe(5);
    expect(body.start_cursor).toBe("cur-abc");
  });

  test("uses cached schema on second query to same database", async () => {
    const cache = new SchemaCache();

    // First query: schema fetch + query (2 fetch calls)
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: { Status: { id: "abc", type: "status", status: {} } },
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], has_more: false, next_cursor: null }),
    });

    await handleQueryDatabase(
      { database_id: "db-123", filters: [{ property: "Status", equals: "Done" }] },
      "test-token",
      mockFetch as any,
      cache,
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Second query: only query call, no schema fetch (1 fetch call)
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], has_more: false, next_cursor: null }),
    });

    await handleQueryDatabase(
      { database_id: "db-123", filters: [{ property: "Status", equals: "Done" }] },
      "test-token",
      mockFetch as any,
      cache,
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("handleListDatabases", () => {
  test("returns list of databases with id and title", async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { id: "db-aaa", title: [{ plain_text: "Tasks" }], description: [{ plain_text: "My tasks" }] },
          { id: "db-bbb", title: [{ plain_text: "Projects" }], description: [] },
        ],
        has_more: false,
        next_cursor: null,
      }),
    });

    const result = await handleListDatabases(
      {},
      "test-token",
      mockFetch as any,
    );

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toEqual([
      { id: "db-aaa", title: "Tasks", description: "My tasks" },
      { id: "db-bbb", title: "Projects", description: "" },
    ]);
  });

  test("passes query when provided", async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], has_more: false, next_cursor: null }),
    });

    await handleListDatabases(
      { query: "Tasks" },
      "test-token",
      mockFetch as any,
    );

    const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
    expect(body.query).toBe("Tasks");
  });
});

describe("handleGetPage", () => {
  test("returns page properties and formatted content", async () => {
    mockFetch.mockReset();
    // First call: get page metadata
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "page-1",
        url: "https://notion.so/page-1",
        properties: {
          Name: { id: "title", type: "title", title: [{ plain_text: "My Page" }] },
          Status: { id: "abc", type: "status", status: { name: "Active", color: "green" } },
        },
      }),
    });
    // Second call: get block children
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { type: "heading_1", heading_1: { rich_text: [{ plain_text: "Overview" }] } },
          { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Some content here." }] } },
        ],
        has_more: false,
        next_cursor: null,
      }),
    });

    const result = await handleGetPage(
      { page_id: "page-1" },
      "test-token",
      mockFetch as any,
    );

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe("page-1");
    expect(parsed.url).toBe("https://notion.so/page-1");
    expect(parsed.properties.Name).toBe("My Page");
    expect(parsed.properties.Status).toBe("Active");
    expect(parsed.content).toBe("# Overview\nSome content here.");
  });
});
