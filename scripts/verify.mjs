import { readFileSync } from "node:fs";
import { checkIndex, checkReadme, loadIcons, VARIANTS } from "./icons.mjs";
import { referenceFile, skillReference } from "./skill.mjs";

const { manifest, icons } = loadIcons();
checkIndex(manifest);
checkReadme(manifest);
if (readFileSync(referenceFile, "utf8") !== skillReference()) throw new Error("skills/coolicons/references/icons.md is out of date, run pnpm skill");
const aliases = icons.filter((icon) => icon.aliasOf).length;
const categories = new Set(icons.map((icon) => icon.category)).size;
console.log(
  `${icons.length} icons with ${aliases} aliases in ${categories} categories, ${icons.length * VARIANTS.length} files match manifest ${manifest.hash} from ${manifest.source.commit}`,
);
