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

const found = cli("search", "trash", "--json");
assert.equal(JSON.parse(found.stdout)[0].name, "trash");

const typo = cli("show", "trahs");
assert.equal(typo.status, 1);
assert.match(typo.stderr, /Did you mean trash/);

const folder = mkdtempSync(path.join(os.tmpdir(), "coolicons-cli-"));
try {
  assert.equal(cli("add", "bell", "trash", "--style", "bulk", "--radius", "round", "--out", folder).status, 0);
  for (const name of ["bell", "trash"]) assert.equal(readFileSync(path.join(folder, `${name}.svg`), "utf8"), exported("bulk/round", name));
} finally {
  rmSync(folder, { recursive: true, force: true });
}

const messages = [
  { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } },
  { jsonrpc: "2.0", method: "notifications/initialized" },
  { jsonrpc: "2.0", id: 2, method: "tools/list" },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_icon", arguments: { name: "trash", style: "duotone", radius: "round" } } },
  { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "search_icons", arguments: { query: "trash, bell" } } },
  { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "get_usage", arguments: { names: "map", style: "fill" } } },
  { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "get_icon", arguments: { name: "trahs" } } },
  { jsonrpc: "2.0", id: 7, method: "unknown" },
];
const replies = new Map(
  execFileSync(process.execPath, [serverFile], { input: messages.map((message) => JSON.stringify(message)).join("\n"), encoding: "utf8" })
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line))
    .map((reply) => [reply.id, reply]),
);
assert.equal(replies.size, 7);
assert.equal(replies.get(1).result.protocolVersion, "2025-06-18");
assert.ok(replies.get(1).result.instructions.includes("Never guess"));
assert.deepEqual(
  replies.get(2).result.tools.map((tool) => tool.name),
  ["describe_set", "search_icons", "get_icon", "get_usage"],
);
assert.equal(replies.get(3).result.content[0].text, exported("duotone/round", "trash"));
assert.match(replies.get(4).result.content[0].text, /- trash \(Trash/);
assert.match(replies.get(4).result.content[0].text, /- bell \(Bell/);
assert.match(replies.get(5).result.content[0].text, /import \{ MapIcon \} from "@coolicons\/react\/fill";/);
assert.equal(replies.get(6).result.isError, true);
assert.equal(replies.get(7).error.code, -32601);

console.log(`cli and mcp match the export, ${((performance.now() - started) / 1000).toFixed(1)} s`);
