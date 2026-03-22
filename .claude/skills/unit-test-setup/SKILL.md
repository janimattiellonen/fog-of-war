---
name: unit-test-setup
description: Install and configure Vitest test infrastructure for this project. Use when setting up testing for the first time or fixing test configuration.
disable-model-invocation: true
---

Set up Vitest and related testing libraries for this project.

## Step 1: Check current state

- Read `package.json` to see what's already installed
- Check if `vitest.config.ts` or a `test` section in `vite.config.ts` exists
- Check if `@testing-library/react` is installed (needed for React component tests)

## Step 2: Install dependencies

Install only what's missing. The required packages are:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- `vitest` — test runner
- `@testing-library/react` — React component testing
- `@testing-library/jest-dom` — DOM matchers (toBeInTheDocument, etc.)
- `@testing-library/user-event` — simulates real user events
- `jsdom` — DOM environment for component tests

## Step 3: Configure Vitest

Add a Vitest config. Extend the existing `vite.config.ts` by changing the import to use `vitest/config` instead of `vite`:

```typescript
import { defineConfig } from 'vitest/config'
// ... existing imports ...

export default defineConfig({
  // ... existing config ...
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
    },
  },
})
```

**Important**: Do NOT use the `/// <reference types="vitest" />` approach — it doesn't work with Vitest 4 + Vite 8. Use `import { defineConfig } from 'vitest/config'` instead.

If modifying `vite.config.ts` would be too disruptive, create a separate `vitest.config.ts` instead.

## Step 4: Create test setup file

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

This registers the custom DOM matchers (like `toBeInTheDocument`) with Vitest's `expect`.

## Step 5: Add npm script

Add a `test` script to `package.json` if not already present:

```json
"test": "vitest run",
"test:watch": "vitest"
```

## Step 6: Update TypeScript config

Ensure `tsconfig.app.json` includes the test setup file types, or create a `tsconfig.test.json` that extends the base config. At minimum, the test files need to be able to resolve Vitest types.

Check if `compilerOptions.types` in `tsconfig.app.json` needs `vitest/globals` added for global test APIs.

## Step 7: Verify

Run `npx vitest run` to confirm the setup works (it should report 0 tests found, with no configuration errors).

## Step 8: Summary

Report what was installed and configured. Mention that the user can now use `/unit-test` to generate tests.
