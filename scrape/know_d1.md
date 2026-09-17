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
