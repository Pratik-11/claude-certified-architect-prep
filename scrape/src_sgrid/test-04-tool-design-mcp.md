# Practice Test 4: Tool Design & MCP Integration (Week 4)
Domain 2: Tool Design & MCP Integration -- Task Statements 2.1-2.5

---

## Question 1
Your agent has two tools: `analyze_content` ("Analyzes content for insights") and `analyze_document` ("Analyzes documents for insights"). In production, the agent frequently calls the wrong one. What is the most effective first step?

A) Add a routing classifier that examines user input and pre-selects the correct tool.
B) Rename the tools and update descriptions to clearly differentiate each tool's purpose, expected inputs, outputs, and when to use it versus the alternative (e.g., rename to `extract_web_results` with a web-specific description).
C) Consolidate them into a single `analyze` tool.
D) Add few-shot examples showing correct tool selection for 20 different scenarios.

<details>
<summary>Answer</summary>

**B)** Tool descriptions are the primary mechanism LLMs use for tool selection. When tools have overlapping names and near-identical descriptions, the model cannot reliably distinguish them. The fix is to rename tools to reflect their specific purpose and update descriptions with clear differentiation: what inputs each handles, what outputs it produces, and when to use one versus the other. This is the highest-leverage, lowest-effort fix.
</details>

---

## Question 2
Your MCP tool returns `{"status": "error", "message": "Operation failed"}` for all failure types: timeouts, invalid input, permission denied, and policy violations. The agent wastes tokens retrying non-retryable errors. What should you change?

A) Add retry logic with exponential backoff for all errors.
B) Return structured error metadata including `errorCategory` (transient/validation/permission), `isRetryable` boolean, and human-readable descriptions.
C) Have the agent parse the error message text to determine if it should retry.
D) Eliminate all error responses and always return a successful result with a warning field.

<details>
<summary>Answer</summary>

**B)** Structured error metadata allows the agent to make intelligent recovery decisions. `errorCategory` tells the agent what kind of failure occurred. `isRetryable` prevents wasted retry attempts on non-retryable errors (validation, permission, policy violations). Human-readable descriptions help the agent communicate appropriately to users. Generic messages (the current state) hide information needed for recovery decisions.
</details>

---

## Question 3
Your agent has access to 18 tools spanning customer lookup, order management, billing, and shipping. Tool selection accuracy has degraded significantly. What is the primary cause and fix?

A) The model needs more training data on tool selection.
B) Giving an agent access to too many tools degrades tool selection reliability. Restrict each agent's tool set to 4-5 tools relevant to its specific role.
C) Add more detailed descriptions to all 18 tools.
D) Implement a keyword-based pre-filter that selects 5 candidate tools before each model call.

<details>
<summary>Answer</summary>

**B)** Research shows that agents with too many tools (e.g., 18 instead of 4-5) experience degraded tool selection. The solution is scoped tool access: each agent gets only the tools needed for its role. If you need all 18 tools, create specialized sub-agents each with a focused tool set. Better descriptions (C) help but do not solve the fundamental decision complexity problem. Pre-filters (D) bypass the model's understanding.
</details>

---

## Question 4
A synthesis agent in your multi-agent system has been given web search tools "for convenience." In testing, the synthesis agent frequently makes web searches instead of synthesizing the findings it already received. What should you do?

A) Add prompt instructions telling the synthesis agent not to search.
B) Remove web search tools from the synthesis agent. Give it only synthesis-relevant tools, and route complex verification needs through the coordinator.
C) Keep the web search tools but rename them to discourage use.
D) Add a usage quota limiting the synthesis agent to 2 web searches per task.

<details>
<summary>Answer</summary>

**B)** Agents with tools outside their specialization tend to misuse them. The synthesis agent should only have tools needed for synthesis. If it needs to verify facts, provide a scoped `verify_fact` tool for simple lookups and route complex cases through the coordinator. Removing cross-specialization tools is the cleanest solution. Prompt instructions (A) and quotas (D) are probabilistic workarounds.
</details>

---

## Question 5
You want to ensure your extraction pipeline always calls `extract_metadata` before any enrichment tools. Which `tool_choice` configuration achieves this?

