export function formatBlocks(blocks: any[]): string {
  let numberedIndex = 0;

  return blocks
    .map((block, i) => {
      if (block.type !== "numbered_list_item") {
        numberedIndex = 0;
      }

      switch (block.type) {
        case "paragraph":
          return richTextToString(block.paragraph.rich_text);

        case "heading_1":
          return `# ${richTextToString(block.heading_1.rich_text)}`;
        case "heading_2":
          return `## ${richTextToString(block.heading_2.rich_text)}`;
        case "heading_3":
          return `### ${richTextToString(block.heading_3.rich_text)}`;

        case "bulleted_list_item":
          return `- ${richTextToString(block.bulleted_list_item.rich_text)}`;

        case "numbered_list_item":
          numberedIndex++;
          return `${numberedIndex}. ${richTextToString(block.numbered_list_item.rich_text)}`;

        case "to_do": {
          const check = block.to_do.checked ? "x" : " ";
          return `- [${check}] ${richTextToString(block.to_do.rich_text)}`;
        }

        case "code":
          return `\`\`\`${block.code.language}\n${richTextToString(block.code.rich_text)}\n\`\`\``;

        case "quote":
          return `> ${richTextToString(block.quote.rich_text)}`;

        case "divider":
          return "---";

        default:
          return `[${block.type}]`;
      }
    })
    .join("\n");
}

function richTextToString(richText: any[]): string {
  return richText.map((t: any) => t.plain_text).join("");
}
