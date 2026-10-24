import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");
export const iconsDir = path.join(root, "icons");
export const manifestFile = path.join(iconsDir, "manifest.json");

export const STYLES = ["line", "duocolor", "duotone", "fill", "bulk"];
export const RADII = ["sharp", "regular", "round"];
export const VARIANTS = STYLES.flatMap((style) => RADII.map((radius) => `${style}/${radius}`));

const STROKE = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
export const PAINTS = [
  STROKE,
  `${STROKE} stroke-opacity="0.4"`,
  'fill="currentColor"',
  'fill="currentColor" fill-opacity="0.2"',
  'fill="currentColor" fill-opacity="0.4"',
];
export const STROKED_PAINTS = 2;

export const OPEN = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n';
export const CLOSE = "</svg>\n";
const PATH = /^<path d="([MmLlHhVvCcSsQqTtAaZz0-9 .,eE-]+)" (.+)\/>$/;
const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export const fingerprint = (text) => createHash("sha1").update(text).digest("hex").slice(0, 12);

export const componentName = (name) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function parseSvg(text, label) {
  if (!text.startsWith(OPEN) || !text.endsWith(`\n${CLOSE}`)) throw new Error(`${label}: unexpected svg frame`);
  const lines = text.slice(OPEN.length, -CLOSE.length - 1).split("\n");
  if (lines.length < 1 || lines.length > 2) throw new Error(`${label}: ${lines.length} layers, the contract allows one or two`);
  return lines.map((line) => {
    const match = PATH.exec(line);
    if (!match) throw new Error(`${label}: unexpected element ${line.slice(0, 60)}`);
    const paint = PAINTS.indexOf(match[2]);
    if (paint < 0) throw new Error(`${label}: unexpected paint ${match[2]}`);
    return [paint, match[1]];
  });
}

export const serializeSvg = (nodes) =>
  `${OPEN}${nodes.map(([paint, d]) => `<path d="${d}" ${PAINTS[paint]}/>`).join("\n")}\n${CLOSE}`;

export const readManifest = () => JSON.parse(readFileSync(manifestFile, "utf8"));

export function loadIcons(dir = iconsDir) {
  const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const errors = [];
  if (manifest.format !== 1) errors.push(`manifest format ${manifest.format}, expected 1`);
  if (manifest.styles?.join() !== STYLES.join()) errors.push(`styles ${manifest.styles} differ from ${STYLES}`);
  if (manifest.radii?.join() !== RADII.join()) errors.push(`radii ${manifest.radii} differ from ${RADII}`);
  if (manifest.source?.dirty !== false) errors.push("the export was made from a state with local changes");
  if (fingerprint(JSON.stringify(manifest.icons)) !== manifest.hash) errors.push("manifest hash does not match its icons");
  if (errors.length) throw new Error(errors.join("\n"));

  const byName = new Map();
  const byComponent = new Map();
  const icons = manifest.icons.map((entry) => {
    const { name, category, aliasOf } = entry;
    if (!NAME.test(name)) errors.push(`${name}: not a lowercase kebab case name`);
    if (byName.has(name)) errors.push(`${name}: listed twice`);
    if (!category) errors.push(`${name}: no category`);
    const component = componentName(name);
    if (byComponent.has(component)) errors.push(`${name}: component ${component} clashes with ${byComponent.get(component)}`);
    byComponent.set(component, name);
    const files = {};
    for (const variant of VARIANTS) {
      const hash = entry.files?.[variant];
      const file = path.join(dir, "svg", variant, `${name}.svg`);
      if (!hash || !existsSync(file)) {
        errors.push(`${variant}/${name}.svg is missing`);
        continue;
      }
      const text = readFileSync(file, "utf8");
      if (fingerprint(text) !== hash) errors.push(`${variant}/${name}.svg does not match its fingerprint`);
      try {
        files[variant] = { hash, nodes: parseSvg(text, `${variant}/${name}.svg`) };
      } catch (error) {
        errors.push(error.message);
      }
    }
    const icon = { name, component, category, aliasOf, files };
    byName.set(name, icon);
    return icon;
  });

  for (const icon of icons) if (byComponent.has(`${icon.component}Icon`)) errors.push(`${icon.name}: ${icon.component}Icon clashes with the icon ${byComponent.get(`${icon.component}Icon`)}`);

  for (const icon of icons) {
    if (!icon.aliasOf) continue;
    const base = byName.get(icon.aliasOf);
    if (!base) errors.push(`${icon.name}: alias of unknown ${icon.aliasOf}`);
    else if (base.aliasOf) errors.push(`${icon.name}: alias of the alias ${icon.aliasOf}`);
    else for (const variant of VARIANTS) if (icon.files[variant]?.hash !== base.files[variant]?.hash) errors.push(`${icon.name}: ${variant} differs from ${icon.aliasOf}`);
  }

  for (const variant of VARIANTS) {
    const folder = path.join(dir, "svg", variant);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder)) if (!byName.has(file.replace(/\.svg$/, ""))) errors.push(`${variant}/${file} is not in the manifest`);
  }
  for (const style of existsSync(path.join(dir, "svg")) ? readdirSync(path.join(dir, "svg")) : []) {
    if (!STYLES.includes(style)) errors.push(`svg/${style} is not a style`);
    else for (const radius of readdirSync(path.join(dir, "svg", style))) if (!RADII.includes(radius)) errors.push(`svg/${style}/${radius} is not a radius`);
  }

  if (errors.length) throw new Error(`${errors.length} problems:\n${errors.slice(0, 40).join("\n")}`);
  return { manifest, icons, byName };
}
