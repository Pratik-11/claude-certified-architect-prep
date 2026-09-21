# Claude Certified Architect — Knowledge Guide (moisesprat)

> Pure **learning content** distilled from the moisesprat study site (the 5 domains × 30 task statements) — **no quiz questions**. Each task statement gives you: *what it's about → key knowledge → ✅ Do / ❌ Don't → ⚠️ exam traps*. Read this to absorb the knowledge in one pass; use `quiz.py` / `REVIEW_SHEET.md` to test it.

Source: https://github.com/moisesprat/claude-certified-architect-guide (domain1–5 pages).

## The 5 domains at a glance

| # | Domain | Weight | Task statements |
|---|---|---|---|
| 1 | Agentic Architecture & Orchestration | **27%** | 1.1–1.7 |
| 2 | Tool Design & MCP Integration | **18%** | 2.1–2.5 |
| 3 | Claude Code Configuration & Workflows | **20%** | 3.1–3.6 |
| 4 | Prompt Engineering & Structured Output | **20%** | 4.1–4.6 |
| 5 | Context Management & Reliability | **15%** | 5.1–5.6 |

## Contents
- [Domain 1: Agentic Architecture & Orchestration](#domain-1-agentic-architecture--orchestration-27)
- [Domain 2: Tool Design & MCP Integration](#domain-2-tool-design--mcp-integration-18)
- [Domain 3: Claude Code Configuration & Workflows](#domain-3-claude-code-configuration--workflows-20)
- [Domain 4: Prompt Engineering & Structured Output](#domain-4-prompt-engineering--structured-output-20)
- [Domain 5: Context Management & Reliability](#domain-5-context-management--reliability-15)

---

## Domain 1: Agentic Architecture & Orchestration (27%)

**Domain in a nutshell:**
- The heaviest domain. It spans the mechanics of a single agent loop up through coordinating fleets of specialized subagents — every exam scenario (Customer Support, Research system, CI/CD pipeline) touches it.
- The agentic loop terminates on `stop_reason == "end_turn"` and continues on `stop_reason == "tool_use"`. Claude decides when it's done — never text-parsing or iteration caps as the primary stop.
- Subagents have **isolated context**: they inherit nothing automatically, so every needed fact must be passed explicitly (ideally as structured data, not raw text). The Task tool spawns them; multiple Task calls in one response run them in parallel.
- When correctness is non-negotiable (financial, identity, regulatory, PII), use **programmatic gates / hooks** for deterministic guarantees, not prompt instructions which have a non-zero failure rate.
- Match the strategy to the task: prompt chaining for predictable pipelines vs. dynamic decomposition for open-ended work; resume sessions when context is valid vs. fresh-start-with-summary when tool results are stale.

### 1.1 — Design and implement agentic loops for autonomous task execution
**What it's about:** The agentic loop is the fundamental execution primitive; getting the termination condition right is the most consequential and most tested implementation detail.
**Key knowledge:**
- Loop lifecycle: send full conversation history → inspect `stop_reason` → execute requested tools → append both the assistant turn and tool results → repeat.
- Only two `stop_reason` values matter for loop control: `"tool_use"` (Claude wants a tool, continue) and `"end_turn"` (Claude is finished, break).
- Tool calls live in `response.content` blocks with `type == "tool_use"`; results go back as a user turn with `tool_result` blocks carrying the matching `tool_use_id`.
- You must append the assistant response AND the tool results; the API requires alternating user/assistant turns.
- Iteration caps are fine as a *safety net* (e.g., 25–50 with a warning log) but never as the *primary* stopping mechanism.
**✅ Do / ❌ Don't:**
- ✅ Check `stop_reason == "end_turn"` exclusively for termination. / ❌ Parse response text for "done"/"task complete" to decide to stop.
- ✅ Append the assistant turn first, then tool results as a user turn. / ❌ Jump straight to tool results, omitting the assistant turn (breaks conversation structure).
- ✅ Let Claude decide which tool to call based on context. / ❌ Use pre-configured decision trees instead of model-driven tool calling.
- ✅ Keep an iteration cap purely as a safety log. / ❌ Rely solely on an iteration cap (silently truncates valid work mid-task).
**⚠️ Exam traps:**
- *Text-based termination → fails because content is non-deterministic; Claude may phrase completion differently or say "done" mid-reasoning. Use `stop_reason`.*
- *"No tool_use blocks = done" → unreliable content-structure logic; rely on `stop_reason`, not block presence.*
- *Omitting the assistant turn → API error from broken turn alternation; always append assistant then tool results.*

### 1.2 — Orchestrate multi-agent systems with coordinator-subagent patterns
**What it's about:** A single coordinator (hub) decomposes a request, delegates to specialized subagents (spokes), collects results, and synthesizes — giving central observability, error handling, and controlled information flow.
**Key knowledge:**
- Hub-and-spoke: coordinator analyzes complexity, decomposes, selects/invokes subagents, aggregates, evaluates coverage, and re-delegates on gaps. Subagents are single-purpose and unaware of each other.
- Subagents have **isolated context** — they do NOT inherit the coordinator's history; every needed fact must be in their prompt (most-tested fact across 1.2/1.3).
- The most common coordinator failure is **overly narrow task decomposition** (e.g., breaking "AI in creative industries" into only visual-arts subtasks) — all subagents "succeed" but the output has systematic blind spots.
- Coordinator prompts should specify research goals and quality criteria, not rigid step-by-step procedures, to preserve subagent adaptability; partition scope to minimize duplication; implement iterative refinement (evaluate → find gaps → re-delegate → re-synthesize).
**✅ Do / ❌ Don't:**
- ✅ Explicitly pass all needed context in each subagent's prompt. / ❌ Assume subagents inherit coordinator context.
- ✅ Decompose breadth-first across all major categories. / ❌ Decompose narrowly toward what the coordinator "knows best."
- ✅ Route all inter-agent information through the coordinator (retries, routing, logging in one place). / ❌ Let subagents call each other directly (spaghetti flows, no observability).
- ✅ When output has coverage gaps but every subagent succeeded, inspect coordinator decomposition first. / ❌ Blame the synthesis agent for systematic gaps.
**⚠️ Exam traps:**
- *"Subagents inherit context automatically" → false; fresh context each invocation, silent failures when info is missing. Pass it explicitly.*
- *Gaps in final output with all subagents successful → root cause is the coordinator's narrow decomposition, not synthesis.*
- *Direct subagent-to-subagent calls "for efficiency" → bypass coordinator observability; route everything through the coordinator.*

### 1.3 — Configure subagent invocation, context passing, and spawning
**What it's about:** The precise mechanics of spawning subagents — the Task tool, how context flows in, and how parallel execution actually works.
**Key knowledge:**
- Subagents are spawned via the `Task` tool; the coordinator's `allowedTools` must include `"Task"` or it cannot spawn regardless of prompt wording.
- Each subagent is defined via `AgentDefinition` (description, system prompt, tool restrictions); tool restrictions enforce role separation.
- Isolation is absolute — no shared memory, no inherited parent context. Every needed item (source URLs, document names, prior outputs) must be in the Task call's prompt.
- Pass context as **structured data** (JSON with fields like content, source_url, date, relevance_score), not raw text blobs, so attribution/metadata survives into synthesis.
- **Parallel spawning** = emit multiple Task calls in a *single* coordinator response (≈1x latency). Spawning across separate turns forces sequential execution.
- Fork-based session management creates independent branches from a shared baseline for divergent exploration without contaminating the main session.
**✅ Do / ❌ Don't:**
- ✅ Emit all parallel Task calls in one coordinator response. / ❌ Spawn subagents across multiple turns expecting parallelism (each turn waits sequentially).
- ✅ Pass structured JSON preserving source/date/relevance. / ❌ Pass raw string concatenation of results (loses attribution/metadata).
- ✅ Give the coordinator goals + quality criteria. / ❌ Give step-by-step procedural instructions (makes subagents rigid).
- ✅ Put complete prior findings directly in the subagent's prompt. / ❌ Assume the subagent can read them from history.
**⚠️ Exam traps:**
- *Sequential turns for "parallelism" → coordinator waits for each Task result; emit all calls in one response.*
- *Raw string concatenation between agents → strips URLs/dates, so synthesis can't cite sources. Use structured JSON.*
- *Over-procedural coordinator prompts → subagents can't adapt to new findings; specify goals and let them choose the approach.*

### 1.4 — Implement multi-step workflows with enforcement and handoff patterns
**What it's about:** Knowing when prompt guidance is insufficient and you must build programmatic gates, plus how to hand off gracefully to a human when the agent can't proceed.
**Key knowledge:**
- Prompts tell Claude what it *should* do; programmatic enforcement controls what the system *can* do. Critical business logic (identity verification before financial ops, compliance before data access) needs deterministic gates.
- A prerequisite gate intercepts a tool call, checks required prior state, and on failure blocks the call and returns a structured error explaining what must happen first (e.g., block `lookup_order`/`process_refund` until `get_customer` sets `verified_customer_id`).
- Prompt-only enforcement has a non-zero failure rate (example: 12% skip verification, ~88% compliance, wrong refunds); a gate gives ~100% compliance with zero possible bypass.
- Structured handoffs: the receiving human has no conversation history, so compile a complete self-contained package — customer ID, root cause, action taken/amount, recommended next action, and what was/wasn't attempted.
**✅ Do / ❌ Don't:**
- ✅ Use a programmatic gate that physically blocks the downstream tool until the prerequisite state is set. / ❌ Enhance the system prompt to say a step is "mandatory" (advisory only).
- ✅ Reserve few-shot for classification/routing where probabilistic is acceptable. / ❌ Rely on few-shot examples to guarantee correct tool order for financial ops.
- ✅ Escalate with a structured summary including investigation results. / ❌ Escalate with just "I need human assistance" / "I couldn't help."
**⚠️ Exam traps:**
- *"Make verification mandatory in the prompt" → always wrong for financial/identity scenarios; prompts are advisory. Use a gate.*
- *Few-shot for deterministic financial requirements → improves probability, not guarantees; gates for financial/identity, prompts/few-shot for style/routing.*
- *Bare "need human assistance" escalation → human starts over; include customer ID, root cause, findings, recommended action.*

### 1.5 — Apply Agent SDK hooks for tool call interception and data normalization
**What it's about:** Hooks sit between tool execution and model reasoning, providing a centralized place for deterministic compliance and clean data normalization without polluting tools or prompts.
**Key knowledge:**
- Two interception points: **tool call interception (pre-call)** before a tool runs, and **PostToolUse** after it returns (before Claude sees the result).
- Pre-call hooks block policy-violating actions (e.g., `process_refund` amount > $500), redirect to alternative workflows (e.g., `escalate_to_manager`), and log compliance events; returning `None` lets the call proceed.
- PostToolUse hooks normalize heterogeneous outputs from different MCP tools to a consistent schema (e.g., Unix timestamp → ISO 8601, numeric status codes → human-readable strings, cents → formatted dollars) before the model reasons over them.
- Decision rule: hooks for *guaranteed* compliance (financial, identity, regulatory, PII); prompts where probabilistic compliance is acceptable (style, tone, formatting). Hook logic runs in app code = 100% enforcement, never fails on model reasoning.
**✅ Do / ❌ Don't:**
- ✅ Enforce the $500 refund policy with a pre-call hook that blocks before execution. / ❌ Enforce it via system prompt (probabilistic, bypassable on edge cases).
- ✅ Centralize normalization in one PostToolUse hook. / ❌ Scatter normalization logic inside each tool implementation (inconsistent, hard to audit).
- ✅ Use hooks only for financial/identity/regulatory rules. / ❌ Use hooks for everything including style/formatting (overkill — use prompts there).
**⚠️ Exam traps:**
- *Prompt-enforced refund cap → unusual inputs bypass it; pre-call hook blocks 100% of the time.*
- *Per-tool normalization → inconsistent and breaks as tools are added; one centralized PostToolUse hook.*
- *Hooks for style guidelines → unnecessary; prompts handle stylistic preferences, hooks handle deterministic compliance.*

### 1.6 — Design task decomposition strategies for complex workflows
**What it's about:** Choosing the right decomposition pattern — fixed pipelines for predictable work, adaptive decomposition for open-ended investigation — and knowing why.
**Key knowledge:**
- **Prompt chaining**: fixed sequential pipeline where each step's output feeds the next; use when stages are known in advance (analyze → summarize → compare → report).
- **Dynamic adaptive decomposition**: generates subtasks from what's discovered; use for open-ended tasks where intermediate findings change what to explore (e.g., adding tests to a legacy codebase).
- **Per-file + integration pass**: split large multi-file reviews into per-file local passes plus a separate cross-file integration pass; avoids attention dilution that causes superficial comments, missed bugs, and contradictory findings in single-pass reviews of 10+ files. (A bigger context window does NOT fix this.)
- **Map-first, then plan**: for open-ended work, map full scope/dependencies, identify high-impact areas, then create a prioritized plan that adapts as dependencies surface.
**✅ Do / ❌ Don't:**
- ✅ Use prompt chaining for predictable, known-step workflows. / ❌ Use dynamic decomposition for a predictable multi-step review (adds overhead/unpredictability).
- ✅ Split big reviews into per-file passes + an integration pass. / ❌ Switch to a larger-context model to review many files in one pass (doesn't fix attention dilution).
- ✅ For legacy-codebase tasks, map structure → find high-impact areas → prioritized plan → implement adaptively. / ❌ Start implementing immediately (duplicates coverage, misses high-impact areas).
**⚠️ Exam traps:**
- *Dynamic decomposition for a known fixed pipeline → unnecessary overhead; use prompt chaining.*
- *Bigger context model for 14-file single-pass review → middle content still processed less reliably; split into focused passes.*
- *Jumping straight into "add tests to legacy codebase" → map first, then prioritize, then implement.*

### 1.7 — Manage session state, resumption, and forking
**What it's about:** Pausing and resuming long-running investigations correctly, and exploring divergent paths from a shared baseline without contaminating either branch.
**Key knowledge:**
- Sessions preserve conversation history and tool results across work sessions; `--resume <session-name>` restores a named conversation's full history.
- Resumption is wrong when analyzed files have changed since the last session — cached tool results are stale and the model reasons incorrectly from them.
- For stale state, **start fresh with summary injection**: open a new session with a structured summary of prior findings and explicitly list which files changed.
- **Targeted re-analysis**: when resuming after changes, tell the agent exactly which files changed so it re-analyzes only those rather than re-exploring everything.
- `fork_session` creates an independent branch sharing history up to the fork point; branches then diverge and neither affects the other. There is no merge — the original coordinator session must collect and compare branch results. Fork once after a shared analysis to explore alternative strategies in parallel.
**✅ Do / ❌ Don't:**
- ✅ Start fresh with an injected summary when prior tool results are stale. / ❌ Blindly resume after the codebase changed (model reasons from stale data).
- ✅ Fork for independent exploration, then have the coordinator collect/compare branch results. / ❌ Expect to "merge" forked branches back together (no merge operation exists).
- ✅ Tell the resumed session exactly which files changed for targeted re-analysis. / ❌ Re-explore the entire codebase after a small targeted change.
- ✅ Resume (`--resume <name>`) when prior context is mostly valid. / ❌ Use summary injection when nothing has changed (unnecessary).
**⚠️ Exam traps:**
- *Resuming after a refactor → tool results reflect the old code; fresh start + summary of findings, specify changed files.*
- *Fork-then-merge → branches are independent with no merge; coordinator collects and compares results from both.*
- *Full re-exploration after a targeted change → wastes context; only re-analyze the files that actually changed.*

---

## Domain 2: Tool Design & MCP Integration (18%)

**Domain in a nutshell:**
- How you define tools is how the agent thinks: the description text is the primary mechanism Claude uses to select tools, and it is re-evaluated on every tool call.
- Structured errors (category + retryability + message) turn dead ends into intelligent recovery decisions; generic "Operation failed" forces the agent to guess or loop.
- Tool distribution matters as much as descriptions: scope each agent to ~4-5 role-specific tools, and pick `tool_choice` deliberately (`auto` / `any` / forced).
- MCP connects agents to external systems; correct config scoping (`.mcp.json` shared vs `~/.claude.json` personal), secure credential handling via env-var expansion, and strong descriptions are all tested.
- Built-in tools (Read, Write, Edit, Bash, Grep, Glob) each have a precise use case; know Grep vs Glob and the Edit → Read+Write fallback.

### 2.1 — Design effective tool interfaces with clear descriptions and boundaries
**What it's about:** Tool descriptions are the decision boundary that determines whether Claude routes to the right tool. Minimal descriptions actively cause routing failures in production.

**Key knowledge:**
- Claude has no access to a tool's source or runtime behavior — only the description text, which is the most leveraged piece of agent config because it is re-evaluated on every call.
- **Exam Principle:** Tool descriptions are the primary mechanism LLMs use for tool selection; minimal descriptions lead to unreliable selection among similar tools.
- A complete description has five components: input formats, example/expected queries, edge cases, boundary explanations, and explicit when-to-use-vs-alternatives. A "Do NOT use this tool for…" section is one of the highest-leverage additions.
- Ambiguity causes misrouting: near-identical tools like `analyze_content` vs `analyze_document` route unpredictably.
- The "split pattern": a generic tool with a `mode` parameter is an antipattern — it just moves disambiguation inside the tool. Split by distinct purpose so each tool is describable in one sentence without referencing another (e.g. `analyze_document` → `extract_data_points` + `summarize_content` + `verify_claim_against_source`).
- Balance against 2.3: split only by distinct purpose; too many tools also degrades selection.
- System prompt interference: keyword-sensitive instructions (e.g. "when users ask about orders, prioritize the order tool") fire on partial matches and override good descriptions. Fix by using specific, unambiguous criteria in the prompt.

**✅ Do / ❌ Don't:**
- ✅ Rewrite descriptions to be unambiguous, and rename tools to match their scope (e.g. `analyze_content` → `extract_web_results`).
- ❌ Add system-prompt instructions to clarify tool choice — prompts are evaluated alongside descriptions and create new keyword collisions.
- ✅ Split generic/multi-purpose tools into purpose-specific tools, each with a single clear contract.
- ❌ Consolidate overlapping tools into one generic tool with hidden modes — same root disambiguation problem.
- ✅ Include input formats, outputs, edge cases, and negative ("do not use") examples.
- ❌ Keep descriptions short to "reduce noise" — the model needs signal, not silence.
- ✅ Rename vague tools; names carry semantic signal too.
- ❌ Keep a vague name while only improving the description.

**⚠️ Exam traps:**
- *Adding prompt instructions to fix routing → wrong; it creates new keyword collisions. Fix the descriptions/names instead.*
- *Merging tools into one with a `mode` param → wrong; the model still has to guess the mode. Split into single-purpose tools.*
- *Forcing the tool call to fix mode confusion → wrong; forcing solves which tool, not which mode.*
- *Raising temperature to fix routing → wrong; temperature controls output variability, not tool selection.*

**Implementation task (gist):** Build a 4-tool customer-support suite (`search_orders`, `process_refund`, `check_shipping_status`, `escalate_to_human`), write full descriptions (use-when, do-not-use, input format, output, edge cases), deliberately introduce then fix a keyword-collision system prompt, verify deterministic routing on ambiguous prompts, and split an overloaded tool to prove accuracy improves.

### 2.2 — Implement structured error responses for MCP tools
**What it's about:** When an MCP tool fails, the agent must decide whether to retry, modify inputs, try an alternative, escalate, or inform the user. Structured errors give the coordinator the data to choose; generic statuses force guessing or infinite retries.

**Key knowledge:**
- **Exam Principle:** Uniform/generic error responses prevent appropriate recovery; structured errors must include category, retryability, and a human-readable message.
- Four error categories: **Transient** (timeouts, service unavailable, network — retryable, attempt local recovery first); **Validation** (invalid/missing input — not retryable without changing input); **Business** (policy violations, e.g. refund over threshold — not retryable, needs customer-friendly explanation, maybe human escalation); **Permission** (insufficient access, expired token — conditionally retryable after re-auth, propagate with context).
- Required error schema fields: `isError` (MCP failure flag), `errorCategory`, `isRetryable` (drives coordinator retry decision), `message`, plus `attemptedQuery` and `partialResults` for coordinator context.
- **Critical distinction:** an empty result set from a successful query (e.g. "customer has no orders") is NOT an error — return success with an empty array, not `isError: true`.
- Layered recovery: subagents resolve what they can locally (transient → local retry with exponential backoff, propagate only after exhausting retries) and propagate everything the coordinator needs; validation errors return immediately with the specific invalid field; business errors return `isRetryable: false` with a friendly message; permission errors return access-needed context for re-auth.
- Partial results matter: if 3 of 5 analyses completed before a timeout, include those in `partialResults` so the coordinator doesn't restart.

**✅ Do / ❌ Don't:**
- ✅ Return `errorCategory` + `isRetryable` + a descriptive message.
- ❌ Return a generic "Operation failed" status that hides type and retryability.
- ✅ Return success with an empty array for empty result sets.
- ❌ Return `isError: true` for an empty (but valid) result — triggers unnecessary retries.
- ✅ Have the subagent retry transient errors locally, then propagate a structured error plus partial results if unresolved.
- ❌ Terminate the whole workflow on a single subagent timeout — it kills completed work.
- ✅ Mark business-rule violations `isRetryable: false` with a customer-friendly message.
- ❌ Mark business violations as retryable — causes infinite retry loops.

**⚠️ Exam traps:**
- *Generic "Operation failed" → wrong; hides failure type/retryability. Return structured fields.*
- *`isError: true` on empty results → wrong; empty is a valid success.*
- *Subagent kills the workflow on timeout → wrong; retry locally then propagate structured error + partials.*
- *Business error marked retryable → wrong; policy violations never self-resolve on retry.*
- *Retry-cap or "don't retry more than twice" prompt instruction → band-aid; structured error metadata is deterministic, prompts are probabilistic.*

**Implementation task (gist):** Implement a `process_refund` MCP tool returning correctly structured errors for all four categories — transient (5s timeout → retryable with attempted query + partials), validation (bad `order_id` → non-retryable naming the field), business (refund > $500 → non-retryable with policy explanation), permission (expired token → guides re-auth) — and return success with an empty array for a customer with no orders.

### 2.3 — Distribute tools appropriately across agents and configure tool_choice
**What it's about:** Giving an agent the wrong tools — too many or the wrong kind — degrades performance as much as bad descriptions. The two levers are role-scoped tool access and correct `tool_choice`.

**Key knowledge:**
- **Exam Principle:** Give each agent only the tools its role needs; ~18 tools degrades selection reliability, while 4-5 well-described role-specific tools route reliably. A narrow exception: a scoped cross-role tool (like `verify_fact`) for a high-frequency need is acceptable.
- Too many tools → the model selects on superficial name matches instead of description logic.
- Cross-specialization risk: a synthesis agent that also has web search tools will web-search when it should synthesize (or flag uncertainty to the coordinator).
- `tool_choice` options: `"auto"` (model may call a tool or return text — normal conversational agent); `"any"` (model must call some tool, no plain text — structured output / guarantee a tool fires); `{"type":"tool","name":"X"}` (model must call exactly that named tool — force a prerequisite step first).
- Forced selection only controls the first call; process the result and call enrichment tools in follow-up turns.
- Scoped access pattern (the 85%/15% problem): give the synthesis agent a scoped `verify_fact` tool to handle the 85% of simple checks directly; route the 15% complex verifications through the coordinator to the web-search agent.
- Replace generic tools with constrained alternatives (e.g. `fetch_url` → `load_document` that validates document URLs only) to prevent misuse.
- Stage-gating by architecture: distributing tools across agents by workflow stage (a coordinator without `format_output` physically cannot call it early) enforces ordering structurally, unlike prompt instructions.

**✅ Do / ❌ Don't:**
- ✅ Give the synthesis agent a scoped `verify_fact` tool for the common case; route complex verifications through the coordinator.
- ❌ Give the synthesis agent all web search tools "for flexibility" — over-provisioned agents misuse out-of-role tools.
- ✅ Use `tool_choice: "any"` (or force the specific tool) when structured output is required.
- ❌ Use `tool_choice: "auto"` when a tool call is mandatory — it lets the model return plain text.
- ✅ Scope each agent to only its role's tools; route cross-tool tasks through the coordinator.
- ❌ Give every agent the same complete tool set "for consistency" — bloats each decision space.

**⚠️ Exam traps:**
- *All web-search tools to the synthesis agent → wrong; over-provisioning causes out-of-role misuse. Use a scoped `verify_fact`.*
- *`tool_choice: "auto"` for required structured output → wrong; use `"any"`. (`"none"` is the opposite — forces text only.)*
- *Same full tool set for every agent → wrong; scope by role.*
- *Prompt-ordering instruction to enforce tool sequence → wrong; distribute tools across stage-specific agents so premature calls are structurally impossible.*
- *Forcing the tool / adding more tools to stop text responses → wrong; `"any"` is the clean guarantee.*

**Implementation task (gist):** Design tool distribution for a 3-agent research system (coordinator, web-search agent, synthesis agent): no agent over 5 tools, none with out-of-role tools; design a scoped tool for the synthesis agent's high-frequency cross-role need; write a scenario where `tool_choice: "any"` is correct and `"auto"` fails; implement a forced-tool prerequisite chain across two turns; and replace `fetch_url` with a constrained alternative.

### 2.4 — Integrate MCP servers into Claude Code and agent workflows
**What it's about:** MCP (Model Context Protocol) exposes external services (GitHub, databases, Jira, custom APIs) as tools. The exam tests where config lives, how credentials are managed, and why MCP descriptions may need to compete with built-in tools.

**Key knowledge:**
- **Key distinction (#1 tested point):** `.mcp.json` is project-level, version-controlled, and shared with the team (use for GitHub, Jira, databases, team-standard tools). `~/.claude.json` is user-level, personal, and never shared via version control (use for personal/experimental servers).
- Config files load additively — user-level does not override project-level. A teammate cloning a repo gets the project's `.mcp.json` but not the original developer's `~/.claude.json`, which is the classic "tools missing for new dev" cause.
- Tools from all configured MCP servers are discovered simultaneously at connection time and all become available at once — no per-request server selection.
- Use existing community MCP servers for standard integrations (Jira, GitHub); reserve custom server development for team-specific workflows with no community alternative.
- Credentials: never hardcode tokens in `.mcp.json`; use `${VAR}` env-var expansion, which is resolved at runtime from the shell so the committed file holds no secrets.
- MCP resources (often-missed point): expose content catalogs (issue summaries, doc hierarchies, DB schemas, file catalogs) as structured data the agent reads at startup, reducing exploratory tool calls because the agent already knows what exists.
- Description enhancement: if MCP tools are ignored in favor of built-ins (e.g. Grep), the MCP descriptions are too weak — make explicit what the MCP tool does that built-ins cannot (same root principle as 2.1).

**✅ Do / ❌ Don't:**
- ✅ Put shared team tooling in project-level `.mcp.json`, committed to the repo.
- ❌ Put team-shared MCP servers in `~/.claude.json` — personal, not shared, so teammates lack them.
- ✅ Use `${ENV_VAR}` expansion for credentials, set in the shell environment.
- ❌ Hardcode API tokens in `.mcp.json` — secrets in version control.
- ✅ Use existing community MCP servers for standard integrations; build custom only for team-specific workflows.
- ❌ Build a custom MCP server for something that already has a community server (e.g. Jira).
- ✅ Enhance MCP tool descriptions to explain capabilities built-ins lack.
- ❌ Leave MCP descriptions minimal — Claude defaults to familiar built-ins (Grep, Bash).

**⚠️ Exam traps:**
- *Team server in `~/.claude.json` → wrong; teammates won't have it. Use project `.mcp.json`.*
- *Hardcoded token in `.mcp.json` → wrong; use `${ENV_VAR}` expansion.*
- *Custom MCP server for Jira → wrong; a community server exists.*
- *Minimal MCP descriptions → wrong; Claude prefers built-ins. (Note: defining MCP servers in `CLAUDE.md` does not work — it holds instructions/conventions, not server definitions.)*
- *Config scope does not affect tool-selection priority — moving a server between files won't change which tool is chosen.*

**Implementation task (gist):** Configure a project with GitHub (community) and a custom documentation MCP server in `.mcp.json` using env-var expansion for both tokens; add a personal experimental server to `~/.claude.json` and justify the placement; write enhanced descriptions explaining what each tool offers beyond built-in Grep/Bash; design an MCP resource exposing a documentation hierarchy and explain how it cuts exploratory calls; and fix any description that could collide with a built-in.

### 2.5 — Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively
**What it's about:** Six built-in tools, each with a precise use case. The exam tests precise selection — which combination is correct for a task and what to do when your first choice fails.

**Key knowledge:**
- Most-confused pairs: **Grep vs Glob** (content search vs path matching) and **Edit vs Read+Write** (targeted modification vs full-file replacement fallback).
- **Grep** searches inside files for text patterns (callers of a function, error messages, imports, variable names); input is a pattern plus optional path glob.
- **Glob** matches file paths by name/extension (all test files, config files, all `.ts` in a dir), e.g. `**/*.test.tsx`.
- **Read** loads a complete file into context (understand a module, load config, first step of a Read→Write fallback); be selective with large files.
- **Write** writes complete file content (new files, or second step of the Read→Write fallback); it replaces the whole file.
- **Edit** modifies a file by matching unique anchor text and replacing it (targeted fixes); it fails when the anchor appears more than once.
- **Bash** executes shell commands (tests, scripts, git, installs) — runs with shell permissions, treat as a lower-level fallback.
- Grep-vs-Glob decision rule: "searching for text inside files" → Grep; "searching for files by name/path" → Glob.
- Edit → Read+Write fallback: when Edit reports a non-unique anchor, Read the full file, identify the correct occurrence by context, then Write the complete modified file (reliable; do not just retry Edit).
- Incremental codebase understanding: start with Grep to find entry points, Read selectively to follow imports/flows, and for usage tracing grep all exported names then search each — never Read every file upfront.

**✅ Do / ❌ Don't:**
- ✅ Use Glob (`**/*.test.tsx`) to find files by name/extension.
- ❌ Use Grep to find files named `*.test.tsx` — Grep searches contents, not names.
- ✅ Use Grep (`import.*React`) to find files containing specific text.
- ❌ Use Glob to find files that import React — Glob matches paths, not contents.
- ✅ Fall back to Read → modify → Write immediately when Edit's anchor isn't unique.
- ❌ Retry Edit after a "anchor not unique" error — it's structural and won't change on retry.
- ✅ Grep for entry points then Read selectively to build understanding incrementally.
- ❌ Read all files in a large codebase upfront — fills/degrades the context window.

**⚠️ Exam traps:**
- *Grep to find `*.test.tsx` files → wrong; use Glob (Grep is content, Glob is paths).*
- *Glob to find files importing React → wrong; use Grep.*
- *Retry Edit after "anchor not unique" → wrong; switch to Read+Write.*
- *Read everything upfront for context → wrong; Grep entry points then Read selectively.*
- *Bash `find`/`sed` may work but is a lower-level fallback — prefer the purpose-built tool (Glob / Read+Write) the exam expects.*

**Implementation task (gist):** Using only built-in tools, find all test files (Glob, with the pattern), find all files importing a utility (Grep, with the pattern), make a targeted Edit then deliberately trigger the non-unique-anchor failure and apply the Read+Write fallback, trace an exported function's full usage (find exported names → grep each → document the dependency graph), and build understanding of an unfamiliar module incrementally (one Grep → Read only the 3 most relevant files).

---

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

---

## Domain 4: Prompt Engineering & Structured Output (20%)

**Domain in a nutshell:**
- This is the precision domain: it tests whether you can replace vague, confidence-based instructions with specific categorical criteria.
- Core distinction throughout: `tool_use` + JSON Schema eliminates *syntax* errors but never *semantic* errors — business-logic validation is always a separate layer.
- Retries fix format/structural errors; they cannot conjure information that isn't in the source document.
- Async cost optimization (Message Batches API, 50% cheaper) trades away latency guarantees and multi-turn tool calling — match the API to the workflow's latency need.
- Maps primarily to Scenario 5 (CI/CD) and Scenario 6 (Structured Data Extraction), but explicit criteria, few-shot, and schema-enforced output are universal skills.

---

### 4.1 — Design prompts with explicit criteria to improve precision and reduce false positives
**What it's about:** Vague instructions like "be conservative" or "only report high-confidence findings" consistently fail; only explicit categorical criteria (what to report vs. what to skip) reliably reduce false positive rates.

**Key knowledge:**
- False positives are a *prompt precision* problem, not a model-quality problem.
- "Only report high-confidence findings" is a confidence filter over an unchanged decision process — the model makes the same borderline calls, just reports fewer. It does not change what is in scope.
- **Exam Principle:** only specific categorical criteria change which issues are considered in scope.
- High false-positive rates cause cascading trust failure — developers start ignoring an entire category (including the correct findings). A 30% false-positive rate erodes trust in the 70% that were right.
- Define explicit severity levels (CRITICAL / HIGH / MEDIUM / SKIP) with concrete code examples for each, so classification is consistent across runs.

**✅ Do / ❌ Don't:**
- ✅ Define categorical scope: explicitly list what IS and is NOT in scope; remove ambiguous categories entirely.
- ✅ When a category has unacceptably high false positives, *temporarily disable* it, fix its criteria, then re-enable.
- ✅ Define each severity level with a concrete code example so triage is consistent.
- ❌ Add "only report high-confidence findings" to reduce false positives (confidence filter, doesn't fix scope).
- ❌ Keep a noisy category enabled "to avoid missing real issues" — it destroys trust in all its findings.
- ❌ Use vague severity labels (low/medium/high) with no definitions — produces inconsistent classification.

**⚠️ Exam traps:**
- *"Only flag when highly confident" → wrong:* it's a confidence filter; the root cause is vague scope. Fix with categorical scope ("flag ONLY when claimed behavior contradicts actual code behavior").
- *Add a disclaimer to a noisy category instead of disabling it → wrong:* disclaimers erode trust further. Temporarily disable and fix offline.
- *Permanently remove categories → wrong:* over-aggressive; temporary disable for improvement is the right move.
- *Add few-shot of good code with no explanation → weaker than:* explicit exclusion criteria (e.g., "do not flag functions with full test coverage, under 20 lines, no branching"), which generalize to unseen patterns.

---

### 4.2 — Apply few-shot prompting to improve output consistency and quality
**What it's about:** When detailed instructions alone yield inconsistent results, few-shot examples are the most effective remedy — they demonstrate judgment on ambiguous cases, lock in output format, and enable generalization to novel inputs.

**Key knowledge:**
- Effective examples show the *reasoning* ("Why reported" / "Why skipped"), not just the verdict — this enables generalization rather than mere pattern-matching.
- **Exam Principle:** few-shot is most powerful for (1) ambiguous-case handling, (2) exact output-format enforcement, and (3) reducing hallucination in extraction across varied document structures.
- 2–4 targeted examples at the hard/ambiguous boundary beat exhaustive 10+ example coverage (which only inflates tokens).
- Use the same output structure (location, issue, severity, suggested fix) in every example — models reproduce the structure they're shown.
- For extraction, include examples from each major document variant (inline citations vs. bibliographies, narrative vs. tables); one format fails to generalize.
- For optional fields, include an example showing correct `null` output when info is absent, to prevent hallucinated values.

**✅ Do / ❌ Don't:**
- ✅ Use 2–4 examples focused on the hardest/ambiguous cases.
- ✅ Include explicit reasoning in each example so the rule generalizes.
- ✅ Include an example of an acceptable pattern that is NOT an issue (reduces false positives while keeping generalization).
- ✅ Cover multiple document formats for extraction tasks.
- ❌ Provide 10+ examples covering every case (token bloat, diminishing returns).
- ❌ Show only correct answers without reasoning (forces pattern-matching, no generalization).
- ❌ Use a single document format in extraction examples.

**⚠️ Exam traps:**
- *Methodology field null because it's described inline, not in a "Methods" heading → fix with few-shot* showing inline-described methodology; making the field required just causes fabrication, and retrying looks in the same place again.
- *Fixing two distinct failure modes → add one targeted example per mode, most frequent failure first;* a single combined example makes iteration harder.
- *Inconsistent revenue formatting → 2–3 targeted format examples (each a different magnitude)* beat 50 examples (cost) or description-only (showing > telling for format).

---

### 4.3 — Enforce structured output using tool use and JSON schemas
**What it's about:** `tool_use` with a JSON Schema is the most reliable structured-output mechanism — the API enforces structure before returning. But it only guarantees syntax, and `tool_choice` has three modes with very different guarantees.

**Key knowledge:**
- Asking Claude to "return JSON" in a prompt is unreliable (markdown wrapping, prose, malformed JSON). Defining an extraction function via `tool_use` guarantees syntax-valid output.
- **Critical limit:** tool use eliminates *syntax* errors (malformed JSON, wrong types, missing required fields) but NOT *semantic* errors (line items not summing to total, values in wrong fields, invalid dates passing as strings, currency-unit mistakes).
- `tool_choice` modes:
  - `"auto"` — model may call a tool or return plain text (use when tool calling is optional).
  - `"any"` — model must call one of the available tools, can't return text, still chooses which (use when structured output is required and multiple schemas exist).
  - `{"type":"tool","name":"X"}` — forced; model must call exactly that tool (use when a specific extraction must run first).
- Schema design: make optional fields nullable (prevents fabrication to satisfy required fields); use an `enum` with an `"other"` + detail-string fallback for extensible categorization; add an `"unclear"` enum value for ambiguous data; put format-normalization rules (e.g., ISO 8601 dates) in the *prompt* since schemas enforce structure, not format.

**✅ Do / ❌ Don't:**
- ✅ Use `tool_choice: "any"` (or forced selection) when extraction is required every time.
- ✅ Mark only truly mandatory fields as required; use nullable types for fields that may be absent.
- ✅ Add a semantic validation layer after schema validation (computed totals, date ranges, cross-field consistency).
- ✅ Use open enums (`"other"` + detail) for unknown categories.
- ❌ Use `tool_choice: "auto"` when you require structured output (it may return text).
- ❌ Mark all fields required "for completeness" (forces hallucination of absent values).
- ❌ Assume schema validation eliminates all extraction errors (it only catches syntax).

**⚠️ Exam traps:**
- *Line items don't sum to total despite strict schema → right answer is a separate semantic validation layer;* schemas can't express cross-field arithmetic, min/max on one field won't help, better tool descriptions don't fix arithmetic.
- *Three doc types, type unknown in advance → use `"any"`* (guarantees a tool, model picks the right one); `"auto"` may return text, forcing one tool mis-maps the others.
- *termination_date before start_date passes schema → add cross-field semantic validation;* markdown JSON is strictly worse, more required fields don't catch relational errors, few-shot isn't a deterministic safety net.

---

### 4.4 — Implement validation, retry, and feedback loops for extraction quality
**What it's about:** Retry-with-error-feedback fixes correctable errors (format, structure); it cannot fix information that simply isn't in the source. Knowing the difference prevents wasted calls and fabricated data.

**Key knowledge:**
- Effective retry appends the assistant's prior output AND the *specific* validation errors plus the original document, then asks for correction — not just resending the same prompt.
- **Key distinction:** retries fix format/structural problems (date format mismatch, type errors, field misplacement); they do NOT fix missing info (absent date, external references not provided, ambiguous/conflicting source data) — retrying there just produces fabrication.
- Feedback-loop design fields: add a `detected_pattern` field to findings to track which constructs trigger false-positive dismissals; add self-validation fields (`calculated_total` vs. `stated_total`, `conflict_detected: boolean`) to surface semantic errors; have the model self-report a confidence score per finding to route low-confidence items to human review.
- Sample-before-batch: refine the prompt on a representative 10–20 document sample before processing thousands — maximizes first-pass success and avoids costly mass reprocessing.

**✅ Do / ❌ Don't:**
- ✅ Distinguish correctable (format/structural) errors from absent information; route absent-info cases to human review or accept `null`.
- ✅ Include the original document, the failed extraction, and the specific errors in the retry message.
- ✅ Classify the failure type first, then apply a targeted correction prompt per root cause.
- ✅ Test on a 10–20 doc sample before running at scale.
- ❌ Retry when a field is null because the info isn't in the document (repeats null or fabricates).
- ❌ Retry without providing the specific validation error (same prompt → same output).
- ❌ Batch-process 10,000 docs with no sample test first.

**⚠️ Exam traps:**
- *15% null dates = 8% truly absent + 7% non-standard format → retry with format guidance fixes the 7%; the 8% stay null or get fabricated.* Inferring dates from context is fabrication, not extraction.
- *Multiple distinct root causes after retries → classify failure type, then targeted correction per cause;* a single generic retry (temperature=0, longer context, or upfront warnings) doesn't address all.
- *Validator approves what humans reject → it only had the JSON + schema, not the source document,* so it can verify structure but not factual accuracy.

---

### 4.5 — Design efficient batch processing strategies
**What it's about:** The Message Batches API gives 50% cost savings but no latency SLA (up to 24h) and no multi-turn tool calling. The exam tests SLA-window calculation and partial-failure recovery.

**Key knowledge:**
- Batch API suits async-tolerant workloads (overnight reports, weekly audits, bulk processing). Completion is non-deterministic — up to 24 hours, sometimes minutes; never build a blocking workflow on "usually faster."
- **Critical limitation:** the batch API does NOT support multi-turn tool calling within a request — agentic/tool-calling workflows must use the synchronous API.
- Every request carries a `custom_id`; results return with the same ID, enabling correlation regardless of completion order — essential for partial-failure recovery.
- **SLA calculation:** submission window = SLA − max batch processing time (24h). E.g., a 30h SLA leaves a 6h submission window; a 36h SLA leaves 12h. With continuous arrivals, submit at least that often.
- Failure recovery: resubmit only failed docs (identified by `custom_id`), not the whole batch; for docs that exceeded context limits, chunk before resubmitting.

**✅ Do / ❌ Don't:**
- ✅ Match API to latency: synchronous for blocking pre-merge checks, batch for non-urgent overnight/weekly work.
- ✅ Resubmit only failed documents via `custom_id`.
- ✅ Chunk oversized documents before resubmitting.
- ✅ Use smaller batches to limit blast radius of a single malformed item.
- ❌ Use batch API for a blocking pre-merge check developers wait on (unbounded 24h window).
- ❌ Use batch API for a workflow that calls tools mid-extraction (no multi-turn tool calling).
- ❌ Resubmit the entire batch when a few docs fail (wastes cost, may overwrite good results).

**⚠️ Exam traps:**
- *36h SLA with 24h processing → submit every 12h (36 − 24);* submitting every 24h or 36h leads to ~48h total for a just-missed document.
- *Ticket arrives 11:58 PM, batch at midnight, 24h processing, 36h SLA → ~12h buffer remains* (deadline T+36h, completion ~T+24h).
- *Single malformed ticket fails a 10,000-ticket batch → use smaller batches (e.g., 100)* to limit blast radius; retrying the whole batch repeats the problem, validation/dead-letter queues are complementary but don't bound the radius directly.

---

### 4.6 — Design multi-instance and multi-pass review architectures
**What it's about:** A model reviewing its own output in the same session is biased by retained generation context. Independence removes that bias; multi-pass removes attention dilution. The fixes are architectural, not instructional.

**Key knowledge:**
- Same-session self-review is less effective because the model retains the reasoning/assumptions from generation and is biased toward its own decisions — not because it "can't review code."
- **Exam Principle:** the fix is structural — a fresh independent instance given only the code (no generation history), which evaluates on the merits with the same capability but no bias.
- Review architectures:
  - **Independent instance review** — second instance with no generation history, code only (use after any generation).
  - **Per-file + integration pass** — pass 1 reviews each file individually (consistent depth, no attention dilution); pass 2 is a separate cross-file integration review (data flow, interface contracts). Use for PRs with 5+ files.
  - **Confidence-scored routing** — model self-reports confidence per finding; high-confidence → automated action, low-confidence → human review. Use for high-stakes automation.
- Larger context windows do NOT solve attention dilution. Consensus filtering (report only findings in 2/3 runs) suppresses intermittently-detected real bugs.

**✅ Do / ❌ Don't:**
- ✅ Use a second independent instance without the generator's reasoning context.
- ✅ Split large multi-file reviews into per-file passes plus a separate cross-file integration pass.
- ✅ Run verification passes with model-reported confidence scores for calibrated routing.
- ❌ Add "critically review your own output" in the same session (context bias remains).
- ❌ Switch to a larger-context model to review many files in one pass (doesn't fix attention dilution).
- ❌ Use 3-run consensus filtering to suppress findings (drops intermittently-caught real bugs).

**⚠️ Exam traps:**
- *"Be critical of your own code" same-session instruction → marginal at best;* retained generation context is architectural, fix with an independent instance. Extended thinking still runs within the same session context.
- *14-file PR with inconsistent/contradictory findings → per-file passes + a separate integration pass;* larger context window is the canonical trap (doesn't fix dilution), consensus filtering suppresses real bugs, instruction-based depth fixes are probabilistic.
- *Multi-pass research where low-credibility sources dominate → add explicit prioritization criteria to Pass 2* (weight by credibility tier, recency, majority consistency); equal citation enforces the flawed default, more sources dilute signal, two runs average the same flawed synthesis.

---

## Domain 5: Context Management & Reliability (15%)

**Domain in a nutshell:**
- This is the reliability domain — everything that prevents production agent systems from silently degrading.
- Context windows are finite and fail in predictable ways: summarisation loses numbers, tool results bloat, and findings in the middle get dropped ("lost in the middle").
- Errors should propagate as structured context (not be silently suppressed or terminate whole workflows) so a coordinator can recover intelligently.
- Escalation, human review, and confidence routing must be calibrated — aggregate metrics and self-reported confidence hide real failures.
- Source attribution (provenance) is lost at every summarisation step unless structured claim→source mappings are preserved through synthesis.
- These concerns are universal across the exam's scenarios (customer support, research pipelines, CI/CD, structured extraction).

### 5.1 — Manage conversation context to preserve critical information across long interactions
**What it's about:** Long conversations fail in predictable ways; context management is the set of architectural choices that prevent quantitative facts, key findings, and useful tokens from being lost as context fills.
**Key knowledge:**
- Three distinct failure modes, three distinct fixes: (1) progressive summarisation loses numbers → extract facts into a persistent "case facts" block; (2) tool results bloat → trim to relevant fields before storing; (3) lost-in-the-middle → place key findings at the beginning of aggregated inputs.
- Summaries collapse transactional facts (order IDs, amounts, dates, statuses) into vague prose. Keep those facts in a persistent block *outside* the summarised history; only summarise conversational tone/context.
- For multi-issue sessions, use a separate structured context layer per issue so issues don't collapse into each other.
- "Lost in the middle": models process the beginning and end of long inputs reliably, the middle unreliably. Put a condensed key-findings summary first and use explicit section headers (## Web Results, ## Document Analysis, ## Prior Findings) as attention anchors.
- Require subagents to emit structured output with metadata (dates, source locations); compress upstream (key facts, citations, relevance scores) when downstream context is tight.
- Tool results with 40+ fields bloat context in proportion to the number of lookups; trim to the ~5 fields the agent actually needs before appending.
- Critical persistent context (account number, preferences, unresolved issues) belongs in a persistent "active commitments" block, never in rolling-window conversation turns.
**✅ Do / ❌ Don't:**
- ✅ Keep transactional facts in a persistent case-facts block outside summarised history.
- ❌ Summarise conversation history wholesale to save tokens (collapses exact values needed for action).
- ✅ Place key findings at position 1 of aggregated inputs and use explicit section headers.
- ❌ Bury key findings in the middle of a large aggregated input.
- ✅ Trim tool outputs to relevant fields before appending to context.
- ❌ Append full 40-field tool result objects to history.
**⚠️ Exam traps:**
- *Increase summarisation interval (every 15 turns vs 5)* → only delays fact loss; the fix is a persistent case-facts block.
- *Switch to a larger context window model* → doesn't prevent summarisation-induced fact loss if you're still summarising.
- *Reports 3–6 dropped while 1–2 and 7–8 kept* → diagnostic signature of lost-in-the-middle, not low report quality, format, or window size.
- *Lengthen the rolling window* → critical persistent context still eventually falls out; store it separately.

### 5.2 — Design effective escalation and ambiguity resolution patterns
**What it's about:** Calibrated escalation requires explicit decision criteria, not self-reported confidence or sentiment detection. The exam distinguishes mandatory escalation, offer-to-resolve-first, and clarification cases.
**Key knowledge:**
- Official Q3 pattern: for a poorly-calibrated agent (e.g., 55% first-contact resolution), the correct first fix is always **explicit escalation criteria with few-shot examples** — not confidence scoring, sentiment analysis, or ML classifiers, which add infrastructure without fixing unclear decision boundaries.
- Mandatory/immediate escalation triggers: explicit customer request for a human (escalate immediately, no investigation first); policy gap (policy silent/ambiguous on the request — don't extrapolate); inability to make meaningful progress after reasonable investigation (complexity alone is not the trigger).
- Frustration + within-capability issue → acknowledge frustration, offer to resolve; escalate only if the customer reiterates preference for a human after the offer.
- Ambiguous identity (multiple customer matches): ask for additional identifiers (email, phone, account number); never use heuristics like "most recent order" or "closest name match."
- Verify both the triggering event AND the claimed causal consequence before remedial action — confirming event X occurred is not confirming X caused outcome Y (e.g., shipping delay confirmed, but did it actually spoil the groceries?).
**✅ Do / ❌ Don't:**
- ✅ Use explicit categorical escalation criteria (policy gap, explicit request, no progress) with few-shot examples.
- ❌ Trigger escalation from self-reported confidence scores (an agent confidently doing the wrong thing still scores 8/10).
- ✅ Escalate on case *type*, not emotional state.
- ❌ Escalate on sentiment thresholds (frustration ≠ complexity).
- ✅ Honor an explicit human request immediately.
- ❌ Investigate first "to prepare a case summary" when a human was explicitly requested.
- ✅ Request additional identifiers on multiple matches.
- ❌ Heuristically pick the "best" customer match.
**⚠️ Exam traps:**
- *Self-reported confidence below 5 → escalate* → same model that misclassifies also miscalibrates its confidence.
- *Sentiment analysis escalation* → solves a different problem; calm policy-exception customer needs escalation, furious standard-return customer does not.
- *One investigation attempt before transferring on explicit request* → still violates the explicit request; escalate immediately.
- *Issue $45 credit after confirming only the delay* → missing step is verifying causation, not the dollar threshold.

### 5.3 — Implement error propagation strategies across multi-agent systems
**What it's about:** When a subagent fails, the coordinator needs enough information to decide whether to retry, use an alternative, proceed with partial results, or escalate. Two anti-patterns dominate: silently suppressing errors and terminating the whole workflow on a single failure.
**Key knowledge:**
- Official Q8 pattern: on a subagent timeout, return **structured error context** — errorType, attemptedQuery, partialResults, alternativeApproaches, isRetryable — so the coordinator can choose to retry (possibly modified query), use an alternative, or proceed with partial findings.
- A generic "search unavailable" status hides whether the failure was a timeout (retryable), invalid query (not retryable), or rate limit (wait then retry).
- Empty result vs access failure: a query that finds no matching documents is a *successful* operation with `isError:false` and empty results (don't blindly retry); a timeout is an *access failure* with `isError:true`, `errorType:"timeout"`, `isRetryable:true`.
- Subagents should implement local recovery (retry with exponential backoff) for transient failures and only propagate what they can't resolve locally.
- For partial completion, pass a structured partial-completion context block (completed sources, pending sources, preliminary findings) so synthesis can use available findings without over-claiming; annotate coverage gaps in the final report.
- For expensive sequential pipelines (Retrieval → Analysis → Synthesis), use checkpointing: persist completed-stage outputs to *durable* storage so a later-stage failure resumes from the checkpoint rather than re-running from scratch (in-memory cache may not survive a crash).
**✅ Do / ❌ Don't:**
- ✅ Return structured error context (type, attempted query, partial results, alternatives, retryable flag).
- ❌ Return empty results marked successful to hide an access failure.
- ✅ Propagate the error and let the coordinator decide; continue with partial results from other subagents.
- ❌ Terminate the entire workflow on a single subagent failure.
- ✅ Reserve empty results for genuinely successful zero-match queries.
- ❌ Return generic "search unavailable" on timeout.
**⚠️ Exam traps:**
- *Local retry then generic "search unavailable" after exhaustion* → right idea about local retry, but the generic status still hides context the coordinator needs.
- *Catch timeout, return empty success* → worst outcome; incomplete research treated as complete.
- *Exclude a partially-complete subagent entirely* → loses already-valid work; include it with a structured partial-completion block.
- *Cache + retry vs checkpointing* → "cache" implies non-durable storage; durable checkpointing provides true fault tolerance.

### 5.4 — Manage context effectively in large codebase exploration
**What it's about:** Extended exploration sessions degrade silently — the model starts answering from training-data "typical patterns" instead of the specific classes it discovered earlier. Externalising state prevents this.
**Key knowledge:**
- Context degradation is insidious and unannounced; the signature is referencing generic "typical service layer pattern" instead of a specific class (e.g., `OrderService`) analysed earlier. At ~80%+ context utilisation, recall and cross-referencing of earlier content degrades.
- **Scratchpad files**: agents record key findings, unresolved questions, files analysed, and session phase to a file; reference the file rather than in-context memory because files persist across context boundaries.
- **Subagent delegation**: spawn subagents for focused questions ("find all test files," "trace refund flow"); verbose output stays in the subagent's context and the main agent receives only structured summaries, preserving coordination context.
- **Phase summaries**: summarise the current phase's findings and inject them into the next phase's subagent context so phases don't start blind.
- `/compact` reduces token usage in extended sessions while preserving explicitly-referenced key findings.
- **Crash recovery**: each agent exports state (current task, findings, open questions) to a known location at checkpoints; a coordinator loads a manifest on resume and injects it so agents continue rather than restart. Prefer structured state exports over plain `--resume` session resumption — prior tool results may be stale if files changed.
- For exhaustive coverage of a huge codebase (e.g., 2,000 files), use a deterministic tool (Grep) to enumerate candidate files, then spawn per-file/small-batch Claude sessions so each has full context — don't sample or let the model self-select files.
**✅ Do / ❌ Don't:**
- ✅ Maintain scratchpad files and reference them explicitly for later questions.
- ❌ Rely on in-context memory for findings across a multi-hour session.
- ✅ Delegate focused exploration to subagents; keep only summaries in the main context.
- ❌ Run verbose exploration directly in the main agent context.
- ✅ Load a structured state manifest on resume and re-explore only what changed.
- ❌ Resume a crashed session with `--resume` without checking what changed (stale tool results).
**⚠️ Exam traps:**
- *Restart and re-analyse / "Claude is making errors"* → misdiagnoses a context-management problem as a model error.
- *Switch to a larger context window* → even 200k fills in a long session; scratchpad files have no such limit.
- *Use `/clear`* → wipes useful earlier findings too; scratchpad preserves findings while resetting verbose output.
- *Sample 200 representative files / let Claude self-select* → non-exhaustive and based on naming conventions, not actual contents; use Grep + per-file sessions.

### 5.5 — Design human review workflows and confidence calibration
**What it's about:** Human review capacity is finite. Aggregate accuracy hides segment failures, and routing must avoid both over-automation and wasting reviewers on cases the model handles reliably.
**Key knowledge:**
- Exam principle: validate accuracy by **document type and field segment** before reducing human review. A 97% aggregate can mask, e.g., 99.8% on standard invoices but 71% on handwritten receipts and 62% on foreign-language docs — automate only segments that individually meet the target.
- Use **field-level confidence scores**, not document-level — a document can be 98% confident on `vendor_name` and 60% on `line_items`; route only the uncertain fields for review.
- Raw model confidence is not inherently calibrated; calibrate thresholds against labeled validation sets (find the score above which actual accuracy exceeds your target). Don't assume 90% confidence = 90% accuracy.
- Maintain ongoing **stratified random sampling** of high-confidence outputs to catch novel error patterns (new formats/distributions) before they scale; don't stop sampling just because a 97% rate was once established.
- Routing priority under limited capacity: low-confidence fields first → known poor-performance document types → ambiguous/contradictory source documents → high-confidence standard-format docs last. Route ambiguous/contradictory sources to humans regardless of confidence.
- Distribution shift matters: when failures cluster in a new segment, or when scope expands to a higher-risk domain (safety, regulatory), re-calibrate/increase oversight for that segment rather than reducing it broadly.
**✅ Do / ❌ Don't:**
- ✅ Stratify by document type and field before any automation decision.
- ❌ Use aggregate accuracy (97%) to justify reducing human review.
- ✅ Route uncertain fields independently using field-level confidence.
- ❌ Route whole documents on a single document-level confidence threshold.
- ✅ Keep ongoing stratified random sampling of high-confidence extractions.
- ❌ Stop sampling once an accuracy rate is established.
**⚠️ Exam traps:**
- *"97% isn't high enough; target 99.5%"* → wrong; there's no universal threshold, it depends on stakes and per-segment performance. The real risk is aggregate masking.
- *Blanket-remove review for the 85% with a 5% post-hoc audit* → fails when failures cluster in a new segment; route by segment and keep review for the problematic one.
- *Reduce billing/shipping review to offset new defect-claim load* → reduces oversight in a validated domain to subsidise a higher-risk one (wrong direction); scope expansion to safety/regulatory needs re-calibrated, not reduced, oversight.

### 5.6 — Preserve information provenance and handle uncertainty in multi-source synthesis
**What it's about:** Source attribution is silently lost at every summarisation step. Conflicting statistics need annotation (not arbitrary selection), and temporal data needs dates to distinguish genuine contradictions from time-based evolution.
**Key knowledge:**
- Require subagents to emit structured **claim→source mappings** (claim, source_url, source_name, publication_date, relevant_excerpt, methodology_notes, confidence) that the synthesis agent must preserve and merge — not summarise into prose. The fix is upstream at the subagent output stage, because prose summaries strip attribution before synthesis ever sees it.
- Conflicting statistics from credible sources → **annotate the conflict with both sources** (and their dates/methodology); don't arbitrarily pick the "higher-quality" one or average them. Let the coordinator/reader decide.
- Require **publication / data-collection dates** in all structured outputs; without them, temporal evolution (35% in 2020 vs 67% in 2023) looks like a contradiction.
- Include **methodological context** (sample size, methodology, geographic scope) — two figures can differ because they measure different populations, not because one is wrong. Example annotation: "McKinsey (Oct 2023, n=1,500, global): 67%; Gartner (Mar 2023, n=800 US): 45% — different populations/methodologies, not directly comparable."
- Pass conflicts upstream: document analysis should include and annotate conflicting values and let the coordinator reconcile, rather than silently selecting one at the analysis stage.
- Structure reports with explicit sections separating well-established findings from contested ones (with conflict annotations) and coverage gaps; render content types appropriately (financial data as tables, news as prose, technical findings as lists) instead of forcing a uniform format.
**✅ Do / ❌ Don't:**
- ✅ Pass structured claim-source mappings; synthesis generates prose with attribution preserved.
- ❌ Summarise subagent findings into prose before synthesis (strips URLs, statistics, dates permanently).
- ✅ Annotate conflicting sources with both values, dates, and methodology.
- ❌ Keep the "higher-quality" source and discard the other.
- ✅ Require publication/collection dates in every structured output.
- ❌ Omit dates to save tokens (turns temporal evolution into a false contradiction).
**⚠️ Exam traps:**
- *"Always include source citations in the final report"* → instructs the synthesis agent to cite sources it no longer has; attribution was lost upstream.
- *Embed citations in prose summaries for later extraction* → prose-embedded attribution is fragile and error-prone to parse.
- *Post-synthesis citation extraction pass* → tries to recover already-lost attribution; expensive and unreliable. Fix is structured mappings from subagents.

---
