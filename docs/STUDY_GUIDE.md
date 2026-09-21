# Claude Certified Architect — Foundations · Study Guide

> A condensed, exam-focused companion to the practice quiz (`src/quiz.py`).
> Sources (6 community repos): moisesprat, paullarionov (Path 1) + OlivierAlter, SGridworks, dnacenta (Path 2).
> **388 practice questions** are in `questions.json` — Path 1 = 163, Path 2 = 225. Run them separately (`--path 1` / `--path 2`) or together (`--path all`).

---

## 1. Exam logistics (know these cold)

| Parameter | Value |
|---|---|
| Question type | Multiple choice — **1 correct of 4** |
| Scoring | **100–1000 scale, pass = 720** |
| Guessing penalty | **None** → *answer every question* |
| Scenarios | 4 of 8 possible, randomly selected |
| Style | Realistic architecture trade-off scenarios, not trivia |

**The exam tests judgment, not recall.** Almost every question is "which approach is *most* effective / *first* step / *best* pattern." The distractors are usually plausible but are (a) over-engineered, (b) addressing the wrong root cause, or (c) using prompts where determinism is required.

### The 5 domains and weights

| # | Domain | Weight | Domain-labeled Qs* |
|---|---|---|---|
| 1 | Agent Architecture and Orchestration | **27%** | 48 |
| 2 | Tool Design and MCP Integration | **18%** | 27 |
| 3 | Claude Code Configuration and Workflows | **20%** | 31 |
| 4 | Prompt Engineering and Structured Output | **20%** | 35 |
| 5 | Context Management and Reliability | **15%** | 29 |

\*Across the full 388-question bank, 170 questions carry an explicit domain label (moisesprat + olivier + dnacenta). The remaining 218 are scenario-labeled (paullarionov + sgrid full-exam) and span all domains — filter those by scenario. See §8.

**Domain 1 is the biggest single bucket (27%). Domains 3+4 together are 40%.** Budget your prep accordingly.

---

## 2. The 8 recurring "mental models" (these win you points)

These ideas show up across *every* domain. Internalize them and most questions answer themselves:

1. **Determinism vs. probability.** When a business rule *must* hold (verify ID before refund, block refunds > $500, enforce tool order), use **code / hooks / preconditions** — *never* a prompt. Prompts give probabilistic compliance; hooks give guarantees.
2. **`stop_reason` drives the agent loop.** Continue on `tool_use`, stop on `end_turn` — but `end_turn` with no tool call can be a *mid-task reasoning turn*, not completion. Never detect completion by parsing assistant text or by a fixed iteration cap.
3. **Coordinator owns everything.** In hub-and-spoke multi-agent systems, all communication, routing, error handling, and synthesis flows *through the coordinator*. Subagents have **isolated context** — they inherit nothing unless you put it in their prompt.
4. **Tool descriptions are the model's main selection signal.** Bad routing? Fix descriptions first (cheapest, highest impact). Too many tools (18 vs 4–5) *hurts* reliability — scope tools to each agent's role.
5. **Few-shot + explicit criteria > vague instructions.** "Flag comments only when they contradict code" beats "check comment accuracy." 2–4 concrete examples beat paragraphs of guidance.
6. **`tool_use` + JSON Schema = guaranteed *syntax*, not *semantics*.** It eliminates malformed JSON but not wrong totals or misfiled values. Catch semantics with validation/retry-with-feedback and self-correction (`calculated_total` vs `stated_total`).
7. **Independent review beats self-review.** A model that generated code retains its reasoning and won't challenge itself. Spin up a *fresh* instance with no generation context for review.
8. **Preserve facts and provenance through summarization.** Summaries silently drop numbers, dates, and "claim → source" mappings. Extract critical facts into a separate persistent block; annotate conflicts instead of picking one value.

---

## 3. Domain 1 — Agent Architecture and Orchestration (27%)

**Quiz questions:** 17 moisesprat (tasks 1.1–1.7) + the *Multi-agent Research System*, *Customer Support Agent*, and *Conversational AI Architecture Patterns* scenarios in paullarionov.

