#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { component, findIcon, iconSet, LookupError, RADII, search, STYLES, svg } from "./core.js";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const HELP = `coolicons ${version}

Search coolicons and copy them into your project. No network, the whole set ships in this package.

Usage
  coolicons search <query>          Find icons by name or meaning, ranked
  coolicons show <name>             Print one icon's SVG to stdout
  coolicons add <name...>           Write SVG files into a folder
  coolicons list                    Print every icon name

Options
  -s, --style <style>     ${STYLES.join(", ")} (default line)
  -r, --radius <radius>   ${RADII.join(", ")} (default regular)
  -o, --out <dir>         Folder for add (default ./icons)
  -l, --limit <n>         Results for search (default 20)
  -c, --category <name>   Only this category, for list
      --size <px>         Width and height of the SVG (default 24)
      --stroke <px>       Stroke width for line, duocolor and duotone (default 2)
      --json              Machine readable output for search and list
  -h, --help              Show this help
  -v, --version           Show the version

Examples
  npx @coolicons/cli search delete
  npx @coolicons/cli show trash --style fill > trash.svg
  npx @coolicons/cli add trash bell --style bulk --radius round --out src/icons
`;

const SHORT = { s: "style", r: "radius", o: "out", l: "limit", c: "category", h: "help", v: "version" };
const VALUED = new Set(["style", "radius", "out", "limit", "category", "size", "stroke"]);

function parse(argv) {
  const options = {};
  const words = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("-") || arg === "-") {
      words.push(arg);
      continue;
    }
    const [raw, inline] = arg.replace(/^--?/, "").split("=", 2);
    const key = arg.startsWith("--") ? raw : (SHORT[raw] ?? raw);
    if (VALUED.has(key)) {
      const value = inline ?? argv[++i];
      if (value === undefined) throw new LookupError(`--${key} needs a value.`);
      options[key] = value;
    } else options[key] = true;
  }
  return { command: words[0], words: words.slice(1), options };
}

const out = (text) => process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
const say = (text) => process.stderr.write(`${text}\n`);

function variant(options) {
  return { style: options.style ?? "line", radius: options.radius ?? "regular", size: options.size ?? 24, strokeWidth: options.stroke ?? 2 };
}

function run({ command, words, options }) {
  if (options.version) return out(version);
  if (options.help || !command || command === "help") return out(HELP);

  if (command === "search") {
    const query = words.join(" ");
    if (!query) throw new LookupError("search needs a query, like: coolicons search delete");
    const results = search(query, Number(options.limit ?? 20));
    if (options.json) return out(JSON.stringify(results.map((icon) => ({ ...icon, component: component(icon) })), null, 2));
    if (!results.length) {
      say(`No icon matches "${query}".`);
      process.exitCode = 1;
      return;
    }
    const width = Math.max(...results.map((icon) => icon.name.length));
    for (const icon of results) out(`${icon.name.padEnd(width)}  ${component(icon)}  ${icon.category}${icon.keywords.length ? `  ${icon.keywords.join(", ")}` : ""}`);
    say(`${results.length} of ${iconSet().icons.length} icons`);
    return;
  }

  if (command === "show") {
    if (words.length !== 1) throw new LookupError("show needs exactly one name, like: coolicons show trash");
    return out(svg(words[0], variant(options)));
  }

  if (command === "add") {
    if (!words.length) throw new LookupError("add needs at least one name, like: coolicons add trash bell");
    const icons = words.map(findIcon);
    const folder = path.resolve(options.out ?? "icons");
    mkdirSync(folder, { recursive: true });
    for (const icon of icons) {
      const file = path.join(folder, `${icon.name}.svg`);
      writeFileSync(file, svg(icon.name, variant(options)));
      say(`Wrote ${path.relative(process.cwd(), file) || file}`);
    }
    return;
  }

  if (command === "list") {
    const icons = options.category ? iconSet().icons.filter((icon) => icon.category.toLowerCase() === String(options.category).toLowerCase()) : iconSet().icons;
    if (!icons.length) throw new LookupError(`No category "${options.category}". Categories: ${[...new Set(iconSet().icons.map((icon) => icon.category))].join(", ")}.`);
    if (options.json) return out(JSON.stringify(icons.map((icon) => icon.name)));
    out(icons.map((icon) => icon.name).join("\n"));
    say(`${icons.length} icons`);
    return;
  }

  throw new LookupError(`Unknown command "${command}". Run coolicons --help.`);
}

try {
  run(parse(process.argv.slice(2)));
} catch (error) {
  if (!(error instanceof LookupError)) throw error;
  say(error.message);
  process.exitCode = 1;
}
