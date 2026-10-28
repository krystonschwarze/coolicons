---
name: coolicons
description: Use coolicons icons in React, Vue or plain SVG. Use when a project imports @coolicons/react, @coolicons/vue or @coolicons/svg, when the user asks for coolicons, or when you add, replace or render an icon from coolicons. Every icon name is looked up in the real list first, never guessed.
---

# coolicons

coolicons is an open source icon set under the MIT license. Every icon comes in five styles and three corner radii, drawn on a 24 pixel grid with a 2 pixel stroke. Website: https://coolicons.cool

## Never guess an icon name

Language models do not know coolicons names, and a wrong name breaks the build. Every name you write must come from one of these sources, in this order:

1. **The installed package**, which matches the project's version. Both packages list every name in `dist/names.d.ts`:

   ```sh
   grep -o '"[a-z0-9-]*"' node_modules/@coolicons/react/dist/names.d.ts | tr -d '"' | grep -i trash
   ```

   For Vue, use `node_modules/@coolicons/vue/dist/names.d.ts`. For `@coolicons/svg`, the files themselves: `ls node_modules/@coolicons/svg/line/regular | grep -i trash`.

2. **[references/icons.md](references/icons.md)** in this skill: every icon with its component name, category and search tags, grouped by category. Search it by meaning, not only by name:

   ```sh
   grep -i -w "delete" references/icons.md
   ```

3. **Online**, when neither is available: https://cdn.jsdelivr.net/gh/krystonschwarze/coolicons@main/icons/data/index.json lists every name with its category and keywords.

If no icon fits, say so and ask. Never swap in a look-alike without telling the user. Look up several names in one search instead of one at a time.

## Install

```sh
npm install @coolicons/react   # React
npm install @coolicons/vue     # Vue 3
npm install @coolicons/svg     # SVG files for anything else
```

## Use

```jsx
import { House } from "@coolicons/react";

<House size={20} />
```

```vue
<script setup>
import { House } from "@coolicons/vue";
</script>

<template>
  <House :size="20" />
</template>
```

SVG files live at `@coolicons/svg/<style>/<radius>/<name>.svg`, for example `@coolicons/svg/line/regular/house.svg`.

## Styles and radii

Styles: `line`, `duocolor`, `duotone`, `fill`, `bulk`. Radii: `sharp`, `regular`, `round`. The package root is Line with Regular corners. Every other combination has its own entry:

```js
import { House } from "@coolicons/react";
import { Folder } from "@coolicons/react/fill";
import { Bell } from "@coolicons/react/bulk/round";
```

Use one style and radius across a project unless the user asks otherwise. Match what the project already imports.

## Props

| Prop | Default | |
| --- | --- | --- |
| `size` | `24` | Width and height in pixels or any CSS length |
| `strokeWidth` | `2` | Line, Duocolor and Duotone only. Fill and Bulk have no strokes |
| `title` | | Adds a `<title>` and `role="img"`. Without it the icon is hidden from screen readers |

All other attributes, like `className`, `style` and `onClick`, go to the `<svg>` element. Icons use `currentColor`, so color comes from CSS.

## Names

Names are lowercase English words joined by hyphens, like `file-plus-corner`. Components use the same words in PascalCase, like `FilePlusCorner`, and every component is also exported with an `Icon` suffix, like `FilePlusCornerIcon`.

Use the suffix when the plain name is already a JavaScript, browser or framework name, for example `MapIcon`, `FileIcon`, `LinkIcon`, `ImageIcon`. Importing the plain `Map` or `File` hides the global in that file. [references/icons.md](references/icons.md) shows the suffixed name for every such icon.

Some icons have a second name, like `reply` for `arrow-u-turn-up-left`. Both point to the same component.

## Icons by name

When the name comes from data, like a CMS or an icon picker:

```jsx
import { CooliconsIcon } from "@coolicons/react/dynamic";

<CooliconsIcon name="house" variant="fill" radius="round" />
```

It loads all icons of one style and radius on first use. Prefer static imports everywhere else.

## Replacing another icon library

1. Find the imports of the old library in the code, not in `package.json`.
2. Map each icon by meaning with the tags in [references/icons.md](references/icons.md), then confirm every target name in the installed package.
3. Keep `size`, `className`, `style` and event handlers. Translate `strokeWidth` only for stroked styles.
4. List every icon without a confident match and ask before changing those call sites.
