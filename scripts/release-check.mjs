import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checkReadme, loadIcons, root } from "./icons.mjs";
import { changelogSection, PACKAGES } from "./release.mjs";

const [tag, notesFile] = process.argv.slice(2);
const version = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
if (tag !== `v${version}`) throw new Error(`tag ${tag} does not match version ${version}`);
for (const name of PACKAGES) {
  const pkg = JSON.parse(readFileSync(path.join(root, "packages", name, "package.json"), "utf8"));
  if (pkg.version !== version) throw new Error(`${pkg.name} has version ${pkg.version}, expected ${version}`);
}
checkReadme(loadIcons().manifest);
const notes = changelogSection(version);
if (!notes) throw new Error(`CHANGELOG.md has no entry for ${version}`);
writeFileSync(notesFile, notes.replace(/^## .*\n+/, ""));
const prerelease = version.includes("-");
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nprerelease=${prerelease}\n`);
console.log(`${tag} is ready: ${PACKAGES.map((name) => `@coolicons/${name}@${version}`).join(", ")}${prerelease ? ", prerelease" : ""}`);
