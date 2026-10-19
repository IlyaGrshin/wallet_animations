---
name: mobile-ui-guidelines
description: Guidelines for building and reviewing native-feeling mobile web UI (mini apps, WebView apps, PWAs, app prototypes) that mimic iOS and Android. Use when building or changing a screen, list, row, sheet, modal, form, tab bar, header, empty/loading/error state, or when asked to "review this screen", "check the layout", "make it feel native", "сверстай экран", "проверь вёрстку".
metadata:
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Mobile UI Guidelines

Rules for UI that has to feel like a native iOS / Android app while running in
a browser or WebView. Stack-agnostic: map each rule onto the project's own
primitives, tokens and conventions (read the project's AGENTS.md / CLAUDE.md
first; project rules win on implementation details).

## How It Works

**Build mode** (writing UI):
1. Find the closest existing screen in the project and copy its structure.
2. List every state before the happy path: loading, empty, error, partial,
   worst-case data (see Data).
3. Compose from the project's primitives; build a new primitive only when
   none fits, and make it reusable.
4. Go through the Checklist at the end before declaring done.

**Review mode** (argument given, or asked to review):
1. Read the files.
2. Check against every rule below.
3. Output findings as `file:line - rule - fix`, grouped by section, most
   severe first. No praise, no restating the code.

## Structure

- One screen = one file; data hooks, animation hooks, helpers and
  sub-components in separate files. Split before a file gets long.
- Mock data lives in data files, not inline in JSX, and includes worst cases.
- Every screen has a loading placeholder that matches its final layout.
- Sections render themselves and return nothing when empty; the parent does
  not need to know.

## Primitives

- Never a raw `<div onClick>`. Pressable things are real buttons or links
  with the project's press feedback component.
- Whole-row tap targets for list rows that navigate or open something; rows
  with their own control (switch, stepper) do not highlight on press.
- One shared component each for: row, grouped section, header/nav bar, sheet
  /modal, button, text, toast. Screens compose them, they do not restyle them.
- Modal visibility through a single shared hook/pattern, not ad-hoc state.
- Toasts/snackbars through one shared service, never a local copy.

## Platform

- Detect platform once (context/provider), never by sniffing the user agent
  in components. Expose it as a root class and/or a hook.
- Platform differences belong in styles first, JS only when behavior differs.
- iOS: grouped inset lists, large radii, blur materials, spring motion,
  text-style actions in nav bars, 44px min row height.
- Android/Material: flatter surfaces, elevation shadows, ripple feedback,
  standard easing, icon actions instead of text actions.
- Typography uses the platform's named text styles (title / body / footnote
  etc.), set per platform at the call site; no raw font sizes in screens.

## Layout and Tokens

- Colors only from theme tokens (host theme vars or the design system);
  no hardcoded hex for surfaces or text. Light and dark must both work.
- One token for horizontal page padding, one for top inset (safe area +
  host chrome). Never re-derive inset formulas per screen.
- Bottom-anchored UI adds `env(safe-area-inset-bottom)` and respects other
  floating UI through a shared clearance token.
- A small fixed spacing scale (e.g. 2/4/6/8/12/16) and radius scale; no
  one-off values.
- Override text color on a wrapper so text components inherit it.
- Spacing between siblings keyed on position or data attributes, not tag
  names.
- Disable text selection and double-tap zoom on app chrome; keep them on
  inputs. Set the tap highlight color intentionally.

## Data

Every list, row and value must survive the worst case:

- Long names: clamp (1-2 lines) with full text available (`title`), and
  `min-width: 0` + `overflow-wrap: anywhere` on flex text columns.
- Trailing values cannot push the title out: cap their width, ellipsize.
- Huge and tiny numbers: format through shared formatters (significant
  digits, "< $0.01" for dust, thousands separators); never inline `toFixed`.
- Large hero numbers scale with container queries, not JS measuring.
- Missing image: fallback avatar (initials / placeholder), also on load error.
- Missing name: shortened identifier (middle truncation).
- Distinguish loading from empty (e.g. `null` vs `[]`). Empty state only when
  everything is empty, not per section.
- Errors scoped to the section/tab that failed; failed values show a dash;
  retries cannot loop.
- Skeletons mirror the real layout with varied widths.

## Motion

- Animate only `transform`, `opacity`, `filter`, `clip-path`. Never layout
  properties, never `transition: all`.
- Durations 150-350ms, hard cap ~1s. Enter/interaction: ease-out
  (`cubic-bezier(0.23, 1, 0.32, 1)`); on-screen movement: ease-in-out; avoid
  ease-in. iOS prefers springs.
- Motion values come from shared constants, not magic numbers per component.
- Animate from the source: correct `transform-origin`; for SVG
  `transform-box: fill-box`.
- Interruptible and never blocking input.
- `prefers-reduced-motion`: CSS kill-switch is not enough for JS animation
  libraries. Each JS animation needs a reduced variant: short opacity
  crossfade, no scale/blur/travel.
- `will-change` only while animating. Measure layout before first paint
  (layout effect) to avoid a flash.
- Scaling an element with `backdrop-filter` inside a wrapper flickers in
  Safari; put the filter on the scaled element.

## Feedback

- Every press has visible feedback within one frame.
- Haptics where the host supports it, guarded with optional chaining:
  selection change for toggles/pickers, light impact for taps, success/error
  notification for submit and validation results.
- Destructive or irreversible actions confirm; failures are reported, never
  swallowed (including clipboard).

## Host Container (WebView / mini app)

- Use the host SDK through one wrapper module.
- Hash routing when the host breaks history routing.
- Native back button wired once; detail panes in split views do not show it.
- Lock host vertical swipe-to-close on long forms and drag gestures.
- `theme-color` and `color-scheme` match the page.
- Test on iOS Low Power Mode and Safari; they are the common regression
  source.

## Accessibility

- Semantic elements first (button, link, list, heading); visible focus.
- Tap targets >= 44x44.
- Icon-only buttons have an accessible name.
- Contrast holds in both themes, including disabled and secondary text.

## Checklist

- [ ] Loading, empty, error, worst-case data all rendered and looked at
- [ ] Only shared primitives; no raw clickable divs
- [ ] Both platforms and both themes checked
- [ ] No hardcoded colors, sizes, insets or motion values
- [ ] Reduced-motion variant for every JS animation
- [ ] Project lint passes; page opened and checked in the dev server
