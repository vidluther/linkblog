---
name: github-issues-first
description: Use when the user asks to implement features, fix bugs, or make any code changes. Requires creating a GitHub issue before writing any code. Use when you feel urgency to "just start coding" or when the user says "let's get this done quickly."
---

# GitHub Issues First

## Overview

**No code without an issue.** Every code change must be tracked by a GitHub issue created BEFORE implementation begins. This ensures work is planned, trackable, and reviewable.

## The Iron Rule

```
NO CODE WITHOUT A GITHUB ISSUE FIRST
```

Before writing ANY code - even a one-line fix do the following:

1. Check if a GitHub issue already exists for the change you want to make.
2. If no issue exists, create a GitHub issue that describes what you're doing and why.

**Violating the letter of this rule is violating the spirit of this rule.**

## When to Create Issues

**ALWAYS before:**

- New features
- Bug fixes
- Refactoring
- Schema changes
- Configuration changes
- Any code modification

**The ONLY exceptions:**

- Updating documentation-only files (README, CLAUDE.md)
- Adding/modifying comments with zero code changes

## Issue Creation Process

### 1. Before ANY implementation, create the issue

Use the `gh` CLI:

```bash
gh issue create --title "Short imperative description" --body "$(cat <<'EOF'
## What
[What needs to be done - be specific]

## Why
[Why this change is needed]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes
[Design decisions, constraints, dependencies on other issues]
EOF
)"
```

### 2. Reference the issue number in your work

- Branch names: `feature/42-add-tagging-system`
- Commits: reference `#42` in commit messages
- PRs: reference `Closes #42` in PR description

### 3. Break large features into multiple issues

If a feature requires multiple steps (scaffolding, schema, API, tests), create separate issues for each. Use labels or a parent issue to group them.

## Quick Reference

| Action         | Command                                        |
| -------------- | ---------------------------------------------- |
| Create issue   | `gh issue create --title "..." --body "..."`   |
| List issues    | `gh issue list`                                |
| View issue     | `gh issue view <number>`                       |
| Close issue    | `gh issue close <number>`                      |
| Add labels     | `gh issue edit <number> --add-label "feature"` |
| Check existing | `gh issue list --search "keyword"`             |

## Red Flags - STOP and Create an Issue

You are about to violate this rule if:

- You're writing code and there's no issue number to reference
- You think "this is too small for an issue"
- You think "I'll create the issue after"
- You feel urgency to "just start coding"
- The user says "let's get this done quickly" and you skip planning
- You're about to scaffold a project without an issue
- You're about to run `npm init` or `nest new` without an issue

**All of these mean: STOP. Create the issue first.**

## Common Rationalizations

| Excuse                             | Reality                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| "It's too small for an issue"      | Small changes still need tracking. Issues take 30 seconds.         |
| "I'll create the issue after"      | You won't. And even if you do, you lost the planning benefit.      |
| "Let's just get this done quickly" | Spending 1 minute on an issue saves 30 minutes of confusion later. |
| "The user didn't ask for an issue" | The project convention is issues-first. Always.                    |
| "I already know what to do"        | Great - then writing the issue will take 15 seconds. Do it.        |
| "It's just a refactor"             | Refactors need tracking too. Create the issue.                     |
| "I'll batch the issues later"      | No. One issue per change, created before the change.               |

## Workflow

```
User asks for change
        |
        v
  Search existing issues
  (gh issue list --search "...")
        |
        v
  Issue exists? ----yes----> Reference it, start work
        |
       no
        |
        v
  Create GitHub issue
  (gh issue create ...)
        |
        v
  Confirm issue # with user
        |
        v
  NOW start implementation
```

## Common Mistakes

1. **Creating vague issues** - "Fix stuff" is not a title. Be specific: "Fix bookmark URL validation to reject malformed URLs"
2. **Skipping acceptance criteria** - If you can't list what "done" looks like, you don't understand the task yet
3. **One mega-issue for everything** - Break work into logical, independently deliverable pieces
4. **Not searching first** - Always check if an issue already exists before creating a duplicate
