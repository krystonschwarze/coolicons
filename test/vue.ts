import { h } from "vue";
import { House, type IconProps } from "@coolicons/vue";
import { Folder } from "@coolicons/vue/bulk/round";
import { CooliconsIcon, icons, preload, type IconName } from "@coolicons/vue/dynamic";

const props: IconProps = { size: 20, strokeWidth: 1.5, title: "Home" };

export const nodes = [h(House, props), h(Folder), h(CooliconsIcon, { name: "house", variant: "fill", radius: "round" })];
export const first: IconName = icons[0].name;
export const ready: Promise<void> = preload();
