import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checkIndex, dataFile, glyphOf, iconsDir, loadIcons, RADII, root, STYLES, VARIANTS } from "./icons.mjs";

const searchFile = path.join(iconsDir, "search.js");

const started = performance.now();
const { manifest, icons } = loadIcons();
const license = path.join(root, "LICENSE");
const only = process.argv.slice(2);

const sizeOf = (dir) =>
  readdirSync(dir, { recursive: true }).reduce((sum, file) => {
    const stat = statSync(path.join(dir, file));
    return stat.isFile() ? sum + stat.size : sum;
  }, 0);

const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function swap(target, staged) {
  rmSync(target, { recursive: true, force: true });
  renameSync(staged, target);
}

function buildSvg() {
  const dir = path.join(root, "packages/svg");
  for (const style of STYLES) {
    const staged = path.join(dir, `${style}.tmp`);
    rmSync(staged, { recursive: true, force: true });
    cpSync(path.join(iconsDir, "svg", style), staged, { recursive: true });
    swap(path.join(dir, style), staged);
  }
  checkIndex(manifest);
  const data = path.join(dir, "data.tmp");
  rmSync(data, { recursive: true, force: true });
  mkdirSync(data);
  for (const variant of VARIANTS) {
    const chunk = Object.fromEntries(
      manifest.icons.map((icon) => [icon.name, glyphOf(readFileSync(path.join(iconsDir, "svg", variant, `${icon.name}.svg`), "utf8"))]),
    );
    writeFileSync(path.join(data, `${variant.replace("/", "-")}.json`), JSON.stringify(chunk));
  }
  cpSync(dataFile, path.join(data, "index.json"));
  swap(path.join(dir, "data"), data);
  cpSync(path.join(iconsDir, "manifest.json"), path.join(dir, "manifest.json"));
  cpSync(license, path.join(dir, "LICENSE"));
  const bytes = STYLES.reduce((sum, style) => sum + sizeOf(path.join(dir, style)), 0);
  return `@coolicons/svg ${megabytes(bytes)}, data ${megabytes(sizeOf(path.join(dir, "data")))}`;
}

const aliasNote = (icon) => (icon.aliasOf ? `/** Alias of {@link ${icons.find((other) => other.name === icon.aliasOf).component}}. */\n` : "");

function buildComponents(framework) {
  const dir = path.join(root, "packages", framework);
  const staged = path.join(dir, "dist.tmp");
  rmSync(staged, { recursive: true, force: true });
  cpSync(path.join(dir, "src"), staged, { recursive: true });
  mkdirSync(path.join(staged, "icons"));
  mkdirSync(path.join(staged, "data"));

  const modules = new Map();
  const ordered = [...icons.filter((icon) => !icon.aliasOf), ...icons.filter((icon) => icon.aliasOf)];
  for (const icon of ordered) {
    for (const variant of VARIANTS) {
      const { hash, nodes } = icon.files[variant];
      if (modules.has(hash)) continue;
      const file = `${icon.name}-${hash}.js`;
      modules.set(hash, file);
      writeFileSync(
        path.join(staged, "icons", file),
        `import { createIcon } from "../runtime.js";\n\nexport default /*#__PURE__*/ createIcon("${icon.component}", ${JSON.stringify(nodes)});\n`,
      );
    }
  }

  for (const variant of VARIANTS) {
    const folder = path.join(staged, variant);
    mkdirSync(folder, { recursive: true });
    const js = icons.map(
      (icon) => `export { default as ${icon.component}, default as ${icon.component}Icon } from "../../icons/${modules.get(icon.files[variant].hash)}";`,
    );
    const dts = icons.map(
      (icon) =>
        `${aliasNote(icon)}export declare const ${icon.component}: IconComponent;\nexport declare const ${icon.component}Icon: IconComponent;`,
    );
    writeFileSync(path.join(folder, "index.js"), `${js.join("\n")}\n`);
    writeFileSync(path.join(folder, "index.d.ts"), `import type { IconComponent } from "../../types.js";\n\nexport type { IconComponent, IconProps, IconRadius, IconVariant } from "../../types.js";\n\n${dts.join("\n")}\n`);

    const chunk = icons.map((icon) => `${JSON.stringify(icon.name)}:${JSON.stringify(icon.files[variant].nodes)}`);
    writeFileSync(path.join(staged, "data", `${variant.replace("/", "-")}.js`), `export default {\n${chunk.join(",\n")}\n};\n`);
  }

  const loaders = VARIANTS.map((variant) => `  "${variant}": () => import("./${variant.replace("/", "-")}.js"),`);
  writeFileSync(path.join(staged, "data", "index.js"), `export const loaders = {\n${loaders.join("\n")}\n};\n`);

  const meta = icons.map(({ name, category, aliasOf }) => (aliasOf ? { name, category, aliasOf } : { name, category }));
  writeFileSync(path.join(staged, "meta.js"), `export const icons = ${JSON.stringify(meta, null, 1)};\n`);
  const union = (values) => [...new Set(values)].map((value) => `  | ${JSON.stringify(value)}`).join("\n");
  writeFileSync(
    path.join(staged, "names.d.ts"),
    `export type IconName =\n${union(icons.map((icon) => icon.name))};\n\nexport type IconCategory =\n${union(icons.map((icon) => icon.category).sort())};\n`,
  );

  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
  const expected = { ".": "line/regular", "./dynamic": "dynamic" };
  for (const style of STYLES) {
    expected[`./${style}`] = `${style}/regular`;
    for (const radius of RADII) expected[`./${style}/${radius}`] = `${style}/${radius}`;
  }
  for (const [entry, target] of Object.entries(expected)) {
    const file = target === "dynamic" ? "dynamic" : `${target}/index`;
    const mapped = pkg.exports[entry];
    if (mapped?.types !== `./dist/${file}.d.ts` || mapped?.default !== `./dist/${file}.js`) throw new Error(`${pkg.name}: exports["${entry}"] should point at dist/${file}`);
  }
  const extra = Object.keys(pkg.exports).filter((entry) => !(entry in expected) && entry !== "./package.json");
  if (extra.length) throw new Error(`${pkg.name}: unexpected exports ${extra.join(", ")}`);

  swap(path.join(dir, "dist"), staged);
  cpSync(license, path.join(dir, "LICENSE"));
  return `${pkg.name} ${megabytes(sizeOf(path.join(dir, "dist")))}, ${modules.size} modules`;
}

