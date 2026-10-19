---
name: twa-ui
description: How to build UI screens, prototypes, components and showcases in this Telegram Web App repo (wallet_animations). Use for any task that adds or changes a screen, page, prototype, list, cell, modal, sheet, form, empty/loading/error state, or component styling here, including "сверстай", "сделай экран", "добавь прототип", "добавь компонент". Covers file layout, project primitives (Page, PanelHeader, SectionList, Cell, Text, Button, ModalView, Skeleton, Snackbar), Apple/Material styling, worst-case data, motion defaults, haptics and a pre-done checklist.
---

# Building UI in wallet_animations

AGENTS.md holds the general rules. This skill holds the concrete patterns the
existing code actually uses, plus the mistakes that were fixed repeatedly.
When this skill and AGENTS.md disagree on an implementation detail, follow
the existing code (noted below).

Primitive APIs: `references/primitives.md`. Read it before composing a screen.

## 1. Before writing code

1. Find the closest existing screen and copy its structure. Best references:
   - list + modal detail: `src/pages/prototypes/GramWallet/components/Transactions/`
   - simple list screen: `src/pages/prototypes/Wallet/index.jsx`
   - form: `src/pages/prototypes/WalletImport/`
   - component demo: `src/components/Cells/Cells.showcase.jsx`
2. List every state the screen has: loading, empty, error, partial data,
   worst-case data. Design them before the happy path.
3. Check that a primitive already covers what you need (`src/components/`).
   Raw `<button>`, `<div onClick>`, hand-built rows are a review finding.

## 2. File layout for a prototype

```
src/pages/prototypes/<Name>/
  index.jsx                 # router / entry, thin
  <Screen>.jsx              # one file per screen
  <Name>.module.scss
  <Name>.skeleton.jsx       # loading placeholder, registered in pageSkeletons.js
  use<Thing>Data.js         # data hooks
  use<Thing>Flight.js       # animation hooks
  constants.js helpers.js   # plain JS
  data/*.json               # mock data
  components/<Part>/index.jsx + <Part>.module.scss
```

- Register in `src/pages/config.js` with
  `component: lazyWithPreload(() => import("./prototypes/<Name>"))`.
  Nested routes: `routeSuffix: "/:rest*?"`. Prototypes own their header
  (`header: false` on the category).
- Showcases are `<Component>.showcase.jsx` (jsx, not js) next to the
  component, registered the same way. Skeleton: `<Component>.skeleton.jsx`
  + entry in `src/pages/pageSkeletons.js` keyed by the same title.
- Imports are relative (existing convention); do not switch a file to aliases.
- 250-line cap: split into hooks / `components/` / helpers early.

## 3. Screen composition

```jsx
<>
    <BackButton />
    <Page>
        <SectionList>
            <SectionList.Item header="Assets">
                <Cell
                    as="button"
                    start={<ImageAvatar src={icon} fallback={<InitialsAvatar name={name} />} />}
                    end={<Cell.End label={formatUsd(value)} caption={formatAmount(amount)} />}
                    onClick={open}
                >
                    <Cell.Text title={name} description={symbol} />
                </Cell>
            </SectionList.Item>
        </SectionList>
    </Page>
</>
```

- Sub-components that render a section return their own `<SectionList.Item>`;
  an empty section returns `null`.
- Clickable rows: `<Cell as="button" onClick>`. Press feedback is automatic.
  Rows with a Switch: `tappable={false}` (no iOS highlight).
- Modal detail: `const { handlers } = useModal({ detail: false })`, render the
  modal next to the list, `<ModalView isOpen onClose>` with
  `<PanelHeader left={<XmarkIcon />} onLeft={onClose}>`, body as `<Table rows>`.
- Long forms: `useEffect(() => lockVerticalSwipes(), [])` so Telegram does
  not collapse the app while scrolling.
- Notifications: `useSnackbar().show({...})`, never a custom toast.

## 4. Styling

- Platform variants are written in SCSS, nested inside the local class
  (this is what the codebase does, 127 uses; not `styles.apple` in JSX):

  ```scss
  .root {
      padding: 12px var(--side-padding);
      :global(body.apple) & { border-radius: 26px; }
      :global(body.material) & { border-radius: 16px; }
  }
  ```
  In JS use `const { isApple } = useSkin()` only when behavior differs.
