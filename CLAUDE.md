# Claude Code Instructions

**Read and follow `AGENTS.md` for all coding guidelines.**

This file exists to ensure Claude Code discovers the project instructions. The comprehensive rules are maintained in `AGENTS.md` to keep a single source of truth for all AI agents.

## Scope Discipline

- Do not over-engineer. Avoid extracting constants, adding abstractions, or creating shared utilities unless explicitly asked.
- If a fix attempt fails twice, stop and ask the user before trying a third approach.

## Quick Reference

- Package manager: **yarn** (not npm/pnpm)
- Routing: **wouter** with `useHashLocation`
- Styling: **SCSS Modules** (ComponentName.module.scss)
- Platform: **Telegram Web App** (internal `@lib/twa` module)
- Max file size: **250 lines**
- Type checking: **PropTypes**

## Critical Rules

1. MUST read `AGENTS.md` before any code changes
2. MUST run linting/type checks before completing tasks
3. MUST use yarn for all package operations
4. NEVER create markdown files unless explicitly asked
5. NEVER exceed 250 lines per file
6. MUST use SCSS Modules for styling
7. MUST respect `prefers-reduced-motion` for animations

## Design System & Figma

- When implementing from Figma, match exact spec values (heights, paddings, radii) on first pass — do not approximate.
- For component bugs, check CSS specificity / inheritance first before adding new rules; prefer fixing the root cause over layering overrides.
