#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { component, findIcon, iconSet, LookupError, RADII, SITE, STROKED, STYLES, search, suggest, svg, usage } from "./core.js";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS = `coolicons is an open source icon set (MIT) in five styles and three corner radii. Never guess an icon name: resolve every name with search_icons before writing code, and look up several names in one call by separating them with commas. If nothing fits, tell the user instead of using a similar icon. Use get_usage for the exact import line, it applies the style and radius entry and the Icon suffix for names that clash with JavaScript or browser globals.`;

const style = { type: "string", enum: STYLES, description: "line, duocolor, duotone, fill or bulk. Default line." };
const radius = { type: "string", enum: RADII, description: "Corner radius: sharp, regular or round. Default regular." };
const readOnly = { readOnlyHint: true, openWorldHint: false };

const TOOLS = [
  {
    name: "describe_set",
    title: "Describe coolicons",
    description: "Counts, styles, corner radii, categories, packages and naming rules of coolicons. Call it once before choosing icons.",
    inputSchema: { type: "object", properties: {} },
    annotations: readOnly,
  },
  {
    name: "search_icons",
    title: "Search coolicons",
    description:
      "Find coolicons by name or meaning, ranked: exact name, then name parts, then tags like delete for trash. Separate several searches with commas to resolve many names in one call, like \"delete, settings, chevron down\".",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "One search, or several separated by commas." },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Results per search. Default 5." },
      },
      required: ["query"],
    },
    annotations: readOnly,
  },
  {
    name: "get_icon",
    title: "Get coolicons SVG",
    description: "The SVG source of one icon in the chosen style and corner radius. Paints with currentColor.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Exact icon name from search_icons, like trash." },
        style,
        radius,
        size: { type: "integer", minimum: 1, description: "Width and height in pixels. Default 24." },
        strokeWidth: { type: "number", minimum: 0.5, maximum: 4, description: "Stroke width for line, duocolor and duotone. Default 2." },
      },
      required: ["name"],
    },
    annotations: readOnly,
  },
  {
    name: "get_usage",
    title: "Get coolicons import",
    description:
      "Install command and import code for one or more icons in React, Vue, plain SVG or the shadcn/ui registry, using the entry for the chosen style and corner radius.",
    inputSchema: {
      type: "object",
      properties: {
        names: { type: "string", description: "Exact icon names, separated by commas." },
        framework: { type: "string", enum: ["react", "vue", "svg", "shadcn"], description: "Default react." },
        style,
        radius,
      },
      required: ["names"],
    },
    annotations: readOnly,
  },
];

const list = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

function describeSet() {
  const { icons, clashes } = iconSet();
  const counts = Object.entries(Object.groupBy(icons, (icon) => icon.category)).map(([category, members]) => `${category} (${members.length})`);
  return `coolicons ${version}: ${icons.length} icons, each in ${STYLES.length} styles and ${RADII.length} corner radii, on a 24 pixel grid with a 2 pixel stroke. MIT license. ${SITE}

Styles: line (strokes), duocolor (strokes with a lighter second stroke), duotone (strokes over a light tone), fill (solid shapes), bulk (solid shapes over a light tone). Only ${[...STROKED].join(", ")} take a stroke width.
Radii: sharp, regular (default), round.

Packages: @coolicons/react and @coolicons/vue (one component per icon, entries like @coolicons/react/fill and @coolicons/react/bulk/round), @coolicons/svg (files at @coolicons/svg/<style>/<radius>/<name>.svg), and the shadcn/ui registry at ${SITE}/r/<name>.json.

Names are lowercase words joined by hyphens, like file-plus-corner. Components use PascalCase, like FilePlusCorner, and also export an Icon suffix. Use the suffix for ${Object.keys(clashes).length} names that clash with globals: ${Object.keys(clashes)
    .map((name) => component({ name }))
    .join(", ")}.

Categories: ${counts.join(", ")}.`;
}

function searchIcons({ query, limit = 5 }) {
  const searches = list(query);
  if (!searches.length) throw new LookupError("query is empty.");
  const blocks = searches.map((term) => {
    const found = search(term, Math.min(Math.max(Number(limit) || 5, 1), 50));
    if (!found.length) {
      const near = suggest(term);
      return `"${term}": no match.${near.length ? ` Close names: ${near.join(", ")}.` : ""}`;
    }
    const rows = found.map((icon) => {
      const alias = icon.aliasOf ? `, same drawing as ${icon.aliasOf}` : "";
      return `- ${icon.name} (${component(icon)}, ${icon.category}${alias})${icon.keywords.length ? `: ${icon.keywords.join(", ")}` : ""}`;
    });
    return `"${term}":\n${rows.join("\n")}`;
  });
  return blocks.join("\n\n");
}

function getIcon({ name, style: chosen = "line", radius: corners = "regular", size = 24, strokeWidth = 2 }) {
  if (!name) throw new LookupError("name is required.");
  return svg(name, { style: chosen, radius: corners, size, strokeWidth });
}

function getUsage({ names, framework = "react", style: chosen = "line", radius: corners = "regular" }) {
  const wanted = list(names);
  if (!wanted.length) throw new LookupError("names is empty.");
  const { install, code } = usage(wanted, { framework, style: chosen, radius: corners });
  const clashing = wanted.map(findIcon).filter((icon) => Object.hasOwn(iconSet().clashes, icon.name));
  const note = clashing.length && (framework === "react" || framework === "vue") ? `\n\nUse the Icon suffix for ${clashing.map(component).join(", ")}: the plain name is a JavaScript, browser or framework name.` : "";
  return `${install}\n\n${code}${note}`;
}

const HANDLERS = { describe_set: describeSet, search_icons: searchIcons, get_icon: getIcon, get_usage: getUsage };

const send = (message) => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
const failure = (id, code, message) => send({ id, error: { code, message } });

function handle(message) {
  const { id, method, params = {} } = message;
  const request = id !== undefined && id !== null;
  if (!request) return;
  if (method === "initialize") {
    const asked = params.protocolVersion;
    return send({
      id,
      result: {
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "coolicons", title: "coolicons", version },
        instructions: INSTRUCTIONS,
      },
    });
  }
  if (method === "ping") return send({ id, result: {} });
  if (method === "tools/list") return send({ id, result: { tools: TOOLS } });
  if (method === "tools/call") {
    const handler = HANDLERS[params.name];
    if (!handler) return failure(id, -32602, `Unknown tool ${params.name}. Tools: ${Object.keys(HANDLERS).join(", ")}.`);
    try {
      return send({ id, result: { content: [{ type: "text", text: handler(params.arguments ?? {}) }] } });
    } catch (error) {
      if (!(error instanceof LookupError)) throw error;
      return send({ id, result: { content: [{ type: "text", text: error.message }], isError: true } });
    }
  }
  return failure(id, -32601, `Method not found: ${method}`);
}

const lines = createInterface({ input: process.stdin });
lines.on("line", (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return failure(null, -32700, "Parse error");
  }
  if (Array.isArray(message) || typeof message !== "object" || message === null) return failure(null, -32600, "Invalid request");
  try {
    handle(message);
  } catch (error) {
    process.stderr.write(`${error.stack ?? error}\n`);
    if (message.id !== undefined && message.id !== null) failure(message.id, -32603, "Internal error");
  }
});