function buildTool(name, bin) {
  const dir = path.join(root, "packages", name);
  const staged = path.join(dir, "dist.tmp");
  rmSync(staged, { recursive: true, force: true });
  cpSync(path.join(dir, "src"), staged, { recursive: true });
  cpSync(path.join(root, "packages/cli/src/core.js"), path.join(staged, "core.js"));
  if (!existsSync(searchFile)) throw new Error("icons/search.js is missing, run pnpm icons:public in the monorepo");
  cpSync(searchFile, path.join(staged, "search.js"));
  const index = checkIndex(manifest);
  const aliases = new Map(icons.map((icon) => [icon.name, icon.aliasOf]));
  const data = path.join(staged, "data");
  mkdirSync(data);
  writeFileSync(
    path.join(data, "index.json"),
    JSON.stringify({
      hash: index.hash,
      icons: index.icons.map((icon) => (aliases.get(icon.name) ? { ...icon, aliasOf: aliases.get(icon.name) } : icon)),
      clashes: index.clashes,
    }),
  );
  for (const variant of VARIANTS) {
    const chunk = Object.fromEntries(
      manifest.icons.map((icon) => [icon.name, glyphOf(readFileSync(path.join(iconsDir, "svg", variant, `${icon.name}.svg`), "utf8"))]),
    );
    writeFileSync(path.join(data, `${variant.replace("/", "-")}.json`), JSON.stringify(chunk));
  }
  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
  if (pkg.bin?.[bin] !== `dist/${name === "cli" ? "cli" : "server"}.js`) throw new Error(`${pkg.name}: bin ${bin} should point at dist`);
  swap(path.join(dir, "dist"), staged);
  cpSync(license, path.join(dir, "LICENSE"));
  return `${pkg.name} ${megabytes(sizeOf(path.join(dir, "dist")))}`;
}

if (!existsSync(license)) throw new Error("LICENSE is missing");
const results = [];
if (!only.length || only.includes("svg")) results.push(buildSvg());
for (const framework of ["react", "vue"]) if (!only.length || only.includes(framework)) results.push(buildComponents(framework));
for (const [name, bin] of [["cli", "coolicons"], ["mcp", "coolicons-mcp"]]) if (!only.length || only.includes(name)) results.push(buildTool(name, bin));
console.log(`${icons.length} icons, set ${manifest.hash}, in ${((performance.now() - started) / 1000).toFixed(1)} s`);
for (const line of results) console.log(`  ${line}`);
