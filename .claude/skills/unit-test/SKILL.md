---
name: unit-test
description: Write unit tests for TypeScript and React code using Vitest. Use when the user asks to write tests, add test coverage, or test a specific file/function.
argument-hint: "[file or function to test]"
---

Write unit tests for the specified files or functions. If `$ARGUMENTS` specifies targets, test those. Otherwise, identify untested files by comparing `src/**/*.ts` and `src/**/*.tsx` against existing `**/*.test.ts` and `**/*.test.tsx` files.

## Step 0: Verify test infrastructure

Check if Vitest is installed by looking for `vitest` in `package.json` devDependencies.

If Vitest is **not** installed, stop and tell the user:

> Vitest is not set up yet. Run `/unit-test-setup` first to install and configure it, then re-run this skill.

Do **not** install packages or modify config files from this skill.

## Step 1: Identify what to test

- If arguments specify a file: test that file
- If arguments specify a function name: find the file containing it and test that function
- If no arguments: find source files in `src/` that lack a corresponding `.test.ts` or `.test.tsx` file and pick the most impactful ones to test (pure logic and utilities first, then hooks, then components)

Prioritize testing in this order:
1. **Pure functions and utilities** (e.g., parsers, calculations, state logic) — easiest to test, highest value
2. **Custom hooks** — test with `@testing-library/react` `renderHook`
3. **React components** — test with `@testing-library/react` `render`

Skip files that are purely type definitions, re-exports, or thin wrappers around browser APIs (canvas, DOM) that would require extensive mocking with little value.

## Step 2: Read the source code

Before writing any test, read the full source file to understand:
- All exported functions/components and their signatures
- Edge cases: nulls, empty inputs, boundary values, error conditions
- Dependencies that may need mocking
- Types and interfaces used

## Step 3: Write tests

Create test files following these conventions:

### File placement and naming
- Place test files next to the source file: `src/game/player.test.ts` for `src/game/player.ts`
- Use `.test.ts` for pure logic, `.test.tsx` for files that render JSX

### Test structure
```typescript
// No vitest imports needed — globals: true is configured
describe('functionName', () => {
  it('should handle the main/happy path', () => { ... });
  it('should handle edge case X', () => { ... });
  it('should throw on invalid input', () => { ... });
});
```

### Rules
- **Test behavior, not implementation**: assert on return values and observable effects, not internal state
- **One logical assertion per test**: each `it()` block tests one scenario
- **Descriptive names**: `it('should return empty array when input is empty')` not `it('works')`
- **No unnecessary mocks**: only mock external dependencies (network, file system, browser APIs). Never mock the module under test
- **Use concrete values**: avoid random/generated test data. Use realistic, readable fixtures
- **Test error paths**: if a function throws, test that it throws with the expected message
- **Keep tests independent**: no test should depend on another test's state or execution order
- **Avoid `any` in tests**: use proper types even in test code
- **Do not test private/unexported functions directly**: test them through the public API

### Mocking guidance
- Use `vi.fn()` for function mocks
- Use `vi.mock()` for module mocks — place at the top of the file
- For canvas/DOM APIs: create minimal mock objects with only the methods used
- For React components with complex deps: mock child components that aren't relevant to the test
- Reset mocks between tests with `beforeEach(() => { vi.clearAllMocks(); })`

### React component testing
- Use `@testing-library/react` — never use `enzyme` or shallow rendering
- Query by role, label, or text — avoid `querySelector` and test IDs when possible
- Test user interactions with `@testing-library/user-event`
- For components using canvas: mock the canvas context rather than testing pixel output

## Step 4: Run and verify

After writing tests, run them:
```bash
npx vitest run <test-file-path>
```

If tests fail:
1. Read the error message carefully
2. Determine if the test or the expectation is wrong
3. Fix the test (not the source code, unless a genuine bug is found)
4. Re-run until all tests pass

## Step 5: Summary

Report:
- Files tested
- Number of test cases written
- Any source code issues discovered during testing (report but do not fix unless asked)
- Suggestions for additional test coverage if relevant
