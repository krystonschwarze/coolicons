import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { IconCategory, IconName } from "./names.js";
import type { IconProps, IconRadius, IconVariant } from "./types.js";

export type { IconCategory, IconName, IconProps, IconRadius, IconVariant };

export interface CooliconsIconProps extends IconProps {
  name: IconName;
  variant?: IconVariant;
  radius?: IconRadius;
}

export declare const CooliconsIcon: ForwardRefExoticComponent<CooliconsIconProps & RefAttributes<SVGSVGElement>>;
export declare const icons: ReadonlyArray<{ name: IconName; category: IconCategory; aliasOf?: IconName }>;
export declare function preload(variant?: IconVariant, radius?: IconRadius): Promise<void>;