### Key knowledge
- **Agentic loop lifecycle:** send request → check `stop_reason` (`tool_use` vs `end_turn`) → execute tools → append results to history → repeat. Model-driven decisions vs hard-coded decision trees.
- **Coordinator–subagent (hub-and-spoke):** coordinator owns inter-agent comms, routing, aggregation, dynamic subagent selection. Subagents have **isolated context**.
- **Spawning:** the `Task` tool spawns subagents; coordinator's `allowedTools` must include `"Task"`. Parallel = multiple `Task` calls in one coordinator turn. `AgentDefinition` sets descriptions/system prompts/tool constraints.
- **Enforcement vs guidance:** programmatic preconditions/hooks (deterministic) vs prompts (probabilistic). Structured handoff protocols on escalation (customer ID, reason, recommended action).
- **Hooks** (`PostToolUse`, etc.) intercept tool results/calls to normalize data or block policy violations — deterministic.
- **Task decomposition:** *fixed pipelines* (prompt chaining) for predictable multi-aspect work; *dynamic adaptive decomposition* for open-ended investigation.
- **Sessions:** `--resume <name>` to continue; `fork_session` for independent branches from shared context. A fresh session + structured summary can beat resuming with stale results.

### Remember / traps
- ❌ Terminating the loop on `if not tool_use: stop` — kills valid reasoning turns.
- ❌ Detecting "done" by parsing assistant text or hitting an arbitrary iteration limit.
- ✅ Pass full prior-agent outputs *explicitly* into subagent prompts; separate data from metadata.
- ✅ Write coordinator prompts as **goals + quality criteria**, not step-by-step instructions.
- ✅ Use `fork_session` to compare approaches in parallel; inform the agent of file changes when resuming.

---

## 4. Domain 2 — Tool Design and MCP Integration (18%)

**Quiz questions:** 11 moisesprat (tasks 2.1–2.5), plus MCP/tooling angles in most scenarios.

