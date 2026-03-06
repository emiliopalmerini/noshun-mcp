import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./src/tools";

const token = process.env.NOTION_API_TOKEN;
if (!token) {
  console.error("NOTION_API_TOKEN environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "noshun-mcp",
  version: "0.1.0",
});

registerTools(server, token);

const transport = new StdioServerTransport();
await server.connect(transport);
