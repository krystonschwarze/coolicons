import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export type IconVariant = "line" | "duocolor" | "duotone" | "fill" | "bulk";
export type IconRadius = "sharp" | "regular" | "round";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
