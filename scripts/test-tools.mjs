import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { iconsDir, loadIcons, root, VARIANTS } from "./icons.mjs";

const started = performance.now();
const { icons } = loadIcons();
const cliFile = path.join(root, "packages/cli/dist/cli.js");
const serverFile = path.join(root, "packages/mcp/dist/server.js");
const cli = (...args) => spawnSync(process.execPath, [cliFile, ...args], { encoding: "utf8", maxBuffer: 1 << 26 });
const exported = (variant, name) => readFileSync(path.join(iconsDir, "svg", variant, `${name}.svg`), "utf8");

for (const variant of VARIANTS) {
  const [style, radius] = variant.split("/");
  for (const icon of icons.filter((_, i) => i % 97 === 0)) {
    const { stdout, status } = cli("show", icon.name, "--style", style, "--radius", radius);
    assert.equal(status, 0, `show ${icon.name} ${variant}`);
    assert.equal(stdout, exported(variant, icon.name), `show ${icon.name} ${variant}`);
  }
}

const listed = cli("list").stdout.trim().split("\n");
assert.deepEqual(listed, icons.map((icon) => icon.name));

const found = cli("search", "calendar", "--json");
assert.equal(JSON.parse(found.stdout)[0].name, "calendar");

const typo = cli("show", "calender");
assert.equal(typo.status, 1);
assert.match(typo.stderr, /Did you mean calendar/);

const folder = mkdtempSync(path.join(os.tmpdir(), "coolicons-cli-"));
try {
  assert.equal(cli("add", "bell", "calendar", "--style", "bulk", "--radius", "round", "--out", folder).status, 0);
  for (const name of ["bell", "calendar"]) assert.equal(readFileSync(path.join(folder, `${name}.svg`), "utf8"), exported("bulk/round", name));
} finally {
  rmSync(folder, { recursive: true, force: true });
}

const messages = [
  { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } },
  { jsonrpc: "2.0", method: "notifications/initialized" },
  { jsonrpc: "2.0", id: 2, method: "tools/list" },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_icon", arguments: { name: "calendar-event", style: "duotone", radius: "round" } } },
  { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "search_icons", arguments: { query: "calendar-event, bell" } } },
  { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "get_usage", arguments: { names: "map", style: "fill" } } },
  { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "get_icon", arguments: { name: "calender" } } },
  { jsonrpc: "2.0", id: 7, method: "unknown" },
  { jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "get_usage", arguments: { names: "calendar-event", framework: "shadcn", style: "bulk", radius: "round" } } },
  { jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "list_icons", arguments: { category: "calendar", offset: 2, limit: 3 } } },
  { jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "list_icons", arguments: { category: "nope" } } },
  { jsonrpc: "2.0", id: 11, method: "tools/call", params: { name: "search_icons", arguments: { query: "dark mode toggle, icon for settings" } } },
];
const replies = new Map(
  execFileSync(process.execPath, [serverFile], { input: messages.map((message) => JSON.stringify(message)).join("\n"), encoding: "utf8" })
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line))
    .map((reply) => [reply.id, reply]),
);
assert.equal(replies.size, 11);
assert.equal(replies.get(1).result.protocolVersion, "2025-06-18");
assert.ok(replies.get(1).result.instructions.includes("Never guess"));
assert.deepEqual(
  replies.get(2).result.tools.map((tool) => tool.name),
  ["describe_set", "search_icons", "list_icons", "get_icon", "get_usage"],
);
assert.equal(replies.get(3).result.content[0].text, exported("duotone/round", "calendar-event"));
assert.match(replies.get(4).result.content[0].text, /- calendar-event \(CalendarEvent/);
assert.match(replies.get(4).result.content[0].text, /- bell \(Bell/);
assert.match(replies.get(5).result.content[0].text, /import \{ MapIcon \} from "@coolicons\/react\/fill";/);
assert.equal(replies.get(6).result.isError, true);
assert.equal(replies.get(7).error.code, -32601);
assert.match(replies.get(8).result.content[0].text, /npx shadcn@latest add @coolicons\/bulk\/round\/calendar-event\b/);
assert.match(replies.get(8).result.content[0].text, /components\/icons\/bulk\/round\/calendar-event\.tsx exporting CalendarEvent/);

const index = JSON.parse(readFileSync(path.join(root, "packages/mcp/dist/data/index.json"), "utf8"));
const calendar = index.icons.filter((icon) => icon.category === "Calendar");
assert.match(replies.get(9).result.content[0].text, new RegExp(`^Calendar: icons 3 to 5 of ${calendar.length}\\. Next page: offset 5\\.\\n- ${calendar[2].name} \\(`));
assert.equal(replies.get(10).result.isError, true);
assert.match(replies.get(10).result.content[0].text, /Categories: .*Calendar/);
assert.match(replies.get(11).result.content[0].text, /"dark mode toggle": no icon matches every word/);
assert.match(replies.get(11).result.content[0].text, /weak: no /);
assert.match(replies.get(11).result.content[0].text, /"icon for settings":\n- settings \(SettingsIcon/);

const weak = cli("search", "dark", "mode", "toggle");
assert.equal(weak.status, 1);
assert.match(weak.stderr, /Weak matches by some words/);
assert.match(weak.stdout, /weak: no /);

console.log(`cli and mcp match the export, ${((performance.now() - started) / 1000).toFixed(1)} s`);
