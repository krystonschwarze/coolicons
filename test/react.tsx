import { Download, House, ImageIcon, LinkIcon, type IconProps } from "@coolicons/react";
import { House as FillHouse } from "@coolicons/react/fill/round";
import { Folder } from "@coolicons/react/bulk";
import { CooliconsIcon, icons, preload, type IconName } from "@coolicons/react/dynamic";

const props: IconProps = { size: 20, strokeWidth: 1.5, title: "Home", className: "icon" };
const ref = { current: null as SVGSVGElement | null };

export const elements = [
  <House {...props} ref={ref} />,
  <FillHouse size="1.5rem" />,
  <Folder aria-hidden={false} />,
  <ImageIcon />,
  <LinkIcon />,
  <Download />,
  <CooliconsIcon name="house" variant="fill" radius="round" />,
  // @ts-expect-error unknown icon name
  <CooliconsIcon name="no-such-icon" />,
  // @ts-expect-error unknown variant
  <CooliconsIcon name="house" variant="outline" />,
];

export const first: IconName = icons[0].name;
export const ready: Promise<void> = preload("bulk", "round");
