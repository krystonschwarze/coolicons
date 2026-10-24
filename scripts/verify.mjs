import { loadIcons, VARIANTS } from "./icons.mjs";

const { manifest, icons } = loadIcons();
const aliases = icons.filter((icon) => icon.aliasOf).length;
const categories = new Set(icons.map((icon) => icon.category)).size;
console.log(
  `${icons.length} icons with ${aliases} aliases in ${categories} categories, ${icons.length * VARIANTS.length} files match manifest ${manifest.hash} from ${manifest.source.commit}`,
);
