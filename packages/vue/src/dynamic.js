import { defineComponent, shallowRef, watchEffect } from "vue";
import { loaders } from "./data/index.js";
import { ICON_PROPS, renderIcon } from "./runtime.js";

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

export const CooliconsIcon = defineComponent({
  name: "CooliconsIcon",
  props: {
    name: { type: String, required: true },
    variant: { type: String, default: "line" },
    radius: { type: String, default: "regular" },
    ...ICON_PROPS,
  },
  setup(props, { slots }) {
    const loaded = shallowRef();
    watchEffect((onCleanup) => {
      const chunk = chunkFor(props.variant, props.radius);
      if (!chunk || chunk.icons) {
        loaded.value = chunk?.icons;
        return;
      }
      let live = true;
      onCleanup(() => {
        live = false;
      });
      chunk.ready.then(() => {
        if (live) loaded.value = chunk.icons;
      });
    });
    return () => renderIcon(loaded.value?.[props.name] ?? [], props, slots.default?.());
  },
});
