import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadIcons, root, STYLES } from "./icons.mjs";
import { referenceFile, skillReference } from "./skill.mjs";

export const PACKAGES = ["svg", "react", "vue", "cli", "mcp"];
const VERSION = /^(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$/;
const changelogFile = path.join(root, "CHANGELOG.md");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const packageFiles = [path.join(root, "package.json"), ...PACKAGES.map((name) => path.join(root, "packages", name, "package.json"))];

const parse = (version) => {
  const match = VERSION.exec(version);
  if (!match) throw new Error(`${version} is not a version like 5.1.0 or 5.1.0-beta.2`);
  const [major, minor, patch, beta] = match.slice(1).map((part) => (part === undefined ? undefined : Number(part)));
  return { major, minor, patch, beta };
};

const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (const key of ["major", "minor", "patch"]) if (x[key] !== y[key]) return x[key] - y[key];
  return (x.beta ?? Number.POSITIVE_INFINITY) - (y.beta ?? Number.POSITIVE_INFINITY);
};

export function releasedVersions() {
  return git("tag", "--list", "v*")
    .split("\n")
    .map((tag) => tag.slice(1))
    .filter((version) => VERSION.test(version) && parse(version).major >= 5)
    .sort(compare);
}

export function changelogSection(version, text = readFileSync(changelogFile, "utf8")) {
  const start = text.indexOf(`\n## ${version}\n`);
  if (start < 0) return undefined;
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start + 1, end < 0 ? undefined : end + 1);
}

const list = (names) => names.map((name) => `\`${name}\``).join(", ");

export function diff(previous, current) {
  const before = new Map(previous.icons.map((icon) => [icon.name, icon]));
  const after = new Map(current.icons.map((icon) => [icon.name, icon]));
  const files = (icon) => JSON.stringify(icon.files);
  let added = [...after.keys()].filter((name) => !before.has(name));
  let removed = [...before.keys()].filter((name) => !after.has(name));
  const renamed = [];
  for (const name of removed) {
    const target = added.find((candidate) => files(after.get(candidate)) === files(before.get(name)));
    if (target) renamed.push([name, target]);
  }
  added = added.filter((name) => !renamed.some(([, target]) => target === name));
  removed = removed.filter((name) => !renamed.some(([source]) => source === name));
  const redrawn = [];
  const recategorized = [];
  for (const [name, icon] of after) {
    const old = before.get(name);
    if (!old) continue;
    const styles = STYLES.filter((style) => Object.keys(icon.files).some((key) => key.startsWith(`${style}/`) && icon.files[key] !== old.files[key]));
    if (styles.length) redrawn.push([name, styles]);
    if (icon.category !== old.category) recategorized.push([name, old.category, icon.category]);
  }
  return { added, removed, renamed, redrawn, recategorized };
}

export function propose(previousVersion, changes) {
  if (!previousVersion) return "5.0.0-beta.1";
  const { major, minor, patch, beta } = parse(previousVersion);
  if (beta !== undefined) return `${major}.${minor}.${patch}-beta.${beta + 1}`;
  if (changes.removed.length || changes.renamed.length) return `${major + 1}.0.0`;
  if (changes.added.length) return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function section(version, manifest, changes, first) {
  const aliases = manifest.icons.filter((icon) => icon.aliasOf).length;
  const categories = new Set(manifest.icons.map((icon) => icon.category)).size;
  const lines = [`## ${version}`, ""];
  if (first) {
    lines.push(
      `First release of coolicons 5: ${manifest.icons.length} icons with ${aliases} aliases in ${categories} categories, each in five styles (Line, Duocolor, Duotone, Fill, Bulk) and three corner radii (Sharp, Regular, Round).`,
      "",
    );
    return lines.join("\n");
  }
  lines.push(`${manifest.icons.length} icons with ${aliases} aliases in ${categories} categories.`, "");
  const block = (title, rows) => rows.length && lines.push(`### ${title}`, "", ...rows, "");
  block("New", changes.added.length ? [list(changes.added)] : []);
  block("Renamed", changes.renamed.map(([from, to]) => `- \`${from}\` is now \`${to}\``));
  block("Removed", changes.removed.length ? [list(changes.removed)] : []);
  block("Redrawn", changes.redrawn.map(([name, styles]) => `- \`${name}\` in ${styles.join(", ")}`));
  block("Category changed", changes.recategorized.map(([name, from, to]) => `- \`${name}\` moved from ${from} to ${to}`));
  if (lines.length === 4) lines.push("No icon changes.", "");
  return lines.join("\n");
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const { manifest } = loadIcons();
  const released = releasedVersions();
  const previousVersion = released.at(-1);
  const previous = previousVersion ? JSON.parse(git("show", `v${previousVersion}:icons/manifest.json`)) : { icons: [] };
  const changes = diff(previous, manifest);
  const current = readJson(packageFiles[0]).version;
  const requested = process.argv[2];
  const version = requested ?? (current !== "0.0.0" && !released.includes(current) ? current : propose(previousVersion, changes));
  parse(version);
  if (released.includes(version)) throw new Error(`v${version} is already tagged`);
  if (previousVersion && compare(version, previousVersion) <= 0) throw new Error(`${version} is not newer than v${previousVersion}`);

  for (const file of packageFiles) {
    const pkg = readJson(file);
    pkg.version = version;
    writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  for (const file of [path.join(root, "README.md"), ...PACKAGES.map((name) => path.join(root, "packages", name, "README.md"))]) {
    const readme = readFileSync(file, "utf8");
    writeFileSync(file, readme.replace(/\b\d+ icons in five styles/g, `${manifest.icons.length} icons in five styles`));
  }

  writeFileSync(referenceFile, skillReference());

  const header = "# Changelog\n\nEvery release lists the icons that were added, renamed, removed, redrawn or moved to another category since the release before.\n";
  const text = existsSync(changelogFile) ? readFileSync(changelogFile, "utf8") : header;
  const entry = section(version, manifest, changes, !previousVersion);
  const old = changelogSection(version, text);
  const first = text.indexOf("\n## ");
  const next = old ? text.replace(old, entry) : first < 0 ? `${text}\n${entry}` : `${text.slice(0, first + 1)}${entry}\n${text.slice(first + 1)}`;
  writeFileSync(changelogFile, `${next.replace(/\n{3,}/g, "\n\n").trimEnd()}\n`);

  console.log(`${version} since ${previousVersion ? `v${previousVersion}` : "the start"}: new ${changes.added.length}, renamed ${changes.renamed.length}, removed ${changes.removed.length}, redrawn ${changes.redrawn.length}, category changed ${changes.recategorized.length}`);
  console.log("Wrote the version into every package.json and the entry into CHANGELOG.md.");
}
