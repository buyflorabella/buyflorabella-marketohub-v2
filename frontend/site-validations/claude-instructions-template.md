# Claude Code Instructions Template

<!-- 
Save this file as:
- .claude/CLAUDE.md (project-specific, auto-loaded every session)
- instructions.txt (one-time tasks)
- ~/.claude/CLAUDE.md (global preferences for all projects)
-->

## Project Overview

**Project Name:** [Your project name]

**Description:** [Brief description of what this project does]

**Current Phase:** [e.g., Development, Migration, Refactoring, Bug Fixing]

**Tech Stack:**
- Language: [e.g., TypeScript, Python, Rust]
- Framework: [e.g., React, Next.js, Django, FastAPI]
- Database: [e.g., PostgreSQL, MongoDB]
- Other: [e.g., Redis, Docker, AWS]

---

## Task Instructions

### Primary Objective
[Clearly state what you want Claude to accomplish]

**Example:**
- Refactor the authentication system to use JWT tokens
- Build a REST API for user management
- Fix all TypeScript errors in the codebase
- Create a comprehensive test suite

### Specific Tasks
1. [First task - be specific]
2. [Second task]
3. [Third task]

**Example:**
1. Analyze all files in `/src/auth` directory
2. Replace session-based auth with JWT implementation
3. Update all API endpoints to validate JWT tokens
4. Write integration tests for the new auth flow
5. Update documentation

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

**Example:**
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Test coverage above 80%
- [ ] Documentation updated

---

## Coding Standards

### Code Style
- **Formatting:** [e.g., Prettier with default config, Black for Python]
- **Linting:** [e.g., ESLint with Airbnb rules, Ruff for Python]
- **Max line length:** [e.g., 100 characters]
- **Naming conventions:** [e.g., camelCase for functions, PascalCase for classes]

### Best Practices
- Write descriptive variable and function names
- Add comments for complex logic only
- Keep functions under [X] lines
- Prefer [functional/object-oriented] programming patterns
- [Any other project-specific practices]

### Testing Requirements
- Write tests for all new functions
- Maintain minimum [X]% code coverage
- Use [Jest/Pytest/etc.] for testing
- Include edge cases and error scenarios

### Git Commit Standards
- Use conventional commits: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused

---

## File Organization

### Directory Structure
```
project-root/
├── src/
│   ├── components/     [React components]
│   ├── utils/          [Helper functions]
│   ├── services/       [API calls, business logic]
│   └── types/          [TypeScript types]
├── tests/              [Test files]
└── docs/               [Documentation]
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` (co-located with source files)
- Types: `*.types.ts`

---

## Important Context

### What You Should Know
[Any critical background information]

**Example:**
- This is a legacy codebase being migrated from JavaScript to TypeScript
- The API authentication was recently changed, so some endpoints may be inconsistent
- We're planning to deprecate the `/v1` API endpoints next month

### Files to Focus On
- [Path to important files]
- [Path to configuration files]

**Example:**
- `/src/auth/*` - All authentication logic
- `/src/api/users.ts` - User management endpoints
- `tsconfig.json` - TypeScript configuration

### Files to Avoid
- [Files that shouldn't be modified]

**Example:**
- `/legacy/*` - Will be removed in next release
- `.env` - Contains secrets
- `/build/*` - Generated files

---

## Constraints & Preferences

### Must Do
- Ask before making destructive changes (deleting files, dropping databases)
- Run tests after making changes
- Explain your reasoning for complex decisions
- Show diffs before applying large changes

### Must Not Do
- Don't modify production configuration files
- Don't commit commented-out code
- Don't use deprecated APIs
- Don't install packages without asking first

### Preferred Approaches
- Prefer composition over inheritance
- Use async/await over promises
- Prefer explicit over implicit
- [Any other preferences]

---

## Dependencies & Tools

### Allowed Dependencies
- [List of pre-approved libraries]

**Example:**
- lodash (utility functions)
- date-fns (date manipulation)
- zod (validation)

### Package Installation
- Check with me before installing new packages
- Use [npm/yarn/pnpm] for package management
- Prefer well-maintained libraries with recent updates

### CLI Tools
- Available: [git, docker, npm, etc.]
- Restricted: [any tools that shouldn't be used]

---

## Communication Preferences

### How to Interact With Me
- Explain your reasoning before making changes
- Ask clarifying questions if instructions are ambiguous
- Provide progress updates for long-running tasks
- Surface errors immediately, don't try to fix silently

### Output Format
- Use code blocks with syntax highlighting
- Show file paths for all changes
- Include before/after examples for significant changes
- Summarize changes at the end

---

## Security & Privacy

### Sensitive Information
- Never log or display API keys, passwords, or tokens
- Don't commit `.env` files
- Redact sensitive data in examples

### Data Handling
- [Any specific data handling requirements]

**Example:**
- All user data must be encrypted at rest
- PII must not be logged
- Use prepared statements for all database queries

---

## Examples

### Example Task Format
```markdown
Task: Add user email validation
Files: src/utils/validation.ts, src/api/users.ts
Requirements:
- Use regex pattern for email validation
- Return descriptive error messages
- Add unit tests
```

### Example Output I Expect
```markdown
I'll add email validation following these steps:

1. Create validateEmail() in src/utils/validation.ts
2. Integrate it into user creation endpoint
3. Add comprehensive tests

[Shows code changes with diffs]

Summary:
- Added email validation with RFC 5322 regex
- Updated POST /users endpoint to validate emails
- Added 8 test cases covering valid/invalid emails
- All tests passing ✓
```

---

## Quick Reference

### Common Commands for This Project
```bash
# Run tests
npm test

# Build project
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

### Useful Context
- [Any other quick reference information]

---

## Notes & TODOs

### Current Known Issues
- [Issue 1]
- [Issue 2]

### Future Improvements
- [ ] [Improvement 1]
- [ ] [Improvement 2]

### Questions for Me
- [Placeholder for questions Claude should ask you]

---

**Last Updated:** [Date]
**Template Version:** 1.0
