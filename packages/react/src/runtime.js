import { createElement, forwardRef } from "react";

const STROKE = { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };
const PAINTS = [
  STROKE,
  { ...STROKE, strokeOpacity: 0.4 },
  { fill: "currentColor" },
  { fill: "currentColor", fillOpacity: 0.2 },
  { fill: "currentColor", fillOpacity: 0.4 },
];
const SECONDARY = [null, ["stroke", "strokeOpacity"], null, ["fill", "fillOpacity"], ["fill", "fillOpacity"]];

function pathProps(paint, strokeWidth, secondaryColor, secondaryOpacity) {
  const props = paint < 2 ? { ...PAINTS[paint], strokeWidth } : { ...PAINTS[paint] };
  const layer = SECONDARY[paint];
  if (layer && secondaryColor != null) props[layer[0]] = secondaryColor;
  if (layer && secondaryOpacity != null) props[layer[1]] = secondaryOpacity;
  return props;
}

export function renderIcon(nodes, { size = 24, strokeWidth = 2, title, secondaryColor, secondaryOpacity, children, ...rest }, ref) {
  const labelled = title != null && title !== "";
  return createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      role: labelled ? "img" : undefined,
      "aria-hidden": labelled ? undefined : true,
      ...rest,
      ref,
    },
    labelled ? createElement("title", null, title) : null,
    ...nodes.map(([paint, d]) => createElement("path", { d, ...pathProps(paint, strokeWidth, secondaryColor, secondaryOpacity) })),
    children,
  );
}

export function createIcon(displayName, nodes) {
  const Icon = forwardRef((props, ref) => renderIcon(nodes, props, ref));
  Icon.displayName = displayName;
  return Icon;
}
