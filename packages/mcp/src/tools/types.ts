import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

export interface McpTool<
  InputArgs extends ZodRawShapeCompat | undefined =
    | ZodRawShapeCompat
    | undefined,
  OutputArgs extends ZodRawShapeCompat = ZodRawShapeCompat,
> {
  name: string;
  config: {
    title?: string;
    description?: string;
    inputSchema?: InputArgs;
    outputSchema?: OutputArgs;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
  };
  executeCallback: ToolCallback<InputArgs>;
}
