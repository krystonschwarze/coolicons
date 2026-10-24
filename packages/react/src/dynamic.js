"use client";
import { forwardRef, useEffect, useState } from "react";
import { loaders } from "./data/index.js";
import { renderIcon } from "./runtime.js";

export { icons } from "./meta.js";

const chunks = new Map();

function chunkFor(variant, radius) {
  const key = `${variant}/${radius}`;
  if (!loaders[key]) return undefined;
  let chunk = chunks.get(key);
  if (!chunk) {
    chunk = { icons: undefined };
    chunk.ready = loaders[key]().then(
      (module) => {
        chunk.icons = module.default;
      },
      () => {
        chunks.delete(key);
      },
    );
    chunks.set(key, chunk);
  }
  return chunk;
}

export function preload(variant = "line", radius = "regular") {
  return chunkFor(variant, radius)?.ready ?? Promise.resolve();
}

export const CooliconsIcon = forwardRef(function CooliconsIcon({ name, variant = "line", radius = "regular", ...props }, ref) {
  const chunk = chunkFor(variant, radius);
  const [, rerender] = useState(0);
  useEffect(() => {
    if (!chunk || chunk.icons) return;
    let live = true;
    chunk.ready.then(() => live && rerender((count) => count + 1));
    return () => {
      live = false;
    };
  }, [chunk]);
  return renderIcon(chunk?.icons?.[name] ?? [], props, ref);
});
