## Domain 3: Claude Code Configuration & Workflows (20%)

**Domain in a nutshell:**
- The hands-on configuration domain: the right answer is usually the exact file path, frontmatter key, or CLI flag.
- Covers the three-level `CLAUDE.md` hierarchy, custom slash commands and skills, path-specific rules, plan mode vs direct execution, iterative refinement, and CI/CD integration.
- Config placement determines *who* receives instructions and whether they travel via version control; precision about location is the whole game.
- Skill frontmatter (`context: fork`, `allowed-tools`, `argument-hint`) controls isolation, tool access, and argument prompting.
- Maps mainly to Scenario 2 (Code Generation with Claude Code) and Scenario 5 (CI/CD Integration), so it is reliably tested.

---

### 3.1 — Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organisation
**What it's about:** Claude Code reads `CLAUDE.md` from multiple locations and merges them; the level where you place a file decides who receives it and whether it is committed to version control.

**Key knowledge:**
- Three levels, all additive (they stack — none overrides another):
  - User-level (`~/.claude/CLAUDE.md`): personal preferences, never committed, only on that developer's machine.
  - Project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`): shared team standards, committed, received by everyone who clones the repo. Applies across all subdirectories.
  - Directory-level (`src/payments/CLAUDE.md`): applies only when Claude works in that directory.
- Project-level config applies to all subdirectories — you do NOT need a `CLAUDE.md` in every folder.
- Use `.claude/rules/*.md` topic files plus `@import` to compose modular config per context (e.g. a payments package imports PCI rules).
- Use the `/memory` command to verify exactly which `CLAUDE.md` files are loaded in the current session — the diagnostic tool.

**✅ Do / ❌ Don't:**
- ✅ Put shared team standards in project-level config and commit them.
- ❌ Put shared standards in `~/.claude/CLAUDE.md` (teammates never get them after cloning).
- ✅ Split large config into `.claude/rules/*.md` and compose with `@import` so each team owns its file.
- ❌ Keep one monolithic `CLAUDE.md` (unmaintainable, loads irrelevant rules every session).
- ✅ Keep personal preferences in user-level config.
- ❌ Put personal preference rules in project config (they leak to all teammates and conflict with team standards).

**⚠️ Exam traps:**
- *"New teammate isn't getting the conventions" → blame project file.* Wrong: the instructions are actually in `~/.claude/CLAUDE.md` (user-level, not committed). Fix: move to project-level and commit.
- *Directory file "replaces" or "overrides" parent config.* Wrong: layers are additive — user + project + directory all apply simultaneously. If directory rules work but user prefs don't, the user-level file itself is broken (syntax/path/empty), not the hierarchy.
- *Plain-text headings in CLAUDE.md ("for files in src/api/…") act as scoping.* Wrong: headings are not scoping syntax; Claude reads the whole file regardless.

**Implementation task (gist):** Build all three config levels, commit the project file, confirm directory-level rules load only in that directory, refactor the project file into three `@import`-ed `.claude/rules/*.md`, then run `/memory` to verify the loaded set matches expectations.

---

### 3.2 — Create and configure custom slash commands and skills
**What it's about:** Slash commands are Markdown templates (team- or user-scoped); skills are more powerful, running in their own context with YAML frontmatter that controls isolation, tools, and argument prompting.

**Key knowledge:**
- Slash command scoping: project (`.claude/commands/review.md`, invoked `/project:review`, shared via git) vs user (`~/.claude/commands/my-review.md`, invoked `/user:my-review`, personal, not committed).
- Skill frontmatter keys the exam tests (in `SKILL.md`):
  - `context: fork` — runs the skill in an isolated sub-agent; verbose output stays in the fork, only a summary returns to the main session. Use for exploration/brainstorming/verbose analysis.
  - `allowed-tools` — restricts which tools the skill may invoke (least privilege); e.g. `[Write, Edit]` blocks destructive `Bash`.
  - `argument-hint` — prompts for a missing argument so the skill doesn't run against the wrong target.
  - Personal skill variants live in `~/.claude/skills/` and don't conflict with team skills in `.claude/skills/`.
- Skills vs CLAUDE.md: CLAUDE.md is always loaded and universal (style, testing standards); skills are invoked on demand for specific task types (architecture review, migration planning).

**✅ Do / ❌ Don't:**
- ✅ Add `context: fork` to any skill doing verbose codebase exploration so output doesn't fill the main context window.
- ❌ Run verbose exploration in a skill without `context: fork` (exhausts tokens, degrades later responses).
- ✅ Lock a write-only skill with `allowed-tools: [Write, Edit]`.
- ❌ Rely on a Markdown-body instruction like "don't run Bash" — prompt instructions can be bypassed; only `allowed-tools` is a hard restriction.
- ✅ Keep experimental/personal commands in `~/.claude/commands/`.
- ❌ Put a personal experiment in `.claude/commands/` (it gets committed and shared).
- ✅ For a dangerous workflow, split into a no-execution plan skill (`allowed-tools: [Read, Glob]`) and a separate execute skill (`allowed-tools: [Bash]`) to force a review gate.

**⚠️ Exam traps:**
- *Verbose skill output flooding the main conversation → fix with `allowed-tools`/`argument-hint`/move to user scope.* Wrong: only `context: fork` isolates output verbosity.
- *Prevent a skill from running Bash via prompt wording or `context: fork`.* Wrong: `context: fork` isolates context, not tool permissions; the only reliable safeguard is `allowed-tools`.
- *`argument-hint` makes output more concise.* Invented — it only prompts for missing arguments.

**Implementation task (gist):** Build a project slash command (verify it appears for all via git), a `context: fork` skill (confirm exploration stays out of main history), an `allowed-tools: [Write, Edit]` skill (confirm Bash is blocked), an `argument-hint` skill (confirm the prompt appears with no args), and a personal `~/.claude/skills/` variant (confirm teammates can't see it).

---

### 3.3 — Apply path-specific rules for conditional convention loading
**What it's about:** Files in `.claude/rules/` support a YAML `paths` field of glob patterns; the rule loads only when Claude edits a matching file, cutting irrelevant context and tokens.

**Key knowledge:**
- A `paths:` array uses globs like `**/*.test.tsx`, `**/*.spec.ts`, `tests/**/*`, `terraform/**/*`, `**/*.tf`.
- Key advantage over directory-level `CLAUDE.md`: a single path rule covers a *file type* across many directories (tests scattered in `src/`, `lib/`, `packages/`) with zero drift; a directory `CLAUDE.md` only covers its own directory.
- Use path rules for conventions tied to a file type; use directory `CLAUDE.md` for conventions tied to a domain/service regardless of file type.
- Path rules reduce token usage by not loading (e.g.) infrastructure rules during frontend work.

**✅ Do / ❌ Don't:**
- ✅ Enforce test conventions everywhere with one `.claude/rules/testing.md` using `paths: ["**/*.test.tsx", "**/*.spec.ts"]`.
- ❌ Create a separate `CLAUDE.md` in each test-containing directory (three copies that drift).
- ✅ Scope conflicting monorepo conventions with per-service `paths:` rules while keeping shared rules in root `CLAUDE.md`.
- ❌ Load every convention in root `CLAUDE.md` for all files (wastes tokens, applies Python rules to TS files, causes false alarms).

**⚠️ Exam traps:**
- *Cascade test rules by putting a `CLAUDE.md` in `src/`.* Wrong: `CLAUDE.md` files don't cascade to sibling or parent directories.
- *Headings/comment blocks ("apply only to user-input files, use judgment") scope rules.* Wrong: the whole file still loads; only path globs actually gate loading.
- *Per-directory `CLAUDE.md` only (drop root).* Loses shared project-wide rules (security, commit standards) that have no home.

**Implementation task (gist):** Create `testing.md` and `terraform.md` rule files with `paths:` globs, then open a plain source file (neither loads), a test file (only testing loads), and a `.tf` file (only terraform loads) to confirm conditional loading.

---

### 3.4 — Determine when to use plan mode vs direct execution
**What it's about:** Plan mode lets Claude explore and propose an approach before changing anything; it is justified only when the cost of a wrong assumption is high. Direct execution fits well-scoped, clearly-correct, small changes.

**Key knowledge:**
- Decision rule — use **plan mode** when: multiple valid approaches with different architecture/infra implications, many files touched, or unknown scope/dependencies to discover first (microservice restructuring, library migration across 45+ files, schema redesign, "add comprehensive tests", "refactor auth module").
- Use **direct execution** when: clear scoped change with one correct approach touching one or two files (single-file bug fix with a clear stack trace, add a null check, rename a variable, bump a dependency, add validation to one endpoint).
- Plan mode prevents "costly rework" — the exam phrase for wrong initial approaches that force undoing many changes; it surfaces foundational decisions *before* code is written.
- The **Explore subagent** isolates verbose discovery output in multi-phase tasks (explore → plan → implement) and returns a structured summary, preserving context for implementation. It is the plan-mode equivalent of `context: fork` (the skill variant) — both run in a separate context and return summaries.
- Plan mode for exploration then direct execution once the approach is confirmed is more powerful than either alone.

**✅ Do / ❌ Don't:**
- ✅ Use plan mode for a multi-strategy migration/refactor; present the option trade-offs and wait for approval before editing.
- ❌ Direct-execute a 45+ file library migration (Claude may pick an incompatible path and discover it after 30 reverted changes).
- ✅ Direct-execute a single-file fix with a clear stack trace.
- ❌ Use plan mode for a trivial scoped fix (adds latency with no benefit).
- ✅ Use the Explore subagent for large discovery phases so implementation starts with a clean context.
- ❌ Run exploration and implementation in one session without the Explore subagent (discovery fills the context window).

**⚠️ Exam traps:**
- *Context exhausted by discovery → use a bigger model / `/compact` / two manual sessions.* Wrong: the designed fix is the Explore subagent (prevents accumulation rather than compressing/losing precision after the fact).
- *Foundational regression after 40 lines → just write a more detailed initial prompt / use git rollback / smaller commits.* Wrong: a detailed prompt still writes the lines before hitting the decision; rollback and small commits are recovery, not prevention — plan mode surfaces the foundational choice first.

**Implementation task (gist):** Classify and run four tasks (clear single-file fix → direct; codebase-wide axios→fetch migration → plan; comprehensive auth tests → plan with Explore subagent; add validation to one endpoint → direct), then write three heuristics for spotting plan-mode vs direct-execution signals.

---

### 3.5 — Apply iterative refinement techniques for progressive improvement
**What it's about:** When output is inconsistent, the real cause is usually underspecified expectations. Refinement is progressive specification: identify the gap and communicate the correction precisely enough that Claude generalizes it.

**Key knowledge:**
- Four techniques:
  - **Concrete input/output examples** — when prose yields inconsistent transformations, give 2–3 input/output pairs (including edge cases like null); shows the *shape* of the transformation. Best for format/structure.
  - **Test-driven iteration** — write the test suite first (behaviour, edge cases, performance), then iterate by sharing failing tests as an unambiguous signal.
  - **Interview pattern** — ask Claude to surface design considerations (cache invalidation, failure modes, unknown edge cases) *before* implementing; best for unfamiliar domains.
  - **Batch vs sequential fixes** — when issues *interact* (one fix changes what another should be), send all fixes in a single message; when issues are *independent*, fix sequentially and validate each.
- Define a complete acceptance checklist/rubric (required library, all claims/fields, error handling, test coverage) before iterating, and validate every attempt against the *whole* checklist — this prevents the "fix one thing, break another" regression cycle caused by partial success criteria.

**✅ Do / ❌ Don't:**
- ✅ Replace vague prose ("format dates consistently") with 2–3 concrete before/after pairs.
- ❌ Keep describing a transformation in prose when it produces inconsistent results (Claude generalizes from examples, not instructions).
- ✅ Batch interacting changes into one message (e.g. change return type AND update the matching error handler together).
- ❌ Send interacting fixes one at a time (intermediate state is contradictory/confusing); sequential is only for independent issues.
- ✅ Write tests first, then iterate against failing tests.
- ❌ Implement first then add tests (they over-fit the implementation and miss edge cases).
- ✅ Evaluate a first draft against a full rubric and issue one comprehensive correction.
- ❌ Issue many sequential single-issue corrections (each pass introduces a new blind spot / regression).

**⚠️ Exam traps:**
- *Inconsistent format → fix with a CLAUDE.md rule, self-critique, or majority-voting across runs.* Wrong: concrete input/output examples are the most effective fix; vague terms stay underspecified, and inconsistent runs don't average into a correct one.
- *Iterative regression (fix one, break another) → blame task complexity / switch to a higher-memory model / run parallel prompts.* Wrong: the cause is incomplete success criteria; the model already has all corrections in history — define a full acceptance checklist and validate against all of it.
- *`/compact` fixes correction quality.* Wrong: it only manages history size, not what you ask for.

**Implementation task (gist):** Practice all four — convert a prose transformation to three I/O examples and measure consistency, drive a feature from failing tests, run the interview pattern on an unfamiliar domain (e.g. a distributed lock), batch-fix two interacting bugs vs sequential to see the intermediate-state problem, then document personal heuristics for choosing each technique.

---

### 3.6 — Integrate Claude Code into CI/CD pipelines
**What it's about:** CI is non-interactive; without the right flag Claude Code waits for input and the pipeline hangs forever. The exam tests the exact non-interactive flag, the right output format for inline PR comments, and the batch-vs-real-time trade-off.

**Key knowledge:**
- `-p` / `--print` runs non-interactive mode: process the prompt, write to stdout, exit. Required for all CI/CD usage; without it the pipeline hangs. No env var or Unix workaround is the correct answer (official Q10).
- `--output-format json` (optionally with `--json-schema`) forces machine-parseable structured output, enabling automated posting as inline PR comments without text parsing.
- Re-run deduplication: include prior review findings in context and instruct Claude to report only new/still-unaddressed issues, so re-runs after new commits don't duplicate comments.
- Test-generation context: provide existing test files (and document fixtures in CLAUDE.md) so generated tests don't duplicate existing scenarios.
- **Batch API vs real-time:** the Message Batches API gives ~50% cost savings but up to 24-hour processing with no latency SLA; results are correlated by `custom_id`. Use it for non-blocking work (overnight tech-debt reports, weekly quality analysis, bulk document processing). Never use it for blocking workflows (pre-merge checks, real-time feedback, latency-sensitive gates). Official Q11: switch only the overnight report to batch, keep the blocking pre-merge check real-time.
- Session context isolation: the session that wrote the code is less effective at reviewing it; use an independent review instance for fresh perspective.

**✅ Do / ❌ Don't:**
- ✅ Invoke as `claude -p "..."` in CI so the job exits automatically.
- ❌ Run `claude "..."` without `-p` (hangs waiting for input).
- ✅ Use `--output-format json` (with `--json-schema`) for parseable findings posted as inline PR comments.
- ✅ Use the Batch API only for non-blocking overnight/background jobs.
- ❌ Switch blocking pre-merge checks to the Batch API (up to 24h, no SLA — developers can't wait).
- ✅ Include prior findings on re-runs to avoid duplicate comments.

**⚠️ Exam traps:**
- *Pipeline hangs → set `CLAUDE_HEADLESS=true`.* Wrong: that env var does not exist (distractor). Use `-p`.
- *Pipeline hangs → redirect stdin from `/dev/null` (or add `--batch`).* Wrong: stdin redirection is an unreliable Unix workaround and `--batch` is not a valid flag; `-p` is the documented mode.
- *Switch both blocking and overnight workflows to batch (with polling or a timeout fallback).* Wrong: batch only fits the overnight report; polling/timeouts add complexity without making batch acceptable for blocking gates.
- *"Batch results can't be correlated to requests."* False — the Batch API uses `custom_id` for exactly that.
- *Re-run review without prior findings.* Wrong: Claude re-flags the same issues as new; supply prior findings and ask for only new/unaddressed ones.

**Implementation task (gist):** Build a CI review pipeline: invoke with `-p` (verify no hang), add `--output-format json --json-schema` and post parsed findings as inline PR comments, implement re-run deduplication via prior findings, supply existing tests to avoid duplicate test scenarios, and split costs by routing overnight jobs to the Batch API while keeping blocking gates real-time.
