# Claude Code Instructions

**Read and follow `AGENTS.md` for all coding guidelines.**

This file exists to ensure Claude Code discovers the project instructions. The comprehensive rules are maintained in `AGENTS.md` to keep a single source of truth for all AI agents.

## Quick Reference

- Package manager: **yarn** (not npm/pnpm)
- Routing: **wouter** with `useHashLocation`
- Styling: **SCSS Modules** (ComponentName.module.scss)
- Platform: **Telegram Web App** (@twa-dev/sdk)
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