### Key knowledge
- **Tool descriptions are the primary selection mechanism.** Include input formats, example queries, edge cases, and applicability boundaries. Overlap/ambiguity → misrouting. System-prompt wording can create unintended tool associations.
- **Structured MCP errors:** use the `isError` flag; return `errorCategory` (transient / validation / business / permission), `isRetryable`, and a human-readable message. Generic "Operation failed" blocks recovery. Distinguish **retryable** vs **non-retryable**, and **access failure** vs **valid empty result**.
- **Tool allocation & `tool_choice`:** too many tools (e.g. 18 vs 4–5) *reduces* reliability. Scope tools to each role + a few cross-role utilities. `tool_choice`: `"auto"` (may answer in text), `"any"` (must call *some* tool), forced `{"type":"tool","name":"…"}`.
- **MCP server scope:** project `.mcp.json` (team, shared via VCS) vs user `~/.claude.json` (personal/experiments). Use env-var substitution (`${GITHUB_TOKEN}`) for secrets. All connected servers' tools are discovered on connection and available simultaneously. MCP **resources** = content catalogs (schemas, summaries) that cut exploratory tool calls.
- **Built-in tools:** **Grep** = search file *contents*; **Glob** = find files by name/pattern; **Read/Write** = full file; **Edit** = precise unique-match change (fall back to Read+Write if match isn't unique).

### Remember / traps
- ✅ First fix for bad tool selection = **improve descriptions / rename to remove overlap** (`analyze_content` → `extract_web_results`), not few-shot or a routing classifier.
- ✅ `retryable: false` for business-rule violations with a clear user-facing reason.
- ✅ Local recovery in subagents for transient errors; propagate only what they can't resolve.
- ✅ Prefer constrained tools (`fetch_url` → `load_document`) and community MCP servers over custom ones for standard integrations.

---

## 5. Domain 3 — Claude Code Configuration and Workflows (20%)

**Quiz questions:** 13 moisesprat (tasks 3.1–3.6), plus paullarionov's *Code Generation with Claude Code*, *Claude Code for CI*, and *Multi-file Code Review* scenarios.

### Key knowledge
- **CLAUDE.md hierarchy:** user (`~/.claude/CLAUDE.md`, not shared via VCS) → project (`.claude/CLAUDE.md` or root `CLAUDE.md`) → directory-level. `@path` syntax (`@./standards/testing.md`) modularizes it. `.claude/rules/` holds topic-focused rule files vs one monolith.
- **Slash commands & skills:** project commands in `.claude/commands/` (shared) vs user in `~/.claude/commands/`. Skills in `.claude/skills/` with `SKILL.md` frontmatter: `context: fork` (isolated subagent context), `allowed-tools`, `argument-hint`.
- **Path-specific rules:** `.claude/rules/` YAML `paths:` globs load conventions **only** when editing matching files (`paths: ["terraform/**/*"]`, `**/*.test.tsx`) — saves context. Prefer over directory CLAUDE.md when conventions span the codebase.
- **Planning mode vs direct execution:** plan for complex/architectural/multi-approach changes (migrations touching 45+ files); execute directly for simple well-understood fixes (single file, clear stack trace). Use the **Explore subagent** to isolate verbose discovery output.
- **Iterative refinement:** concrete input/output examples are the most effective spec. Test-driven iteration. The **"interview" pattern** (Claude asks clarifying questions). Give interdependent issues together; independent ones sequentially.
- **CI/CD:** `-p` / `--print` for non-interactive runs; `--output-format json` + `--json-schema` for structured CI output (inline PR comments). CLAUDE.md supplies review/testing standards. **Session isolation:** the instance that *wrote* code is worse at reviewing it — use a fresh one. On re-runs, include prior results and report only new/unfixed issues.

### Remember / traps
- ✅ Team member missing instructions? They were probably placed at **user level** instead of **project level**.
- ✅ Include existing test files when generating tests (style + avoid duplication).
- ✅ `context: fork` keeps verbose skills from polluting the main session.

---

## 6. Domain 4 — Prompt Engineering and Structured Output (20%)

**Quiz questions:** 18 moisesprat (tasks 4.1–4.6), plus paullarionov's *Structured Data Extraction* angle and review/CI scenarios.

### Key knowledge
- **Explicit criteria > vague instructions.** Categorical, example-backed criteria beat "be more conservative." High false-positive rates in one category erode trust in the accurate ones.
- **Few-shot** is the most effective lever for consistent, actionable, correctly formatted output; demonstrates ambiguous-case handling; reduces extraction hallucinations. Use 2–4 targeted examples with rationale.
- **Structured output via `tool_use` + JSON Schema** = most reliable schema conformance, eliminates JSON *syntax* errors. `tool_choice`: `auto` (may text), `any` (must tool-call), forced specific tool. Strict schema ≠ semantic correctness. Make fields optional/nullable when the source may lack them (avoid fabrication); use enums + `"other"`/`"unclear"` + detail field for extensibility.
- **Validation / retry / feedback:** include *concrete validation errors* in retry prompts. Retries are **useless when the info is simply absent** from the source. Track `detected_pattern` for false-positive analysis. Self-correct by extracting both `calculated_total` and `stated_total` to detect mismatches. Semantic errors vs syntax errors (latter handled by `tool_use`).
- **Batch processing:** Message Batches API = **50% cheaper, up to 24h window, no latency SLA**. Use for non-blocking (overnight reports/audits); use sync API for blocking (pre-merge checks). Batch does **not** support multi-turn tool calling in one request. `custom_id` correlates request↔response and lets you resubmit only failures.
- **Multi-instance / multi-pass review:** independent instances (no generation context) find subtle issues self-review misses. Per-file local pass + cross-file integration pass avoids attention dilution.

### Remember / traps
- ✅ Need guaranteed structured output with multiple schemas? `tool_choice: "any"`. Need a specific extractor? Force `{"type":"tool","name":"extract_metadata"}`.
- ✅ Don't retry when the missing data lives in an external document — escalate or mark unknown.
- ✅ Nullable/optional fields prevent the model from inventing values.

---

## 7. Domain 5 — Context Management and Reliability (15%)

**Quiz questions:** 16 moisesprat (tasks 5.1–5.6), plus provenance/escalation angles across paullarionov scenarios.

### Key knowledge
- **Context preservation:** progressive summarization silently drops numbers, %, dates. **Lost-in-the-middle:** models read start+end reliably, miss the middle. Tool outputs bloat context (40+ fields when 5 matter). Always send full conversation history in subsequent requests.
- **Escalation:** valid triggers = explicit human request, policy gap/exception, no progress. Execute explicit human requests *immediately* (no extra investigation). **Sentiment analysis and self-rated confidence are unreliable** proxies for complexity. Multiple customer matches → ask for another identifier, don't guess.
- **Error propagation:** return structured error context (failure type, attempted query, partial results, alternatives). Distinguish access failure (retry decision) from valid empty result. Anti-patterns: silent suppression *and* aborting the whole workflow on one failure. Annotate coverage in synthesis (well-supported vs gaps).
- **Large-codebase context:** long sessions degrade (model cites "typical patterns" not specific classes). Use scratchpad files, delegate to subagents, summarize before next phase, `/compact` to reduce usage, structured state persistence for crash recovery.
- **Human oversight & calibration:** aggregate accuracy (97%) can hide bad performance on specific doc types/fields. Use **stratified random sampling**, field-level confidence, validation against labeled sets; route low-confidence/ambiguous extractions to humans.
- **Provenance & uncertainty:** require subagents to output **"claim → source"** mappings (URL, doc, quote). Preserve them through aggregation. Annotate conflicting stats with attribution; don't arbitrarily pick. Include publication dates so temporal differences aren't read as contradictions. Render by content type (financial → tables, news → prose, technical → structured lists).

### Remember / traps
- ✅ Extract transactional facts into a persistent **"case facts" block** outside summarized history.
- ✅ Put key findings at the *start* of aggregated data with headings (beat lost-in-the-middle).
- ✅ Conflicting sources → annotate + attribute + pass to coordinator; never silently choose.

---

## 8. How the practice questions map to domains

### Domain-labeled questions (filter with menu option 2 / `--domain N`)

Across the full bank, **260** questions carry an explicit domain:

| Domain | Path 1 (moisesprat) | Path 2 (olivier + dnacenta) | Path 2 (sgrid topic tests) | Total |
|---|---|---|---|---|
| 1 | 17 | 21 | 30 | 68 |
| 2 | 11 | 16 | 10 | 37 |
| 3 | 13 | 18 | 20 | 51 |
| 4 | 18 | 17 | 20 | 55 |
| 5 | 16 | 13 | 20 | 49 |

moisesprat and olivier additionally tag each question with a **task** (e.g. 1.1–5.6), matching the task headings in §3–§7. SGridworks topic tests are each tied to one domain/task too (10 tests × 10 q).

### Scenario-labeled questions (filter with menu option 3 / `--scenario`)

**128** questions have no domain label and are scenario-grounded only (paullarionov + sgrid full mock); moisesprat questions carry a scenario *and* a domain. The exam's 6 scenarios:

| Scenario | Maps mostly to |
|---|---|
| Customer Support (Resolution) Agent | D1 (orchestration/enforcement), D5 (escalation) |
| Code Generation with Claude Code | D3 (Claude Code), D4 (review/prompting) |
| Multi-Agent Research System | D1 (coordinator–subagent), D5 (provenance) |
| Developer Productivity Pipeline | D1/D2/D3 (tools, built-ins, config) |
| Claude Code for Continuous Integration | D3 (CI/CD, `-p`, JSON output), D4 |
| Structured Data Extraction | D4 (schemas, few-shot, validation), D5 |
| Conversational AI Architecture Patterns | D1 (agentic loops/patterns) |

> Tip: drill domain mastery via **option 2**, then test scenario judgment via **option 3**. Use the **`p`** key to switch between Path 1, Path 2, or All first.

---

## 9. Rapid-fire fact sheet (last-minute review)

| Topic | The answer they want |
|---|---|
| Loop continues when… | `stop_reason == "tool_use"` |
| `end_turn` with no tool call means | possibly a reasoning turn — **not necessarily done** |
| Spawn a subagent with | the `Task` tool (coordinator needs `Task` in `allowedTools`) |
| Subagent context | isolated — must be passed explicitly in the prompt |
| Parallel subagents | multiple `Task` calls in one turn |
| Enforce tool order / business rule | code / hooks / preconditions (deterministic) — *not* prompts |
| Normalize tool output formats | `PostToolUse` hook |
| Fix bad tool routing (first step) | improve tool **descriptions** |
| Tools per agent | ~4–5 scoped; many tools hurt reliability |
| Guarantee a tool call | `tool_choice: "any"` |
| Force a specific tool | `tool_choice: {"type":"tool","name":"…"}` |
| MCP error fields | `isError`, `errorCategory`, `isRetryable`, message |
| Team-shared MCP config | project `.mcp.json` (+ `${ENV_VAR}` secrets) |
| Personal MCP config | `~/.claude.json` |
| Search file contents | **Grep** |
| Find files by pattern | **Glob** |
| Edit fails (non-unique match) | fall back to **Read + Write** |
| Team missing CLAUDE.md rules | they were set at **user** level, not **project** |
| Modularize CLAUDE.md | `@path` imports + `.claude/rules/` |
| Conventions for a file type | `.claude/rules/` with `paths:` glob |
| Isolate a verbose skill | `context: fork` in SKILL.md |
| Complex/architectural change | **planning mode** |
| Simple single-file fix | **direct execution** |
| Claude Code in CI | `-p` + `--output-format json` + `--json-schema` |
| Review code you generated | use a **fresh, independent** instance |
| Guarantee JSON structure | `tool_use` + JSON Schema (syntax only) |
| Catch wrong totals | validation + self-correction (calc vs stated) |
| Avoid fabricated values | optional/nullable fields |
| Best lever for consistent output | **few-shot** examples (2–4) |
| Cheap, non-urgent bulk jobs | **Batch API** (50% off, ≤24h, no SLA) |
| Pre-merge / blocking check | synchronous API (not batch) |
| Resubmit only failed batch items | track `custom_id` |
| Reliable complexity signal | explicit criteria — **not** sentiment or self-confidence |
| Multiple customer matches | ask for another identifier (don't guess) |
| Conflicting source stats | annotate + attribute, pass to coordinator |
| Beat lost-in-the-middle | put key facts at start/end + headings |
| Long-session context bloat | scratchpad files, subagents, `/compact` |
| Hidden poor accuracy | stratified sampling + field-level confidence |

---

## 10. Exam-day strategy

1. **Answer every question** — no guessing penalty. Flag-and-return rather than leave blank.
2. **Read for the qualifier:** "*most* effective," "*first* step," "*minimizes* context." Two options may both work; pick the one the qualifier points to.
3. **Default eliminations:**
   - Anything relying on a **prompt** to enforce a hard rule → usually wrong (use code/hooks).
   - **Over-engineered** options (train a classifier, build shared memory store, add a routing layer) when a simpler fix (better descriptions, few-shot, a precondition) addresses the root cause → usually wrong.
   - Options that **discard information** (concatenate, pick highest-confidence only, silently drop a source) → usually wrong.
   - **Sentiment / self-rated confidence** as a complexity/quality signal → usually wrong.
4. **Coordinator synthesizes; subagents don't talk to each other.** Reject any option where subagents bypass the coordinator.
5. **Determinism for money/identity/policy.** If the scenario mentions refunds, payments, identity verification, or compliance → look for the hook/precondition answer.
6. **Map the scenario to a domain** in your head — it tells you which mental model (§2) applies.

---

## 11. Glossary

- **Agentic loop** — the request → `stop_reason` check → tool execution → append results cycle.
- **Coordinator / subagent** — hub-and-spoke orchestration; coordinator routes and synthesizes.
- **Hook** — interceptor (e.g. `PostToolUse`) for deterministic cross-cutting logic (logging, normalization, policy blocks).
- **MCP** — Model Context Protocol; standard for exposing tools/resources to Claude.
- **MCP resource** — read-only content catalog (schemas, summaries) reducing exploratory calls.
- **`tool_choice`** — `auto` / `any` / forced-tool control over whether and which tool is called.
- **CLAUDE.md** — hierarchical project/user instruction file for Claude Code.
- **`context: fork`** — runs a skill in an isolated subagent context.
- **Batch API** — async bulk processing: 50% cheaper, ≤24h window, no latency SLA.
- **Lost-in-the-middle** — degraded recall of content in the middle of long inputs.
- **Provenance** — claim → source attribution preserved through aggregation/summarization.
- **Stratified sampling** — sampling across strata (doc types/fields) to expose hidden error rates.

---

*Generated from the two community guides. Pair this with `python3 src/quiz.py` — aim to clear the 40-question mock exam at ≥720 several times, then drill your weakest domain with `python3 quiz.py --domain N`.*
