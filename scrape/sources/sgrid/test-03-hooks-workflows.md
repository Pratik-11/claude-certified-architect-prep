# Practice Test 3: Hooks, Workflows & Sessions (Week 3)
Domain 1: Agentic Architecture & Orchestration -- Task Statements 1.4-1.7

---

## Question 1
Your customer support agent must verify customer identity before processing any refund. In production, logs show the agent skips `get_customer` and calls `process_refund` directly in 8% of cases, despite clear system prompt instructions. What change provides the strongest guarantee?

A) Add bold, capitalized instructions in the system prompt: "YOU MUST ALWAYS call get_customer BEFORE process_refund."
B) Add 5 few-shot examples showing the agent always calling get_customer first.
C) Implement a programmatic prerequisite that blocks `process_refund` until `get_customer` has returned a verified customer ID.
D) Add a confidence check: have the agent rate its certainty about the customer's identity before proceeding.

<details>
<summary>Answer</summary>

**C)** When errors have financial consequences, programmatic enforcement is required. Prompt-based approaches (A, B) have a non-zero failure rate -- even with strong instructions, the model will occasionally deviate. Confidence self-assessment (D) is unreliable. Only programmatic prerequisites provide deterministic guarantees that the required sequence is followed every time.
</details>

---

## Question 2
Your agent handles a customer request: "I want to return my damaged headphones and also change my shipping address for order #5678." The agent resolves the address change but forgets to handle the return. What architectural change would prevent this?

A) Add a system prompt instruction: "Always address all parts of the customer's message."
B) Decompose multi-concern requests into distinct items, investigate each in parallel using shared context, then synthesize a unified resolution.
C) Limit customers to one request per message.
D) Add a checklist tool that the agent must mark items complete before responding.

<details>
<summary>Answer</summary>

**B)** The solution is to explicitly decompose multi-concern requests into separate items and handle each one. Using shared context allows related items to inform each other, while parallel investigation prevents the agent from losing track of items. Option A is a prompt instruction that may help but does not guarantee coverage. Option C degrades the customer experience. Option D is a partial solution but does not address the decomposition step.
</details>

---

## Question 3
A PostToolUse hook receives order data from different MCP tools. Tool A returns timestamps as Unix epochs, Tool B returns ISO 8601 strings, and Tool C returns dates as "MM/DD/YYYY". The agent struggles to compare dates across tool results. What should the hook do?

A) Add instructions to the system prompt explaining each date format so the model can convert them.
B) Normalize all date formats to a consistent format (e.g., ISO 8601) in the PostToolUse hook before the model processes them.
C) Create separate agents for each tool, each specialized in its date format.
D) Store all dates in a database and let the agent query them with SQL.

<details>
<summary>Answer</summary>

**B)** PostToolUse hooks are designed to intercept and transform tool results before the model processes them. Normalizing heterogeneous data formats (timestamps, dates, status codes) in hooks ensures the model always sees consistent data without needing to understand each tool's format. This is deterministic and reliable, unlike prompt-based approaches (A).
</details>

---

## Question 4
Your company policy prohibits refunds over $500 without manager approval. You need to enforce this in your customer support agent. Which approach provides guaranteed compliance?

A) Include the $500 limit in the system prompt with clear instructions to escalate above that amount.
B) Implement a tool call interception hook that blocks `process_refund` when the amount exceeds $500 and redirects to a human escalation workflow.
C) Add few-shot examples showing the agent escalating for large refunds.
D) Have the agent calculate the refund amount and ask for confirmation before processing.

<details>
<summary>Answer</summary>

**B)** Tool call interception hooks provide deterministic enforcement of business rules. The hook inspects the tool call parameters before execution and blocks policy-violating actions, redirecting to alternative workflows. This guarantees compliance -- the refund physically cannot be processed through the system. Prompt-based approaches (A, C) have a non-zero failure rate. Agent self-checking (D) is also probabilistic.
</details>

---

## Question 5
When escalating a complex case to a human agent, your AI agent currently transfers the conversation with "Transferring you to a human agent." The human agent has no access to the conversation transcript. What information should the handoff include?

A) Just the customer's name and account number.
B) A structured handoff summary: customer ID, root cause analysis, refund amount, recommended action, and what has already been investigated.
C) The entire conversation transcript.
D) A sentiment score and customer satisfaction prediction.

<details>
<summary>Answer</summary>

