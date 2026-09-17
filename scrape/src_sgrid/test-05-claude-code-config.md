# Practice Test 5: Claude Code Configuration (Week 5)
Domain 3: Claude Code Configuration & Workflows -- Task Statements 3.1-3.3

---

## Question 1
A new team member reports that Claude Code is not following the project's coding standards, while all other developers see them applied correctly. The standards are documented in a CLAUDE.md file. Where is the most likely misconfiguration?

A) The standards are in the project-level `.claude/CLAUDE.md` but the new member has not pulled the latest changes.
B) The standards are in `~/.claude/CLAUDE.md` (user-level) on another developer's machine, so they are not shared via version control.
C) The CLAUDE.md file is too large for Claude to process.
D) The new member's Claude Code version is outdated.

<details>
<summary>Answer</summary>

**B)** User-level configuration in `~/.claude/CLAUDE.md` applies only to that user and is not shared through version control. If coding standards are placed there instead of project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`), new team members will not receive them. This is the classic configuration hierarchy diagnostic question.
</details>

---

## Question 2
Your project has a large CLAUDE.md file (500+ lines) covering API conventions, testing standards, deployment procedures, security policies, and style guides. It is becoming hard to maintain. What is the best refactoring approach?

A) Split it into multiple files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`) with topic-specific focus.
B) Create a summary CLAUDE.md and link to external documentation.
C) Keep the single file but add a table of contents.
D) Move all content to the README.md instead.

<details>
<summary>Answer</summary>

**A)** The `.claude/rules/` directory is designed for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md. Each file can focus on one area (testing, API conventions, deployment, security) making maintenance easier. Files in `.claude/rules/` can also have YAML frontmatter for path-scoping, adding conditional loading. README.md (D) is for human documentation, not Claude configuration.
</details>

---

## Question 3
Your monorepo has 5 packages, each maintained by a different team with different coding standards. Package A uses React hooks, Package B uses Angular, Package C is a Go backend. You want each package to use its own standards document. What is the most maintainable approach?

A) Put all standards in the root CLAUDE.md under package-specific headers.
B) Use `@import` in each package's CLAUDE.md to selectively include relevant standards files.
C) Create identical CLAUDE.md files in each package directory, duplicating shared standards.
D) Use a single `.claude/rules/` file with conditional logic for each package.

<details>
<summary>Answer</summary>

**B)** The `@import` syntax lets each package's CLAUDE.md reference specific standards files relevant to its domain (e.g., Package A imports `react-standards.md`, Package C imports `go-standards.md`). Shared standards can be in a common file that all packages import. This avoids duplication (C) and keeps each package's configuration focused (vs putting everything in root, A).
</details>

---

## Question 4
You want to create a `/deploy` command that is available only to you for testing, without affecting your teammates. Where should you create it?

A) `.claude/commands/deploy.md` in the project repository.
B) `~/.claude/commands/deploy.md` in your home directory.
C) `.claude/skills/deploy/SKILL.md` in the project repository.
D) Add it to your personal CLAUDE.md.

<details>
<summary>Answer</summary>

**B)** User-scoped commands in `~/.claude/commands/` are personal and not shared via version control. Project-scoped commands in `.claude/commands/` (A) would be shared with all teammates via the repository. Skills (C) are also project-scoped when in the project directory. CLAUDE.md (D) is for instructions, not command definitions.
</details>

---

## Question 5
You are creating a skill that performs verbose codebase analysis, generating extensive output. You do not want this output to pollute the main conversation context. What frontmatter option should you use?

A) `output: hidden`
B) `context: fork`
C) `verbose: false`
D) `context: isolated`

<details>
<summary>Answer</summary>

**B)** The `context: fork` frontmatter option runs the skill in an isolated sub-agent context. This prevents verbose skill outputs from consuming tokens in the main conversation. The skill runs, produces its output, and returns a summary without the detailed exploration polluting the main session. Options A, C, and D are not valid frontmatter options.
</details>

---

## Question 6
A skill needs to generate code files but should not be allowed to execute shell commands or delete files. How do you restrict its capabilities?

A) Add instructions in the skill's prompt saying "Do not use Bash or delete files."
B) Configure `allowed-tools` in the SKILL.md frontmatter to limit tool access (e.g., only Read, Write, Edit).
C) Create a separate Claude Code profile with reduced permissions.
D) Use a lower-capability model for the skill.

<details>
<summary>Answer</summary>

**B)** The `allowed-tools` frontmatter in SKILL.md restricts which tools the skill can access during execution. Setting it to only file write operations (Read, Write, Edit) prevents the skill from running Bash commands or performing destructive actions. This is deterministic tool restriction, not prompt-based (A).
</details>

---

## Question 7
A skill for code review should prompt the developer for a PR number when invoked without arguments. Which frontmatter option enables this?

A) `required-args: ["pr_number"]`
B) `argument-hint: "PR number to review"`
C) `prompt: "Enter PR number"`
D) `input-required: true`

<details>
<summary>Answer</summary>

**B)** The `argument-hint` frontmatter prompts developers for required parameters when they invoke the skill without arguments. It provides a hint about what input is expected. The other options are not valid SKILL.md frontmatter fields.
</details>

---

## Question 8
Your team needs both always-loaded universal coding standards AND on-demand task-specific workflows (like code review, deployment checks, migration helpers). How should these be organized?

A) Put everything in CLAUDE.md -- it handles both standards and workflows.
B) Use CLAUDE.md for always-loaded universal standards and skills (.claude/skills/) for on-demand task-specific workflows.
C) Use skills for everything since they are more flexible.
D) Use .claude/rules/ for workflows and CLAUDE.md for standards.

<details>
<summary>Answer</summary>

**B)** CLAUDE.md is always loaded and suited for universal standards that should apply to every interaction. Skills are invoked on-demand and suited for task-specific workflows that only apply when explicitly needed. This separation keeps the always-loaded context lean (saving tokens) while providing rich task-specific guidance when needed.
</details>

---

## Question 9
You want to verify which memory files are currently loaded in your Claude Code session and diagnose why some sessions seem to have different behavior. Which command should you use?

A) `/status`
B) `/memory`
C) `/config`
D) `/debug`

<details>
<summary>Answer</summary>

**B)** The `/memory` command shows which memory files are loaded in the current session. This helps diagnose inconsistent behavior across sessions -- if different memory files are loaded, behavior will differ. This is the designated diagnostic tool for memory-related issues.
</details>

---

## Question 10
A developer creates a personal variant of a team skill with different behavior. They want to avoid affecting teammates. What is the correct approach?

A) Modify the team skill in `.claude/skills/` and add a git ignore rule.
B) Create a personal skill variant in `~/.claude/skills/` with a different name.
C) Override the team skill by creating one with the same name in `~/.claude/skills/`.
D) Add conditional logic to the team skill that checks the username.

<details>
<summary>Answer</summary>

**B)** Personal skill customization is done by creating variants in `~/.claude/skills/` with different names. Using a different name avoids conflicts with the team skill and prevents unintended effects on teammates. Same-name overrides (C) could cause confusion. Modifying the team skill (A) affects everyone even with gitignore. Conditional logic (D) adds unnecessary complexity.
</details>
