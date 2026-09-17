'use strict';

const SCENARIO_META = {
  'customer-support': {
    name: 'Customer Support Resolution Agent',
    description: 'A multi-turn autonomous agent that resolves customer tickets by querying account databases, policy documents, and escalation systems. It must handle ambiguous requests, partial information, and graceful handoff to human agents.'
  },
  'multi-agent-research': {
    name: 'Multi-Agent Research System',
    description: 'A coordinator-subagent architecture that decomposes research queries across specialized subagents (web search, document analysis, synthesis). Subagents run in parallel and return structured reports to a coordinator that produces a final answer.'
  },
  'developer-productivity': {
    name: 'Developer Productivity Pipeline',
    description: 'An agentic coding assistant embedded in a CI/CD workflow. It reads pull requests, proposes code improvements, runs automated fixes, and commits results. Configured via CLAUDE.md files in the repository hierarchy.'
  },
  'data-extraction': {
    name: 'Structured Data Extraction',
    description: 'A batch pipeline that extracts structured records from unstructured documents (contracts, invoices, reports). Uses few-shot prompting, JSON schemas, and multi-pass validation to produce high-fidelity structured outputs.'
  },
  'cicd-pipeline': {
    name: 'CI/CD Code Review Pipeline',
    description: 'An automated code review agent integrated into GitHub Actions. It analyzes diffs, checks for security issues, enforces style guides defined in CLAUDE.md, and posts structured review comments. Runs on every pull request.'
  }
};

