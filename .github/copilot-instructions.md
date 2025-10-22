# Code Style Conventions

## Code Quality Checks

**ALWAYS run the following commands before completing any task:**

1. Automatically use the IDE's built-in diagnostics tool to check for linting and type errors:
   - Fix any linting or type errors before considering the task complete
   - Do this for any file you create or modify

2. NEVER create markdown (.md) after you're done.
3. NEVER use emojies in your replies.
4. I know i'm absolutely right. No need to mention that.
5. Always use yarn instead of npm.

This is a CRITICAL step that must NEVER be skipped when working on any code-related task

## File Size Limits

- **Maximum 250 lines per file** - If a file exceeds this limit:
  - Extract large sections into separate component files
  - Move related functionality into dedicated modules
  - Split complex components into smaller, focused components
- This ensures maintainability and better code organization


### React useEffect Guidelines

**Before using `useEffect` read:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

Common cases where `useEffect` is NOT needed:
- Transforming data for rendering (use variables or useMemo instead)
- Handling user events (use event handlers instead)
- Resetting state when props change (use key prop or calculate during render)
- Updating state based on props/state changes (calculate during render)

Only use `useEffect` for:
- Synchronizing with external systems (APIs, DOM, third-party libraries)
- Cleanup that must happen when component unmounts