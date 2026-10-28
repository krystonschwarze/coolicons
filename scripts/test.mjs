import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { CLOSE, iconsDir, loadIcons, OPEN, RADII, STYLES, VARIANTS } from "./icons.mjs";

const started = performance.now();
const { manifest, icons, byName } = loadIcons();

function canonical(markup) {
  const tags = [...markup.replace(/<!--.*?-->/g, "").matchAll(/<(svg|path|title)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*\/?>(?:([^<]*)<\/title>)?/g)];
  return tags.map(([, tag, attributes, text]) => ({
    tag,
    attributes: Object.fromEntries([...attributes.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]).sort()),
    ...(text === undefined ? {} : { text }),
  }));
}

const expected = (variant, name, extra = { "aria-hidden": "true" }) => {
  const [svg, ...paths] = canonical(readFileSync(path.join(iconsDir, "svg", variant, `${name}.svg`), "utf8"));
  return [{ ...svg, attributes: Object.fromEntries(Object.entries({ ...svg.attributes, ...extra }).sort()) }, ...paths];
};

const split = (markup) => markup.replace(/<!--.*?-->/g, "").split(/(?=<svg )/).filter(Boolean);
const entryOf = (variant) => (variant === "line/regular" ? "" : `/${variant}`);
const styleEntry = (variant) => variant.endsWith("/regular") && `/${variant.split("/")[0]}`;

const frameworks = {
  react: {
    renderAll: (components) => renderToStaticMarkup(createElement(Fragment, null, ...components.map((Component, key) => createElement(Component, { key })))),
    render: (Component, props) => renderToStaticMarkup(createElement(Component, props)),
  },
  vue: {
    renderAll: (components) => renderToString(createSSRApp({ render: () => components.map((Component) => h(Component)) })),
    render: (Component, props) => renderToString(createSSRApp({ render: () => h(Component, props) })),
  },
};

let renders = 0;
for (const [framework, { renderAll, render }] of Object.entries(frameworks)) {
  for (const variant of VARIANTS) {
    const module = await import(`@coolicons/${framework}${entryOf(variant)}`);
    assert.deepEqual(Object.keys(module).sort(), icons.flatMap((icon) => [icon.component, `${icon.component}Icon`]).sort(), `${framework} ${variant} exports`);
    assert.ok(icons.every((icon) => module[`${icon.component}Icon`] === module[icon.component]), `${framework} ${variant} Icon names`);
    for (const alias of [styleEntry(variant), variant === "line/regular" && "/line/regular"].filter(Boolean)) {
      const other = await import(`@coolicons/${framework}${alias}`);
      assert.ok(icons.every((icon) => other[icon.component] === module[icon.component]), `${framework}${alias} matches ${variant}`);
    }
    const markups = split(await renderAll(icons.map((icon) => module[icon.component])));
    assert.equal(markups.length, icons.length, `${framework} ${variant} rendered count`);
    icons.forEach((icon, index) => assert.deepEqual(canonical(markups[index]), expected(variant, icon.name), `${framework} ${variant}/${icon.name}`));
    renders += markups.length;
  }

  const line = await import(`@coolicons/${framework}`);
  const duocolor = await import(`@coolicons/${framework}/duocolor`);
  const bulk = await import(`@coolicons/${framework}/bulk/round`);
  const sized = canonical(await render(line.House, { size: 16 }));
  assert.equal(sized[0].attributes.width, "16");
  assert.equal(sized[0].attributes.height, "16");
  const thin = canonical(await render(duocolor.Folder, { strokeWidth: 1.5 }));
  assert.ok(thin.slice(1).every((node) => node.attributes["stroke-width"] === "1.5"), `${framework} strokeWidth on every stroke`);
  const filled = canonical(await render(bulk.Folder, { strokeWidth: 1.5 }));
  assert.ok(filled.every((node) => !("stroke-width" in node.attributes)), `${framework} strokeWidth leaves fills alone`);
  const titled = canonical(await render(line.House, { title: "Home" }));
  assert.equal(titled[0].attributes.role, "img");
  assert.equal(titled[0].attributes["aria-hidden"], undefined);
  assert.deepEqual(titled[1], { tag: "title", attributes: {}, text: "Home" });
  const classed = canonical(await render(line.House, framework === "react" ? { className: "icon", "aria-hidden": "false" } : { class: "icon", "aria-hidden": "false" }));
  assert.equal(classed[0].attributes.class, "icon");
  assert.equal(classed[0].attributes["aria-hidden"], "false");

  const dynamic = await import(`@coolicons/${framework}/dynamic`);
  assert.deepEqual(
    dynamic.icons.map((icon) => icon.name),
    icons.map((icon) => icon.name),
  );
  for (const variant of VARIANTS) {
    const chunk = (await import(`../packages/${framework}/dist/data/${variant.replace("/", "-")}.js`)).default;
    assert.deepEqual(Object.keys(chunk), icons.map((icon) => icon.name), `${framework} data ${variant}`);
    for (const icon of icons) assert.deepEqual(chunk[icon.name], icon.files[variant].nodes, `${framework} data ${variant}/${icon.name}`);
  }
  const empty = canonical(await render(dynamic.CooliconsIcon, { name: "folder", variant: "bulk", radius: "round" }));
  assert.equal(empty.length, 1, `${framework} CooliconsIcon renders an empty frame before its data loads`);
  await dynamic.preload("bulk", "round");
  assert.deepEqual(canonical(await render(dynamic.CooliconsIcon, { name: "folder", variant: "bulk", radius: "round" })), expected("bulk/round", "folder"));
  const unknown = canonical(await render(dynamic.CooliconsIcon, { name: "folder", variant: "nope" }));
  assert.equal(unknown.length, 1, `${framework} CooliconsIcon with an unknown variant renders an empty frame`);
}

const svgManifest = JSON.parse(readFileSync(new URL(import.meta.resolve("@coolicons/svg/manifest.json")), "utf8"));
assert.equal(svgManifest.hash, manifest.hash);
for (const style of STYLES) for (const radius of RADII) assert.ok(byName.size && readFileSync(new URL(import.meta.resolve(`@coolicons/svg/${style}/${radius}/house.svg`))));
const svgData = (file) => JSON.parse(readFileSync(new URL(import.meta.resolve(`@coolicons/svg/data/${file}`)), "utf8"));
assert.equal(svgData("index.json").hash, manifest.hash, "svg data index matches the set");
for (const variant of VARIANTS) {
  const chunk = svgData(`${variant.replace("/", "-")}.json`);
  assert.deepEqual(Object.keys(chunk), manifest.icons.map((icon) => icon.name), `svg data ${variant}`);
  for (const icon of manifest.icons)
    assert.equal(`${OPEN.trimEnd()}${chunk[icon.name]}${CLOSE}`, readFileSync(path.join(iconsDir, "svg", variant, `${icon.name}.svg`), "utf8"), `svg data ${variant}/${icon.name}`);
}

console.log(`${renders} renders and the dynamic data match the export, in ${((performance.now() - started) / 1000).toFixed(1)} s`);
