import type { FunctionalComponent } from "vue";

export type IconVariant = "line" | "duocolor" | "duotone" | "fill" | "bulk";
export type IconRadius = "sharp" | "regular" | "round";

export interface IconProps {
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
  secondaryColor?: string;
  secondaryOpacity?: number | string;
}

export type IconComponent = FunctionalComponent<IconProps>;