const QUESTION_BANK = [

  // ─── SCENARIO 1: customer-support (q-csa-001 to q-csa-015) ─────────────────

  {
    id: 'q-csa-001',
    scenario: 'customer-support',
    domain: 1,
    task: '1.1',
    stem: 'The support agent calls a <code>lookup_account(email)</code> tool and receives a successful result. On the next turn, Claude returns a message with <code>stop_reason: "end_turn"</code> and no tool_use block — it is reasoning about what to do next. Your agentic loop checks <code>if not tool_use_blocks: terminate_loop()</code>. What is the consequence?',
    options: [
      { letter: 'A', text: 'The loop correctly terminates because the agent finished its reasoning.' },
      { letter: 'B', text: 'The loop incorrectly terminates, discarding a valid mid-task reasoning turn before the agent has resolved the ticket.' },
      { letter: 'C', text: 'The loop pauses and waits for the user to supply more context before continuing.' },
      { letter: 'D', text: 'Claude re-invokes the last tool automatically to compensate for the missing tool_use block.' }
    ],
    correct: 1,
    explanation: 'Claude can return a pure-text response with stop_reason "end_turn" during a multi-step task as a reasoning turn — it does not always signal task completion. The absent-tool-use check fires here and terminates prematurely. The correct termination signal is a final text response where the agent explicitly states it has finished, or a sentinel tool call. Option A is wrong because "end_turn" without tool use does not mean the task is done. Options C and D do not reflect actual agentic loop behavior.',
    canEliminate: 2
  },

  {
    id: 'q-csa-002',
    scenario: 'customer-support',
    domain: 1,
    task: '1.2',
    stem: 'You are orchestrating a support resolution system where a coordinator agent routes tickets to three specialist subagents: billing, technical, and policy. The coordinator sends the full ticket context to each subagent. After all three respond, which pattern best produces a coherent final reply to the customer?',
    options: [
      { letter: 'A', text: 'Concatenate all three subagent responses in order and return them directly.' },
      { letter: 'B', text: 'Use the subagent with the highest confidence score as the sole source.' },
      { letter: 'C', text: 'Pass all three subagent outputs back to the coordinator as assistant context and prompt it to synthesize a single customer-facing reply.' },
      { letter: 'D', text: 'Let the user choose which subagent response to use by presenting all three options.' }
    ],
    correct: 2,
    explanation: 'The coordinator-subagent pattern works best when subagent outputs are passed back to the coordinator as context for synthesis. The coordinator has the full picture of the original ticket plus all specialist answers and can resolve contradictions, decide emphasis, and produce a coherent reply. Concatenation (A) produces fragmented output. Using only the highest-confidence subagent (B) discards valid information from other domains. Presenting all three to the user (D) defeats the purpose of automation.',
    canEliminate: 3
  },

  {
    id: 'q-csa-003',
    scenario: 'customer-support',
    domain: 1,
    task: '1.3',
    stem: 'A subagent is spawned to look up a customer\'s order history. The coordinator passes <code>{ customer_id, date_range, issue_type }</code> as the subagent\'s initial user message. The subagent returns a structured summary. What is the most important property of context passed to subagents?',
    options: [
      { letter: 'A', text: 'It should include the full conversation history from the coordinator session so the subagent has maximum information.' },
      { letter: 'B', text: 'It should be minimal and task-scoped — only what the subagent needs to complete its specific function.' },
      { letter: 'C', text: 'It must always be passed as a system prompt, never as a user message.' },
      { letter: 'D', text: 'It should be encrypted to prevent the subagent from accessing sensitive data beyond its task.' }
    ],
    correct: 1,
    explanation: 'Subagent context should be minimal and task-scoped. Passing the full coordinator conversation history (A) bloats context, leaks information the subagent does not need, and wastes tokens. Context placement as user vs. system message (C) is a secondary concern — either can work depending on the subagent\'s purpose. Encryption (D) is not a standard context-passing mechanism for Claude subagents. Tight scoping improves reliability and reduces hallucination risk.',
    canEliminate: 3
  },

  {
    id: 'q-csa-004',
    scenario: 'customer-support',
    domain: 2,
    task: '2.1',
    stem: 'You are designing a <code>submit_refund(order_id, amount, reason)</code> tool. The <code>reason</code> parameter accepts a free-form string. After deployment, you observe the agent sometimes passes reasons like "user angry" and other times "product defect — received damaged item". What tool design change best improves consistency?',
    options: [
      { letter: 'A', text: 'Remove the reason parameter entirely to prevent inconsistency.' },
      { letter: 'B', text: 'Change reason to an enum: ["product_defect", "wrong_item", "late_delivery", "changed_mind", "other"].' },
      { letter: 'C', text: 'Add a minimum character length validation of 20 characters to the reason parameter.' },
      { letter: 'D', text: 'Add a second tool <code>validate_reason(reason)</code> the agent calls first before submitting.' }
    ],
    correct: 1,
    explanation: 'Constraining the reason parameter to an enum forces the model to choose from a defined vocabulary, producing consistent, machine-readable values downstream. Free-form strings (the original design) lead to semantic drift. Removing the parameter (A) loses valuable data. Character-length validation (C) still allows arbitrary strings. A validation pre-tool (D) adds latency and a second round-trip without addressing the root cause.',
    canEliminate: 0
  },

  {
    id: 'q-csa-005',
    scenario: 'customer-support',
    domain: 2,
    task: '2.2',
    stem: 'The <code>lookup_account</code> tool occasionally receives an email address that has a typo and returns a 404 from the backend. The tool currently raises a Python exception which propagates as an unhandled error to the agentic loop. What is the correct MCP tool error handling pattern?',
    options: [
      { letter: 'A', text: 'Catch the exception and return a JSON object with <code>{ "error": true, "message": "Account not found for email X" }</code> in the tool result.' },
      { letter: 'B', text: 'Let the exception propagate so the agentic loop\'s outer try/catch handles all tool errors uniformly.' },
      { letter: 'C', text: 'Return an empty result <code>{}</code> and let Claude infer the error from the absence of data.' },
      { letter: 'D', text: 'Retry the lookup three times with exponential backoff before returning any result.' }
    ],
    correct: 0,
    explanation: 'MCP tools should return structured error information in the tool result body rather than raising exceptions. A JSON error object lets Claude read the error message and decide how to proceed — for example, asking the customer to confirm their email. Unhandled exceptions (B) crash the loop or produce generic error messages Claude cannot act on. An empty result (C) is ambiguous and likely to cause hallucination. Retries (D) are appropriate for transient network errors, not 404s caused by bad input.',
    canEliminate: 2
  },

  {
    id: 'q-csa-006',
    scenario: 'customer-support',
    domain: 3,
    task: '3.1',
    stem: 'Your support agent repository has a root CLAUDE.md with general communication guidelines and a <code>tools/</code> subdirectory with a second CLAUDE.md defining tool-calling conventions. A developer opens Claude Code from the <code>tools/</code> directory. Which instructions apply?',
    options: [
      { letter: 'A', text: 'Only the tools/ CLAUDE.md applies — child files override parent files completely.' },
      { letter: 'B', text: 'Only the root CLAUDE.md applies — Claude Code always reads from the project root.' },
      { letter: 'C', text: 'Both files apply — the root CLAUDE.md and the tools/ CLAUDE.md are merged, with tool-specific rules available alongside general guidelines.' },
      { letter: 'D', text: 'The developer must manually specify which CLAUDE.md to load using the --config flag.' }
    ],
    correct: 2,
    explanation: 'CLAUDE.md files cascade: when Claude Code is invoked from a subdirectory, it reads CLAUDE.md files from the project root down to the current directory. All applicable files are merged, giving the agent both the general guidelines and the directory-specific conventions simultaneously. Child files do not override — they supplement. Option A misrepresents the cascading behavior. Option B is incorrect — subdirectory files also apply. Option D is not how CLAUDE.md loading works.',
    canEliminate: 1
  },

  {
    id: 'q-csa-007',
    scenario: 'customer-support',
    domain: 3,
    task: '3.4',
    stem: 'A support team lead wants Claude Code to draft a multi-step refund workflow script that will interact with five different internal APIs. The task is well-defined. Should plan mode be used before execution?',
    options: [
      { letter: 'A', text: 'Yes — plan mode is required for all tasks involving external API calls to prevent unintended side effects.' },
      { letter: 'B', text: 'Yes — the multi-step nature and multiple API interactions make this a strong candidate for plan-then-execute to get team lead sign-off before any writes occur.' },
      { letter: 'C', text: 'No — the task is well-defined so Claude should execute directly without a planning phase.' },
      { letter: 'D', text: 'No — plan mode only applies to infrastructure changes, not application code generation.' }
    ],
    correct: 1,
    explanation: 'Plan mode is the right choice when a task has multiple steps, touches multiple systems, and where a mistake would be hard to reverse. Writing a workflow that calls five APIs fits all three criteria — the team lead should approve the approach before any code is generated or executed. Option A overstates the rule (not all API tasks need plan mode). Option C incorrectly treats "well-defined" as sufficient to skip planning. Option D misdefines plan mode\'s scope.',
    canEliminate: 3
  },

  {
    id: 'q-csa-008',
    scenario: 'customer-support',
    domain: 4,
    task: '4.1',
    stem: 'Your agent classifies customer intent as one of: refund_request, escalation_request, status_inquiry, general_question, or abuse_report. You observe it labeling some polite but firm refund requests as escalation_request. What prompt change best reduces this false positive?',
    options: [
      { letter: 'A', text: 'Add a rule: "Classify as escalation_request only when the customer explicitly uses words like \'manager\', \'supervisor\', or \'formal complaint\'."' },
      { letter: 'B', text: 'Merge escalation_request and refund_request into a single category to eliminate the boundary.' },
      { letter: 'C', text: 'Increase the temperature parameter to make classifications more decisive.' },
      { letter: 'D', text: 'Add a second classification pass that reviews all escalation_request labels and downgrades ambiguous ones.' }
    ],
    correct: 0,
    explanation: 'Adding explicit, observable criteria for when to use a category reduces false positives at the boundary. The model conflates "insistent refund request" with "escalation" because both involve elevated customer frustration. Anchoring escalation_request to explicit language cues (manager, supervisor, formal complaint) provides a clear signal. Merging categories (B) avoids the problem but loses useful signal for routing. Increasing temperature (C) makes outputs less predictable, not more precise. A second-pass review (D) adds latency and complexity without fixing the root cause in the classification prompt.',
    canEliminate: 2
  },

  {
    id: 'q-csa-009',
    scenario: 'customer-support',
    domain: 4,
    task: '4.3',
    stem: 'You need the agent to always return its ticket analysis in a JSON object with fields: <code>category</code>, <code>priority</code>, <code>sentiment</code>, and <code>recommended_action</code>. Which approach most reliably enforces this structure?',
    options: [
      { letter: 'A', text: 'Instruct the agent in the system prompt: "Always respond in JSON with these fields."' },
      { letter: 'B', text: 'Define a tool <code>submit_analysis(category, priority, sentiment, recommended_action)</code> and set tool_choice to force its use.' },
      { letter: 'C', text: 'Use a regex post-processor that extracts JSON from the response text.' },
      { letter: 'D', text: 'Ask the agent to respond in XML instead, which is more structured than JSON.' }
    ],
    correct: 1,
    explanation: 'Forcing tool use via tool_choice guarantees the model produces a structured call with typed parameters — the schema is enforced at the API level, not by hoping the model follows text instructions. Text instructions (A) produce JSON most of the time but not reliably, especially with complex prompts. Regex post-processing (C) is brittle and fails on nested structures or escaped characters. XML (D) does not improve structure enforcement — the same compliance issue exists.',
    canEliminate: 3
  },

  {
    id: 'q-csa-010',
    scenario: 'customer-support',
    domain: 4,
    task: '4.4',
    stem: 'An extraction agent pulls account data from free-text customer emails. In testing, 12% of extractions are missing the <code>order_id</code> field. What reliability pattern best handles this?',
    options: [
      { letter: 'A', text: 'Increase max_tokens so the model has more room to include all fields.' },
      { letter: 'B', text: 'After each extraction, validate required fields and, if missing, re-prompt with: "The order_id field was not found. Please re-read the message and extract it, or return null if absent."' },
      { letter: 'C', text: 'Switch to a larger model for all extractions to improve accuracy.' },
      { letter: 'D', text: 'Make order_id optional in the schema to reduce validation failures.' }
    ],
    correct: 1,
    explanation: 'A validation-and-retry loop targeting the specific missing field is the standard reliability pattern. The re-prompt tells the model exactly what is wrong and what to do, which is more effective than a generic retry. Increasing max_tokens (A) does not help when the field is present in the source email but omitted from the extraction. Upgrading the model (C) may help but is expensive and does not fix the underlying prompt ambiguity. Making the field optional (D) hides the error rather than fixing it.',
    canEliminate: 0
  },

  {
    id: 'q-csa-011',
    scenario: 'customer-support',
    domain: 5,
    task: '5.1',
    stem: 'A customer support session spans 40 turns and is approaching Claude\'s context window limit. The agent has gathered account details, issue history, and three attempted resolutions. What is the best context management strategy to continue the session?',
    options: [
      { letter: 'A', text: 'Truncate the oldest turns from the conversation history to fit within the window.' },
      { letter: 'B', text: 'Start a fresh session and ask the customer to re-explain their issue.' },
      { letter: 'C', text: 'Generate a structured summary of critical facts (account ID, issue, resolutions attempted) and pass it as a system prompt prefix in the new context window.' },
      { letter: 'D', text: 'Increase the model\'s context window by upgrading to a larger variant.' }
    ],
    correct: 2,
    explanation: 'Summarizing critical facts into a structured prefix preserves the semantically important state while discarding the verbatim turns that consume tokens. This maintains continuity without requiring the customer to repeat themselves. Truncating oldest turns (A) risks losing account details gathered early in the conversation. Starting fresh (B) is a poor customer experience. Upgrading the model (D) defers the problem — it does not eliminate it, and adds cost.',
    canEliminate: 1
  },

  {
    id: 'q-csa-012',
    scenario: 'customer-support',
    domain: 5,
    task: '5.2',
    stem: 'A customer asks: "Can you refund the charges from last month?" The agent\'s account lookup shows three charges last month ($12.99, $24.99, $9.99). The agent does not know which charge the customer means. What is the correct escalation pattern?',
    options: [
      { letter: 'A', text: 'Refund all three charges to avoid guessing incorrectly.' },
      { letter: 'B', text: 'Refund the largest charge since it is most likely to be disputed.' },
      { letter: 'C', text: 'Ask the customer to clarify which charge: "I see three charges from last month. Could you confirm which one you\'d like refunded?"' },
      { letter: 'D', text: 'Escalate immediately to a human agent because the request is ambiguous.' }
    ],
    correct: 2,
    explanation: 'When the agent has insufficient information to act without risk of error, the correct pattern is targeted clarification — asking the minimum question needed to resolve the ambiguity. Refunding all three (A) over-acts on incomplete information. Guessing the largest (B) is heuristic reasoning that will be wrong often. Escalating to a human (D) is premature when the agent can resolve the ambiguity itself with one question.',
    canEliminate: 1
  },

  {
    id: 'q-csa-013',
    scenario: 'customer-support',
    domain: 5,
    task: '5.3',
    stem: 'Your support system has three layers: a router agent, a specialist agent, and a fulfillment agent. The fulfillment agent fails with "payment gateway timeout". How should this error propagate?',
    options: [
      { letter: 'A', text: 'The fulfillment agent silently retries until it succeeds, shielding upper layers from transient errors.' },
      { letter: 'B', text: 'The fulfillment agent returns a structured error to the specialist agent, which decides whether to retry, escalate, or inform the customer.' },
      { letter: 'C', text: 'The error is logged but not returned — the specialist agent receives an empty response and infers failure.' },
      { letter: 'D', text: 'The router agent polls the fulfillment agent every 5 seconds to check if it succeeded.' }
    ],
    correct: 1,
    explanation: 'Each agent layer should receive structured error information so it can make an informed decision about retry vs. escalation vs. user notification. Silent infinite retry (A) can mask persistent failures and block the pipeline. Empty responses (C) cause the upper layer to misinterpret the state. Polling (D) is an anti-pattern — agents should receive pushed results, not poll.',
    canEliminate: 2
  },

  {
    id: 'q-csa-014',
    scenario: 'customer-support',
    domain: 2,
    task: '2.4',
    stem: 'Your team wants to add Claude Code MCP tool access to the support agent\'s development environment so developers can query the live customer database while building prompts. What is the primary risk of this configuration?',
    options: [
      { letter: 'A', text: 'MCP servers increase response latency because they add a network round-trip.' },
      { letter: 'B', text: 'Developers may inadvertently trigger live queries during prompt development, exposing or mutating production customer data.' },
      { letter: 'C', text: 'MCP integration is not supported for database tools — only file system tools are available.' },
      { letter: 'D', text: 'The MCP server cannot be configured per-project and applies globally to all Claude Code sessions.' }
    ],
    correct: 1,
    explanation: 'Connecting a live production database as an MCP tool in a development environment means any agent invocation — including exploratory prompt testing — can trigger real queries and potentially expose PII or mutate records. The correct approach is to use a sandboxed read-only replica for development. Latency (A) is a real concern but not the primary risk. Option C is false — MCP supports any tool type. Option D is also false — MCP servers are configured per-project in .claude/settings.json.',
    canEliminate: 0
  },

  {
    id: 'q-csa-015',
    scenario: 'customer-support',
    domain: 3,
    task: '3.6',
    stem: 'You are integrating Claude Code into a GitHub Actions pipeline that runs on every support agent code change. The workflow calls <code>claude -p "Review this diff for tool schema regressions"</code>. The pipeline sometimes times out after 4 minutes. What is the most likely cause?',
    options: [
      { letter: 'A', text: 'The GitHub Actions runner does not have internet access to reach the Claude API.' },
      { letter: 'B', text: 'The -p flag is invalid for non-interactive CI use — use --prompt instead.' },
      { letter: 'C', text: 'The diff passed to Claude contains a large file that inflates the prompt beyond what completes in CI time budget, causing the API call to run long.' },
      { letter: 'D', text: 'GitHub Actions kills processes that produce no stdout for 2 minutes, but Claude buffers output until completion.' }
    ],
    correct: 2,
    explanation: 'In CI environments, large diffs (e.g., auto-generated files, lockfiles, large data files) dramatically increase prompt size and response time. The fix is to filter the diff before passing it — strip generated files, limit to relevant paths. Option A would produce an immediate connection error, not a timeout. Option B is incorrect — -p is valid for non-interactive use. Option D describes a real GitHub Actions behavior but it would manifest as a "no output" timeout at 10 minutes, not 4 minutes.',
    canEliminate: 1
  },

  // ─── SCENARIO 2: multi-agent-research (q-mar-001 to q-mar-015) ──────────────

  {
    id: 'q-mar-001',
    scenario: 'multi-agent-research',
    domain: 1,
    task: '1.1',
    stem: 'A research coordinator agent spawns three subagents in parallel. Each subagent runs an agentic loop to gather data. Subagent B calls a web search tool, gets results, then returns <code>stop_reason: "end_turn"</code> with a text summary. The coordinator\'s loop logic only continues if it receives a tool_use block. What happens?',
    options: [
      { letter: 'A', text: 'The coordinator correctly identifies that subagent B is done and collects its result.' },
      { letter: 'B', text: 'The coordinator loop terminates early because it misinterprets the end_turn text response as a loop-exit signal.' },
      { letter: 'C', text: 'Subagent B re-runs its last tool call automatically to produce a tool_use block.' },
      { letter: 'D', text: 'The coordinator waits indefinitely for a tool_use block from subagent B.' }
    ],
    correct: 1,
    explanation: 'A coordinator loop that only continues on tool_use blocks will terminate when a subagent returns a final text summary with stop_reason "end_turn". This is a mid-task reasoning or completion signal that should be handled separately. The correct design checks stop_reason explicitly: continue the loop on "tool_use", collect the result on "end_turn" text. Option A would only be correct if the loop were designed to handle text responses. Options C and D do not reflect actual behavior.',
    canEliminate: 3
  },

  {
    id: 'q-mar-002',
    scenario: 'multi-agent-research',
    domain: 1,
    task: '1.2',
    stem: 'Three research subagents run in parallel: one searches academic databases, one searches news, one queries a knowledge graph. The coordinator must produce a unified answer. Which handoff pattern minimizes coordinator context usage while preserving answer quality?',
    options: [
      { letter: 'A', text: 'Have each subagent return its full raw data so the coordinator can verify sources directly.' },
      { letter: 'B', text: 'Have each subagent return a structured summary (claim, evidence snippet, confidence) and pass only those summaries to the coordinator.' },
      { letter: 'C', text: 'Have the coordinator call each subagent sequentially so it can ask follow-up questions.' },
      { letter: 'D', text: 'Have each subagent post results to a shared memory store and have the coordinator read only what it needs.' }
    ],
    correct: 1,
    explanation: 'Structured summaries (claim, evidence, confidence) convey the semantically relevant content at a fraction of the token cost of raw data. The coordinator can synthesize across three structured summaries efficiently. Full raw data (A) bloats the coordinator\'s context with irrelevant material. Sequential calls (C) eliminate the parallelism benefit. A shared memory store (D) adds architecture complexity and still requires the coordinator to decide what to read, which may require reading all of it.',
    canEliminate: 0
  },

  {
    id: 'q-mar-003',
    scenario: 'multi-agent-research',
    domain: 1,
    task: '1.4',
    stem: 'A research workflow has four steps: query_decomposition → parallel_search → synthesis → fact_check. The synthesis step requires all parallel_search results. The fact_check step requires the synthesis output. What is the correct workflow enforcement pattern?',
    options: [
      { letter: 'A', text: 'Run all four steps in parallel to minimize latency.' },
      { letter: 'B', text: 'Use a DAG where synthesis has a join gate that waits for all parallel_search results, and fact_check is gated on synthesis completion.' },
      { letter: 'C', text: 'Poll each step every second to check if it has completed before starting the next.' },
      { letter: 'D', text: 'Run steps in strict sequential order: decompose, then one search at a time, then synthesize, then check.' }
    ],
    correct: 1,
    explanation: 'A DAG (directed acyclic graph) with explicit join gates is the canonical pattern for workflows with parallel branches and downstream dependencies. The parallel_search subagents run concurrently; the synthesis step waits for all of them (join gate). Then fact_check waits for synthesis. This preserves parallelism where it is safe and enforces ordering where it is required. Option A would pass empty search results to synthesis. Polling (C) is inefficient. Strict sequential (D) eliminates the parallelism benefit.',
    canEliminate: 0
  },

  {
    id: 'q-mar-004',
    scenario: 'multi-agent-research',
    domain: 1,
    task: '1.6',
    stem: 'A research query arrives: "Analyze the competitive landscape for battery storage technology in 2024, including market leaders, technology trends, regulatory environment, and investment activity." How should a task decomposition strategy handle this?',
    options: [
      { letter: 'A', text: 'Pass the full query to a single agent and let it gather all information sequentially.' },
      { letter: 'B', text: 'Decompose into four parallel subtasks (market leaders, technology trends, regulatory, investment), assign each to a specialist subagent, then synthesize.' },
      { letter: 'C', text: 'Break into two sequential phases: first gather all data, then analyze it, using one agent per phase.' },
      { letter: 'D', text: 'Reject the query as too broad and ask the user to narrow the scope.' }
    ],
    correct: 1,
    explanation: 'The query has four clearly separable dimensions that map well to parallel specialist subagents. Decomposition into parallel subtasks reduces total latency and allows each subagent to focus its context on a single domain. A single sequential agent (A) must hold all four research threads in one context, increasing the risk of omissions and errors. Two-phase sequential (C) provides some separation but loses parallelism. Rejecting the query (D) is never the right response when decomposition is feasible.',
    canEliminate: 3
  },

  {
    id: 'q-mar-005',
    scenario: 'multi-agent-research',
    domain: 2,
    task: '2.1',
    stem: 'A research subagent has access to <code>web_search(query)</code>, <code>fetch_document(url)</code>, and <code>extract_citations(text)</code>. When the subagent is given a synthesis task (combining information from already-fetched documents), it unexpectedly starts calling web_search again. What tool design fix prevents this?',
    options: [
      { letter: 'A', text: 'Remove web_search from the subagent\'s tool list when invoking it for synthesis tasks.' },
      { letter: 'B', text: 'Add a "do not search" instruction to the system prompt.' },
      { letter: 'C', text: 'Add a usage counter that disables web_search after 3 calls.' },
      { letter: 'D', text: 'Rename web_search to gather_new_information to signal when it should be used.' }
    ],
    correct: 0,
    explanation: 'Tool distribution — providing only the tools a subagent needs for its specific role — is more reliable than instructions alone. A synthesis subagent does not need web_search; removing it eliminates the possibility of the unwanted behavior. Instructions (B) are less reliable than structural constraints for tool use. Usage counters (C) are a fragile workaround. Renaming (D) may help somewhat but the model can still infer the tool\'s purpose and call it.',
    canEliminate: 3
  },

  {
    id: 'q-mar-006',
    scenario: 'multi-agent-research',
    domain: 2,
    task: '2.3',
    stem: 'The synthesis subagent should always use the <code>output_research_report(title, sections, sources)</code> tool for its final output. During testing you observe it sometimes returning a plain text report instead of calling the tool. Which configuration fix is most direct?',
    options: [
      { letter: 'A', text: 'Set <code>tool_choice: { type: "tool", name: "output_research_report" }</code> to force the model to call that specific tool.' },
      { letter: 'B', text: 'Add a system prompt instruction: "You must always call output_research_report before ending your response."' },
      { letter: 'C', text: 'Set <code>tool_choice: "none"</code> to prevent any spontaneous tool calls and handle routing in code.' },
      { letter: 'D', text: 'Add a post-processing step that parses the text response and constructs the tool call manually.' }
    ],
    correct: 0,
    explanation: 'Setting tool_choice to a specific named tool forces the model to call exactly that tool, eliminating the text-response fallback. This is the API-level enforcement mechanism for required tool calls. Text instructions (B) are less reliable — the model may still produce text responses under certain conditions. tool_choice "none" (C) prevents all tool calls, which is the opposite of what is needed. Post-processing (D) is a brittle workaround that requires correctly parsing an arbitrary text format.',
    canEliminate: 2
  },

  {
    id: 'q-mar-007',
    scenario: 'multi-agent-research',
    domain: 3,
    task: '3.2',
    stem: 'Your research system uses a Claude Code custom slash command <code>/research-query</code> that prompts the agent to decompose and execute a research workflow. The command should pass the user\'s query as an argument. What is the correct way to reference the argument inside the command definition?',
    options: [
      { letter: 'A', text: 'Use <code>{args}</code> in the command template to insert the user\'s argument.' },
      { letter: 'B', text: 'The slash command cannot accept arguments — arguments must be added to the system prompt instead.' },
      { letter: 'C', text: 'Use <code>$1</code> shell-style argument syntax.' },
      { letter: 'D', text: 'Arguments are not supported in Claude Code slash commands; use a named configuration file instead.' }
    ],
    correct: 0,
    explanation: 'Claude Code slash command templates use <code>{args}</code> as the placeholder for arguments passed after the command name. When a user runs <code>/research-query battery storage 2024</code>, the string "battery storage 2024" is substituted for <code>{args}</code>. Options B and D incorrectly claim arguments are unsupported. Option C uses shell parameter syntax which is not the Claude Code convention.',
    canEliminate: 3
  },

  {
    id: 'q-mar-008',
    scenario: 'multi-agent-research',
    domain: 3,
    task: '3.5',
    stem: 'The research agent\'s first draft synthesis often misses connections between findings from different subagents. You want to use iterative refinement to improve it. What is the most effective single-pass refinement prompt?',
    options: [
      { letter: 'A', text: '"Rewrite the synthesis to be more comprehensive."' },
      { letter: 'B', text: '"Review the synthesis and identify any claims from the market leaders section that contradict or reinforce claims in the technology trends section. Revise to make these connections explicit."' },
      { letter: 'C', text: '"Make the synthesis longer by adding more detail to each section."' },
      { letter: 'D', text: '"Rate the synthesis quality from 1-10 and suggest what is missing."' }
    ],
    correct: 1,
    explanation: 'Effective refinement prompts specify exactly what dimension to improve and how. Asking for cross-section connection analysis gives the model a concrete task: examine specific pairs of sections and surface relationships. Generic prompts like "more comprehensive" (A) or "longer" (C) produce padding rather than genuine improvement. A rating prompt (D) produces meta-commentary, not an improved synthesis — it would be a useful input to a refinement prompt but is not one itself.',
    canEliminate: 2
  },

  {
    id: 'q-mar-009',
    scenario: 'multi-agent-research',
    domain: 4,
    task: '4.2',
    stem: 'The research system needs to extract a structured competitive analysis from analyst reports. You have 5 high-quality example extractions from past reports. How should few-shot examples be positioned for maximum effect?',
    options: [
      { letter: 'A', text: 'Place all 5 examples at the end of the prompt, after the target document to analyze.' },
      { letter: 'B', text: 'Place all 5 examples in the system prompt as background context.' },
      { letter: 'C', text: 'Place examples in the conversation as alternating user/assistant turns before the target document, in the human turn before the final request.' },
      { letter: 'D', text: 'Randomly distribute the 5 examples throughout the prompt to expose the model to varied positions.' }
    ],
    correct: 2,
    explanation: 'Few-shot examples are most effective when placed as user/assistant turn pairs in the conversation history immediately before the task request. This positions them as recency-weighted demonstrations the model actively conditions on. Placing examples after the target document (A) reverses the intended flow. System prompt placement (B) works but is less effective than conversational turn placement for extraction tasks because the model has already processed the document. Random distribution (D) disrupts the demonstration pattern.',
    canEliminate: 3
  },

  {
    id: 'q-mar-010',
    scenario: 'multi-agent-research',
    domain: 4,
    task: '4.5',
    stem: 'Your research pipeline processes 500 analyst reports per day. Each report requires three extraction passes (facts, claims, sources). Processing them one-at-a-time takes 14 hours. What batch processing strategy reduces wall-clock time most effectively?',
    options: [
      { letter: 'A', text: 'Combine all three extraction passes into a single prompt per document.' },
      { letter: 'B', text: 'Process documents in parallel batches, with each pass in its own API call, using the Anthropic Batch API for throughput.' },
      { letter: 'C', text: 'Pre-sort documents by length and process shorter ones first.' },
      { letter: 'D', text: 'Cache the system prompt across all calls to reduce per-request overhead.' }
    ],
    correct: 1,
    explanation: 'Parallel processing with the Batch API is designed exactly for this use case — high-volume, latency-insensitive workloads. The Batch API offers higher throughput and lower cost than sequential real-time calls. Combining passes into one prompt (A) reduces API calls but makes each call more complex and may reduce extraction quality. Pre-sorting (C) does not reduce total computation. Prompt caching (D) helps with cost but does not reduce wall-clock time for CPU-bound inference.',
    canEliminate: 2
  },

  {
    id: 'q-mar-011',
    scenario: 'multi-agent-research',
    domain: 4,
    task: '4.6',
    stem: 'You want to fact-check the coordinator\'s final synthesis using multiple independent review passes. Which architecture best detects contradictions between the synthesis and source documents?',
    options: [
      { letter: 'A', text: 'A single reviewer agent with access to all source documents simultaneously.' },
      { letter: 'B', text: 'Two independent reviewer agents each with a different subset of source documents, then a third agent that compares their findings.' },
      { letter: 'C', text: 'The original subagents re-read the synthesis and flag anything they did not contribute.' },
      { letter: 'D', text: 'A human reviewer who reads the synthesis after the agents complete.' }
    ],
    correct: 1,
    explanation: 'Multi-instance review with independent subsets and a comparison pass catches contradictions that a single reviewer might miss because it sees all documents and may rationalize inconsistencies. Two independent reviewers working from different evidence sets will diverge when the synthesis has contradictions — the comparison agent then surfaces those divergences. Option A is reasonable but a single agent reviewing all sources may not catch subtle contradictions. Option C reuses agents that are biased toward their own outputs. Option D is correct but does not answer the architecture question for automated systems.',
    canEliminate: 2
  },

  {
    id: 'q-mar-012',
    scenario: 'multi-agent-research',
    domain: 5,
    task: '5.4',
    stem: 'A research subagent is analyzing a 400-page regulatory document to extract requirements relevant to battery storage. The document exceeds the context window. What is the most effective approach?',
    options: [
      { letter: 'A', text: 'Split the document into 50-page chunks and process each chunk independently.' },
      { letter: 'B', text: 'Use keyword search to pre-filter the document to sections mentioning "battery", "storage", or "energy" before sending to Claude.' },
      { letter: 'C', text: 'Ask the subagent to read only the table of contents and infer relevant sections.' },
      { letter: 'D', text: 'Use a retrieval step to embed the document and retrieve only the most semantically relevant sections before sending to Claude.' }
    ],
    correct: 3,
    explanation: 'Retrieval-augmented approaches (embedding + semantic search) are the standard solution for large document exploration within context limits. They surface the most relevant sections regardless of keyword presence, handling synonyms and paraphrased requirements. Keyword search (B) misses relevant content that uses different terminology. Chunk-by-chunk processing (A) risks missing cross-chunk relationships and requires merging N separate outputs. Table of contents inference (C) is unreliable for regulatory documents where relevant content may not be in clearly labeled sections.',
    canEliminate: 2
  },

  {
    id: 'q-mar-013',
    scenario: 'multi-agent-research',
    domain: 5,
    task: '5.5',
    stem: 'The research coordinator must decide whether to include a finding in the final report. The finding comes from a single source with moderate confidence. What confidence calibration pattern should the coordinator use?',
    options: [
      { letter: 'A', text: 'Include the finding but tag it with its source and confidence level so readers can judge.' },
      { letter: 'B', text: 'Exclude any finding that comes from fewer than three independent sources.' },
      { letter: 'C', text: 'Include the finding without qualification to avoid cluttering the report with caveats.' },
      { letter: 'D', text: 'Ask the human operator for approval before including single-source findings.' }
    ],
    correct: 0,
    explanation: 'Preserving provenance and confidence metadata allows downstream consumers to apply their own judgment. Tagging the finding with source and confidence is more useful than binary include/exclude decisions. Requiring three sources (B) is overly strict for some domains and would exclude legitimate single-source findings. Including without qualification (C) misrepresents certainty. Requiring human approval for every single-source finding (D) defeats automation at scale.',
    canEliminate: 2
  },

  {
    id: 'q-mar-014',
    scenario: 'multi-agent-research',
    domain: 5,
    task: '5.6',
    stem: 'The synthesis combines findings from three sources: an academic paper (high credibility), a vendor whitepaper (medium credibility, potential bias), and a blog post (low credibility). Two sources agree on a claim; the blog post contradicts it. How should the synthesis handle this?',
    options: [
      { letter: 'A', text: 'Accept the majority (2-source) claim and omit the blog post finding.' },
      { letter: 'B', text: 'Present the majority claim as the primary finding while noting the dissenting blog post, flagging the credibility differential.' },
      { letter: 'C', text: 'Treat all three sources equally and present the conflict without resolution.' },
      { letter: 'D', text: 'Default to the most recently published source regardless of credibility.' }
    ],
    correct: 1,
    explanation: 'Credibility-weighted synthesis presents the best-supported claim as primary while preserving the dissenting view with appropriate context. Omitting the dissent (A) hides information. Treating all sources equally (C) ignores credibility signals and implies false parity between an academic paper and a blog post. Recency over credibility (D) is a poor default for research synthesis where older high-quality sources often outweigh newer low-quality ones.',
    canEliminate: 2
  },

  {
    id: 'q-mar-015',
    scenario: 'multi-agent-research',
    domain: 1,
    task: '1.7',
    stem: 'A long research session is paused by the user overnight. The next morning, the user wants to resume from where they left off. The session state includes: current query decomposition, subagent progress, and partial results. What session resumption design is most robust?',
    options: [
      { letter: 'A', text: 'Store the entire conversation history in localStorage and reload it as the messages array.' },
      { letter: 'B', text: 'Serialize the structured session state (query, subtask statuses, partial results) to a JSON file and reload it as a system prompt prefix on resume.' },
      { letter: 'C', text: 'Ask the user to re-enter their research query and restart from the beginning.' },
      { letter: 'D', text: 'Resume by replaying all tool calls from the original session against the live APIs.' }
    ],
    correct: 1,
    explanation: 'Serializing structured state to a file and injecting it as a system prompt prefix is the most robust resumption pattern. It is compact, human-readable, and does not depend on the original conversation being intact. Full conversation history (A) may exceed context limits for long sessions and is fragile. Restarting from scratch (C) discards completed work. Replaying tool calls (D) re-executes side effects (searches, fetches) which may return different results and wastes API budget.',
    canEliminate: 0
  },

  // ─── SCENARIO 3: developer-productivity (q-dep-001 to q-dep-015) ────────────

  {
    id: 'q-dep-001',
    scenario: 'developer-productivity',
    domain: 1,
    task: '1.1',
    stem: 'A developer productivity agent is running an agentic loop to implement a feature. It reads a file, edits it, runs tests, and sees a test failure. It then returns a text message explaining the failure with <code>stop_reason: "end_turn"</code>. Your loop terminates on end_turn. What is the problem?',
    options: [
      { letter: 'A', text: 'The agent is working correctly — end_turn after explaining a failure is the correct signal to stop.' },
      { letter: 'B', text: 'The loop terminates before the agent has a chance to fix the failure, treating the explanation as a completion signal.' },
      { letter: 'C', text: 'The agent should have used stop_reason "tool_use" to signal that more work is needed.' },
      { letter: 'D', text: 'Test failures always require human intervention and the loop should escalate rather than continue.' }
    ],
    correct: 1,
    explanation: 'An agent explaining a test failure is in the middle of a debugging workflow, not at the end of it. Terminating on end_turn here discards the agent\'s analysis before it can apply a fix. The correct loop design distinguishes between end_turn-as-completion (final answer delivered) and end_turn-as-reasoning (intermediate analysis). The loop should continue when the agent\'s text contains a plan to fix the issue. Option A mistakes reasoning output for task completion. Option C is incorrect — stop_reason values are controlled by the API, not chosen by the agent for signaling.',
    canEliminate: 2
  },

  {
    id: 'q-dep-002',
    scenario: 'developer-productivity',
    domain: 1,
    task: '1.3',
    stem: 'A coordinator spawns a code-review subagent. The subagent needs the diff, the repository\'s coding standards, and the PR description. The coordinator\'s full session context also contains unrelated user conversations. What is the correct context passing approach?',
    options: [
      { letter: 'A', text: 'Pass the entire coordinator session history to the subagent for maximum context.' },
      { letter: 'B', text: 'Pass only the diff, coding standards excerpt, and PR description as the subagent\'s initial context.' },
      { letter: 'C', text: 'Pass no context — the subagent should request what it needs via tool calls.' },
      { letter: 'D', text: 'Pass the full repository contents so the subagent can look up anything it needs.' }
    ],
    correct: 1,
    explanation: 'Subagent context should be scoped to what the subagent needs for its specific task. The code-review subagent needs the diff (what changed), coding standards (what rules apply), and PR description (why the change was made). Unrelated conversation history (A) wastes tokens and introduces noise. No context (C) forces the subagent to make tool calls for information already available. Full repository contents (D) likely exceeds the context window and floods the subagent with irrelevant code.',
    canEliminate: 2
  },

  {
    id: 'q-dep-003',
    scenario: 'developer-productivity',
    domain: 3,
    task: '3.1',
    stem: 'Your monorepo has a root CLAUDE.md with general guidelines and separate CLAUDE.md files in <code>frontend/</code>, <code>backend/</code>, and <code>infra/</code>. A developer working on the backend wants ONLY the backend rules to apply — not the frontend or infra rules. Will they get what they want if they open Claude Code from the <code>backend/</code> directory?',
    options: [
      { letter: 'A', text: 'Yes — Claude Code only reads CLAUDE.md files in the current directory when invoked from a subdirectory.' },
      { letter: 'B', text: 'No — Claude Code reads the root CLAUDE.md plus the backend/ CLAUDE.md, but not frontend/ or infra/.' },
      { letter: 'C', text: 'No — Claude Code reads all CLAUDE.md files in the entire repository regardless of working directory.' },
      { letter: 'D', text: 'Yes — the frontend/ and infra/ CLAUDE.md files are ignored because they are sibling directories, not ancestors.' }
    ],
    correct: 1,
    explanation: 'CLAUDE.md loading follows the ancestor chain from the current working directory to the project root. Opening from backend/ loads root/CLAUDE.md + backend/CLAUDE.md. It does NOT load frontend/ or infra/ CLAUDE.md files because those are in sibling subdirectories, not in the ancestor path. Option A is wrong — the root CLAUDE.md always applies. Option C is wrong — sibling directories are not included. Option D reaches the right conclusion for the wrong reason — sibling files are excluded because they are not ancestors, not because they are "sibling directories" as a special rule.',
    canEliminate: 2
  },

  {
    id: 'q-dep-004',
    scenario: 'developer-productivity',
    domain: 3,
    task: '3.2',
    stem: 'You create a slash command <code>/fix-lint</code> in <code>.claude/commands/fix-lint.md</code>. The command should run ESLint on the current file and auto-fix issues. Which approach makes the command most reusable across different files?',
    options: [
      { letter: 'A', text: 'Hardcode the file path in the command definition.' },
      { letter: 'B', text: 'Use <code>{args}</code> to accept the file path as an argument: <code>Run ESLint --fix on {args}</code>.' },
      { letter: 'C', text: 'Create separate commands for each file type: /fix-lint-js, /fix-lint-ts, etc.' },
      { letter: 'D', text: 'Store the target file path in localStorage and read it from the command.' }
    ],
    correct: 1,
    explanation: 'The <code>{args}</code> placeholder in a Claude Code slash command template is substituted with whatever text the user types after the command name. This makes the command reusable: <code>/fix-lint src/auth.ts</code> passes "src/auth.ts" as the argument. Hardcoding (A) eliminates reusability. Creating separate commands per file type (C) duplicates logic and is harder to maintain. localStorage (D) is not a mechanism available to command definitions.',
    canEliminate: 2
  },

  {
    id: 'q-dep-005',
    scenario: 'developer-productivity',
    domain: 3,
    task: '3.3',
    stem: 'Your repository has both Python and TypeScript code. The root CLAUDE.md has general rules. You want Python-specific linting conventions only when Claude works in <code>src/python/</code> and TypeScript conventions only when working in <code>src/ts/</code>. What is the cleanest implementation?',
    options: [
      { letter: 'A', text: 'Add both Python and TypeScript rules to the root CLAUDE.md with conditional language: "Apply Python rules only to .py files."' },
      { letter: 'B', text: 'Create CLAUDE.md files inside src/python/ and src/ts/ with their respective conventions; the root CLAUDE.md stays general.' },
      { letter: 'C', text: 'Create a single CLAUDE.md with a section for each language and instruct Claude to read only the relevant section.' },
      { letter: 'D', text: 'Use environment variables to switch which CLAUDE.md file Claude Code reads at startup.' }
    ],
    correct: 1,
    explanation: 'Path-specific CLAUDE.md files are exactly the mechanism designed for this use case. When Claude Code operates in src/python/, it loads root/CLAUDE.md + src/python/CLAUDE.md — getting general + Python-specific rules. When in src/ts/, it loads root/CLAUDE.md + src/ts/CLAUDE.md. Option A puts all conventions in one file, which increases context size for every session regardless of language. Option C relies on Claude correctly parsing sections — less reliable than structural path-based loading. Option D is not how Claude Code configuration works.',
    canEliminate: 3
  },

  {
    id: 'q-dep-006',
    scenario: 'developer-productivity',
    domain: 3,
    task: '3.6',
    stem: 'You integrate Claude Code into GitHub Actions using <code>claude -p "..."</code> in a non-interactive step. The step exits with code 0 but produces no output. The workflow shows no review comments. What is the most likely cause?',
    options: [
      { letter: 'A', text: 'The -p flag only works in interactive mode and silently does nothing in CI.' },
      { letter: 'B', text: 'The ANTHROPIC_API_KEY environment variable is not set in the Actions environment, causing silent failure.' },
      { letter: 'C', text: 'Claude Code requires a CLAUDE.md file to be present to operate in CI.' },
      { letter: 'D', text: 'The output was sent to stderr instead of stdout and the workflow capture is missing 2>&1.' }
    ],
    correct: 1,
    explanation: 'A missing ANTHROPIC_API_KEY causes the Claude Code CLI to fail silently in some configurations — it exits 0 but produces no output. The fix is to verify the secret is set in the repository\'s Actions secrets and referenced correctly in the workflow YAML. Option A is incorrect — -p is the correct non-interactive flag. Option C is false — CLAUDE.md is not required to run. Option D would result in output visible in the workflow logs under stderr capture, which is easily diagnosable.',
    canEliminate: 2
  },

  {
    id: 'q-dep-007',
    scenario: 'developer-productivity',
    domain: 2,
    task: '2.5',
    stem: 'A developer productivity agent uses Claude Code\'s built-in tools. It needs to find all TypeScript files that import a specific module, then read each one. Which combination of built-in tools is most appropriate?',
    options: [
      { letter: 'A', text: 'Bash to run <code>find . -name "*.ts"</code> then Read for each file.' },
      { letter: 'B', text: 'Glob with pattern <code>**/*.ts</code> to find files, then Grep to filter by import, then Read for matches.' },
      { letter: 'C', text: 'Read the entire directory listing with a single Read call, then filter programmatically.' },
      { letter: 'D', text: 'Write a temporary shell script, execute it with Bash, parse the output.' }
    ],
    correct: 1,
    explanation: 'The correct built-in tool sequence is Glob (find .ts files by pattern) → Grep (filter to those containing the specific import) → Read (read each match). This uses specialized tools for each step rather than shelling out. Bash with find (A) works but bypasses the dedicated tools, making the work harder to review and audit. Reading an entire directory (C) is not how the Read tool works — it reads files, not directory listings. A temporary shell script (D) adds unnecessary complexity.',
    canEliminate: 0
  },

  {
    id: 'q-dep-008',
    scenario: 'developer-productivity',
    domain: 4,
    task: '4.1',
    stem: 'A code review agent classifies issues as: security_vulnerability, performance_issue, style_violation, or logical_bug. You observe it tagging N+1 database query patterns as performance_issue instead of logical_bug. What prompt change is most effective?',
    options: [
      { letter: 'A', text: 'Add: "N+1 query patterns should be classified as logical_bug because they represent incorrect algorithmic design, not just inefficiency."' },
      { letter: 'B', text: 'Remove the performance_issue category to force all performance-related issues into logical_bug.' },
      { letter: 'C', text: 'Add a confidence threshold so low-confidence classifications default to logical_bug.' },
      { letter: 'D', text: 'Add more examples of performance_issue to the prompt so the model better distinguishes them.' }
    ],
    correct: 0,
    explanation: 'Providing explicit boundary criteria for ambiguous categories is the most targeted fix. N+1 patterns sit at the boundary between performance and logic — a rule explaining why they belong in logical_bug (algorithmic design error, not just slow) resolves the ambiguity. Removing a category (B) is too blunt. Confidence thresholds (C) add complexity without addressing the classification rule. Adding more performance_issue examples (D) reinforces the wrong classification.',
    canEliminate: 2
  },

  {
    id: 'q-dep-009',
    scenario: 'developer-productivity',
    domain: 4,
    task: '4.3',
    stem: 'A code review agent should return its findings as a JSON array of objects with fields: <code>file</code>, <code>line</code>, <code>severity</code>, <code>category</code>, <code>message</code>. You see it sometimes nesting findings inside a wrapper object. What is the most reliable fix?',
    options: [
      { letter: 'A', text: 'Add to the prompt: "Return only a raw JSON array, no wrapper object."' },
      { letter: 'B', text: 'Define a <code>submit_findings(findings: Finding[])</code> tool with a JSON schema that enforces an array at the top level and use tool_choice to require its use.' },
      { letter: 'C', text: 'Write a post-processor that unwraps the object and extracts the findings array.' },
      { letter: 'D', text: 'Change the return type to a newline-delimited JSON format (NDJSON) to avoid nesting.' }
    ],
    correct: 1,
    explanation: 'Tool use with a JSON schema enforces structure at the API level — the model cannot produce a wrapper object when the schema requires a top-level array. This is more reliable than text instructions (A), which the model may not follow consistently. Post-processing (C) handles the symptom rather than the cause. NDJSON (D) changes the output format entirely and requires all consumers to update their parsing logic.',
    canEliminate: 3
  },

  {
    id: 'q-dep-010',
    scenario: 'developer-productivity',
    domain: 4,
    task: '4.6',
    stem: 'You want a two-pass code review: the first pass identifies issues, the second pass prioritizes and deduplicates. Both passes use the same model. What architecture ensures the second pass is independent of the first?',
    options: [
      { letter: 'A', text: 'Use the same conversation thread — pass the first-pass output as context for the second.' },
      { letter: 'B', text: 'Start a fresh conversation for the second pass, passing only the raw diff and the first-pass findings as input (no prior conversation history).' },
      { letter: 'C', text: 'Run both passes simultaneously and merge the outputs.' },
      { letter: 'D', text: 'Use a different model for the second pass to ensure independence.' }
    ],
    correct: 1,
    explanation: 'Independence in multi-pass review means the second pass should not be influenced by the reasoning process of the first pass — only its output. Starting a fresh conversation with the diff and findings as explicit input achieves this. Using the same conversation thread (A) allows the second pass to be anchored to the first pass\'s framing and intermediate reasoning. Running simultaneously (C) prevents the second pass from having the first\'s findings as input. Using a different model (D) is costly and not necessary for independence.',
    canEliminate: 2
  },

  {
    id: 'q-dep-011',
    scenario: 'developer-productivity',
    domain: 5,
    task: '5.1',
    stem: 'A developer productivity agent is refactoring a large codebase across 20 files. After 30 tool calls, the context window is almost full and the agent has not finished. How should the agent preserve progress?',
    options: [
      { letter: 'A', text: 'Summarize completed changes and pending tasks into a structured handoff document, then start a new session with that document as context.' },
      { letter: 'B', text: 'Commit all changes made so far and restart from the beginning with the same prompt.' },
      { letter: 'C', text: 'Increase the context window by switching to a model with larger context.' },
      { letter: 'D', text: 'Continue the current session — Claude will automatically compress old context as needed.' }
    ],
    correct: 0,
    explanation: 'A structured handoff document summarizing completed edits and remaining tasks is the correct pattern for long-running agentic work that hits context limits. It preserves progress explicitly and gives the next session a clear starting point. Committing and restarting (B) loses the planning context — the agent would re-derive the refactoring plan. Switching models (C) defers the problem. Relying on automatic compression (D) is passive and may lose critical details about what has already been changed.',
    canEliminate: 3
  },

  {
    id: 'q-dep-012',
    scenario: 'developer-productivity',
    domain: 5,
    task: '5.3',
    stem: 'A developer productivity pipeline has three agents: a planner, an implementer, and a tester. The tester reports a compilation error. The error message needs to reach the planner so it can revise the implementation plan. How should error propagation be designed?',
    options: [
      { letter: 'A', text: 'The tester writes the error to a shared log file that the planner polls.' },
      { letter: 'B', text: 'The tester returns the structured error to the implementer, which passes it back to the planner as a task failure result.' },
      { letter: 'C', text: 'The tester sends the error directly to the planner, bypassing the implementer.' },
      { letter: 'D', text: 'The error is suppressed and the tester retries the compilation 3 times before reporting.' }
    ],
    correct: 1,
    explanation: 'Error propagation should follow the established agent hierarchy: tester → implementer → planner. The implementer receives the error, understands it in the context of what it implemented, and passes it to the planner with relevant context. Bypassing the implementer (C) loses the implementer\'s context about why the code was written a certain way. Polling shared state (A) adds architecture complexity. Suppressing with retries (D) hides persistent errors and delays resolution.',
    canEliminate: 0
  },

  {
    id: 'q-dep-013',
    scenario: 'developer-productivity',
    domain: 5,
    task: '5.5',
    stem: 'A code review agent assigns severity levels: critical, high, medium, low. After deployment, you observe it assigning "critical" to 40% of all findings. This seems over-inflated. What is the most effective fix?',
    options: [
      { letter: 'A', text: 'Add a maximum: "No more than 10% of findings should be critical."' },
      { letter: 'B', text: 'Add explicit criteria: "Critical: security vulnerabilities that allow data exfiltration or authentication bypass. High: bugs that cause data loss or incorrect behavior in production. Medium: issues that affect code correctness in edge cases. Low: style or readability issues."' },
      { letter: 'C', text: 'Remove the critical severity level and fold those issues into high.' },
      { letter: 'D', text: 'Run a calibration pass where a separate agent re-reviews all critical findings and downgrades false positives.' }
    ],
    correct: 1,
    explanation: 'Over-inflation of high-severity labels is caused by under-specified criteria. Adding explicit, observable examples for each severity level gives the model concrete anchors for calibration. Percentage caps (A) create artificial distribution pressure without improving the quality of individual severity assessments. Removing a severity level (C) compresses the scale rather than fixing it. A calibration re-review agent (D) adds latency and cost without addressing the root cause in the classification prompt.',
    canEliminate: 0
  },

  {
    id: 'q-dep-014',
    scenario: 'developer-productivity',
    domain: 1,
    task: '1.5',
    stem: 'You use the Agent SDK to build a developer productivity pipeline. You want to log every tool call the agent makes (tool name, arguments, result) for audit purposes without modifying the agent\'s core logic. What is the correct SDK mechanism?',
    options: [
      { letter: 'A', text: 'Wrap each tool function with a custom logging decorator.' },
      { letter: 'B', text: 'Add logging statements inside each tool implementation.' },
      { letter: 'C', text: 'Use an Agent SDK hook on the tool_call event to intercept, log, and pass through every tool invocation.' },
      { letter: 'D', text: 'Parse the raw API response after each turn to extract tool_use blocks and log them.' }
    ],
    correct: 2,
    explanation: 'Agent SDK hooks are designed for cross-cutting concerns like logging, monitoring, and data normalization. A hook on the tool_call event fires for every tool invocation without modifying the tool implementations or the agent\'s logic. Decorator wrapping (A) requires modifying each tool individually. Adding logging inside tool implementations (B) mixes concerns and requires touching every tool. Parsing raw API responses (D) is a fragile workaround that re-implements what the SDK hook provides cleanly.',
    canEliminate: 3
  },

  {
    id: 'q-dep-015',
    scenario: 'developer-productivity',
    domain: 2,
    task: '2.4',
    stem: 'A team configures the Claude Code MCP integration for their developer productivity agent. They add the MCP server config to their personal <code>~/.claude/mcp.json</code> instead of the project\'s <code>.claude/settings.json</code>. What is the consequence for other team members?',
    options: [
      { letter: 'A', text: 'Other team members automatically inherit the MCP configuration via git.' },
      { letter: 'B', text: 'The MCP server is only available to the developer who configured it — other team members\' Claude Code sessions will not have access.' },
      { letter: 'C', text: 'The MCP configuration in ~/ overrides project-level settings for all users on the machine.' },
      { letter: 'D', text: 'Claude Code merges both configurations, so all team members get both personal and project MCP servers.' }
    ],
    correct: 1,
    explanation: 'User-level MCP configuration in ~/.claude/ applies only to that user\'s Claude Code sessions. Project-level configuration in .claude/settings.json is committed to the repository and shared with all team members. Configuring the MCP server only at the user level means it is not available to colleagues who clone the repo. Option A is incorrect — ~/.claude/ is not tracked by git. Option C is incorrect — user-level config does not propagate to other users on the same machine. Option D is true for the single user\'s sessions but the question asks about other team members.',
    canEliminate: 0
  },

  // ─── SCENARIO 4: data-extraction (q-dex-001 to q-dex-015) ───────────────────

  {
    id: 'q-dex-001',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.1',
    stem: 'An extraction agent classifies contract clauses as: indemnification, limitation_of_liability, ip_ownership, confidentiality, or other. You see it classifying mutual NDA clauses as ip_ownership because they restrict IP disclosure. What is the most targeted fix?',
    options: [
      { letter: 'A', text: 'Add a rule: "Classify as confidentiality when the clause restricts disclosure of information between parties, even if it mentions intellectual property."' },
      { letter: 'B', text: 'Merge ip_ownership and confidentiality into a single category.' },
      { letter: 'C', text: 'Add more ip_ownership examples to the few-shot prompt.' },
      { letter: 'D', text: 'Add a post-classification review step that re-reads all ip_ownership results.' }
    ],
    correct: 0,
    explanation: 'The NDA misclassification is a boundary problem: the clause mentions IP (triggering ip_ownership) but its purpose is controlling disclosure (confidentiality). A rule that specifies the primary purpose test — disclosure restriction → confidentiality, even if IP is mentioned — directly resolves the ambiguity. Merging categories (B) loses useful signal. Adding more ip_ownership examples (C) reinforces the existing wrong boundary. Post-classification review (D) adds a second pass without fixing the first.',
    canEliminate: 2
  },

  {
    id: 'q-dex-002',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.2',
    stem: 'You are building a pipeline that extracts payment terms from invoices. You have 4 high-quality labeled examples. You want to add them as few-shot demonstrations. Which format produces the highest extraction consistency?',
    options: [
      { letter: 'A', text: 'Include all 4 examples in the system prompt as a reference section.' },
      { letter: 'B', text: 'Include all 4 examples as user/assistant turn pairs in the conversation, immediately before the extraction request.' },
      { letter: 'C', text: 'Include 2 examples in the system prompt and 2 in the conversation.' },
      { letter: 'D', text: 'Include examples as XML-tagged blocks inside the user message alongside the document.' }
    ],
    correct: 1,
    explanation: 'Few-shot examples placed as user/assistant turn pairs in the conversation immediately before the task request are most effective because they create a clear pattern the model conditions on with high recency weight. System prompt placement (A) works but examples are further from the task and less directly conditioning. Split placement (C) fragments the pattern. XML-tagged examples (D) can work but mixing them with the target document in a single user message reduces their effectiveness as a demonstration pattern.',
    canEliminate: 2
  },

  {
    id: 'q-dex-003',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.3',
    stem: 'An invoice extraction tool must return: <code>vendor_name</code> (string), <code>invoice_date</code> (ISO 8601 date), <code>line_items</code> (array of objects with description/quantity/unit_price), and <code>total_amount</code> (number). Which approach most reliably enforces this schema?',
    options: [
      { letter: 'A', text: 'Describe the expected format in the system prompt with an example JSON.' },
      { letter: 'B', text: 'Define a <code>submit_invoice_data</code> tool with a JSON Schema specifying all types, required fields, and array item schemas, then set tool_choice to force its use.' },
      { letter: 'C', text: 'Use a regex to validate the output and ask Claude to fix any validation errors.' },
      { letter: 'D', text: 'Split into separate extractions: one call per field, then assemble in code.' }
    ],
    correct: 1,
    explanation: 'Tool use with a JSON Schema enforces the structure at the API level. The schema can specify field types (string, number, date format pattern), required fields, and array item schemas — all validated before the response is returned. System prompt description (A) relies on the model\'s text-following reliability, which is lower than schema enforcement. Regex validation (C) is brittle for nested structures and requires a retry round-trip. Per-field extraction (D) multiplies API calls and loses relationships between fields.',
    canEliminate: 2
  },

  {
    id: 'q-dex-004',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.4',
    stem: 'Your extraction pipeline has a 15% rate of missing the <code>payment_terms</code> field from contracts. The field is always present in the source documents. After reviewing failures, you find the terms are expressed in varied formats: "Net 30", "due within 30 days", "payable upon receipt". What is the most effective retry strategy?',
    options: [
      { letter: 'A', text: 'Retry with a higher temperature to encourage more creative extraction.' },
      { letter: 'B', text: 'On missing payment_terms, re-prompt with: "The payment_terms field was not extracted. Look for any of these expressions: Net 30, due within N days, payable upon receipt, or similar payment timing language."' },
      { letter: 'C', text: 'Use a separate classification model to detect which format the payment terms use, then route to format-specific extractors.' },
      { letter: 'D', text: 'Increase max_tokens so the model has more room to include the field.' }
    ],
    correct: 1,
    explanation: 'A targeted re-prompt that enumerates the known format variations directly addresses the root cause: the model is not recognizing all variants of payment terms language. This is more effective than increasing temperature (A), which adds randomness without adding knowledge. A format classification router (C) is over-engineered for a 15% miss rate where the issue is pattern recognition, not routing. Increasing max_tokens (D) does not help when the field is being missed due to format mismatch, not token limits.',
    canEliminate: 0
  },

  {
    id: 'q-dex-005',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.5',
    stem: 'You need to extract structured data from 10,000 contracts in 8 hours. Each extraction takes approximately 3 seconds. Sequential processing would take ~8.3 hours. Which strategy meets the deadline?',
    options: [
      { letter: 'A', text: 'Use the Anthropic Batch API to process all contracts in parallel, accepting up to 24-hour turnaround for higher throughput.' },
      { letter: 'B', text: 'Use concurrent API calls (e.g., 20 parallel threads) to process contracts simultaneously within the 8-hour window.' },
      { letter: 'C', text: 'Reduce the extraction prompt length to make each call faster.' },
      { letter: 'D', text: 'Upgrade to a larger model to improve parallelism.' }
    ],
    correct: 1,
    explanation: '20 parallel threads processing ~3-second calls would process 10,000 contracts in approximately 10,000/(20 × 3600/3) ≈ 25 minutes — well within 8 hours. The Batch API (A) offers high throughput but its up-to-24-hour turnaround violates the 8-hour requirement. Reducing prompt length (C) might save 0.5-1 second per call but would still require ~7-8 hours sequentially. Upgrading the model (D) does not increase parallelism.',
    canEliminate: 3
  },

  {
    id: 'q-dex-006',
    scenario: 'data-extraction',
    domain: 4,
    task: '4.6',
    stem: 'A two-pass extraction system first extracts raw data, then a second pass validates and normalizes it. You want the validation pass to be independent of the extraction pass\'s reasoning. What architecture ensures this?',
    options: [
      { letter: 'A', text: 'Continue the same conversation — pass the extracted data back to the same model thread for validation.' },
      { letter: 'B', text: 'Start a fresh conversation for validation with only the original document and the extracted data as input — no prior conversation history.' },
      { letter: 'C', text: 'Use a different model for validation to ensure independence.' },
      { letter: 'D', text: 'Run both passes simultaneously with different random seeds.' }
    ],
    correct: 1,
    explanation: 'Independence means the validation pass evaluates the extracted data against the source document without being influenced by the extraction pass\'s intermediate reasoning. A fresh conversation with only the document and extracted data achieves this — the validator sees what was claimed and what the source says. Continuing the same thread (A) makes the validator anchored to the extractor\'s framing. Different models (C) add cost without guaranteeing independence. Simultaneous runs (D) prevent the validator from having the extractor\'s output.',
    canEliminate: 2
  },

  {
    id: 'q-dex-007',
    scenario: 'data-extraction',
    domain: 1,
    task: '1.2',
    stem: 'An extraction coordinator sends contracts to specialist subagents: a dates-extractor, a parties-extractor, and a financial-terms-extractor. All three run in parallel. After they complete, the coordinator assembles the full structured record. What is the primary risk of this parallel design?',
    options: [
      { letter: 'A', text: 'The subagents may extract overlapping information (e.g., effective_date in both dates and financial_terms) that conflicts.' },
      { letter: 'B', text: 'Parallel subagents cannot share the same source document.' },
      { letter: 'C', text: 'The coordinator\'s assembly step will always be slower than sequential extraction.' },
      { letter: 'D', text: 'The Anthropic API does not support concurrent requests from the same API key.' }
    ],
    correct: 0,
    explanation: 'When multiple specialist subagents extract from the same document, their extraction domains may overlap. An effective date could appear in both the dates subagent and the financial terms subagent, potentially with different formats or values. The coordinator must resolve conflicts during assembly. This is the primary design risk. Option B is false — all subagents can receive the same document as input context. Option C is false — parallel assembly is faster, not slower. Option D is false — concurrent requests are supported (with rate limits).',
    canEliminate: 3
  },

  {
    id: 'q-dex-008',
    scenario: 'data-extraction',
    domain: 5,
    task: '5.6',
    stem: 'An extraction agent pulls financial figures from three analyst reports covering the same company. Report A states revenue of $4.2B, Report B states $4.1B, Report C states $4.3B (all for the same period). How should the agent handle this in its output?',
    options: [
      { letter: 'A', text: 'Use the average: $4.2B, without noting the variance.' },
      { letter: 'B', text: 'Use the median value ($4.2B) and note that values ranged from $4.1B to $4.3B across sources, citing all three.' },
      { letter: 'C', text: 'Use the most recent report\'s figure regardless of value.' },
      { letter: 'D', text: 'Mark the field as extraction_failed due to conflicting sources.' }
    ],
    correct: 1,
    explanation: 'Presenting the central estimate with the observed range and source citations preserves information provenance and gives consumers the data they need to assess confidence. Pure averaging without disclosing the variance (A) hides uncertainty. Most-recent-wins (C) discards the other sources without justification. Marking as failed (D) is over-restrictive — the values are close, consistent, and usable with appropriate uncertainty notation.',
    canEliminate: 3
  },

  {
    id: 'q-dex-009',
    scenario: 'data-extraction',
    domain: 5,
    task: '5.1',
    stem: 'A contract extraction session is processing a 200-page agreement. After 25 pages of extraction, the context window is filling. The agent has already extracted parties, effective date, and governing law. What is the correct approach to continue without losing progress?',
    options: [
      { letter: 'A', text: 'Continue adding pages until the context limit is hit, then start fresh.' },
      { letter: 'B', text: 'Summarize the already-extracted structured data into a compact state object and inject it as a prefix for the next context window before processing remaining pages.' },
      { letter: 'C', text: 'Process the remaining pages without the previously extracted data, then merge at the end.' },
      { letter: 'D', text: 'Upgrade to a model with a larger context window.' }
    ],
    correct: 1,
    explanation: 'The structured extraction results already produced are compact — a JSON object with a few fields takes minimal tokens. Injecting them as a context prefix in the next window preserves continuity and allows the agent to know what it has already found while processing the remaining pages. Starting fresh (A) re-extracts already-done sections. Processing without state (C) risks re-extracting the same information or missing cross-section dependencies. Upgrading the model (D) defers the problem rather than solving it.',
    canEliminate: 0
  },

  {
    id: 'q-dex-010',
    scenario: 'data-extraction',
    domain: 1,
    task: '1.6',
    stem: 'You receive a complex contract that needs: party extraction, obligation extraction, payment term extraction, termination clause extraction, and IP rights extraction. Each is a significant task. How should a task decomposition strategy handle this?',
    options: [
      { letter: 'A', text: 'Extract all fields in a single prompt for maximum efficiency.' },
      { letter: 'B', text: 'Create five specialist subagents, each focused on one extraction type, run them in parallel, then merge results.' },
      { letter: 'C', text: 'Extract fields sequentially so each extraction can reference the previous ones.' },
      { letter: 'D', text: 'Extract in two passes: first identify all relevant sections, then extract from only those sections.' }
    ],
    correct: 1,
    explanation: 'Decomposing into parallel specialist subagents reduces latency (all run simultaneously), improves accuracy (each agent focuses on one extraction domain), and produces cleaner, more manageable outputs. A single prompt (A) for five complex extraction types risks truncation, confusion between extraction types, and lower quality. Sequential extraction (C) is slower and the dependencies between extraction types are minimal for most contracts. Two-pass section identification (D) adds latency without clear quality benefit for well-structured contracts.',
    canEliminate: 2
  },

  {
    id: 'q-dex-011',
    scenario: 'data-extraction',
    domain: 2,
    task: '2.2',
    stem: 'An extraction tool <code>extract_clauses(document_id)</code> calls a document store API. The API returns HTTP 429 (rate limited) for 30% of calls during peak hours. What is the correct tool error handling strategy?',
    options: [
      { letter: 'A', text: 'Return an error immediately: <code>{ "error": "rate_limited", "retry_after": 5 }</code>.' },
      { letter: 'B', text: 'Retry internally with exponential backoff (1s, 2s, 4s) up to 3 attempts, then return structured error if all fail.' },
      { letter: 'C', text: 'Return an empty result and let Claude infer the rate limit from the absence of data.' },
      { letter: 'D', text: 'Raise an exception that propagates to the top-level agentic loop.' }
    ],
    correct: 1,
    explanation: 'Transient rate-limit errors are best handled by the tool itself with exponential backoff before surfacing to the agent. The agent does not need to know about transient infrastructure issues that resolve automatically. If all retries fail, a structured error gives the agent actionable information. Immediate error return (A) forces the agent to handle retry logic it should not need to know about. Empty results (C) are ambiguous. Exception propagation (D) crashes the loop rather than returning recoverable error information.',
    canEliminate: 2
  },

  {
    id: 'q-dex-012',
    scenario: 'data-extraction',
    domain: 3,
    task: '3.4',
    stem: 'A data extraction job arrives: "Extract all financial obligations from this 50-page contract and format them in our standard template." Should plan mode be used?',
    options: [
      { letter: 'A', text: 'No — the task is well-specified with a clear input and output format.' },
      { letter: 'B', text: 'Yes — the multi-step nature (reading a 50-page document, extracting multiple fields, formatting) warrants a plan to review before execution.' },
      { letter: 'C', text: 'Yes — all tasks involving external files must use plan mode.' },
      { letter: 'D', text: 'No — plan mode is only needed for tasks that modify production systems.' }
    ],
    correct: 0,
    explanation: 'This task has a clear input (50-page contract), clear objective (extract financial obligations), and a known output format (standard template). These are the conditions under which direct execution is appropriate — the task is well-specified enough that a planning phase would add overhead without reducing risk. Plan mode is valuable when a task has multiple valid approaches, could affect shared systems, or has hard-to-reverse consequences. A read-and-extract task has none of these properties.',
    canEliminate: 2
  },

  {
    id: 'q-dex-013',
    scenario: 'data-extraction',
    domain: 2,
    task: '2.1',
    stem: 'You are designing a <code>parse_invoice(raw_text)</code> tool. It currently takes a raw string of arbitrary length. After deployment, you observe performance varies significantly with invoice complexity. What tool interface design improvement addresses this?',
    options: [
      { letter: 'A', text: 'Add a <code>max_length</code> parameter that truncates input to control processing time.' },
      { letter: 'B', text: 'Split into <code>parse_invoice_header(raw_text)</code> and <code>parse_invoice_line_items(raw_text)</code> with clear, bounded responsibilities.' },
      { letter: 'C', text: 'Add a <code>complexity_hint</code> parameter so the tool can adjust its processing strategy.' },
      { letter: 'D', text: 'Add a <code>timeout_ms</code> parameter so callers can set processing time limits.' }
    ],
    correct: 1,
    explanation: 'Splitting into tools with bounded responsibilities reduces the complexity variance problem — each tool handles a smaller, more consistent workload, making performance more predictable. It also enables parallel invocation (header and line items can be parsed simultaneously). Truncation (A) silently loses data. A complexity hint (C) is a leaky abstraction — the caller should not need to assess complexity. A timeout parameter (D) adds operational complexity without improving the tool design.',
    canEliminate: 2
  },

  {
    id: 'q-dex-014',
    scenario: 'data-extraction',
    domain: 5,
    task: '5.2',
    stem: 'An extraction agent encounters an invoice where the vendor name is partially obscured (a document scan artifact). The agent can read "Acme Corp" or "Acne Corp" from the image. What is the correct handling?',
    options: [
      { letter: 'A', text: 'Choose the more common company name ("Acme Corp") and proceed.' },
      { letter: 'B', text: 'Return <code>{ "vendor_name": "Acme Corp [OCR uncertain — possible: Acne Corp]", "confidence": "low" }</code> to preserve uncertainty information.' },
      { letter: 'C', text: 'Mark the entire extraction as failed due to scan quality.' },
      { letter: 'D', text: 'Return null for vendor_name and let the downstream system handle it.' }
    ],
    correct: 1,
    explanation: 'When the agent has genuine uncertainty about extracted data, it should surface that uncertainty rather than silently committing to a guess. Including the primary extraction plus the alternative reading and a low-confidence flag preserves all information for downstream review. Guessing (A) produces a clean result that may be wrong. Marking the entire extraction as failed (C) is over-restrictive — all other fields may be clean. Returning null (D) loses even the partial information that could help a human reviewer.',
    canEliminate: 2
  },

  {
    id: 'q-dex-015',
    scenario: 'data-extraction',
    domain: 1,
    task: '1.4',
    stem: 'An extraction workflow has steps: OCR → preprocessing → field_extraction → validation → normalization. OCR and preprocessing must complete before field_extraction. Validation requires field_extraction results. Normalization can run in parallel with validation after field_extraction. What DAG topology is correct?',
    options: [
      { letter: 'A', text: 'Linear chain: OCR → preprocessing → field_extraction → validation → normalization.' },
      { letter: 'B', text: 'OCR → preprocessing → field_extraction → [validation ∥ normalization] where both run in parallel after field_extraction.' },
      { letter: 'C', text: 'All five steps run in parallel for maximum throughput.' },
      { letter: 'D', text: 'OCR and preprocessing run in parallel, then field_extraction, validation, normalization sequentially.' }
    ],
    correct: 1,
    explanation: 'The correct topology matches the dependency constraints: OCR then preprocessing (sequential, each depends on the prior), then field_extraction (depends on preprocessing), then validation and normalization in parallel (both depend on field_extraction, but not on each other). Option A is correct about sequencing but misses the parallelism opportunity between validation and normalization. Option C ignores all dependencies. Option D incorrectly runs OCR and preprocessing in parallel — preprocessing depends on OCR output.',
    canEliminate: 2
  },

  // ─── SCENARIO 5: cicd-pipeline (q-ccd-001 to q-ccd-015) ─────────────────────

  {
    id: 'q-ccd-001',
    scenario: 'cicd-pipeline',
    domain: 3,
    task: '3.1',
    stem: 'Your CI/CD pipeline repository has a root CLAUDE.md with general rules and a <code>.github/</code> directory with a second CLAUDE.md defining rules specific to GitHub Actions workflow files. A developer opens Claude Code while in the <code>.github/workflows/</code> directory. Which CLAUDE.md files are loaded?',
    options: [
      { letter: 'A', text: 'Only the .github/ CLAUDE.md — the root is overridden by the more specific file.' },
      { letter: 'B', text: 'The root CLAUDE.md and the .github/ CLAUDE.md — both ancestor files apply.' },
      { letter: 'C', text: 'All CLAUDE.md files in the repository, regardless of location.' },
      { letter: 'D', text: 'None — CLAUDE.md files do not apply in hidden directories starting with ".".' }
    ],
    correct: 1,
    explanation: 'CLAUDE.md files are loaded from every directory in the ancestor chain from the current working directory to the project root. Working in .github/workflows/ means both root/CLAUDE.md and .github/CLAUDE.md are loaded. .github/workflows/ has its own ancestor chain: .github/workflows → .github → root. The .github/ CLAUDE.md applies because it is an ancestor, not because it overrides. Hidden directories are not excluded from CLAUDE.md loading.',
    canEliminate: 3
  },

  {
    id: 'q-ccd-002',
    scenario: 'cicd-pipeline',
    domain: 3,
    task: '3.6',
    stem: 'Your GitHub Actions CI review workflow runs <code>claude -p "Review this PR diff: $(git diff HEAD~1)"</code>. On large PRs, the diff exceeds the shell argument length limit and the command fails. What is the correct fix?',
    options: [
      { letter: 'A', text: 'Increase the shell\'s ARG_MAX limit to accommodate larger diffs.' },
      { letter: 'B', text: 'Write the diff to a temporary file and pass the file path to Claude using stdin or a file-based input method.' },
      { letter: 'C', text: 'Split the diff into 10KB chunks and run claude multiple times.' },
      { letter: 'D', text: 'Use the GitHub API to fetch the diff instead of git diff.' }
    ],
    correct: 1,
    explanation: 'Writing large inputs to a file and piping them via stdin (e.g., <code>git diff HEAD~1 | claude -p "Review this diff" --stdin</code>) or passing a file path avoids shell argument length limits. Increasing ARG_MAX (A) is a system-level change that requires elevated permissions and may not be possible in CI. Chunking (C) fragments the diff, breaking context across reviews. Using the GitHub API (D) fetches the same data but does not solve the argument length problem.',
    canEliminate: 0
  },

  {
    id: 'q-ccd-003',
    scenario: 'cicd-pipeline',
    domain: 2,
    task: '2.1',
    stem: 'Your CI review agent has two tools: <code>post_review_comment(file, line, comment)</code> and <code>approve_pr()</code>. You observe the agent calling approve_pr() after posting a comment about a minor style issue. What tool design change prevents this?',
    options: [
      { letter: 'A', text: 'Add a <code>severity</code> parameter to post_review_comment so the agent knows which comments block approval.' },
      { letter: 'B', text: 'Update the approve_pr() tool description to clearly state: "Only call this tool when all identified issues have severity \'low\' or no issues exist. Do not call if any medium or high severity issues were found."' },
      { letter: 'C', text: 'Remove approve_pr() from the agent\'s tool list and handle approval in a separate step.' },
      { letter: 'D', text: 'Add a confirmation dialog before approve_pr() is executed.' }
    ],
    correct: 1,
    explanation: 'Tool descriptions are how Claude understands when a tool should be used. Adding explicit preconditions to the approve_pr() description ("only when all issues are low severity or none exist") gives the model a clear policy to follow. Severity on post_review_comment (A) is useful but does not directly govern approve_pr() behavior. Removing approve_pr() (C) removes functionality. A confirmation dialog (D) is a UI pattern not applicable to agentic tools.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-004',
    scenario: 'cicd-pipeline',
    domain: 4,
    task: '4.1',
    stem: 'A CI code review agent flags issues as: security, correctness, performance, style, or documentation. You observe it flagging all TODO comments as "documentation" issues with medium severity. You want TODO comments flagged only if they reference unresolved bugs. What prompt change is correct?',
    options: [
      { letter: 'A', text: 'Add: "Flag TODO comments only when they contain a bug reference (e.g., \'TODO: fix bug #123\' or \'TODO: this breaks when...\'). Do not flag TODO comments that are general reminders or future work notes."' },
      { letter: 'B', text: 'Remove "documentation" from the category list.' },
      { letter: 'C', text: 'Lower the default severity for all documentation issues to low.' },
      { letter: 'D', text: 'Add a post-processing filter that removes all TODO-related findings.' }
    ],
    correct: 0,
    explanation: 'Precise criteria with positive examples of when to flag and negative examples of when not to directly address the over-flagging problem. The model is applying documentation category too broadly; specifying the intended scope (only bug-reference TODOs) fixes the boundary. Removing the category (B) eliminates legitimate documentation issues. Lowering severity (C) does not reduce the number of false positive flags — they are still generated. Post-processing filter (D) removes all TODO findings including the legitimate ones.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-005',
    scenario: 'cicd-pipeline',
    domain: 4,
    task: '4.2',
    stem: 'You want the CI review agent to identify SQL injection vulnerabilities. You have 3 labeled examples from past reviews. How should examples be structured to be most effective?',
    options: [
      { letter: 'A', text: 'Show 3 examples of vulnerable code snippets, labeled as "SQL injection vulnerability."' },
      { letter: 'B', text: 'Show 3 pairs: (vulnerable snippet → correct finding) AND (safe snippet → "no issue"), so the model learns both sides of the boundary.' },
      { letter: 'C', text: 'Show 3 examples of safe code snippets, labeled as "no issue", to calibrate false positives.' },
      { letter: 'D', text: 'Show 3 examples of the structured output format only, without example inputs.' }
    ],
    correct: 1,
    explanation: 'The most effective few-shot examples for a classifier show both positive cases (vulnerable code → issue) and negative cases (safe code → no issue). This teaches the model the boundary, not just one side. Showing only vulnerable examples (A) may cause over-flagging of similar-looking safe code. Showing only safe examples (C) teaches the model to say "no issue" but not to correctly identify issues. Format-only examples (D) demonstrate output structure but not the discrimination task.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-006',
    scenario: 'cicd-pipeline',
    domain: 4,
    task: '4.3',
    stem: 'The CI review agent must post comments in a structured format with fields: <code>file</code>, <code>line_start</code>, <code>line_end</code>, <code>severity</code>, <code>category</code>, <code>message</code>, <code>suggestion</code>. You see it sometimes omitting <code>suggestion</code> for fixable issues. What is the most reliable fix?',
    options: [
      { letter: 'A', text: 'Add to the prompt: "Always include a suggestion field, even if it says \'no suggestion available\'."' },
      { letter: 'B', text: 'Make suggestion a required field in the tool\'s JSON schema, with a minimum length of 10 characters.' },
      { letter: 'C', text: 'Add a post-processing step that adds a generic suggestion if the field is missing.' },
      { letter: 'D', text: 'Run a second pass that specifically asks the agent to add suggestions to all findings.' }
    ],
    correct: 1,
    explanation: 'Making suggestion a required field with a minimum length in the JSON schema enforces the constraint at the API level. The model cannot return a valid tool call without it. Text instructions (A) are less reliable — the model may follow them most of the time but not always. Post-processing with a generic suggestion (C) produces unhelpful filler. A second pass (D) adds latency and API cost without guaranteeing quality suggestions.',
    canEliminate: 0
  },

  {
    id: 'q-ccd-007',
    scenario: 'cicd-pipeline',
    domain: 1,
    task: '1.2',
    stem: 'A CI pipeline has a security-review subagent and a style-review subagent running in parallel on the same PR diff. Both return findings to a coordinator that assembles the final review. The security-review subagent flags a raw SQL query in a utility function. The style-review subagent flags the same function for missing type annotations. What does the coordinator need to handle?',
    options: [
      { letter: 'A', text: 'The coordinator must deduplicate findings because both subagents flagged the same function.' },
      { letter: 'B', text: 'The coordinator must merge findings from the same code location without duplication while preserving all distinct issues.' },
      { letter: 'C', text: 'The coordinator should prioritize security findings and discard style findings from the same location.' },
      { letter: 'D', text: 'The coordinator can return findings from both subagents without merging — downstream systems handle deduplication.' }
    ],
    correct: 1,
    explanation: 'When multiple subagents review the same code, their findings may overlap at specific locations. The coordinator must merge findings at the same code location, preserving all distinct issues (SQL injection AND missing types) rather than deduplicating by location. Deduplication (A) implies discarding one of the findings. Security-first filtering (C) would lose the style issue. Passing unmerged findings (D) produces duplicate location headers in the review output, which is confusing to reviewers.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-008',
    scenario: 'cicd-pipeline',
    domain: 5,
    task: '5.3',
    stem: 'A CI review pipeline has a security subagent and a coordinator. The security subagent cannot connect to the CVE database (a transient network error). How should this be communicated to the coordinator?',
    options: [
      { letter: 'A', text: 'The security subagent runs a partial review without CVE lookups and returns its findings without disclosing the missing data source.' },
      { letter: 'B', text: 'The security subagent returns its findings with a metadata flag: <code>{ "cve_check_status": "failed", "reason": "CVE database unreachable" }</code>.' },
      { letter: 'C', text: 'The security subagent fails completely and returns no findings.' },
      { letter: 'D', text: 'The security subagent retries indefinitely until the CVE database becomes available.' }
    ],
    correct: 1,
    explanation: 'Partial results with explicit metadata about what failed are more useful than either silent omission or complete failure. The coordinator can use the CVE check status to decide whether to hold the review, proceed with a disclaimer, or trigger a retry. Silent partial results (A) give the reviewer false confidence that the CVE check was performed. Complete failure (C) discards all the findings that were successfully generated. Infinite retry (D) blocks the pipeline indefinitely.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-009',
    scenario: 'cicd-pipeline',
    domain: 5,
    task: '5.4',
    stem: 'The CI agent needs to understand a code change that spans 30 files across a large codebase. Reading all 30 changed files plus their dependencies would exceed the context window. What is the most effective large codebase exploration strategy?',
    options: [
      { letter: 'A', text: 'Read all 30 changed files and truncate the least-changed ones to fit in the window.' },
      { letter: 'B', text: 'Use Grep to find relevant context (function signatures, interfaces, imports) from the unchanged dependency files, reading only the most referenced symbols.' },
      { letter: 'C', text: 'Read only the files with the most lines changed, ignoring small diffs.' },
      { letter: 'D', text: 'Ask the PR author to provide a summary of the changes instead of reading the diff.' }
    ],
    correct: 1,
    explanation: 'For large codebase exploration, targeted symbol-level reads using Grep are more context-efficient than full-file reads. Reading function signatures, interfaces, and import declarations from dependency files provides the necessary architectural context at a fraction of the token cost. Truncation (A) silently loses information and may remove critical context. Lines-changed heuristic (C) may miss small but important changes. Author summaries (D) replace automated analysis with manual input.',
    canEliminate: 3
  },

  {
    id: 'q-ccd-010',
    scenario: 'cicd-pipeline',
    domain: 5,
    task: '5.5',
    stem: 'The CI review agent assigns confidence scores to its findings: high, medium, low. You observe that the agent assigns "high" confidence to 85% of findings. This leads reviewers to ignore the confidence signal. What is the most effective calibration fix?',
    options: [
      { letter: 'A', text: 'Normalize confidence post-hoc: map the top 20% to high, next 30% to medium, rest to low.' },
      { letter: 'B', text: 'Add criteria: "Assign high confidence only when: (1) the issue is definitively present in the diff with no ambiguity about the code\'s intent AND (2) you can cite the exact line causing the problem."' },
      { letter: 'C', text: 'Remove confidence scores entirely to prevent misleading signals.' },
      { letter: 'D', text: 'Set a system-level cap: no more than 30% of findings in any review may be high confidence.' }
    ],
    correct: 1,
    explanation: 'Over-confidence is caused by under-specified criteria. Adding concrete, observable conditions for high confidence (definitive presence + exact location) forces the model to apply a higher bar. Post-hoc normalization (A) is fragile — it works across a batch but not per-review, and may up-rate false positives from a low-quality review. Removing scores (C) eliminates the signal rather than fixing it. A percentage cap (D) is arbitrary and may still assign high confidence to the wrong findings.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-011',
    scenario: 'cicd-pipeline',
    domain: 3,
    task: '3.3',
    stem: 'Your CI/CD pipeline covers two repos: a Node.js frontend and a Go backend. Coding standards differ significantly. You want rules scoped precisely to each repo type. Using a single shared Claude Code configuration, what is the correct approach?',
    options: [
      { letter: 'A', text: 'Use a single root CLAUDE.md that lists all rules with language tags (## Node.js Rules, ## Go Rules) and rely on Claude to apply the right section.' },
      { letter: 'B', text: 'Use separate CLAUDE.md files in the frontend/ and backend/ directories with path-specific rules; the root CLAUDE.md contains only cross-repo conventions.' },
      { letter: 'C', text: 'Maintain two completely separate repository configurations with no shared root.' },
      { letter: 'D', text: 'Use environment variables to toggle which rule set is active.' }
    ],
    correct: 1,
    explanation: 'Path-specific CLAUDE.md files in frontend/ and backend/ apply automatically when Claude Code operates in each subdirectory. This is more reliable than instruction-based rule selection (A), which requires Claude to correctly identify and apply the right language section every time. Completely separate configurations (C) lose the benefit of shared cross-repo conventions. Environment variables (D) are not a supported CLAUDE.md loading mechanism.',
    canEliminate: 0
  },

  {
    id: 'q-ccd-012',
    scenario: 'cicd-pipeline',
    domain: 1,
    task: '1.6',
    stem: 'A large PR arrives with changes to: authentication logic, database schema, UI components, and CI workflows. A single review agent is overwhelmed and produces a shallow analysis. What decomposition strategy produces the highest-quality review?',
    options: [
      { letter: 'A', text: 'Assign the full diff to one agent but give it more turns to complete a thorough review.' },
      { letter: 'B', text: 'Decompose the diff by concern area and assign each to a specialist reviewer: auth-reviewer, db-reviewer, ui-reviewer, ci-reviewer, then synthesize.' },
      { letter: 'C', text: 'Process the diff file-by-file sequentially with one agent.' },
      { letter: 'D', text: 'Review only the files that changed the most lines as a proxy for risk.' }
    ],
    correct: 1,
    explanation: 'Decomposition by concern area assigns each specialist reviewer a semantically coherent slice of the diff — authentication logic has different review criteria than UI components. Each specialist can focus its context on the relevant domain knowledge. More turns for one agent (A) does not address the context dilution problem — the agent must still hold all domains simultaneously. Sequential file-by-file (C) misses cross-file interactions within each concern area. Lines-changed heuristic (D) is a poor risk proxy.',
    canEliminate: 3
  },

  {
    id: 'q-ccd-013',
    scenario: 'cicd-pipeline',
    domain: 2,
    task: '2.3',
    stem: 'A CI review agent should ONLY use the <code>post_review_comment</code> tool — never calling <code>approve_pr</code> or <code>request_changes</code> without explicit instruction. During testing you observe it sometimes calling approve_pr spontaneously. Which is the most direct fix?',
    options: [
      { letter: 'A', text: 'Remove approve_pr and request_changes from the agent\'s available tools.' },
      { letter: 'B', text: 'Set tool_choice to "auto" and add a system prompt instruction not to call those tools.' },
      { letter: 'C', text: 'Add post-processing that intercepts and cancels any approve_pr calls.' },
      { letter: 'D', text: 'Set tool_choice to the specific post_review_comment tool to force only that tool.' }
    ],
    correct: 0,
    explanation: 'If the agent should never call approve_pr or request_changes, the cleanest fix is to remove those tools from the agent\'s available tool list entirely. Without the tool, the behavior is impossible. This is more reliable than instructions (B), which the model may not always follow. Post-processing cancellation (C) is fragile and still allows the call to be attempted. Forcing tool_choice to post_review_comment (D) prevents the agent from calling anything else, which may be too restrictive if it also needs to make other valid tool calls.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-014',
    scenario: 'cicd-pipeline',
    domain: 1,
    task: '1.7',
    stem: 'A long CI review session state-tracks: which files have been reviewed, findings per file, and overall summary so far. The agent needs to pause and resume across CI job restarts. What session state management approach is most reliable?',
    options: [
      { letter: 'A', text: 'Store the full conversation history in the CI job artifact store and reload it on restart.' },
      { letter: 'B', text: 'Serialize structured review state (reviewed_files, findings_by_file, summary_draft) to a JSON artifact and inject it as a system prompt prefix on resume.' },
      { letter: 'C', text: 'Re-run the entire review from scratch on job restart.' },
      { letter: 'D', text: 'Use a database to track review progress and have the agent query it on startup.' }
    ],
    correct: 1,
    explanation: 'Serializing structured state to a JSON artifact is compact, deterministic, and easy to inject as context. It captures exactly what the agent needs to resume without requiring the full conversation history. Full conversation history (A) may exceed context limits for long reviews and is larger than necessary. Restarting from scratch (C) wastes budget and time. A database approach (D) requires infrastructure, write permissions in the CI environment, and adds latency on every turn.',
    canEliminate: 2
  },

  {
    id: 'q-ccd-015',
    scenario: 'cicd-pipeline',
    domain: 5,
    task: '5.2',
    stem: 'A CI review agent encounters a diff where a function\'s behavior change is ambiguous — it could be a bug fix or an intentional breaking change. The agent cannot determine intent from the code alone. What is the correct escalation pattern?',
    options: [
      { letter: 'A', text: 'Assume it is a bug fix (the more common case) and flag it with low severity.' },
      { letter: 'B', text: 'Post a review comment asking for clarification: "This change to [function] may be intentional or may be a regression. Could the author confirm whether this is a deliberate breaking change?"' },
      { letter: 'C', text: 'Flag it as a critical security issue to ensure it gets reviewed by a human.' },
      { letter: 'D', text: 'Skip the finding entirely since the agent cannot be certain.' }
    ],
    correct: 1,
    explanation: 'When an automated agent cannot resolve an ambiguity from available information, the correct pattern is to surface the ambiguity to a human with a specific, targeted question. A review comment requesting author clarification is minimal, actionable, and escalates only what needs escalation. Guessing (A) commits to a potentially wrong interpretation. Over-flagging as critical (C) abuses severity and trains reviewers to ignore critical flags. Skipping (D) silently drops a potentially important finding.',
    canEliminate: 0
  },

];

// ─── Dev-only validation ─────────────────────────────────────────────────────
if (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  QUESTION_BANK.forEach(q => {
    console.assert(q.options.length === 4, `${q.id}: must have 4 options`);
    console.assert(q.canEliminate !== q.correct, `${q.id}: canEliminate must not equal correct`);
    console.assert(q.correct >= 0 && q.correct <= 3, `${q.id}: correct index out of range`);
    console.assert(q.canEliminate >= 0 && q.canEliminate <= 3, `${q.id}: canEliminate out of range`);
  });
  console.log(`questions.js loaded: ${QUESTION_BANK.length} questions`);
}
