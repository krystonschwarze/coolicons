import { h } from "vue";

const STROKE = { stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round" };
const PAINTS = [
  STROKE,
  { ...STROKE, "stroke-opacity": 0.4 },
  { fill: "currentColor" },
  { fill: "currentColor", "fill-opacity": 0.2 },
  { fill: "currentColor", "fill-opacity": 0.4 },
];
const SECONDARY = [null, ["stroke", "stroke-opacity"], null, ["fill", "fill-opacity"], ["fill", "fill-opacity"]];

export const ICON_PROPS = {
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: [Number, String], default: 2 },
  title: { type: String, default: undefined },
  secondaryColor: { type: String, default: undefined },
  secondaryOpacity: { type: [Number, String], default: undefined },
};

function pathProps(paint, strokeWidth, secondaryColor, secondaryOpacity) {
  const props = paint < 2 ? { ...PAINTS[paint], "stroke-width": strokeWidth } : { ...PAINTS[paint] };
  const layer = SECONDARY[paint];
  if (layer && secondaryColor != null) props[layer[0]] = secondaryColor;
  if (layer && secondaryOpacity != null) props[layer[1]] = secondaryOpacity;
  return props;
}

export function renderIcon(nodes, { size = 24, strokeWidth = 2, title, secondaryColor, secondaryOpacity }, children) {
  const labelled = title != null && title !== "";
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      role: labelled ? "img" : undefined,
      "aria-hidden": labelled ? undefined : "true",
    },
    [
      labelled ? h("title", title) : null,
      ...nodes.map(([paint, d]) => h("path", { d, ...pathProps(paint, strokeWidth, secondaryColor, secondaryOpacity) })),
      children,
    ],
  );
}

export function createIcon(displayName, nodes) {
  const Icon = (props, { slots }) => renderIcon(nodes, props, slots.default?.());
  Icon.props = ICON_PROPS;
  Icon.displayName = displayName;
  return Icon;
}
