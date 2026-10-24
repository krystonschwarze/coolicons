import { execFileSync } from "node:child_process";
import path from "node:path";
import { publint } from "publint";
import { formatMessage } from "publint/utils";
import { root } from "./icons.mjs";

let failed = false;
for (const name of ["svg", "react", "vue"]) {
  const dir = path.join(root, "packages", name);
  const { messages, pkg } = await publint({ pkgDir: dir, strict: true, level: "suggestion" });
  for (const message of messages) {
    console.log(`@coolicons/${name}: ${formatMessage(message, pkg)}`);
    failed ||= message.type !== "suggestion";
  }
  const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: dir, encoding: "utf8", maxBuffer: 1 << 28 }))[0];
  console.log(`@coolicons/${name} ${packed.version}: ${packed.entryCount} files, ${(packed.size / 1024 / 1024).toFixed(1)} MB packed, ${(packed.unpackedSize / 1024 / 1024).toFixed(1)} MB unpacked`);
  if (name === "svg") continue;
  try {
    execFileSync(path.join(root, "node_modules/.bin/attw"), ["--pack", dir, "--profile", "esm-only", "--format", "table-flipped"], { encoding: "utf8", maxBuffer: 1 << 26 });
    console.log(`@coolicons/${name}: types resolve for every entry`);
  } catch (error) {
    console.log(error.stdout);
    failed = true;
  }
}
if (failed) process.exit(1);
