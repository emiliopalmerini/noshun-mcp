import { describe, test, expect, mock, beforeEach } from "bun:test";
import { handleGetDatabaseSchema, handleQueryDatabase } from "./tools";

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
        results: [{ id: "page-1", properties: {} }],
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
});
