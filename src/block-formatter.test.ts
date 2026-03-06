import { describe, test, expect } from "bun:test";
import { formatBlocks } from "./block-formatter";

describe("formatBlocks", () => {
  test("paragraph", () => {
    const blocks = [
      { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Hello world" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("Hello world");
  });

  test("headings", () => {
    const blocks = [
      { type: "heading_1", heading_1: { rich_text: [{ plain_text: "Title" }] } },
      { type: "heading_2", heading_2: { rich_text: [{ plain_text: "Subtitle" }] } },
      { type: "heading_3", heading_3: { rich_text: [{ plain_text: "Section" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("# Title\n## Subtitle\n### Section");
  });

  test("bulleted list", () => {
    const blocks = [
      { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: "Item one" }] } },
      { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: "Item two" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("- Item one\n- Item two");
  });

  test("numbered list", () => {
    const blocks = [
      { type: "numbered_list_item", numbered_list_item: { rich_text: [{ plain_text: "First" }] } },
      { type: "numbered_list_item", numbered_list_item: { rich_text: [{ plain_text: "Second" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("1. First\n2. Second");
  });

  test("to_do", () => {
    const blocks = [
      { type: "to_do", to_do: { rich_text: [{ plain_text: "Buy milk" }], checked: false } },
      { type: "to_do", to_do: { rich_text: [{ plain_text: "Done task" }], checked: true } },
    ];
    expect(formatBlocks(blocks)).toBe("- [ ] Buy milk\n- [x] Done task");
  });

  test("code block", () => {
    const blocks = [
      { type: "code", code: { rich_text: [{ plain_text: "const x = 1;" }], language: "typescript" } },
    ];
    expect(formatBlocks(blocks)).toBe("```typescript\nconst x = 1;\n```");
  });

  test("quote", () => {
    const blocks = [
      { type: "quote", quote: { rich_text: [{ plain_text: "Be yourself." }] } },
    ];
    expect(formatBlocks(blocks)).toBe("> Be yourself.");
  });

  test("divider", () => {
    const blocks = [
      { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Above" }] } },
      { type: "divider", divider: {} },
      { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Below" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("Above\n---\nBelow");
  });

  test("mixed content", () => {
    const blocks = [
      { type: "heading_1", heading_1: { rich_text: [{ plain_text: "Notes" }] } },
      { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Some text." }] } },
      { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: "Point A" }] } },
      { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: "Point B" }] } },
    ];
    expect(formatBlocks(blocks)).toBe("# Notes\nSome text.\n- Point A\n- Point B");
  });

  test("empty rich_text", () => {
    const blocks = [
      { type: "paragraph", paragraph: { rich_text: [] } },
    ];
    expect(formatBlocks(blocks)).toBe("");
  });

  test("unsupported block type passes through type name", () => {
    const blocks = [
      { type: "table", table: {} },
    ];
    expect(formatBlocks(blocks)).toBe("[table]");
  });
});
