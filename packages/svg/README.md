# @coolicons/svg

[coolicons](https://coolicons.cool) as SVG files: 1220 icons in five styles and three corner radii.

```sh
npm install @coolicons/svg
```

The files are in `@coolicons/svg/<style>/<radius>/<name>.svg`, with the styles `line`, `duocolor`, `duotone`, `fill`, `bulk` and the radii `sharp`, `regular`, `round`. Every file is 24 by 24 pixels, has at most two paths and uses `currentColor`.

`@coolicons/svg/manifest.json` lists every icon with its name, category, alias and a fingerprint per file.

`@coolicons/svg/data/` holds the same set as JSON for tools that load it at runtime, such as the coolicons Figma plugin through jsDelivr. `data/index.json` lists every icon with its category and search keywords, `data/<style>-<radius>.json` maps every name to the inner markup of its SVG file.

More in the [coolicons repository](https://github.com/krystonschwarze/coolicons#readme). MIT license.
