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
