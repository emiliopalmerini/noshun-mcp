import { describe, test, expect, mock } from "bun:test";
import { NotionClient } from "./notion-client";

const mockFetch = mock();

function createClient() {
  return new NotionClient("test-token", mockFetch as any);
}

describe("NotionClient", () => {
  describe("getDatabaseSchema", () => {
    test("fetches and returns simplified schema", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            Name: { id: "title", type: "title", title: {} },
            Status: { id: "abc", type: "status", status: { options: [{ name: "Done" }, { name: "In Progress" }] } },
            Priority: { id: "def", type: "number", number: { format: "number" } },
            Tags: { id: "ghi", type: "multi_select", multi_select: { options: [{ name: "urgent" }] } },
          },
        }),
      });

      const client = createClient();
      const schema = await client.getDatabaseSchema("db-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.notion.com/v1/databases/db-123",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer test-token",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
        },
      );

      expect(schema).toEqual({
        Name: { type: "title" },
        Status: { type: "status" },
        Priority: { type: "number" },
        Tags: { type: "multi_select" },
      });
    });

    test("throws on API error", async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Database not found" }),
      });

      const client = createClient();
      expect(client.getDatabaseSchema("bad-id")).rejects.toThrow("404");
    });
  });

  describe("queryDatabase", () => {
    test("posts query body and returns results", async () => {
      mockFetch.mockReset();
      const mockResults = {
        results: [{ id: "page-1" }, { id: "page-2" }],
        has_more: true,
        next_cursor: "cursor-abc",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const client = createClient();
      const result = await client.queryDatabase("db-123", {
        filter: { property: "Status", status: { equals: "Done" } },
        sorts: [{ property: "Name", direction: "ascending" }],
        page_size: 10,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.notion.com/v1/databases/db-123/query",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter: { property: "Status", status: { equals: "Done" } },
            sorts: [{ property: "Name", direction: "ascending" }],
            page_size: 10,
          }),
        },
      );

      expect(result).toEqual(mockResults);
    });

    test("throws on API error", async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid filter" }),
      });

      const client = createClient();
      expect(client.queryDatabase("db-123", {})).rejects.toThrow("400");
    });
  });
});
