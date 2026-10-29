import { readFileSync } from "node:fs";
import { matchIcons } from "./search.js";

export const STYLES = ["line", "duocolor", "duotone", "fill", "bulk"];
export const RADII = ["sharp", "regular", "round"];
export const STROKED = new Set(["line", "duocolor", "duotone"]);
export const SITE = "https://coolicons.cool";

const read = (file) => JSON.parse(readFileSync(new URL(`./data/${file}`, import.meta.url), "utf8"));

let set;
const chunks = new Map();
let byName;

export function iconSet() {
  set ??= read("index.json");
  return set;
}

function lookup() {
  byName ??= new Map(iconSet().icons.map((icon) => [icon.name, icon]));
  return byName;
}

export class LookupError extends Error {
  constructor(message, suggestions = []) {
    super(message);
    this.suggestions = suggestions;
  }
}

export function toName(input) {
  return String(input)
    .trim()
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function findIcon(input) {
  const name = toName(input);
  const icon = lookup().get(name);
  if (icon) return icon;
  const suggestions = suggest(name);
  throw new LookupError(
    `No coolicons icon is named "${name}".${suggestions.length ? ` Did you mean ${suggestions.join(", ")}?` : ""}`,
    suggestions,
  );
}

export function checkVariant(style = "line", radius = "regular") {
  if (!STYLES.includes(style)) throw new LookupError(`Unknown style "${style}". Styles: ${STYLES.join(", ")}.`);
  if (!RADII.includes(radius)) throw new LookupError(`Unknown radius "${radius}". Radii: ${RADII.join(", ")}.`);
  return { style, radius };
}

export function search(query, limit = 10) {
  return matchIcons(iconSet().icons, query).slice(0, limit);
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export function suggest(input, limit = 5) {
  const name = toName(input);
  if (!name) return [];
  const found = search(name.replaceAll("-", " "), limit).map((icon) => icon.name);
  if (found.length >= limit) return found;
  const near = iconSet()
    .icons.map((icon) => ({ name: icon.name, cost: distance(name, icon.name) }))
    .filter((entry) => entry.cost <= Math.max(2, Math.floor(name.length / 3)) && !found.includes(entry.name))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
    .map((entry) => entry.name);
  return [...found, ...near].slice(0, limit);
}

export function component(icon) {
  const pascal = icon.name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return Object.hasOwn(iconSet().clashes, icon.name) ? `${pascal}Icon` : pascal;
}

export function svg(input, { style = "line", radius = "regular", size = 24, strokeWidth = 2 } = {}) {
  const icon = findIcon(input);
  checkVariant(style, radius);
  const key = `${style}-${radius}`;
  if (!chunks.has(key)) chunks.set(key, read(`${key}.json`));
  let inner = chunks.get(key)[icon.name];
  if (STROKED.has(style) && Number(strokeWidth) !== 2) inner = inner.replaceAll('stroke-width="2"', `stroke-width="${strokeWidth}"`);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>\n`;
}

const entry = (style, radius) => (style === "line" && radius === "regular" ? "" : radius === "regular" ? `/${style}` : `/${style}/${radius}`);

export function registryItem(icon, style = "line", radius = "regular") {
  return [style === "line" && radius === "regular" ? "" : style, radius === "regular" ? "" : radius, icon.name].filter(Boolean).join("/");
}

export function usage(inputs, { framework = "react", style = "line", radius = "regular" } = {}) {
  checkVariant(style, radius);
  const icons = [inputs].flat().map(findIcon);
  const names = icons.map(component);
  if (framework === "react" || framework === "vue") {
    const from = `@coolicons/${framework}${entry(style, radius)}`;
    const imports = `import { ${names.join(", ")} } from "${from}";`;
    const tags = names.map((name) => (framework === "react" ? `<${name} size={20} />` : `<${name} :size="20" />`)).join("\n");
    const code = framework === "react" ? `${imports}\n\n${tags}` : `<script setup>\n${imports}\n</script>\n\n<template>\n${tags}\n</template>`;
    return { install: `npm install @coolicons/${framework}`, code };
  }
  if (framework === "svg") {
    return {
      install: "npm install @coolicons/svg",
      code: icons.map((icon) => `@coolicons/svg/${style}/${radius}/${icon.name}.svg`).join("\n"),
    };
  }
  if (framework === "shadcn") {
    const items = icons.map((icon) => `${SITE}/r/${registryItem(icon, style, radius)}.json`);
    const files = icons.map((icon) => `components/icons/${registryItem(icon, style, radius)}.tsx`);
    return { install: `npx shadcn@latest add ${items.join(" ")}`, code: `Adds ${files.join(", ")} exporting ${names.join(", ")}.` };
  }
  throw new LookupError(`Unknown framework "${framework}". Use react, vue, svg or shadcn.`);
}