**B)** Structured handoff summaries should include actionable information: customer ID, root cause analysis, what was investigated, refund amount, and recommended action. This gives the human agent enough context to continue without re-investigating. The full transcript (C) is too verbose. Just name/account (A) requires complete re-investigation. Sentiment scores (D) are not actionable.
</details>

---

## Question 6
What is the key distinction between using hooks for enforcement versus prompt instructions?

A) Hooks are faster to implement than prompt instructions.
B) Hooks provide deterministic guarantees while prompt instructions provide probabilistic compliance -- choose hooks when business rules require guaranteed compliance.
C) Prompt instructions are more reliable than hooks because the model understands context.
D) Hooks and prompt instructions provide equivalent compliance rates.

<details>
<summary>Answer</summary>

**B)** This is a fundamental distinction tested throughout the exam. Hooks operate programmatically outside the model's decision-making, providing deterministic (100%) compliance. Prompt instructions influence the model's behavior but have a non-zero failure rate. For critical business rules with financial, legal, or safety consequences, hooks are required. For best-effort guidance where occasional deviations are acceptable, prompt instructions suffice.
</details>

---

## Question 7
You are resuming a Claude Code session after making several code changes to files the agent previously analyzed. The session context still contains the old analysis. What should you do?

A) Resume the session and trust the model to detect that files have changed.
B) Start a completely new session and re-analyze everything from scratch.
C) Resume the session and inform the agent about specific file changes for targeted re-analysis.
D) Delete the session and all associated state before starting fresh.

<details>
<summary>Answer</summary>

**C)** When resuming sessions after code modifications, inform the agent about specific changes so it can perform targeted re-analysis rather than full re-exploration. This preserves valuable prior context while ensuring stale information is updated. Option A risks the model reasoning about outdated code. Option B wastes time re-analyzing unchanged files. Option D is destructive and unnecessary.
</details>

---

## Question 8
You have a long-running investigation session with extensive tool results from 3 hours of codebase exploration. The tool results contain many details that are no longer relevant. You want to continue the investigation in a new session. What is the most reliable approach?

A) Resume the existing session since it has all the context.
B) Start a new session with a structured summary of key findings from the previous session injected into the initial context.
C) Export the full conversation transcript and paste it into the new session.
D) Resume with `--resume` and hope the model ignores stale results.

<details>
<summary>Answer</summary>

**B)** Starting fresh with a structured summary is more reliable than resuming with stale tool results. The summary preserves key findings while discarding irrelevant details. Resuming a session with extensive stale tool results (A, D) can lead to the model reasoning about outdated information. Pasting the full transcript (C) reintroduces the same stale data problem.
</details>

---

## Question 9
Your task is to add comprehensive tests to a large legacy codebase with no existing test coverage. Which task decomposition approach is most appropriate?

A) Prompt chaining: write tests for file A, then file B, then file C, in alphabetical order.
B) Dynamic adaptive decomposition: first map the codebase structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered.
C) Write all tests in a single session with comprehensive upfront instructions.
D) Use a pre-configured pipeline that generates one test file per source file.

<details>
<summary>Answer</summary>

**B)** Open-ended tasks with unknown scope require dynamic adaptive decomposition. Start by mapping structure, identify which areas have the highest impact (most critical business logic, most error-prone), then create a prioritized plan. As you discover dependencies between modules, the plan adapts. Alphabetical order (A) ignores priority. Single session (C) will exhaust context. Fixed pipeline (D) does not adapt to discovered dependencies.
</details>

---

## Question 10
A code review task involves analyzing a PR that modifies 12 files. Which task decomposition pattern is most appropriate?

A) Dynamic decomposition where the agent explores files in whatever order seems best.
B) Prompt chaining: analyze each file individually for local issues, then run a separate cross-file integration pass to catch data flow and consistency issues.
C) Analyze all 12 files in a single pass to catch cross-file issues.
D) Randomly sample 4 files for review to stay within context limits.

<details>
<summary>Answer</summary>

**B)** Code reviews are predictable multi-aspect tasks well-suited to prompt chaining. Per-file analysis ensures consistent depth (avoiding the attention dilution of analyzing all files at once). The separate cross-file integration pass catches issues that only emerge when considering how files interact. Single-pass (C) leads to inconsistent depth. Random sampling (D) misses files. Unstructured exploration (A) lacks the systematic coverage a review requires.
</details>
