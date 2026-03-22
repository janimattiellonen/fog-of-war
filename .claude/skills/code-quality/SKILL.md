---
name: code-quality
description: Reviews TypeScript and React code for type safety, React patterns, code structure, and test coverage. Use when reviewing code quality, looking for anti-patterns, or preparing code for PR review.
argument-hint: "[file or directory path]"
---

Perform a comprehensive code quality review of the changed or specified files. If `$ARGUMENTS` specifies files or directories, focus on those. Otherwise, review all files changed relative to the main branch.

## Step 1: Identify target files

Determine which files to review:
- If the user specified files/directories via arguments: use those
- Otherwise: run `git diff --name-only main...HEAD -- '*.ts' '*.tsx'` to find changed TypeScript/React files
- Also check `git diff --name-only` for unstaged changes
- Filter to only `.ts` and `.tsx` files

If no files are found, tell the user and stop.

## Step 2: Run automated checks (in parallel)

Run all of these in parallel and collect results:
- `npm run typecheck` — TypeScript type checking
- `npm run lint` — ESLint analysis

## Step 3: Manual code review

Read each target file and review for the following categories. Only report actual issues found — do not pad the report with generic advice.

### TypeScript quality
- Proper use of types — avoid `any`, prefer specific types and interfaces
- Use of discriminated unions over type assertions
- Correct use of generics (not overly complex, not underused)
- Proper nullability handling (no unnecessary `!` non-null assertions)
- Consistent use of `const` over `let` where values don't change
- Enums vs. union types (prefer union types for simple cases)

### React patterns
- Components are focused and have a single responsibility
- No business logic mixed into rendering — extract hooks or helpers
- Proper use of hooks: correct dependency arrays, no missing deps
- No state that can be derived from other state or props
- Event handlers and callbacks are stable (useMemo/useCallback where it matters for performance)
- Keys in lists are stable and meaningful (not array index unless list is static)
- No prop drilling beyond 2 levels — consider context or composition

### Code structure
- Functions and components are reasonably sized (flag functions > 50 lines)
- No duplicated logic that should be extracted
- Imports are organized and there are no unused imports
- No dead code (unreachable branches, unused variables, commented-out code)
- File organization follows existing project conventions

### Test quality
- Changed logic has corresponding tests (flag untested code paths)
- Tests are testing behavior, not implementation details
- No snapshot tests that are too broad
- Test descriptions clearly state what is being tested
- Mocks are minimal and focused

## Step 4: Suggest refactors

For each issue found, provide:
1. The file and line number
2. What the problem is (be specific)
3. A concrete fix — show the corrected code

Group findings by severity:
- **Errors**: Type safety issues, bugs, missing error handling at boundaries
- **Warnings**: Anti-patterns, performance issues, missing tests
- **Suggestions**: Style improvements, minor refactors for readability

## Step 5: Summary

End with a brief summary:
- Total files reviewed
- Count of errors / warnings / suggestions
- The single most impactful improvement to make first

If automated checks (Step 2) had failures, list those separately at the top before the manual review findings.
