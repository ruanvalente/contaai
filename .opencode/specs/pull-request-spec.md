# Pull Request Spec

## Purpose

This spec defines the standards for creating and reviewing pull requests in the project. It ensures consistency, quality, and effective communication across the team.

## When to Use This Spec

- Creating new pull requests
- Reviewing pull requests
- Setting up PR templates

---

## PR Title Convention

Use semantic commits format in title:

```
<type>(<scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style changes (formatting, no logic) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance, dependencies, build changes |

### Scope

Optional. Indicates the area affected:

- `dashboard`
- `auth`
- `books`
- `ui`
- `database`
- `api`
- `config`

### Examples

```
feat(dashboard): add book search functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(books): simplify formatBook function
```

---

## PR Description Template

```markdown
## Summary
[Brief description of what this PR does]

## Changes
- [Change 1]
- [Change 2]
- [Change 3]

## Testing
- [ ] Unit tests pass
- [ ] Manual testing performed
- [ ] No console errors

## Screenshots
[If UI changes, add screenshots]

## Related Issues
Closes #[issue number]
```

---

## PR Guidelines

### Before Creating PR

- [ ] All tests pass locally
- [ ] Code follows project conventions
- [ ] No linting errors
- [ ] PR title follows semantic convention
- [ ] Description is complete

### Review Requirements

- At least 1 approval required
- All comments addressed
- CI checks passing

### After Merge

- Branch deleted (optional)
- Related issue closed

---

## Quick Reference

| Scenario | Type |
|----------|------|
| New feature | `feat` |
| Bug fix | `fix` |
| Performance | `perf` |
| Refactoring | `refactor` |
| Documentation | `docs` |
| Tests | `test` |
| Dependencies | `chore` |

---

## Example: Search Books Bug Fix PR

### Title

```
fix(books): align searchBooksAction with dashboard data source
```

### Description

```markdown
## Summary
Fixed the search functionality to use the same data source (`user_books` table) as the dashboard, ensuring published books appear in search results.

## Changes
- Changed table from `books` to `user_books` in searchBooksAction
- Added `status = 'published'` filter to search query
- Updated formatter from `formatBook` to `formatUserBook`

## Testing
- [x] Lint passes
- [x] Manual testing in dev environment
- [x] Verified search returns published books from user_books

## Related Issues
Closes #21
```