A) `tool_choice: "auto"` with system prompt instructions to call metadata extraction first.
B) `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the first turn, then process subsequent steps in follow-up turns.
C) `tool_choice: "any"` which guarantees the model calls some tool.
D) Define `extract_metadata` first in the tools array, since the model prefers tools listed first.

<details>
<summary>Answer</summary>

**B)** Forced tool selection (`{"type": "tool", "name": "..."}`) ensures a specific tool is called. Use it for the first turn to guarantee metadata extraction, then switch to `"auto"` or `"any"` for subsequent turns. Option A is probabilistic. Option C guarantees a tool call but not which tool. Option D relies on an unreliable assumption about tool ordering preference.
</details>

---

## Question 6
Your team wants to share MCP server configurations across all developers working on the project. Where should the configuration be placed?

A) In each developer's `~/.claude.json` file.
B) In the project's `.mcp.json` file, committed to version control, with `${GITHUB_TOKEN}` style environment variable expansion for credentials.
C) In the project's CLAUDE.md file with server connection strings.
D) In a shared Google Doc that developers reference when setting up their environment.

<details>
<summary>Answer</summary>

**B)** Project-scoped MCP configuration goes in `.mcp.json` at the project root. This file is version-controlled so all developers get the same configuration. Environment variable expansion (e.g., `${GITHUB_TOKEN}`) allows each developer to use their own credentials without committing secrets. Option A is user-scoped and not shared. Option C is for instructions, not server configuration. Option D is not programmatic.
</details>

---

## Question 7
A developer adds a personal experimental MCP server for testing. Where should this be configured so it does not affect teammates?

A) In the project's `.mcp.json` file with a comment marking it as experimental.
B) In `~/.claude.json` (user-scoped configuration).
C) In a git-ignored `.mcp.local.json` file.
D) In the project's CLAUDE.md file under an "experimental" section.

<details>
<summary>Answer</summary>

**B)** User-scoped configuration in `~/.claude.json` is for personal and experimental servers. This configuration applies only to that user and is not shared via version control. All configured servers (both project and user scoped) are discovered at connection time and available simultaneously. Option A would affect all teammates. Option C is not a recognized configuration mechanism. Option D is for instructions.
</details>

---

## Question 8
Your MCP server has a `search_issues` tool that returns detailed issue data including summaries, labels, and status. But the agent keeps using the built-in `Grep` tool to search for issue references in code instead. What is the likely cause?

A) The agent prefers built-in tools by default and cannot be changed.
B) The MCP tool's description does not clearly explain its capabilities and outputs, causing the agent to prefer the familiar built-in Grep tool.
C) Built-in tools always take priority over MCP tools.
D) The MCP server connection is too slow.

<details>
<summary>Answer</summary>

**B)** When MCP tool descriptions are vague or incomplete, the agent defaults to familiar built-in tools. Enhancing the MCP tool description to clearly explain what it can do, what data it returns, and when it should be used over alternatives prevents this. The fix is to write richer descriptions that help the agent understand the MCP tool's unique value. Built-in tools do not have automatic priority (A, C).
</details>

---

## Question 9
A developer needs to find all files in a project that match the pattern `*.test.tsx`. Which built-in tool should they use?

A) Grep -- search for "test.tsx" in file contents.
B) Glob -- find files matching the naming pattern `**/*.test.tsx`.
C) Read -- read each directory to find test files.
D) Bash -- run `find . -name "*.test.tsx"`.

<details>
<summary>Answer</summary>

**B)** Glob is the built-in tool for file path pattern matching -- finding files by name or extension patterns. Grep is for searching file contents (not file names). Read is for loading file contents (not finding files). Bash with `find` works but Glob is the dedicated tool for this purpose and is preferred.
</details>

---

## Question 10
Your agent needs to understand how a function `processRefund` is used across the codebase. It should find all callers, trace the data flow, and understand the function's dependencies. What is the recommended approach using built-in tools?

A) Use Read to load every file in the project and search through them.
B) Start with Grep to find all callers of `processRefund`, then use Read to follow imports and trace flows incrementally.
C) Use Bash to run a static analysis tool.
D) Use Glob to find all JavaScript files, then Read each one looking for the function name.

<details>
<summary>Answer</summary>

**B)** Build codebase understanding incrementally: start with Grep to find entry points (all callers of the function), then use Read to follow imports and trace flows from those entry points. This targeted approach is more efficient than reading all files (A, D) and uses the built-in tools for their intended purposes. Running external tools via Bash (C) should be a fallback, not the first approach.
</details>
