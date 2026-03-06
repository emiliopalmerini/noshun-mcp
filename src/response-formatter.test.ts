import { describe, test, expect } from "bun:test";
import { formatQueryResponse } from "./response-formatter";

describe("formatQueryResponse", () => {
  test("extracts id, url, and flattened properties", () => {
    const raw = {
      results: [
        {
          object: "page",
          id: "page-1",
          created_time: "2026-01-01T00:00:00.000Z",
          last_edited_time: "2026-03-01T00:00:00.000Z",
          created_by: { object: "user", id: "user-1" },
          last_edited_by: { object: "user", id: "user-1" },
          cover: null,
          icon: null,
          archived: false,
          in_trash: false,
          url: "https://notion.so/page-1",
          public_url: null,
          properties: {
            Name: { id: "title", type: "title", title: [{ plain_text: "My Task" }] },
            Status: { id: "abc", type: "status", status: { name: "Done", color: "green" } },
            Priority: { id: "def", type: "number", number: 5 },
            Done: { id: "ghi", type: "checkbox", checkbox: true },
            Tags: { id: "jkl", type: "multi_select", multi_select: [{ name: "urgent" }, { name: "bug" }] },
            Category: { id: "mno", type: "select", select: { name: "Work", color: "blue" } },
            "Due Date": { id: "pqr", type: "date", date: { start: "2026-03-10", end: null } },
            Assignee: { id: "stu", type: "people", people: [{ id: "user-1", name: "Emilio" }] },
            Notes: { id: "vwx", type: "rich_text", rich_text: [{ plain_text: "Some notes here" }] },
            Project: { id: "yza", type: "relation", relation: [{ id: "proj-1" }, { id: "proj-2" }] },
          },
        },
      ],
      has_more: false,
      next_cursor: null,
    };

    const result = formatQueryResponse(raw);

    expect(result).toEqual({
      results: [
        {
          id: "page-1",
          url: "https://notion.so/page-1",
          Name: "My Task",
          Status: "Done",
          Priority: 5,
          Done: true,
          Tags: ["urgent", "bug"],
          Category: "Work",
          "Due Date": "2026-03-10",
          Assignee: ["Emilio"],
          Notes: "Some notes here",
          Project: ["proj-1", "proj-2"],
        },
      ],
      has_more: false,
      next_cursor: null,
    });
  });

  test("handles null/empty property values", () => {
    const raw = {
      results: [
        {
          id: "page-2",
          url: "https://notion.so/page-2",
          properties: {
            Name: { id: "title", type: "title", title: [] },
            Status: { id: "abc", type: "status", status: null },
            Priority: { id: "def", type: "number", number: null },
            Category: { id: "mno", type: "select", select: null },
            "Due Date": { id: "pqr", type: "date", date: null },
          },
        },
      ],
      has_more: false,
      next_cursor: null,
    };

    const result = formatQueryResponse(raw);

    expect(result).toEqual({
      results: [
        {
          id: "page-2",
          url: "https://notion.so/page-2",
          Name: "",
          Status: null,
          Priority: null,
          Category: null,
          "Due Date": null,
        },
      ],
      has_more: false,
      next_cursor: null,
    });
  });
});
