# Primitive APIs (as implemented)

Verify against the source before relying on a prop; this is a map, not a spec.

## Page — `src/components/Page`
`mode` "secondary" (default) | "primary", `headerColor` / `backgroundColor`
(hex without `#`), `expandOnMount`, `deferHeader`. Sets `--page-background`.

## PanelHeader — `src/components/PanelHeader`
`left` / `right` (node, string, or `{apple, material}`), `onLeft` / `onRight`,
`leftVariant` / `rightVariant`, `overlay`, `titleGlass`, `search`,
`pin` "sticky" | "fixed", `edge` "soft" | "hard", `largeTitle`.
Text actions are dropped on Material. Bar metrics: `_metrics.scss`.

## SectionList — `src/components/SectionList`
`type` "insetGrouped" (default) | "grouped".
`SectionList.Item`: `header` (string), `description` (footer string), rest spread.
Corners are squircled in JS (26 Apple / 16 Material).

## Cell — `src/components/Cells`
`as` (default "div"), `start`, `end`, `align` "center" | "top", `onClick`,
`tappable`. Press feedback auto-on with `onClick` or non-div `as`.
- `Cell.Text {type: "Accent", title, description, caption, bold}` — a number
  in a text field renders a skeleton bar of that many `ch`.
- `Cell.Start {type: "Image" | "Icon", src, iconType, variant: "success" | "destructive"}`
- `Cell.End {label, caption}` — end slot is `max-width: 50%`, ellipsized.
- `Cell.Part type`: `Chevron`, `Picker`, `Dropdown`, `Switch`, `ColorPicker`.
- `Cell.Editable`, `Cell.Switch`.

## CellStack
`<CellStack defaultExpanded><CellStack.Morph>{front}</CellStack.Morph><Cell/>...</CellStack>`

## Text — `src/components/Text`
`apple={{variant, weight}}`, `material={{variant, weight}}` inline at call site;
flat `variant` / `weight` apply to both. Also `skeleton`, `rounded`, `caps`,
`as`; Apple only `chevron`, `arrow={{direction}}`.
- Apple variants: largeTitle, title1-3, body, callout, subheadline1/2,
  footnote, caption2. Weights: regular, medium, semibold, bold.
- Material variants: largeTitle, title1, title2, body, subheadline1/2, caption2.
- Common pairs: title `apple {title1, semibold}` / `material {title1, medium}`;
  body `apple {callout}` / `material {subheadline1}`;
  small `apple {footnote}` / `material {subheadline2}`.

## Button — `src/components/Button`
- `RegularButton {variant, label, isShine, isFill, disabled}`; variants with
  styles: `filled`, `tinted`, `plain`, `gray`, `disabled` (no `outlined`, no size).
  Disabled: `variant={ok ? "filled" : "disabled"} disabled={!ok}`.
- `MultilineButton {variant: "filled" | "plain", icon, label}`.

## Tappable
`as`, `className`, `mode` "overlay" | "opacity", `disabled`. iOS tint / Material
ripple, keeps own handlers. Use for any custom pressable surface.

## GlassEffect
`GlassContainer {className, style}` (no children = fills positioned parent),
`GlassBorder {className, muted}`. When scaling, put `backdrop-filter` on the
scaled element instead (Safari flicker).

## ModalView + useModal
- `useModal({ detail: false })` or `useModal(["a", "b"])` ->
  `{ handlers: { detail: { open, close, toggle, isOpen } }, isOpen(id) }`.
- `ModalView {isOpen, onClose, initialPage, style}`. Multi-page: every child is
  `<ModalView.Page id>`; mixing with other children falls back to plain mode.

## Skeleton
`<Skeleton active>` redacts all Text / Cell.Text / avatars inside.
Also `SkeletonBlock {as, className, active}`, `useSkeletonContext`.
`PageSkeleton {rows = 7, media, trailing}` is the router fallback.

## Snackbar
`useSnackbar().show({ position: "top" | "bottom", icon, title, description,
action | link: {label}, duration (0 = sticky), type })`; `type` fires haptic.

## TabBar
`{ tabs: [{label, icon}], onChange, defaultIndex }`.

## Platform
`const { isApple, isMaterial } = useSkin()` from `src/hooks/DeviceProvider`.
