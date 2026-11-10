import { h } from "vue";
import { House, type IconProps } from "@coolicons/vue";
import { Folder } from "@coolicons/vue/bulk/round";
import { CooliconsIcon, icons, preload, type IconName } from "@coolicons/vue/dynamic";

const props: IconProps = { size: 20, strokeWidth: 1.5, title: "Home" };

const tinted: IconProps = { secondaryColor: "var(--brand)", secondaryOpacity: 0.6 };

export const nodes = [
  h(House, props),
  h(Folder),
  h(Folder, tinted),
  h(CooliconsIcon, { name: "house", variant: "fill", radius: "round" }),
  h(CooliconsIcon, { name: "folder", variant: "bulk", secondaryOpacity: "60%" }),
];
export const first: IconName = icons[0].name;
export const ready: Promise<void> = preload();