- Colors only from `var(--tg-theme-*)` or project vars in `src/index.css`
  (`--text-confirm-color`, `--tertiary-fill-background`,
  `--separator-non-opaque`, `--text-disabled-color`, `--glass-tint-background`).
  No hardcoded hex for surfaces or text.
- Horizontal padding: `var(--side-padding)` (16 Apple / 20 Material).
- Top inset: `var(--content-inset-top)`. Never re-derive it from
  `env(safe-area-inset-top)` + TG vars.
- Bottom: `calc(24px + env(safe-area-inset-bottom, 0px))`; bottom-anchored
  UI uses `var(--bottom-clearance, <own baseline>)`.
- Units px. Scale actually used: gaps 2/4/6/8/12/16, radii 6/8/12/16/20/26,
  pill `100px`. Min tap height 44px.
- Text color override: put `color` on a wrapping element, not on `<Text>`.
- Spacing between siblings: key on sibling position or data attributes,
  never on tag names.
- Amounts: `font-family: var(--rounded-stack)`.

## 5. Worst-case data (mandatory)

Every list/cell must survive:

- very long names (2-line clamp + `title`), long unbroken strings
  (`overflow-wrap: anywhere`, `min-width: 0` on flex children);
- huge and dust amounts: format with `src/utils/number.js`
  (`formatUsd` gives "< $0.01", `formatAmount`, `formatPrice`, `formatBalance`,
  `formatPercentage`); never `toFixed` inline;
- big balances: scale font with container queries
  (see `BalanceCard.module.scss`), not JS measuring;
- missing icon: `ImageAvatar fallback={<InitialsAvatar .../>}`;
- missing name: `truncateMiddle(address, 4, 4)` / `utils/address.js`;
- empty: show an empty state only when everything is empty; empty section
  returns `null`;
- loading: `null` = loading (skeleton), `[]` = empty. Use `<Skeleton active>`
  or numeric `Cell.Text` props (skeleton bar N `ch` wide), vary widths;
- errors: per-section/per-tab, show "—" for failed values, retry must not loop.

Add worst-case items to the mock JSON and look at them before calling it done.

## 6. Motion

Load `/web-animation-design` for anything non-trivial. Project specifics:

- `import * as m from "motion/react-m"`; `motion.div` breaks under strict
  `LazyMotion`.
- Use constants from `src/utils/animations.js`: `SPRING.APPLE` /
  `SPRING.MATERIAL` by platform, `SPRING.MODAL`, `DURATION.*`,
  `EASING.QUINT_OUT`. No new magic numbers unless justified.
- Reduced motion: CSS durations are killed globally, but JS (motion) is not.
  Every motion component needs `useReducedMotion()` with a variant: opacity
  crossfade ~0.15s, no scale/blur/travel (see commit 92e950d).
- `will-change` only during the animation. First-paint measurements in a
  layout effect + rAF to avoid flash.
- Animate transform/opacity/filter/clip-path only (existing
  `height: "auto"` in `Wallet/components/Assets` is a known violation, do not copy).

## 7. Haptics (`WebApp` from `lib/twa`, optional chaining)

- toggle, picker, wheel: `WebApp.HapticFeedback?.selectionChanged()`
- button tap with weight: `impactOccurred("light")`
- submit/validation result: `notificationOccurred("success" | "error")`

## 8. Done checklist

- [ ] All states covered: loading, empty, error, worst-case data
- [ ] Only project primitives; clickable rows are `Cell as="button"`
- [ ] Apple and Material both checked (SkinSwitcher), light and dark theme
- [ ] No hardcoded colors; safe areas via project vars
- [ ] Reduced-motion variant for every JS animation
- [ ] `clsx` for classNames (no template literals, no `filter(Boolean).join`)
- [ ] Files <= 250 lines, PropTypes on exported components
- [ ] Registered in `config.js` (+ skeleton in `pageSkeletons.js`)
- [ ] `yarn lint` passes; ideally open the page with `yarn dev` and look at it
