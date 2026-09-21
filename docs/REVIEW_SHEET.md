# Claude Certified Architect — All-Questions Review Sheet

> Every one of the **388 questions** in `data/questions.json`, grouped by domain, with the correct answer marked (✅) and a one-line **Remember** hook distilled from the explanation.

> Read top-to-bottom the night before, or jump to a weak domain. For the interactive version (scoring, result files) use `python3 src/quiz.py`.

**How to read each entry:** the question → options (✅ = correct) → **Remember:** *what it tests → the answer → the thing to notice.*

## Contents

- [Domain 1: Agent Architecture & Orchestration (27%)](#domain-1) — 68 q
- [Domain 2: Tool Design & MCP Integration (18%)](#domain-2) — 37 q
- [Domain 3: Claude Code Configuration & Workflows (20%)](#domain-3) — 51 q
- [Domain 4: Prompt Engineering & Structured Output (20%)](#domain-4) — 55 q
- [Domain 5: Context Management & Reliability (15%)](#domain-5) — 49 q
- [Scenario-based questions (no fixed domain)](#scenario-based) — 128 q


<a name="domain-1"></a>
## Domain 1: Agent Architecture & Orchestration (27%)

*68 questions*

#### D1-1. `dnacenta-d1-1`
<sub>**D1** · `dnacenta` · path 2 · `dnacenta-d1-1`</sub>

An agentic loop is processing customer requests. After Claude responds, what should the system check to determine the next action?

- A) Whether the response contains text content
- **B) The `stop_reason` field in the response** ✅
- C) The length of the response
- D) Whether Claude expressed confidence in its answer

> **Answer: B.** 💡 **Remember:** The `stop_reason` field determines whether to continue the loop (`tool_use`), end it (`end_turn`), or handle edge cases (`pause_turn`, `max_tokens`).

---

#### D1-2. `dnacenta-d1-2`
<sub>**D1** · `dnacenta` · path 2 · `dnacenta-d1-2`</sub>

A coordinator agent needs to pass customer information to a subagent. What is the correct approach?

- A) The subagent will automatically inherit the coordinator's conversation context
- **B) Include all relevant customer information explicitly in the subagent's prompt** ✅
- C) Store the information in a shared database that both agents access
- D) Use environment variables to pass the context

> **Answer: B.** 💡 **Remember:** Subagents have isolated context and do not inherit the coordinator's conversation. Context must be explicitly passed in the prompt.

---

#### D1-3. `dnacenta-d1-3`
<sub>**D1** · `dnacenta` · path 2 · `dnacenta-d1-3`</sub>

A financial services application needs to ensure identity verification occurs before any refund processing. Which enforcement mechanism should be used?

- A) Add instructions to the system prompt requiring verification first
- **B) Use a PreToolUse hook that blocks `process_refund` until verification is complete** ✅
- C) Train the model on examples where verification comes first
- D) Set a high temperature to encourage creative verification approaches

> **Answer: B.** 💡 **Remember:** Financial operations require deterministic, programmatic enforcement. Prompt-based instructions have a non-zero failure rate and are inappropriate for financial/safety-critical workflows.

---

#### D1-4. `sgrid-test-02-multi-agent-11`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-11`</sub>

You are building a multi-agent research system with a coordinator, a web search agent, a document analysis agent, and a synthesis agent. The synthesis agent produces reports that consistently miss findings from the document analysis agent. Investigation shows the coordinator passes web search results to synthesis but only passes a summary reference to the document analysis output. What is the most likely fix?

- A) Increase the synthesis agent's context window to accommodate more data.
- **B) Include complete findings from the document analysis agent directly in the synthesis subagent's prompt, not just summary references.** ✅
- C) Have the synthesis agent call the document analysis agent directly to retrieve the full results.
- D) Add instructions to the coordinator to always include all results, assuming the current prompt just needs better wording.

> **Answer: B.** 💡 **Remember:** Subagent context must be explicitly provided -- subagents do not inherit parent context or share memory.

---

#### D1-5. `sgrid-test-02-multi-agent-12`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-12`</sub>

Your coordinator agent needs to invoke three subagents: web search, document analysis, and fact checking. The web search and document analysis can run independently, but fact checking needs the results from both. What is the optimal execution pattern?

- A) Run all three sequentially: web search, then document analysis, then fact checking.
- **B) Have the coordinator emit two Task tool calls in a single response (web search + document analysis) for parallel execution, then invoke fact checking in the next turn with both results.** ✅
- C) Run all three in parallel and have fact checking poll for results from the other two.
- D) Create a pipeline where web search feeds into document analysis which feeds into fact checking.

> **Answer: B.** 💡 **Remember:** Parallel subagent execution is achieved by emitting multiple Task tool calls in a single coordinator response.

---

#### D1-6. `sgrid-test-02-multi-agent-13`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-13`</sub>

A team configures their coordinator agent but forgets to include "Task" in the `allowedTools` list. What happens when the coordinator tries to spawn a subagent?

- A) The coordinator automatically gains Task tool access when it detects the need for subagents.
- **B) The coordinator cannot spawn subagents because Task is not in its allowed tools.** ✅
- C) The coordinator spawns subagents but they run with restricted permissions.
- D) The system falls back to running the subagent's work inline within the coordinator's context.

> **Answer: B.** 💡 **Remember:** `allowedTools` must explicitly include "Task" for a coordinator to invoke subagents. Without it, the coordinator simply cannot call the Task tool and will be unable to delegate work.

---

#### D1-7. `sgrid-test-02-multi-agent-14`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-14`</sub>

Your multi-agent system uses a coordinator that delegates research on "renewable energy policy" to three subagents. You observe the subagents frequently research overlapping topics, producing duplicate findings that waste tokens and processing time. What is the most effective fix?

- A) Add deduplication logic in the coordinator that filters duplicate findings after all subagents complete.
- **B) Partition the research scope across subagents to minimize overlap (e.g., assign distinct subtopics or source types to each agent).** ✅
- C) Reduce the number of subagents to one to eliminate duplication entirely.
- D) Have each subagent check with the coordinator before researching each subtopic.

> **Answer: B.** 💡 **Remember:** The coordinator should partition the research scope so each subagent has a distinct assignment (e.g., one handles academic sources, one handles news, one handles government reports, or each covers a distinct subtopic).

---

#### D1-8. `sgrid-test-02-multi-agent-15`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-15`</sub>

In a hub-and-spoke architecture, a subagent encounters an error while analyzing a document. The developer configures the subagent to send a message directly to the synthesis subagent explaining the failure. Why is this problematic?

- **A) Subagents cannot communicate with each other -- all inter-subagent communication must route through the coordinator for observability, consistent error handling, and controlled information flow.** ✅
- B) The synthesis agent might not be running yet when the error occurs.
- C) Direct communication is fine but should use a different message format than normal results.
- D) The error should be logged to a file instead of communicated to any agent.

> **Answer: A.** 💡 **Remember:** In hub-and-spoke architecture, the coordinator manages all inter-subagent communication.

---

#### D1-9. `sgrid-test-02-multi-agent-16`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-16`</sub>

You need to configure subagent definitions. Which elements should an `AgentDefinition` include?

- A) Only a system prompt -- everything else is inherited from the coordinator.
- **B) Descriptions, system prompts, and tool restrictions for each subagent type.** ✅
- C) Only tool restrictions -- the model determines its own role from context.
- D) A reference to the coordinator's configuration that the subagent clones.

> **Answer: B.** 💡 **Remember:** An `AgentDefinition` should include descriptions (explaining the agent's role and capabilities), system prompts (guiding its behavior), and tool restrictions (limiting which tools it can access).

---

#### D1-10. `sgrid-test-02-multi-agent-17`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-17`</sub>

Your coordinator receives results from a web search subagent. The results contain source URLs, article titles, and extracted content, but this metadata is mixed into the prose of the findings. When the synthesis agent later uses these results, source attribution is lost. What should you change?

- A) Have the synthesis agent search for URLs in the text using regex to extract sources.
- **B) Use structured data formats to separate content from metadata (source URLs, document names, page numbers) when passing context between agents.** ✅
- C) Have the coordinator add source attributions after synthesis is complete.
- D) Include instructions in the synthesis agent's prompt to preserve any URLs it finds.

> **Answer: B.** 💡 **Remember:** Using structured data formats (e.g., JSON or clearly delimited sections) to separate content from metadata ensures that source information is preserved through the synthesis step.

---

#### D1-11. `sgrid-test-02-multi-agent-18`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-18`</sub>

Your coordinator agent always routes every query through the full pipeline: web search -> document analysis -> synthesis -> report generation, even for simple factual questions that only need a web search. What should you change?

- A) Add a timeout to each agent so simple queries complete faster.
- **B) Design the coordinator to analyze query requirements and dynamically select which subagents to invoke rather than always routing through the full pipeline.** ✅
- C) Create a separate "simple query" coordinator that only uses web search.
- D) Add a classifier model before the coordinator that decides the pipeline.

> **Answer: B.** 💡 **Remember:** The coordinator should dynamically assess query complexity and invoke only the subagents needed.

---

#### D1-12. `sgrid-test-02-multi-agent-19`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-19`</sub>

You are designing a coordinator prompt for a research system. A colleague suggests writing detailed step-by-step procedural instructions: "Step 1: Call web search agent with query X. Step 2: Take result and call document analysis agent..." Why might this approach be suboptimal?

- A) Procedural instructions are always better because they ensure consistent behavior.
- **B) Coordinator prompts should specify research goals and quality criteria rather than step-by-step procedures, to enable subagent adaptability to different query types.** ✅
- C) Procedural instructions use more tokens than goal-oriented instructions.
- D) The coordinator cannot follow step-by-step instructions with the Agent SDK.

> **Answer: B.** 💡 **Remember:** Goal-oriented prompts allow the coordinator to adapt its strategy based on the specific query.

---

#### D1-13. `sgrid-test-02-multi-agent-20`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-02-multi-agent-20`</sub>

You want to explore two different testing strategies for a legacy codebase from a shared analysis baseline. You have already completed an initial codebase analysis. What is the best approach?

- A) Start two completely new sessions, re-running the codebase analysis in each.
- **B) Use `fork_session` to create independent branches from the shared analysis baseline to explore each strategy without re-doing the initial analysis.** ✅
- C) Use the same session for both explorations sequentially, clearing context between them.
- D) Create two subagents that each receive a copy of the analysis and explore one strategy.

> **Answer: B.** 💡 **Remember:** `fork_session` creates independent branches from a shared analysis baseline. Both branches retain the initial codebase analysis context and can explore divergent approaches independently.

---

#### D1-14. `sgrid-test-03-hooks-workflows-21`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-21`</sub>

Your customer support agent must verify customer identity before processing any refund. In production, logs show the agent skips `get_customer` and calls `process_refund` directly in 8% of cases, despite clear system prompt instructions. What change provides the strongest guarantee?

- A) Add bold, capitalized instructions in the system prompt: "YOU MUST ALWAYS call get_customer BEFORE process_refund."
- B) Add 5 few-shot examples showing the agent always calling get_customer first.
- **C) Implement a programmatic prerequisite that blocks `process_refund` until `get_customer` has returned a verified customer ID.** ✅
- D) Add a confidence check: have the agent rate its certainty about the customer's identity before proceeding.

> **Answer: C.** 💡 **Remember:** When errors have financial consequences, programmatic enforcement is required. Prompt-based approaches (A, B) have a non-zero failure rate -- even with strong instructions, the model will occasionally deviate.

---

#### D1-15. `sgrid-test-03-hooks-workflows-22`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-22`</sub>

Your agent handles a customer request: "I want to return my damaged headphones and also change my shipping address for order #5678." The agent resolves the address change but forgets to handle the return. What architectural change would prevent this?

- A) Add a system prompt instruction: "Always address all parts of the customer's message."
- **B) Decompose multi-concern requests into distinct items, investigate each in parallel using shared context, then synthesize a unified resolution.** ✅
- C) Limit customers to one request per message.
- D) Add a checklist tool that the agent must mark items complete before responding.

> **Answer: B.** 💡 **Remember:** The solution is to explicitly decompose multi-concern requests into separate items and handle each one.

---

#### D1-16. `sgrid-test-03-hooks-workflows-23`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-23`</sub>

A PostToolUse hook receives order data from different MCP tools. Tool A returns timestamps as Unix epochs, Tool B returns ISO 8601 strings, and Tool C returns dates as "MM/DD/YYYY". The agent struggles to compare dates across tool results. What should the hook do?

- A) Add instructions to the system prompt explaining each date format so the model can convert them.
- **B) Normalize all date formats to a consistent format (e.g., ISO 8601) in the PostToolUse hook before the model processes them.** ✅
- C) Create separate agents for each tool, each specialized in its date format.
- D) Store all dates in a database and let the agent query them with SQL.

> **Answer: B.** 💡 **Remember:** PostToolUse hooks are designed to intercept and transform tool results before the model processes them.

---

#### D1-17. `sgrid-test-03-hooks-workflows-24`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-24`</sub>

Your company policy prohibits refunds over $500 without manager approval. You need to enforce this in your customer support agent. Which approach provides guaranteed compliance?

- A) Include the $500 limit in the system prompt with clear instructions to escalate above that amount.
- **B) Implement a tool call interception hook that blocks `process_refund` when the amount exceeds $500 and redirects to a human escalation workflow.** ✅
- C) Add few-shot examples showing the agent escalating for large refunds.
- D) Have the agent calculate the refund amount and ask for confirmation before processing.

> **Answer: B.** 💡 **Remember:** Tool call interception hooks provide deterministic enforcement of business rules. The hook inspects the tool call parameters before execution and blocks policy-violating actions, redirecting to alternative workflows.

---

#### D1-18. `sgrid-test-03-hooks-workflows-25`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-25`</sub>

When escalating a complex case to a human agent, your AI agent currently transfers the conversation with "Transferring you to a human agent." The human agent has no access to the conversation transcript. What information should the handoff include?

- A) Just the customer's name and account number.
- **B) A structured handoff summary: customer ID, root cause analysis, refund amount, recommended action, and what has already been investigated.** ✅
- C) The entire conversation transcript.
- D) A sentiment score and customer satisfaction prediction.

> **Answer: B.** 💡 **Remember:** Structured handoff summaries should include actionable information: customer ID, root cause analysis, what was investigated, refund amount, and recommended action.

---

#### D1-19. `sgrid-test-03-hooks-workflows-26`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-26`</sub>

What is the key distinction between using hooks for enforcement versus prompt instructions?

- A) Hooks are faster to implement than prompt instructions.
- **B) Hooks provide deterministic guarantees while prompt instructions provide probabilistic compliance -- choose hooks when business rules require guaranteed compliance.** ✅
- C) Prompt instructions are more reliable than hooks because the model understands context.
- D) Hooks and prompt instructions provide equivalent compliance rates.

> **Answer: B.** 💡 **Remember:** This is a fundamental distinction tested throughout the exam. Hooks operate programmatically outside the model's decision-making, providing deterministic (100%) compliance.

---

#### D1-20. `sgrid-test-03-hooks-workflows-27`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-27`</sub>

You are resuming a Claude Code session after making several code changes to files the agent previously analyzed. The session context still contains the old analysis. What should you do?

- A) Resume the session and trust the model to detect that files have changed.
- B) Start a completely new session and re-analyze everything from scratch.
- **C) Resume the session and inform the agent about specific file changes for targeted re-analysis.** ✅
- D) Delete the session and all associated state before starting fresh.

> **Answer: C.** 💡 **Remember:** When resuming sessions after code modifications, inform the agent about specific changes so it can perform targeted re-analysis rather than full re-exploration.

---

#### D1-21. `sgrid-test-03-hooks-workflows-28`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-28`</sub>

You have a long-running investigation session with extensive tool results from 3 hours of codebase exploration. The tool results contain many details that are no longer relevant. You want to continue the investigation in a new session. What is the most reliable approach?

- A) Resume the existing session since it has all the context.
- **B) Start a new session with a structured summary of key findings from the previous session injected into the initial context.** ✅
- C) Export the full conversation transcript and paste it into the new session.
- D) Resume with `--resume` and hope the model ignores stale results.

> **Answer: B.** 💡 **Remember:** Starting fresh with a structured summary is more reliable than resuming with stale tool results.

---

#### D1-22. `sgrid-test-03-hooks-workflows-29`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-29`</sub>

Your task is to add comprehensive tests to a large legacy codebase with no existing test coverage. Which task decomposition approach is most appropriate?

- A) Prompt chaining: write tests for file A, then file B, then file C, in alphabetical order.
- **B) Dynamic adaptive decomposition: first map the codebase structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered.** ✅
- C) Write all tests in a single session with comprehensive upfront instructions.
- D) Use a pre-configured pipeline that generates one test file per source file.

> **Answer: B.** 💡 **Remember:** Open-ended tasks with unknown scope require dynamic adaptive decomposition. Start by mapping structure, identify which areas have the highest impact (most critical business logic, most error-prone), then create a prioritized plan.

---

#### D1-23. `sgrid-test-03-hooks-workflows-30`
<sub>**D1** · `sgrid` · path 2 · `sgrid-test-03-hooks-workflows-30`</sub>

A code review task involves analyzing a PR that modifies 12 files. Which task decomposition pattern is most appropriate?

- A) Dynamic decomposition where the agent explores files in whatever order seems best.
- **B) Prompt chaining: analyze each file individually for local issues, then run a separate cross-file integration pass to catch data flow and consistency issues.** ✅
- C) Analyze all 12 files in a single pass to catch cross-file issues.
- D) Randomly sample 4 files for review to stay within context limits.

> **Answer: B.** 💡 **Remember:** Code reviews are predictable multi-aspect tasks well-suited to prompt chaining. Per-file analysis ensures consistent depth (avoiding the attention dilution of analyzing all files at once).

---

#### D1-24. `q-csa-001`
<sub>**D1** · Task 1.1 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-001`</sub>

The support agent calls a `lookup_account(email)` tool and receives a successful result. On the next turn, Claude returns a message with `stop_reason: "end_turn"` and no tool_use block — it is reasoning about what to do next. Your agentic loop checks `if not tool_use_blocks: terminate_loop()`. What is the consequence?

- A) The loop correctly terminates because the agent finished its reasoning.
- **B) The loop incorrectly terminates, discarding a valid mid-task reasoning turn before the agent has resolved the ticket.** ✅
- C) The loop pauses and waits for the user to supply more context before continuing.
- D) Claude re-invokes the last tool automatically to compensate for the missing tool_use block.

> **Answer: B.** 💡 **Remember:** Claude can return a pure-text response with stop_reason "end_turn" during a multi-step task as a reasoning turn — it does not always signal task completion.

---

#### D1-25. `q-dep-001`
<sub>**D1** · Task 1.1 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-001`</sub>

A developer productivity agent is running an agentic loop to implement a feature. It reads a file, edits it, runs tests, and sees a test failure. It then returns a text message explaining the failure with `stop_reason: "end_turn"`. Your loop terminates on end_turn. What is the problem?

- A) The agent is working correctly — end_turn after explaining a failure is the correct signal to stop.
- **B) The loop terminates before the agent has a chance to fix the failure, treating the explanation as a completion signal.** ✅
- C) The agent should have used stop_reason "tool_use" to signal that more work is needed.
- D) Test failures always require human intervention and the loop should escalate rather than continue.

> **Answer: B.** 💡 **Remember:** An agent explaining a test failure is in the middle of a debugging workflow, not at the end of it.

---

#### D1-26. `q-mar-001`
<sub>**D1** · Task 1.1 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-001`</sub>

A research coordinator agent spawns three subagents in parallel. Each subagent runs an agentic loop to gather data. Subagent B calls a web search tool, gets results, then returns `stop_reason: "end_turn"` with a text summary. The coordinator's loop logic only continues if it receives a tool_use block. What happens?

- A) The coordinator correctly identifies that subagent B is done and collects its result.
- **B) The coordinator loop terminates early because it misinterprets the end_turn text response as a loop-exit signal.** ✅
- C) Subagent B re-runs its last tool call automatically to produce a tool_use block.
- D) The coordinator waits indefinitely for a tool_use block from subagent B.

> **Answer: B.** 💡 **Remember:** A coordinator loop that only continues on tool_use blocks will terminate when a subagent returns a final text summary with stop_reason "end_turn".

---

#### D1-27. `olivier-13`
<sub>**D1** · Task 1.1 · `olivier` · path 2 · `olivier-13`</sub>

You are building a customer support agent using the Claude Agent SDK. The agent processes billing disputes by calling tools like `lookup_order`, `get_invoice`, and `process_refund`. A code review notes that after each tool call, your loop checks whether Claude's response text contains the phrase "I have completed" to decide whether to stop.

What is the primary problem with this loop termination approach?

- A) The agent will never terminate because `process_refund` always returns a success message that prevents "I have completed" from appearing.
- **B) Relying on natural language signals in the assistant's text is unreliable; the correct approach is to inspect `stop_reason` and only terminate when it equals `"end_turn"`.** ✅
- C) The loop should terminate as soon as any tool call fails, since continuing after a failure will corrupt the conversation history.
- D) Checking response text is only valid in synchronous mode; you must use a callback handler for proper loop control in async contexts.

> **Answer: B.** 💡 **Remember:** Inspecting `stop_reason` is the canonical method for agentic loop control: continue iterating when `stop_reason` is `"tool_use"`, stop when it is `"end_turn"`.

---

#### D1-28. `olivier-14`
<sub>**D1** · Task 1.1 · `olivier` · path 2 · `olivier-14`</sub>

A developer productivity agent investigates bug reports by calling `search_codebase`, `read_file`, and `run_tests`. During a code review, a colleague proposes adding an iteration cap: if the loop has not finished after 15 tool calls, terminate with a generic "investigation incomplete" response.

What is the correct characterization of this design?

- A) Iteration caps are the recommended primary stopping mechanism because they prevent runaway costs in production.
- **B) Iteration caps are a reasonable safety boundary for long-running tasks but should not be the primary termination mechanism; `stop_reason: "end_turn"` remains the authoritative signal.** ✅
- C) The iteration cap should be replaced with a time-based timeout, since token counts are a more reliable measure of completion than iteration count.
- D) Iteration caps are unnecessary if the system prompt instructs the agent to always request only the minimum tools needed.

> **Answer: B.** 💡 **Remember:** The agentic loop should terminate primarily when `stop_reason` equals `"end_turn"`, which signals that the model has finished its task.

---

#### D1-29. `olivier-15`
<sub>**D1** · Task 1.1 · `olivier` · path 2 · `olivier-15`</sub>

Your multi-agent research system's agentic loop appends each tool result to the conversation history before sending the next request. A teammate suggests instead storing all tool results in a separate database and providing only a summary to the model at each iteration, rather than the full result.

Under what condition would this change most likely degrade agent performance?

- A) When the tool results contain binary data such as images or file attachments.
- **B) When the model needs to reason across multiple tool results simultaneously to determine its next action, since summaries may omit details required for that reasoning.** ✅
- C) When the number of tool calls per session exceeds 10, since larger histories slow down the API.
- D) When tools return results faster than 200ms, making history appending redundant.

> **Answer: B.** 💡 **Remember:** The agentic loop depends on tool results being present in conversation history so the model can reason about what it has already discovered before deciding its next action.

---

#### D1-30. `sgrid-test-01-agentic-loops-1`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-1`</sub>

You are building a customer support agent. Your agentic loop currently checks if the assistant's response contains the phrase "I've completed the task" to decide when to stop iterating. During testing, the agent sometimes generates this phrase mid-conversation while still needing to call additional tools. What should you change?

- A) Add additional termination phrases like "No further action needed" to make detection more robust.
- **B) Check `stop_reason` in the API response: continue when it equals `"tool_use"` and terminate when it equals `"end_turn"`.** ✅
- C) Set a maximum iteration count and stop after that many loops regardless of the response content.
- D) Parse the assistant's response for tool call JSON to determine if more tools need to be invoked.

> **Answer: B.** 💡 **Remember:** The `stop_reason` field is the reliable, API-provided mechanism for determining whether the model wants to call a tool or has finished its response.

---

#### D1-31. `sgrid-test-01-agentic-loops-10`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-10`</sub>

Which of the following is the correct agentic loop control flow?

- A) Send request -> Check if response contains tool JSON -> Execute tool -> Loop until no tool JSON found
- **B) Send request -> Check `stop_reason` -> If `"tool_use"`: execute tool, append results to history, send next request -> If `"end_turn"`: return final response** ✅
- C) Send request -> Execute all tools defined in the system -> Append results -> Send next request -> Check for "done" in response text
- D) Send request -> If response has text content, return it -> If response has tool content, execute and loop

> **Answer: B.** 💡 **Remember:** The correct flow is: (1) send the API request, (2) check `stop_reason`, (3) if `"tool_use"`, execute the requested tools, append both the assistant's response and tool results to the conversation history, and send the next request, (4) if `"end_turn"`, retu...

---

#### D1-32. `sgrid-test-01-agentic-loops-2`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-2`</sub>

Your agentic loop processes tool results but does not append them to the conversation history before sending the next request. The agent appears to "forget" what tools returned and re-calls the same tools repeatedly. What is the root cause?

- A) The model's context window is too small to hold the tool results.
- **B) Tool results must be appended to the conversation history so the model can reason about them in the next iteration.** ✅
- C) The model needs a system prompt instruction telling it not to repeat tool calls.
- D) You need to implement a deduplication layer that prevents the same tool from being called twice.

> **Answer: B.** 💡 **Remember:** Tool results must be added to the conversation history between iterations. Without this, the model has no record of previous tool outputs and cannot incorporate that information into its reasoning.

---

#### D1-33. `sgrid-test-01-agentic-loops-3`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-3`</sub>

A developer implements an agentic loop with `max_iterations = 5` as the primary stopping condition. The agent frequently hits this limit mid-task, producing incomplete responses. The developer's fix is to increase the limit to 20. What is the better approach?

- **A) Use `stop_reason == "end_turn"` as the primary termination condition, with the iteration cap as a safety fallback only.** ✅
- B) Set `max_iterations = 50` to ensure the agent always has enough room to complete.
- C) Remove the iteration cap entirely and let the agent run until it finishes naturally.
- D) Add a timer-based cutoff (e.g., 60 seconds) instead of an iteration count.

> **Answer: A.** 💡 **Remember:** The primary loop control should be the model's own `stop_reason`. When the model returns `"end_turn"`, it has decided it is done.

---

#### D1-34. `sgrid-test-01-agentic-loops-4`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-4`</sub>

In your agentic loop, after the model returns a response with `stop_reason: "tool_use"`, you execute the requested tool and get a result. What should happen next?

- A) Send a new API request with only the tool result as the user message.
- **B) Append the assistant's response (with the tool call) and the tool result to the conversation history, then send the full updated history in the next API request.** ✅
- C) Parse the tool result and include a summary in the next system prompt update.
- D) Store the tool result in a database and include a reference ID in the next message.

> **Answer: B.** 💡 **Remember:** The complete conversation history, including the assistant's tool call request and the tool's result, must be appended and sent in the next API request.

---

#### D1-35. `sgrid-test-01-agentic-loops-5`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-5`</sub>

You notice your agentic loop terminates when the assistant message contains text content alongside a tool call. The code checks `if response.content[0].type == "text": break`. Why is this incorrect?

- **A) The `content` array can contain both text blocks and tool_use blocks in the same response. The model often explains its reasoning (text) before or after requesting a tool call.** ✅
- B) Text content is only present in error responses, so this check is correct for normal flow.
- C) The `content` array always has exactly one element, so checking the first element is fine.
- D) Tool calls are never mixed with text content in the same response.

> **Answer: A.** 💡 **Remember:** A single assistant response can contain both text blocks (the model's reasoning or explanation) and `tool_use` blocks in the same `content` array.

---

#### D1-36. `sgrid-test-01-agentic-loops-6`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-6`</sub>

Your customer support agent uses an agentic loop. In production, you observe that the agent sometimes enters an infinite loop, calling the same two tools alternately without making progress. What is the best mitigation?

- A) Parse each tool result for the word "error" and terminate the loop if detected.
- **B) Maintain a reasonable iteration safety cap as a fallback and monitor for repeated identical tool calls as a signal to investigate prompt or tool design issues.** ✅
- C) After each tool call, ask the model "Are you done?" and terminate if it says yes.
- D) Limit each tool to being called only once per session.

> **Answer: B.** 💡 **Remember:** An iteration safety cap prevents infinite loops, while monitoring for repeated identical calls helps identify root causes (poor tool descriptions, ambiguous results).

---

#### D1-37. `sgrid-test-01-agentic-loops-7`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-7`</sub>

What distinguishes model-driven decision-making in an agentic loop from a pre-configured decision tree?

- A) Model-driven decision-making is slower but more accurate than decision trees.
- **B) In model-driven loops, Claude reasons about which tool to call next based on the current context, rather than following a fixed sequence of tool calls.** ✅
- C) Decision trees use the API while model-driven approaches use local inference.
- D) Model-driven approaches require fewer tools to be defined.

> **Answer: B.** 💡 **Remember:** The key distinction is that in model-driven agentic loops, Claude analyzes the current context (conversation history, tool results, user request) and dynamically decides which tool to call.

---

#### D1-38. `sgrid-test-01-agentic-loops-8`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-8`</sub>

You are designing an agentic loop for a billing dispute agent. The agent must: (1) look up the customer, (2) retrieve the disputed charge, (3) check the refund policy, and (4) either process the refund or escalate. A junior developer suggests hard-coding this sequence. What is the tradeoff?

- A) Hard-coding is always better because it guarantees the correct order.
- **B) Hard-coding ensures the sequence but loses the model's ability to adapt when steps fail or when context makes some steps unnecessary. A hybrid approach using programmatic prerequisites for critical steps and model-driven logic for adaptive steps is often better.** ✅
- C) Model-driven is always better because it is more flexible.
- D) There is no difference -- the model will follow the same sequence either way.

> **Answer: B.** 💡 **Remember:** Neither extreme is always best. Hard-coding ensures order but loses adaptability (e.g., if the customer already provided their ID, `get_customer` might not be needed).

---

#### D1-39. `sgrid-test-01-agentic-loops-9`
<sub>**D1** · Task 1.1 · `sgrid` · path 2 · `sgrid-test-01-agentic-loops-9`</sub>

Your agentic loop implementation sends the API request, receives a response, and checks `stop_reason`. The response has `stop_reason: "max_tokens"`. What does this indicate and how should you handle it?

- A) The model finished its response normally. Terminate the loop.
- **B) The model's response was truncated because it hit the `max_tokens` limit. You should continue the conversation so the model can complete its response, or increase `max_tokens`.** ✅
- C) The model encountered an error. Retry the same request.
- D) The model wants to call a tool but ran out of space to specify which one. Terminate and report an error.

> **Answer: B.** 💡 **Remember:** `stop_reason: "max_tokens"` means the response was cut off before the model finished.

---

#### D1-40. `q-ccd-007`
<sub>**D1** · Task 1.2 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-007`</sub>

A CI pipeline has a security-review subagent and a style-review subagent running in parallel on the same PR diff. Both return findings to a coordinator that assembles the final review. The security-review subagent flags a raw SQL query in a utility function. The style-review subagent flags the same function for missing type annotations. What does the coordinator need to handle?

- A) The coordinator must deduplicate findings because both subagents flagged the same function.
- **B) The coordinator must merge findings from the same code location without duplication while preserving all distinct issues.** ✅
- C) The coordinator should prioritize security findings and discard style findings from the same location.
- D) The coordinator can return findings from both subagents without merging — downstream systems handle deduplication.

> **Answer: B.** 💡 **Remember:** When multiple subagents review the same code, their findings may overlap at specific locations.

---

#### D1-41. `q-csa-002`
<sub>**D1** · Task 1.2 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-002`</sub>

You are orchestrating a support resolution system where a coordinator agent routes tickets to three specialist subagents: billing, technical, and policy. The coordinator sends the full ticket context to each subagent. After all three respond, which pattern best produces a coherent final reply to the customer?

- A) Concatenate all three subagent responses in order and return them directly.
- B) Use the subagent with the highest confidence score as the sole source.
- **C) Pass all three subagent outputs back to the coordinator as assistant context and prompt it to synthesize a single customer-facing reply.** ✅
- D) Let the user choose which subagent response to use by presenting all three options.

> **Answer: C.** 💡 **Remember:** The coordinator-subagent pattern works best when subagent outputs are passed back to the coordinator as context for synthesis.

---

#### D1-42. `q-dex-007`
<sub>**D1** · Task 1.2 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-007`</sub>

An extraction coordinator sends contracts to specialist subagents: a dates-extractor, a parties-extractor, and a financial-terms-extractor. All three run in parallel. After they complete, the coordinator assembles the full structured record. What is the primary risk of this parallel design?

- **A) The subagents may extract overlapping information (e.g., effective_date in both dates and financial_terms) that conflicts.** ✅
- B) Parallel subagents cannot share the same source document.
- C) The coordinator's assembly step will always be slower than sequential extraction.
- D) The Anthropic API does not support concurrent requests from the same API key.

> **Answer: A.** 💡 **Remember:** When multiple specialist subagents extract from the same document, their extraction domains may overlap.

---

#### D1-43. `q-mar-002`
<sub>**D1** · Task 1.2 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-002`</sub>

Three research subagents run in parallel: one searches academic databases, one searches news, one queries a knowledge graph. The coordinator must produce a unified answer. Which handoff pattern minimizes coordinator context usage while preserving answer quality?

- A) Have each subagent return its full raw data so the coordinator can verify sources directly.
- **B) Have each subagent return a structured summary (claim, evidence snippet, confidence) and pass only those summaries to the coordinator.** ✅
- C) Have the coordinator call each subagent sequentially so it can ask follow-up questions.
- D) Have each subagent post results to a shared memory store and have the coordinator read only what it needs.

> **Answer: B.** 💡 **Remember:** Structured summaries (claim, evidence, confidence) convey the semantically relevant content at a fraction of the token cost of raw data.

---

#### D1-44. `olivier-16`
<sub>**D1** · Task 1.2 · `olivier` · path 2 · `olivier-16`</sub>

Your multi-agent research system uses a coordinator that always routes every query through all four subagents (web search, document analysis, synthesis, and report generation) regardless of query complexity. For a simple factual question like "What year was the Anthropic API released?", the system takes 45 seconds and incurs unnecessary cost.

What design change most directly addresses this?

- A) Replace the coordinator with a static routing table that maps query keywords to specific subagent pipelines.
- B) Have each subagent evaluate its own relevance to the current query and self-select into or out of the pipeline.
- **C) Design the coordinator to dynamically select which subagents to invoke based on query complexity and type, rather than always routing through the full pipeline.** ✅
- D) Reduce the number of subagents from four to two by merging web search and document analysis into a single "retrieval" agent.

> **Answer: C.** 💡 **Remember:** A coordinator that always runs the full pipeline regardless of query complexity wastes resources and adds latency for simple requests.

---

#### D1-45. `olivier-17`
<sub>**D1** · Task 1.2 · `olivier` · path 2 · `olivier-17`</sub>

A coordinator agent in your research system has delegated document analysis to a subagent. After the subagent finishes, the coordinator notices the findings are incomplete: the subagent covered only three of the five specified sources. The coordinator needs to get the remaining two sources analyzed.

What is the correct approach for re-delegating this work?

- A) Invoke the synthesis agent with the partial findings and instruct it to infer what the missing sources likely contain based on patterns from the three completed analyses.
- **B) The coordinator should re-invoke the document analysis subagent with an explicit prompt specifying only the two missing sources, including the previously completed findings as context.** ✅
- C) Send all five sources again to a new document analysis subagent instance, which will re-analyze the three already-completed sources along with the two missing ones.
- D) Let the coordinator generate its own analysis of the remaining two sources directly, rather than spawning another subagent delegation.

> **Answer: B.** 💡 **Remember:** The coordinator's role includes evaluating output for gaps and re-delegating targeted work to close those gaps.

---

#### D1-46. `olivier-7`
<sub>**D1** · Task 1.2 · `olivier` · path 2 · `olivier-7`</sub>

After running on "impact of AI on creative industries," each subagent completes successfully but the final reports cover only visual arts, missing music, writing, and film production. The coordinator decomposed the topic into: "AI in digital art creation," "AI in graphic design," and "AI in photography." What is the most likely root cause?

- A) The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.
- **B) The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains.** ✅
- C) The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.
- D) The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria.

> **Answer: B.** 💡 **Remember:** The coordinator's logs reveal the root cause directly: it decomposed "creative industries" into only visual arts subtasks.

---

#### D1-47. `q-csa-003`
<sub>**D1** · Task 1.3 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-003`</sub>

A subagent is spawned to look up a customer's order history. The coordinator passes `{ customer_id, date_range, issue_type }` as the subagent's initial user message. The subagent returns a structured summary. What is the most important property of context passed to subagents?

- A) It should include the full conversation history from the coordinator session so the subagent has maximum information.
- **B) It should be minimal and task-scoped — only what the subagent needs to complete its specific function.** ✅
- C) It must always be passed as a system prompt, never as a user message.
- D) It should be encrypted to prevent the subagent from accessing sensitive data beyond its task.

> **Answer: B.** 💡 **Remember:** Subagent context should be minimal and task-scoped. Passing the full coordinator conversation history (A) bloats context, leaks information the subagent does not need, and wastes tokens.

---

#### D1-48. `q-dep-002`
<sub>**D1** · Task 1.3 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-002`</sub>

A coordinator spawns a code-review subagent. The subagent needs the diff, the repository's coding standards, and the PR description. The coordinator's full session context also contains unrelated user conversations. What is the correct context passing approach?

- A) Pass the entire coordinator session history to the subagent for maximum context.
- **B) Pass only the diff, coding standards excerpt, and PR description as the subagent's initial context.** ✅
- C) Pass no context — the subagent should request what it needs via tool calls.
- D) Pass the full repository contents so the subagent can look up anything it needs.

> **Answer: B.** 💡 **Remember:** Subagent context should be scoped to what the subagent needs for its specific task. The code-review subagent needs the diff (what changed), coding standards (what rules apply), and PR description (why the change was made).

---

#### D1-49. `olivier-18`
<sub>**D1** · Task 1.3 · `olivier` · path 2 · `olivier-18`</sub>

You are building a coordinator that delegates research tasks to subagents using the `Task` tool. When you test the system, the coordinator cannot invoke any subagents. Reviewing the coordinator's `AgentDefinition`, you notice the `allowedTools` field is set to `["web_search", "read_document"]`.

What is the most likely cause of the failure?

- A) The `Task` tool requires an explicit `subagent_endpoint` configuration before it can be invoked.
- **B) `"Task"` is not included in the coordinator's `allowedTools`, so it cannot spawn subagents.** ✅
- C) The coordinator's system prompt does not include instructions to use the `Task` tool, so the model never attempts to call it.
- D) Subagent invocation requires the coordinator to be running in plan mode rather than direct execution mode.

> **Answer: B.** 💡 **Remember:** The `Task` tool is the mechanism for spawning subagents in the Claude Agent SDK. For a coordinator to invoke subagents, `"Task"` must be explicitly included in its `allowedTools`.

---

#### D1-50. `olivier-19`
<sub>**D1** · Task 1.3 · `olivier` · path 2 · `olivier-19`</sub>

Your multi-agent research system has a web search subagent that consistently returns findings without identifying which sources correspond to which claims. When the synthesis agent receives these findings, it cannot produce properly cited reports.

What is the correct fix during context passing from the web search subagent to the synthesis agent?

- A) Instruct the synthesis agent to run its own web searches to re-locate the original sources.
- **B) Use structured data formats that separate claim content from metadata (source URLs, publication dates, page numbers) in the subagent's output, and include this structure when passing context to the synthesis agent.** ✅
- C) Have the coordinator concatenate all subagent outputs into a single text block before forwarding to synthesis, since synthesis will extract citations naturally.
- D) Configure the web search subagent to return only source URLs, and have the synthesis agent re-read each source to reconstruct the findings.

> **Answer: B.** 💡 **Remember:** Structured data formats that separate content from metadata ensure that claim-source mappings survive the handoff between agents.

---

#### D1-51. `olivier-20`
<sub>**D1** · Task 1.3 · `olivier` · path 2 · `olivier-20`</sub>

A coordinator needs to research three independent subtopics in parallel: market trends, competitor analysis, and regulatory environment. Each requires a separate web search subagent. How should the coordinator spawn these subagents to maximize throughput?

- A) Spawn the subtopics sequentially: start the first subagent, wait for its result, then start the second, and so on, to avoid context conflicts.
- **B) Emit all three `Task` tool calls in a single coordinator response, which allows the subagents to run in parallel.** ✅
- C) Route all three subtopics through a single subagent sequentially, sharing context between them to reduce total memory usage.
- D) Use a single subagent with three separate prompts in sequence, passing prior results as context for each subsequent prompt.

> **Answer: B.** 💡 **Remember:** The Claude Agent SDK supports parallel subagent execution by emitting multiple `Task` tool calls in a single coordinator response.

---

#### D1-52. `q-dex-015`
<sub>**D1** · Task 1.4 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-015`</sub>

An extraction workflow has steps: OCR → preprocessing → field_extraction → validation → normalization. OCR and preprocessing must complete before field_extraction. Validation requires field_extraction results. Normalization can run in parallel with validation after field_extraction. What DAG topology is correct?

- A) Linear chain: OCR → preprocessing → field_extraction → validation → normalization.
- **B) OCR → preprocessing → field_extraction → [validation ∥ normalization] where both run in parallel after field_extraction.** ✅
- C) All five steps run in parallel for maximum throughput.
- D) OCR and preprocessing run in parallel, then field_extraction, validation, normalization sequentially.

> **Answer: B.** 💡 **Remember:** The correct topology matches the dependency constraints: OCR then preprocessing (sequential, each depends on the prior), then field_extraction (depends on preprocessing), then validation and normalization in parallel (both depend on field_extraction, but no...

---

#### D1-53. `q-mar-003`
<sub>**D1** · Task 1.4 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-003`</sub>

A research workflow has four steps: query_decomposition → parallel_search → synthesis → fact_check. The synthesis step requires all parallel_search results. The fact_check step requires the synthesis output. What is the correct workflow enforcement pattern?

- A) Run all four steps in parallel to minimize latency.
- **B) Use a DAG where synthesis has a join gate that waits for all parallel_search results, and fact_check is gated on synthesis completion.** ✅
- C) Poll each step every second to check if it has completed before starting the next.
- D) Run steps in strict sequential order: decompose, then one search at a time, then synthesize, then check.

> **Answer: B.** 💡 **Remember:** A DAG (directed acyclic graph) with explicit join gates is the canonical pattern for workflows with parallel branches and downstream dependencies.

---

#### D1-54. `olivier-21`
<sub>**D1** · Task 1.4 · `olivier` · path 2 · `olivier-21`</sub>

Your customer support agent handles account closure requests. The workflow requires: (1) verify customer identity via `get_customer`, (2) check for active subscriptions via `check_subscriptions`, (3) process closure via `close_account`. Production logs show the agent occasionally calls `close_account` before completing the identity verification step, resulting in unauthorized account closures.

A colleague suggests adding a system prompt instruction: "Always verify identity before closing accounts." What is the most effective approach?

- A) The system prompt instruction is sufficient because it explicitly describes the required order.
- B) Add few-shot examples showing the correct three-step sequence alongside the system prompt instruction.
- **C) Implement a programmatic prerequisite that blocks `close_account` from executing until `get_customer` has returned a verified customer ID.** ✅
- D) Add a routing classifier that analyzes the request type and pre-selects the appropriate tools before the agent begins.

> **Answer: C.** 💡 **Remember:** When a tool ordering requirement has serious consequences (unauthorized account closures), programmatic enforcement provides deterministic guarantees.

---

#### D1-55. `olivier-22`
<sub>**D1** · Task 1.4 · `olivier` · path 2 · `olivier-22`</sub>

A customer contacts your support agent about three issues in a single message: a billing charge dispute, a missing order, and a request to update their email address. The agent processes these sequentially, taking 3-4 minutes per request. A senior architect suggests you redesign the handling approach.

What design change would most improve efficiency while maintaining accuracy?

- A) Instruct the agent to address only the highest-priority issue per conversation turn and ask the customer to submit separate tickets for the remaining issues.
- **B) Decompose the three concerns into distinct investigation items and process each in parallel using shared customer context, then compile a unified response.** ✅
- C) Process the three issues sequentially but cache intermediate results so subsequent issues benefit from data already retrieved.
- D) Delegate all three issues to a single specialized "multi-issue" subagent that handles complex requests with multiple concerns.

> **Answer: B.** 💡 **Remember:** When a customer presents multiple independent concerns, decomposing them into parallel investigation items dramatically reduces latency.

---

#### D1-56. `q-dep-014`
<sub>**D1** · Task 1.5 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-014`</sub>

You use the Agent SDK to build a developer productivity pipeline. You want to log every tool call the agent makes (tool name, arguments, result) for audit purposes without modifying the agent's core logic. What is the correct SDK mechanism?

- A) Wrap each tool function with a custom logging decorator.
- B) Add logging statements inside each tool implementation.
- **C) Use an Agent SDK hook on the tool_call event to intercept, log, and pass through every tool invocation.** ✅
- D) Parse the raw API response after each turn to extract tool_use blocks and log them.

> **Answer: C.** 💡 **Remember:** Agent SDK hooks are designed for cross-cutting concerns like logging, monitoring, and data normalization.

---

#### D1-57. `olivier-23`
<sub>**D1** · Task 1.5 · `olivier` · path 2 · `olivier-23`</sub>

Your customer support agent integrates with three backend MCP tools: a legacy billing system returning Unix timestamps, an order management system returning ISO 8601 dates, and a subscription service returning numeric status codes (1=active, 2=paused, 3=cancelled). The agent frequently misinterprets these heterogeneous formats when reasoning about customer records.

What is the most appropriate architectural fix?

- A) Update each backend system to return a uniform date and status format before the agent calls them.
- B) Add format conversion instructions to the system prompt explaining how to interpret each tool's output conventions.
- **C) Implement `PostToolUse` hooks that intercept tool results from each source and normalize timestamps, dates, and status codes into a consistent format before the model processes them.** ✅
- D) Add a post-processing step after the agent produces its final response to re-format any dates and statuses that appear in the output.

> **Answer: C.** 💡 **Remember:** `PostToolUse` hooks are the correct mechanism for intercepting and transforming tool results before the model processes them.

---

#### D1-58. `olivier-24`
<sub>**D1** · Task 1.5 · `olivier` · path 2 · `olivier-24`</sub>

Your customer support agent has a policy: refunds above $500 require manager approval and must not be processed autonomously. Your system prompt states "Do not process refunds above $500 without manager approval." Production logs show this rule is violated in approximately 3% of cases.

What is the most effective way to guarantee compliance?

- A) Strengthen the system prompt language: "You are strictly forbidden from processing refunds above $500 without explicit manager approval under any circumstances."
- B) Add 10 few-shot examples in the system prompt, all demonstrating the agent requesting manager approval for high-value refunds.
- **C) Implement a hook that intercepts outgoing `process_refund` tool calls, checks the refund amount, and blocks execution or redirects to the manager approval workflow when the amount exceeds $500.** ✅
- D) Implement a validation step that runs after `process_refund` completes and reverses any refunds that exceeded the threshold.

> **Answer: C.** 💡 **Remember:** Business rules that require guaranteed compliance must be enforced programmatically, not through prompt instructions alone.

---

#### D1-59. `olivier-25`
<sub>**D1** · Task 1.5 · `olivier` · path 2 · `olivier-25`</sub>

A developer productivity agent has a `PostToolUse` hook that transforms raw Bash output. Currently the hook appends a formatted summary but also preserves the full raw output in the result passed to the model. Sessions exploring large codebases are hitting context limits faster than expected.

What change would most effectively reduce unnecessary context consumption from tool results?

- A) Disable the `PostToolUse` hook entirely and let the model process raw Bash output directly.
- **B) Modify the hook to return only the formatted summary to the model, trimming the verbose raw output rather than preserving it alongside the summary.** ✅
- C) Increase the model's `max_tokens` parameter to accommodate the additional context from both raw and formatted output.
- D) Switch from `PostToolUse` hooks to pre-processing the Bash commands themselves to produce shorter output.

> **Answer: B.** 💡 **Remember:** `PostToolUse` hooks can trim verbose tool outputs to only the relevant data before the model processes them.

---

#### D1-60. `q-ccd-012`
<sub>**D1** · Task 1.6 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-012`</sub>

A large PR arrives with changes to: authentication logic, database schema, UI components, and CI workflows. A single review agent is overwhelmed and produces a shallow analysis. What decomposition strategy produces the highest-quality review?

- A) Assign the full diff to one agent but give it more turns to complete a thorough review.
- **B) Decompose the diff by concern area and assign each to a specialist reviewer: auth-reviewer, db-reviewer, ui-reviewer, ci-reviewer, then synthesize.** ✅
- C) Process the diff file-by-file sequentially with one agent.
- D) Review only the files that changed the most lines as a proxy for risk.

> **Answer: B.** 💡 **Remember:** Decomposition by concern area assigns each specialist reviewer a semantically coherent slice of the diff — authentication logic has different review criteria than UI components.

---

#### D1-61. `q-dex-010`
<sub>**D1** · Task 1.6 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-010`</sub>

You receive a complex contract that needs: party extraction, obligation extraction, payment term extraction, termination clause extraction, and IP rights extraction. Each is a significant task. How should a task decomposition strategy handle this?

- A) Extract all fields in a single prompt for maximum efficiency.
- **B) Create five specialist subagents, each focused on one extraction type, run them in parallel, then merge results.** ✅
- C) Extract fields sequentially so each extraction can reference the previous ones.
- D) Extract in two passes: first identify all relevant sections, then extract from only those sections.

> **Answer: B.** 💡 **Remember:** Decomposing into parallel specialist subagents reduces latency (all run simultaneously), improves accuracy (each agent focuses on one extraction domain), and produces cleaner, more manageable outputs.

---

#### D1-62. `q-mar-004`
<sub>**D1** · Task 1.6 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-004`</sub>

A research query arrives: "Analyze the competitive landscape for battery storage technology in 2024, including market leaders, technology trends, regulatory environment, and investment activity." How should a task decomposition strategy handle this?

- A) Pass the full query to a single agent and let it gather all information sequentially.
- **B) Decompose into four parallel subtasks (market leaders, technology trends, regulatory, investment), assign each to a specialist subagent, then synthesize.** ✅
- C) Break into two sequential phases: first gather all data, then analyze it, using one agent per phase.
- D) Reject the query as too broad and ask the user to narrow the scope.

> **Answer: B.** 💡 **Remember:** The query has four clearly separable dimensions that map well to parallel specialist subagents.

---

#### D1-63. `olivier-26`
<sub>**D1** · Task 1.6 · `olivier` · path 2 · `olivier-26`</sub>

You are building an automated code review system using Claude. The review must cover three aspects for every pull request: security vulnerabilities, style compliance, and performance implications. Each aspect has clear, defined criteria documented in your engineering handbook.

Which decomposition strategy is most appropriate?

- A) Dynamic adaptive decomposition: have the agent start by scanning the full PR and generate a review plan based on what it finds.
- **B) Prompt chaining with sequential focused passes: one pass per review aspect (security, style, performance), each with dedicated criteria.** ✅
- C) A single comprehensive pass that examines all three aspects simultaneously to capture cross-cutting concerns.
- D) Spawn three fully independent agents without shared context, then merge their outputs in a final aggregation step.

> **Answer: B.** 💡 **Remember:** When a workflow has predictable, well-defined aspects that must each be covered, prompt chaining with sequential focused passes is the appropriate pattern.

---

#### D1-64. `olivier-27`
<sub>**D1** · Task 1.6 · `olivier` · path 2 · `olivier-27`</sub>

An engineering team asks you to design a Claude-based system to investigate a production incident. The system must root-cause a bug that was introduced somewhere in the past two weeks across an unknown set of files and services. The scope of the investigation cannot be known in advance.

Which decomposition approach is most appropriate?

- A) Prompt chaining: design a fixed sequence of investigation steps (check logs, read configs, trace service calls) that the agent executes in order.
- **B) Dynamic adaptive decomposition: the agent first maps the affected services and symptom timeline, then generates and prioritizes investigation subtasks based on what is discovered at each step.** ✅
- C) Split the investigation between two agents: one agent reads logs while the other reads source code, and they report findings independently to a human operator.
- D) Have the agent run a comprehensive search of all changed files in the past two weeks and produce a ranked list of candidates for manual review.

> **Answer: B.** 💡 **Remember:** Open-ended investigation tasks with unknown scope require dynamic adaptive decomposition, where the agent builds its investigation plan based on intermediate findings rather than following a fixed sequence.

---

#### D1-65. `q-ccd-014`
<sub>**D1** · Task 1.7 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-014`</sub>

A long CI review session state-tracks: which files have been reviewed, findings per file, and overall summary so far. The agent needs to pause and resume across CI job restarts. What session state management approach is most reliable?

- A) Store the full conversation history in the CI job artifact store and reload it on restart.
- **B) Serialize structured review state (reviewed_files, findings_by_file, summary_draft) to a JSON artifact and inject it as a system prompt prefix on resume.** ✅
- C) Re-run the entire review from scratch on job restart.
- D) Use a database to track review progress and have the agent query it on startup.

> **Answer: B.** 💡 **Remember:** Serializing structured state to a JSON artifact is compact, deterministic, and easy to inject as context.

---

#### D1-66. `q-mar-015`
<sub>**D1** · Task 1.7 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-015`</sub>

A long research session is paused by the user overnight. The next morning, the user wants to resume from where they left off. The session state includes: current query decomposition, subagent progress, and partial results. What session resumption design is most robust?

- A) Store the entire conversation history in localStorage and reload it as the messages array.
- **B) Serialize the structured session state (query, subtask statuses, partial results) to a JSON file and reload it as a system prompt prefix on resume.** ✅
- C) Ask the user to re-enter their research query and restart from the beginning.
- D) Resume by replaying all tool calls from the original session against the live APIs.

> **Answer: B.** 💡 **Remember:** Serializing structured state to a file and injecting it as a system prompt prefix is the most robust resumption pattern.

---

#### D1-67. `olivier-28`
<sub>**D1** · Task 1.7 · `olivier` · path 2 · `olivier-28`</sub>

A developer has been using Claude Code to investigate a legacy authentication service. After several hours, they have built up a detailed session with findings about the service's token validation logic. They need to step away and return tomorrow. Three core files in the authentication module will be modified overnight by another team.

What is the most reliable approach for resuming the investigation productively the next day?

- **A) Resume the named session with `--resume <session-name>` and notify the agent about the specific files that were changed, so it can re-analyze those files in the context of its prior understanding.** ✅
- B) Start a completely new session each time, since stale tool results from the previous session make resumption unreliable for any scenario.
- C) Resume the named session without any notification about file changes; the agent will detect modifications automatically when it next reads those files.
- D) Use `fork_session` to create a branch of the current session before stepping away, then resume from the fork the next day.

> **Answer: A.** 💡 **Remember:** When resuming a session after code modifications, the correct approach is to use `--resume <session-name>` to continue the named session and explicitly inform the agent about which files changed so it can target re-analysis appropriately.

---

#### D1-68. `olivier-29`
<sub>**D1** · Task 1.7 · `olivier` · path 2 · `olivier-29`</sub>

You are leading a research investigation using Claude Code. You have completed an initial analysis of a competitor's public API documentation and want to explore two divergent architectural approaches for your response strategy: one focused on feature parity, one focused on differentiation. You want both explorations to start from the same analysis baseline.

Which session management approach best fits this scenario?

- A) Run two separate new sessions, each with a copy of the analysis findings injected as context in the initial prompt.
- B) Use `--resume` to resume the current session twice in parallel, once for each exploration direction.
- **C) Use `fork_session` to create two independent branches from the current session, then explore each approach in its respective branch.** ✅
- D) Continue in the same session, exploring one approach, then using `/compact` to clear context before exploring the second approach.

> **Answer: C.** 💡 **Remember:** `fork_session` is designed precisely for this scenario: creating independent branches from a shared analysis baseline to explore divergent approaches.

---


<a name="domain-2"></a>
## Domain 2: Tool Design & MCP Integration (18%)

*37 questions*

#### D2-1. `dnacenta-d2-4`
<sub>**D2** · `dnacenta` · path 2 · `dnacenta-d2-4`</sub>

An agent has 18 tools configured and is frequently selecting the wrong tool. What is the most effective solution?

- A) Improve all 18 tool descriptions to be more detailed
- **B) Distribute the tools across specialized subagents with 4-5 tools each** ✅
- C) Set tool_choice to "any" to force tool usage
- D) Add examples to the system prompt showing correct tool selection

> **Answer: B.** 💡 **Remember:** The 4-5 tool maximum per agent is the key architectural principle. Even with better descriptions, 18 tools degrades selection reliability.

---

#### D2-2. `dnacenta-d2-5`
<sub>**D2** · `dnacenta` · path 2 · `dnacenta-d2-5`</sub>

A search tool returns an empty array. What should the agent communicate to the user?

- A) "The search service is currently unavailable"
- B) "No results were found matching your query"
- **C) Check the response status to distinguish between "no results" and "search failed"** ✅
- D) Retry the search with different parameters

> **Answer: C.** 💡 **Remember:** The agent must distinguish between a valid empty result (status 200, no matches) and a failed search (error/timeout).

---

#### D2-3. `dnacenta-d2-6`
<sub>**D2** · `dnacenta` · path 2 · `dnacenta-d2-6`</sub>

Where should MCP server credentials be stored in a project using `.mcp.json`?

- A) Directly in the `.mcp.json` file
- **B) In environment variables referenced via `${VAR_NAME}` syntax** ✅
- C) In a separate `.mcp-secrets.json` file
- D) In the project's `package.json`

> **Answer: B.** 💡 **Remember:** `.mcp.json` supports environment variable expansion. Credentials should never be committed to version control.

---

#### D2-4. `sgrid-test-04-tool-design-mcp-31`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-31`</sub>

Your agent has two tools: `analyze_content` ("Analyzes content for insights") and `analyze_document` ("Analyzes documents for insights"). In production, the agent frequently calls the wrong one. What is the most effective first step?

- A) Add a routing classifier that examines user input and pre-selects the correct tool.
- **B) Rename the tools and update descriptions to clearly differentiate each tool's purpose, expected inputs, outputs, and when to use it versus the alternative (e.g., rename to `extract_web_results` with a web-specific description).** ✅
- C) Consolidate them into a single `analyze` tool.
- D) Add few-shot examples showing correct tool selection for 20 different scenarios.

> **Answer: B.** 💡 **Remember:** Tool descriptions are the primary mechanism LLMs use for tool selection. When tools have overlapping names and near-identical descriptions, the model cannot reliably distinguish them.

---

#### D2-5. `sgrid-test-04-tool-design-mcp-32`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-32`</sub>

Your MCP tool returns `{"status": "error", "message": "Operation failed"}` for all failure types: timeouts, invalid input, permission denied, and policy violations. The agent wastes tokens retrying non-retryable errors. What should you change?

- A) Add retry logic with exponential backoff for all errors.
- **B) Return structured error metadata including `errorCategory` (transient/validation/permission), `isRetryable` boolean, and human-readable descriptions.** ✅
- C) Have the agent parse the error message text to determine if it should retry.
- D) Eliminate all error responses and always return a successful result with a warning field.

> **Answer: B.** 💡 **Remember:** Structured error metadata allows the agent to make intelligent recovery decisions. `errorCategory` tells the agent what kind of failure occurred.

---

#### D2-6. `sgrid-test-04-tool-design-mcp-33`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-33`</sub>

Your agent has access to 18 tools spanning customer lookup, order management, billing, and shipping. Tool selection accuracy has degraded significantly. What is the primary cause and fix?

- A) The model needs more training data on tool selection.
- **B) Giving an agent access to too many tools degrades tool selection reliability. Restrict each agent's tool set to 4-5 tools relevant to its specific role.** ✅
- C) Add more detailed descriptions to all 18 tools.
- D) Implement a keyword-based pre-filter that selects 5 candidate tools before each model call.

> **Answer: B.** 💡 **Remember:** Research shows that agents with too many tools (e.g., 18 instead of 4-5) experience degraded tool selection.

---

#### D2-7. `sgrid-test-04-tool-design-mcp-34`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-34`</sub>

A synthesis agent in your multi-agent system has been given web search tools "for convenience." In testing, the synthesis agent frequently makes web searches instead of synthesizing the findings it already received. What should you do?

- A) Add prompt instructions telling the synthesis agent not to search.
- **B) Remove web search tools from the synthesis agent. Give it only synthesis-relevant tools, and route complex verification needs through the coordinator.** ✅
- C) Keep the web search tools but rename them to discourage use.
- D) Add a usage quota limiting the synthesis agent to 2 web searches per task.

> **Answer: B.** 💡 **Remember:** Agents with tools outside their specialization tend to misuse them. The synthesis agent should only have tools needed for synthesis.

---

#### D2-8. `sgrid-test-04-tool-design-mcp-35`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-35`</sub>

You want to ensure your extraction pipeline always calls `extract_metadata` before any enrichment tools. Which `tool_choice` configuration achieves this?

- A) `tool_choice: "auto"` with system prompt instructions to call metadata extraction first.
- **B) `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the first turn, then process subsequent steps in follow-up turns.** ✅
- C) `tool_choice: "any"` which guarantees the model calls some tool.
- D) Define `extract_metadata` first in the tools array, since the model prefers tools listed first.

> **Answer: B.** 💡 **Remember:** Forced tool selection (`{"type": "tool", "name": "..."}`) ensures a specific tool is called.

---

#### D2-9. `sgrid-test-04-tool-design-mcp-36`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-36`</sub>

Your team wants to share MCP server configurations across all developers working on the project. Where should the configuration be placed?

- A) In each developer's `~/.claude.json` file.
- **B) In the project's `.mcp.json` file, committed to version control, with `${GITHUB_TOKEN}` style environment variable expansion for credentials.** ✅
- C) In the project's CLAUDE.md file with server connection strings.
- D) In a shared Google Doc that developers reference when setting up their environment.

> **Answer: B.** 💡 **Remember:** Project-scoped MCP configuration goes in `.mcp.json` at the project root. This file is version-controlled so all developers get the same configuration.

---

#### D2-10. `sgrid-test-04-tool-design-mcp-37`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-37`</sub>

A developer adds a personal experimental MCP server for testing. Where should this be configured so it does not affect teammates?

- A) In the project's `.mcp.json` file with a comment marking it as experimental.
- **B) In `~/.claude.json` (user-scoped configuration).** ✅
- C) In a git-ignored `.mcp.local.json` file.
- D) In the project's CLAUDE.md file under an "experimental" section.

> **Answer: B.** 💡 **Remember:** User-scoped configuration in `~/.claude.json` is for personal and experimental servers.

---

#### D2-11. `sgrid-test-04-tool-design-mcp-38`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-38`</sub>

Your MCP server has a `search_issues` tool that returns detailed issue data including summaries, labels, and status. But the agent keeps using the built-in `Grep` tool to search for issue references in code instead. What is the likely cause?

- A) The agent prefers built-in tools by default and cannot be changed.
- **B) The MCP tool's description does not clearly explain its capabilities and outputs, causing the agent to prefer the familiar built-in Grep tool.** ✅
- C) Built-in tools always take priority over MCP tools.
- D) The MCP server connection is too slow.

> **Answer: B.** 💡 **Remember:** When MCP tool descriptions are vague or incomplete, the agent defaults to familiar built-in tools.

---

#### D2-12. `sgrid-test-04-tool-design-mcp-39`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-39`</sub>

A developer needs to find all files in a project that match the pattern `*.test.tsx`. Which built-in tool should they use?

- A) Grep -- search for "test.tsx" in file contents.
- **B) Glob -- find files matching the naming pattern `**/*.test.tsx`.** ✅
- C) Read -- read each directory to find test files.
- D) Bash -- run `find . -name "*.test.tsx"`.

> **Answer: B.** 💡 **Remember:** Glob is the built-in tool for file path pattern matching -- finding files by name or extension patterns.

---

#### D2-13. `sgrid-test-04-tool-design-mcp-40`
<sub>**D2** · `sgrid` · path 2 · `sgrid-test-04-tool-design-mcp-40`</sub>

Your agent needs to understand how a function `processRefund` is used across the codebase. It should find all callers, trace the data flow, and understand the function's dependencies. What is the recommended approach using built-in tools?

- A) Use Read to load every file in the project and search through them.
- **B) Start with Grep to find all callers of `processRefund`, then use Read to follow imports and trace flows incrementally.** ✅
- C) Use Bash to run a static analysis tool.
- D) Use Glob to find all JavaScript files, then Read each one looking for the function name.

> **Answer: B.** 💡 **Remember:** Build codebase understanding incrementally: start with Grep to find entry points (all callers of the function), then use Read to follow imports and trace flows from those entry points.

---

#### D2-14. `q-ccd-003`
<sub>**D2** · Task 2.1 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-003`</sub>

Your CI review agent has two tools: `post_review_comment(file, line, comment)` and `approve_pr()`. You observe the agent calling approve_pr() after posting a comment about a minor style issue. What tool design change prevents this?

- A) Add a `severity` parameter to post_review_comment so the agent knows which comments block approval.
- **B) Update the approve_pr() tool description to clearly state: "Only call this tool when all identified issues have severity 'low' or no issues exist. Do not call if any medium or high severity issues were found."** ✅
- C) Remove approve_pr() from the agent's tool list and handle approval in a separate step.
- D) Add a confirmation dialog before approve_pr() is executed.

> **Answer: B.** 💡 **Remember:** Tool descriptions are how Claude understands when a tool should be used. Adding explicit preconditions to the approve_pr() description ("only when all issues are low severity or none exist") gives the model a clear policy to follow.

---

#### D2-15. `q-csa-004`
<sub>**D2** · Task 2.1 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-004`</sub>

You are designing a `submit_refund(order_id, amount, reason)` tool. The `reason` parameter accepts a free-form string. After deployment, you observe the agent sometimes passes reasons like "user angry" and other times "product defect — received damaged item". What tool design change best improves consistency?

- A) Remove the reason parameter entirely to prevent inconsistency.
- **B) Change reason to an enum: ["product_defect", "wrong_item", "late_delivery", "changed_mind", "other"].** ✅
- C) Add a minimum character length validation of 20 characters to the reason parameter.
- D) Add a second tool `validate_reason(reason)` the agent calls first before submitting.

> **Answer: B.** 💡 **Remember:** Constraining the reason parameter to an enum forces the model to choose from a defined vocabulary, producing consistent, machine-readable values downstream.

---

#### D2-16. `q-dex-013`
<sub>**D2** · Task 2.1 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-013`</sub>

You are designing a `parse_invoice(raw_text)` tool. It currently takes a raw string of arbitrary length. After deployment, you observe performance varies significantly with invoice complexity. What tool interface design improvement addresses this?

- A) Add a `max_length` parameter that truncates input to control processing time.
- **B) Split into `parse_invoice_header(raw_text)` and `parse_invoice_line_items(raw_text)` with clear, bounded responsibilities.** ✅
- C) Add a `complexity_hint` parameter so the tool can adjust its processing strategy.
- D) Add a `timeout_ms` parameter so callers can set processing time limits.

> **Answer: B.** 💡 **Remember:** Splitting into tools with bounded responsibilities reduces the complexity variance problem — each tool handles a smaller, more consistent workload, making performance more predictable.

---

#### D2-17. `q-mar-005`
<sub>**D2** · Task 2.1 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-005`</sub>

A research subagent has access to `web_search(query)`, `fetch_document(url)`, and `extract_citations(text)`. When the subagent is given a synthesis task (combining information from already-fetched documents), it unexpectedly starts calling web_search again. What tool design fix prevents this?

- **A) Remove web_search from the subagent's tool list when invoking it for synthesis tasks.** ✅
- B) Add a "do not search" instruction to the system prompt.
- C) Add a usage counter that disables web_search after 3 calls.
- D) Rename web_search to gather_new_information to signal when it should be used.

> **Answer: A.** 💡 **Remember:** Tool distribution — providing only the tools a subagent needs for its specific role — is more reliable than instructions alone.

---

#### D2-18. `olivier-2`
<sub>**D2** · Task 2.1 · `olivier` · path 2 · `olivier-2`</sub>

Production logs show the agent frequently calls `get_customer` when users ask about orders, instead of calling `lookup_order`. Both tools have minimal descriptions and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?

- A) Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples.
- **B) Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.** ✅
- C) Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords.
- D) Consolidate both tools into a single `lookup_entity` tool that accepts any identifier and internally determines which backend to query.

> **Answer: B.** 💡 **Remember:** Tool descriptions are the primary mechanism LLMs use for tool selection. Option B directly addresses the root cause.

---

#### D2-19. `olivier-30`
<sub>**D2** · Task 2.1 · `olivier` · path 2 · `olivier-30`</sub>

Your customer support agent has a `lookup_order` tool that is called at the right times, but frequently returns errors. Logs show the agent passes free-text descriptions like "order from last Tuesday" instead of the required ISO-8601 timestamp format. The tool description reads: "Retrieves order details given a date or identifier." No examples or format constraints are provided.

What change to the tool definition would most directly reduce these input format errors?

- **A) Add input format constraints, accepted value formats, and example inputs to the tool description so the model knows exactly how to format its calls.** ✅
- B) Add a system prompt instruction: "Always use ISO-8601 format when calling lookup_order."
- C) Add input schema validation that rejects malformed inputs and returns an error to the agent.
- D) Split `lookup_order` into two tools: `lookup_order_by_id` and `lookup_order_by_date` to reduce ambiguity.

> **Answer: A.** 💡 **Remember:** Tool descriptions are the primary mechanism the model uses to understand how to call a tool.

---

#### D2-20. `olivier-31`
<sub>**D2** · Task 2.1 · `olivier` · path 2 · `olivier-31`</sub>

Your customer support agent has three tools with overlapping names and descriptions: `get_account_info` ("Get information about the account"), `fetch_account_details` ("Fetch account details"), and `retrieve_customer_record` ("Retrieve customer information"). All three call different backend systems with different data. The agent frequently picks the wrong tool.

Which approach most effectively resolves the misrouting?

- A) Add a system prompt instruction listing all three tools and specifying exactly when each should be used based on the request type.
- **B) Rename the tools to reflect their distinct data sources and rewrite their descriptions to explain what data each returns, what backend it queries, and what use case it serves.** ✅
- C) Consolidate all three tools into one tool with a `source` parameter that specifies which backend to query.
- D) Keep the current tools but randomize which one the agent calls, then merge the responses in a post-processing step.

> **Answer: B.** 💡 **Remember:** Ambiguous or overlapping tool names and descriptions cause misrouting. Renaming tools to reflect their distinct backends and writing descriptions that explain what each one returns, where its data comes from, and when to use it are the right fixes.

---

#### D2-21. `q-csa-005`
<sub>**D2** · Task 2.2 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-005`</sub>

The `lookup_account` tool occasionally receives an email address that has a typo and returns a 404 from the backend. The tool currently raises a Python exception which propagates as an unhandled error to the agentic loop. What is the correct MCP tool error handling pattern?

- **A) Catch the exception and return a JSON object with `{ "error": true, "message": "Account not found for email X" }` in the tool result.** ✅
- B) Let the exception propagate so the agentic loop's outer try/catch handles all tool errors uniformly.
- C) Return an empty result `{}` and let Claude infer the error from the absence of data.
- D) Retry the lookup three times with exponential backoff before returning any result.

> **Answer: A.** 💡 **Remember:** MCP tools should return structured error information in the tool result body rather than raising exceptions.

---

#### D2-22. `q-dex-011`
<sub>**D2** · Task 2.2 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-011`</sub>

An extraction tool `extract_clauses(document_id)` calls a document store API. The API returns HTTP 429 (rate limited) for 30% of calls during peak hours. What is the correct tool error handling strategy?

- A) Return an error immediately: `{ "error": "rate_limited", "retry_after": 5 }`.
- **B) Retry internally with exponential backoff (1s, 2s, 4s) up to 3 attempts, then return structured error if all fail.** ✅
- C) Return an empty result and let Claude infer the rate limit from the absence of data.
- D) Raise an exception that propagates to the top-level agentic loop.

> **Answer: B.** 💡 **Remember:** Transient rate-limit errors are best handled by the tool itself with exponential backoff before surfacing to the agent.

---

#### D2-23. `olivier-32`
<sub>**D2** · Task 2.2 · `olivier` · path 2 · `olivier-32`</sub>

Your customer support MCP tool `process_refund` returns the same error response for all failures: `{"status": "error", "message": "Operation failed"}`. The agent currently handles all errors by apologizing to the customer and ending the conversation. Logs show this response is triggered by: network timeouts, invalid refund amounts, refunds blocked by fraud detection, and expired order IDs.

What structured error response design would most improve the agent's ability to recover appropriately?

- A) Return different HTTP status codes for each failure type and have the agent interpret the status code to determine recovery action.
- **B) Return structured error metadata including `errorCategory` (transient/validation/permission/business), `isRetryable` boolean, and a human-readable explanation specific to the failure reason.** ✅
- C) Return a verbose error log with the full stack trace and system state so the agent has maximum information to reason from.
- D) Return a numeric error code and have the system prompt map each code to a recovery action.

> **Answer: B.** 💡 **Remember:** Structured error metadata gives the agent the information it needs to choose the correct recovery path: retry a transient failure, ask the customer for corrected input on a validation failure, or explain a policy block on a business rule violation.

---

#### D2-24. `olivier-33`
<sub>**D2** · Task 2.2 · `olivier` · path 2 · `olivier-33`</sub>

A web search subagent in your research system calls `search_web` and receives the following response: `{"results": [], "status": "success"}`. The subagent reports to the coordinator: "Web search was successful but no relevant results were found." Later you discover the search API was actually down and returning empty results for all queries.

What change to the MCP tool's error handling would prevent this confusion?

- A) Always return a non-empty results array by including fallback content when the actual search returns nothing.
- **B) Distinguish between access failures (where the backend could not be reached or returned an error) and valid empty results (where the search succeeded but found no matches), using the `isError` flag for the former.** ✅
- C) Add a `confidence` field to the response so the agent can infer whether the empty result is a real outcome or a failure.
- D) Implement automatic retry in the MCP tool itself, so the agent never sees an empty result unless all retries were exhausted.

> **Answer: B.** 💡 **Remember:** Access failures and valid empty results are fundamentally different conditions that require different agent responses.

---

#### D2-25. `olivier-34`
<sub>**D2** · Task 2.2 · `olivier` · path 2 · `olivier-34`</sub>

Your MCP tool `check_fraud_risk` returns `{"isError": true, "message": "Refund blocked"}` when a refund is flagged by fraud detection. The agent interprets this as a transient failure and retries the refund three times before giving up. Each retry generates a separate fraud alert in your compliance system.

What is the missing element in the error response design?

- A) The response should include a `retry_after` timestamp so the agent knows when to retry.
- **B) The response should include `isRetryable: false` and a customer-appropriate explanation distinguishing this business rule block from a transient system error.** ✅
- C) The tool should suppress the `isError` flag for fraud blocks and instead return the result as a successful response with a `blocked: true` field.
- D) The response should include the fraud risk score so the agent can decide whether the score is high enough to justify blocking.

> **Answer: B.** 💡 **Remember:** A business rule block from fraud detection is a non-retryable error. Including `isRetryable: false` signals to the agent that retrying will not resolve the situation, preventing redundant attempts that trigger compliance alerts.

---

#### D2-26. `q-ccd-013`
<sub>**D2** · Task 2.3 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-013`</sub>

A CI review agent should ONLY use the `post_review_comment` tool — never calling `approve_pr` or `request_changes` without explicit instruction. During testing you observe it sometimes calling approve_pr spontaneously. Which is the most direct fix?

- **A) Remove approve_pr and request_changes from the agent's available tools.** ✅
- B) Set tool_choice to "auto" and add a system prompt instruction not to call those tools.
- C) Add post-processing that intercepts and cancels any approve_pr calls.
- D) Set tool_choice to the specific post_review_comment tool to force only that tool.

> **Answer: A.** 💡 **Remember:** If the agent should never call approve_pr or request_changes, the cleanest fix is to remove those tools from the agent's available tool list entirely.

---

#### D2-27. `q-mar-006`
<sub>**D2** · Task 2.3 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-006`</sub>

The synthesis subagent should always use the `output_research_report(title, sections, sources)` tool for its final output. During testing you observe it sometimes returning a plain text report instead of calling the tool. Which configuration fix is most direct?

- **A) Set `tool_choice: { type: "tool", name: "output_research_report" }` to force the model to call that specific tool.** ✅
- B) Add a system prompt instruction: "You must always call output_research_report before ending your response."
- C) Set `tool_choice: "none"` to prevent any spontaneous tool calls and handle routing in code.
- D) Add a post-processing step that parses the text response and constructs the tool call manually.

> **Answer: A.** 💡 **Remember:** Setting tool_choice to a specific named tool forces the model to call exactly that tool, eliminating the text-response fallback.

---

#### D2-28. `olivier-35`
<sub>**D2** · Task 2.3 · `olivier` · path 2 · `olivier-35`</sub>

You are building a multi-agent research system with a synthesis agent whose sole job is combining findings from subagents and producing a structured report. You have given the synthesis agent access to all 18 tools in your system: web search, file reading, database queries, email sending, calendar access, and more, reasoning that more tools provide more flexibility.

What problem does this configuration most likely introduce?

- A) The synthesis agent will refuse to call any tools because it is overwhelmed by the number of choices.
- **B) Having access to tools outside its specialization increases the likelihood the synthesis agent will misuse them, such as initiating new web searches instead of synthesizing the provided findings.** ✅
- C) 18 tools will exceed the context window limit for tool schemas, causing API errors on every request.
- D) The additional tools will slow down the synthesis agent because the model must read all tool descriptions before producing output.

> **Answer: B.** 💡 **Remember:** Giving an agent access to tools outside its specialization degrades tool selection reliability.

---

#### D2-29. `olivier-36`
<sub>**D2** · Task 2.3 · `olivier` · path 2 · `olivier-36`</sub>

Your customer support system requires that every response from the `draft_response` agent includes a structured JSON summary before the agent returns its output. You want to guarantee the agent calls the `generate_summary` tool on every invocation, not optionally.

Which `tool_choice` configuration achieves this?

- A) Set `tool_choice: "auto"` so the model decides when the summary tool is needed.
- B) Set `tool_choice: "any"` so the model must call at least one tool, though it may choose a different tool instead.
- **C) Set `tool_choice: {"type": "tool", "name": "generate_summary"}` to force the model to call `generate_summary` specifically.** ✅
- D) Remove all other tools from the agent's tool list so `generate_summary` is the only option available.

> **Answer: C.** 💡 **Remember:** Forced tool selection via `tool_choice: {"type": "tool", "name": "generate_summary"}` guarantees the model calls that specific tool on every invocation.

---

#### D2-30. `olivier-9`
<sub>**D2** · Task 2.3 · `olivier` · path 2 · `olivier-9`</sub>

The synthesis agent frequently needs to verify specific claims while combining findings. Currently, this creates 2-3 round trips per task, increasing latency by 40%. 85% of verifications are simple fact-checks; 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining reliability?

- **A) Give the synthesis agent a scoped `verify_fact` tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.** ✅
- B) Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass.
- C) Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips.
- D) Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify.

> **Answer: A.** 💡 **Remember:** Option A applies the principle of least privilege by giving the synthesis agent only what it needs for the 85% common case while preserving the existing coordination pattern for complex cases.

---

#### D2-31. `q-csa-014`
<sub>**D2** · Task 2.4 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-014`</sub>

Your team wants to add Claude Code MCP tool access to the support agent's development environment so developers can query the live customer database while building prompts. What is the primary risk of this configuration?

- A) MCP servers increase response latency because they add a network round-trip.
- **B) Developers may inadvertently trigger live queries during prompt development, exposing or mutating production customer data.** ✅
- C) MCP integration is not supported for database tools — only file system tools are available.
- D) The MCP server cannot be configured per-project and applies globally to all Claude Code sessions.

> **Answer: B.** 💡 **Remember:** Connecting a live production database as an MCP tool in a development environment means any agent invocation — including exploratory prompt testing — can trigger real queries and potentially expose PII or mutate records.

---

#### D2-32. `q-dep-015`
<sub>**D2** · Task 2.4 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-015`</sub>

A team configures the Claude Code MCP integration for their developer productivity agent. They add the MCP server config to their personal `~/.claude/mcp.json` instead of the project's `.claude/settings.json`. What is the consequence for other team members?

- A) Other team members automatically inherit the MCP configuration via git.
- **B) The MCP server is only available to the developer who configured it — other team members' Claude Code sessions will not have access.** ✅
- C) The MCP configuration in ~/ overrides project-level settings for all users on the machine.
- D) Claude Code merges both configurations, so all team members get both personal and project MCP servers.

> **Answer: B.** 💡 **Remember:** User-level MCP configuration in ~/.claude/ applies only to that user's Claude Code sessions.

---

#### D2-33. `olivier-37`
<sub>**D2** · Task 2.4 · `olivier` · path 2 · `olivier-37`</sub>

Your team is setting up a shared GitHub MCP server for all engineers on a project. The server requires a GitHub API token for authentication. You want every engineer who clones the repository to have the MCP server available without each person having to manually configure it, and you want to avoid committing the actual token to version control.

What is the correct configuration approach?

- A) Add the MCP server to `~/.claude.json` on each developer's machine with their personal token hardcoded.
- **B) Add the MCP server to the project-scoped `.mcp.json` file with the token specified using environment variable expansion (e.g., `${GITHUB_TOKEN}`), and commit `.mcp.json` to the repository.** ✅
- C) Add the MCP server configuration to the root `CLAUDE.md` file under a `[mcp_servers]` section.
- D) Create a setup script that each developer runs once to add the MCP server to their personal `~/.claude.json` with their token.

> **Answer: B.** 💡 **Remember:** Project-scoped `.mcp.json` with environment variable expansion is the correct pattern for shared MCP servers: it is committed to the repository so all team members get the configuration automatically, and tokens are injected via environment variables at run...

---

#### D2-34. `olivier-38`
<sub>**D2** · Task 2.4 · `olivier` · path 2 · `olivier-38`</sub>

A developer productivity agent frequently makes multiple exploratory tool calls to discover what data sources are available in your MCP server before it can answer user questions. This pattern increases latency and consumes context for routine requests.

What MCP feature most directly addresses this discovery overhead?

- A) Add a `list_tools` meta-tool to the MCP server that returns all available tool names and descriptions.
- **B) Expose content catalogs as MCP resources, giving the agent visibility into available data at connection time rather than through exploratory tool calls.** ✅
- C) Reduce the number of tools in the MCP server by merging similar tools together to minimize the discovery surface.
- D) Add a caching layer that stores the results of previous exploratory calls and reuses them across sessions.

> **Answer: B.** 💡 **Remember:** MCP resources are designed to expose content catalogs so agents know what data is available without making exploratory tool calls.

---

#### D2-35. `q-dep-007`
<sub>**D2** · Task 2.5 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-007`</sub>

A developer productivity agent uses Claude Code's built-in tools. It needs to find all TypeScript files that import a specific module, then read each one. Which combination of built-in tools is most appropriate?

- A) Bash to run `find . -name "*.ts"` then Read for each file.
- **B) Glob with pattern `**/*.ts` to find files, then Grep to filter by import, then Read for matches.** ✅
- C) Read the entire directory listing with a single Read call, then filter programmatically.
- D) Write a temporary shell script, execute it with Bash, parse the output.

> **Answer: B.** 💡 **Remember:** The correct built-in tool sequence is Glob (find .ts files by pattern) → Grep (filter to those containing the specific import) → Read (read each match).

---

#### D2-36. `olivier-39`
<sub>**D2** · Task 2.5 · `olivier` · path 2 · `olivier-39`</sub>

A developer productivity agent needs to find all TypeScript files in a project that import from a deprecated module named `legacy-auth`. The project has thousands of files across many directories.

Which combination of built-in tools is most appropriate for this task?

- A) Use `Bash` to run `find . -name "*.ts"` and then `Bash` again to run `grep` on each file found.
- B) Use `Glob` to find all `.ts` files, then use `Read` to open each file and check whether it contains the import.
- **C) Use `Grep` to search for the import pattern across all TypeScript files in the codebase.** ✅
- D) Use `Read` on the project root directory to get a file listing, then recursively `Read` each subdirectory.

> **Answer: C.** 💡 **Remember:** `Grep` is the correct built-in tool for searching file contents across a codebase. It efficiently searches all TypeScript files for the import pattern without requiring separate file enumeration.

---

#### D2-37. `olivier-40`
<sub>**D2** · Task 2.5 · `olivier` · path 2 · `olivier-40`</sub>

A developer productivity agent needs to update a configuration value in a file. The value appears in a block of code that contains several nearly identical lines. When the agent uses `Edit`, the tool returns an error: "Match not unique: found 3 occurrences of the target text."

What is the correct fallback approach?

- A) Use `Bash` to run a `sed` command to replace all occurrences of the target text simultaneously.
- **B) Use `Read` to load the full file contents, identify the exact surrounding context needed to make the edit unique, and retry `Edit` with a larger `old_string` that uniquely identifies the correct location.** ✅
- C) Use `Write` to overwrite the entire file with a corrected version, based on the contents loaded by `Read`.
- D) Use `Grep` to locate the line number of each occurrence, then use `Edit` with a line number parameter to target the correct one.

> **Answer: B.** 💡 **Remember:** When `Edit` fails due to non-unique text, the correct first step is to use `Read` to examine the full file and find enough surrounding context to construct a unique `old_string`.

---


<a name="domain-3"></a>
## Domain 3: Claude Code Configuration & Workflows (20%)

*51 questions*

#### D3-1. `dnacenta-d3-7`
<sub>**D3** · `dnacenta` · path 2 · `dnacenta-d3-7`</sub>

A team wants testing conventions to apply to all `*.test.ts` files throughout their codebase, which has tests scattered across many directories. What is the most maintainable approach?

- A) Add a CLAUDE.md in every directory that contains test files
- **B) Create a single rule file in `.claude/rules/` with `paths: ["**/*.test.ts"]` frontmatter** ✅
- C) Add testing rules to the project-level CLAUDE.md
- D) Create a `tests/` directory and put all tests there with a CLAUDE.md

> **Answer: B.** 💡 **Remember:** Path-specific rules in `.claude/rules/` are superior to directory-level CLAUDE.md when conventions span multiple directories.

---

#### D3-2. `dnacenta-d3-8`
<sub>**D3** · `dnacenta` · path 2 · `dnacenta-d3-8`</sub>

When should Claude Code use plan mode instead of direct execution?

- A) When fixing a single bug with a clear stack trace
- **B) When migrating a library that affects 45+ files across the project** ✅
- C) When adding a null check to a function
- D) When updating a configuration constant

> **Answer: B.** 💡 **Remember:** Plan mode is for multi-file changes with architectural implications and multiple valid approaches.

---

#### D3-3. `dnacenta-d3-9`
<sub>**D3** · `dnacenta` · path 2 · `dnacenta-d3-9`</sub>

A CI pipeline needs to run Claude Code for automated code review. Which flag is essential?

- A) `--verbose`
- **B) `-p` / `--print`** ✅
- C) `--force`
- D) `--no-cache`

> **Answer: B.** 💡 **Remember:** The `-p`/`--print` flag enables non-interactive mode, which is mandatory in CI. Without it, Claude Code hangs waiting for user input.

---

#### D3-4. `sgrid-test-05-claude-code-config-41`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-41`</sub>

A new team member reports that Claude Code is not following the project's coding standards, while all other developers see them applied correctly. The standards are documented in a CLAUDE.md file. Where is the most likely misconfiguration?

- A) The standards are in the project-level `.claude/CLAUDE.md` but the new member has not pulled the latest changes.
- **B) The standards are in `~/.claude/CLAUDE.md` (user-level) on another developer's machine, so they are not shared via version control.** ✅
- C) The CLAUDE.md file is too large for Claude to process.
- D) The new member's Claude Code version is outdated.

> **Answer: B.** 💡 **Remember:** User-level configuration in `~/.claude/CLAUDE.md` applies only to that user and is not shared through version control.

---

#### D3-5. `sgrid-test-05-claude-code-config-42`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-42`</sub>

Your project has a large CLAUDE.md file (500+ lines) covering API conventions, testing standards, deployment procedures, security policies, and style guides. It is becoming hard to maintain. What is the best refactoring approach?

- **A) Split it into multiple files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`) with topic-specific focus.** ✅
- B) Create a summary CLAUDE.md and link to external documentation.
- C) Keep the single file but add a table of contents.
- D) Move all content to the README.md instead.

> **Answer: A.** 💡 **Remember:** The `.claude/rules/` directory is designed for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md.

---

#### D3-6. `sgrid-test-05-claude-code-config-43`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-43`</sub>

Your monorepo has 5 packages, each maintained by a different team with different coding standards. Package A uses React hooks, Package B uses Angular, Package C is a Go backend. You want each package to use its own standards document. What is the most maintainable approach?

- A) Put all standards in the root CLAUDE.md under package-specific headers.
- **B) Use `@import` in each package's CLAUDE.md to selectively include relevant standards files.** ✅
- C) Create identical CLAUDE.md files in each package directory, duplicating shared standards.
- D) Use a single `.claude/rules/` file with conditional logic for each package.

> **Answer: B.** 💡 **Remember:** The `@import` syntax lets each package's CLAUDE.md reference specific standards files relevant to its domain (e.g., Package A imports `react-standards.md`, Package C imports `go-standards.md`).

---

#### D3-7. `sgrid-test-05-claude-code-config-44`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-44`</sub>

You want to create a `/deploy` command that is available only to you for testing, without affecting your teammates. Where should you create it?

- A) `.claude/commands/deploy.md` in the project repository.
- **B) `~/.claude/commands/deploy.md` in your home directory.** ✅
- C) `.claude/skills/deploy/SKILL.md` in the project repository.
- D) Add it to your personal CLAUDE.md.

> **Answer: B.** 💡 **Remember:** User-scoped commands in `~/.claude/commands/` are personal and not shared via version control.

---

#### D3-8. `sgrid-test-05-claude-code-config-45`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-45`</sub>

You are creating a skill that performs verbose codebase analysis, generating extensive output. You do not want this output to pollute the main conversation context. What frontmatter option should you use?

- A) `output: hidden`
- **B) `context: fork`** ✅
- C) `verbose: false`
- D) `context: isolated`

> **Answer: B.** 💡 **Remember:** The `context: fork` frontmatter option runs the skill in an isolated sub-agent context.

---

#### D3-9. `sgrid-test-05-claude-code-config-46`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-46`</sub>

A skill needs to generate code files but should not be allowed to execute shell commands or delete files. How do you restrict its capabilities?

- A) Add instructions in the skill's prompt saying "Do not use Bash or delete files."
- **B) Configure `allowed-tools` in the SKILL.md frontmatter to limit tool access (e.g., only Read, Write, Edit).** ✅
- C) Create a separate Claude Code profile with reduced permissions.
- D) Use a lower-capability model for the skill.

> **Answer: B.** 💡 **Remember:** The `allowed-tools` frontmatter in SKILL.md restricts which tools the skill can access during execution.

---

#### D3-10. `sgrid-test-05-claude-code-config-47`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-47`</sub>

A skill for code review should prompt the developer for a PR number when invoked without arguments. Which frontmatter option enables this?

- A) `required-args: ["pr_number"]`
- **B) `argument-hint: "PR number to review"`** ✅
- C) `prompt: "Enter PR number"`
- D) `input-required: true`

> **Answer: B.** 💡 **Remember:** The `argument-hint` frontmatter prompts developers for required parameters when they invoke the skill without arguments.

---

#### D3-11. `sgrid-test-05-claude-code-config-48`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-48`</sub>

Your team needs both always-loaded universal coding standards AND on-demand task-specific workflows (like code review, deployment checks, migration helpers). How should these be organized?

- A) Put everything in CLAUDE.md -- it handles both standards and workflows.
- **B) Use CLAUDE.md for always-loaded universal standards and skills (.claude/skills/) for on-demand task-specific workflows.** ✅
- C) Use skills for everything since they are more flexible.
- D) Use .claude/rules/ for workflows and CLAUDE.md for standards.

> **Answer: B.** 💡 **Remember:** CLAUDE.md is always loaded and suited for universal standards that should apply to every interaction.

---

#### D3-12. `sgrid-test-05-claude-code-config-49`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-49`</sub>

You want to verify which memory files are currently loaded in your Claude Code session and diagnose why some sessions seem to have different behavior. Which command should you use?

- A) `/status`
- **B) `/memory`** ✅
- C) `/config`
- D) `/debug`

> **Answer: B.** 💡 **Remember:** The `/memory` command shows which memory files are loaded in the current session. This helps diagnose inconsistent behavior across sessions -- if different memory files are loaded, behavior will differ.

---

#### D3-13. `sgrid-test-05-claude-code-config-50`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-05-claude-code-config-50`</sub>

A developer creates a personal variant of a team skill with different behavior. They want to avoid affecting teammates. What is the correct approach?

- A) Modify the team skill in `.claude/skills/` and add a git ignore rule.
- **B) Create a personal skill variant in `~/.claude/skills/` with a different name.** ✅
- C) Override the team skill by creating one with the same name in `~/.claude/skills/`.
- D) Add conditional logic to the team skill that checks the username.

> **Answer: B.** 💡 **Remember:** Personal skill customization is done by creating variants in `~/.claude/skills/` with different names.

---

#### D3-14. `sgrid-test-06-plan-mode-cicd-51`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-51`</sub>

A developer needs to add a null check to a single function in one file. The bug is clear from the stack trace. Which mode should they use?

- A) Plan mode to explore the codebase and understand the full impact before making the change.
- **B) Direct execution -- the change is well-understood, single-file, and has clear scope.** ✅
- C) Plan mode first, then direct execution for the implementation.
- D) Start in direct execution and switch to plan mode if the fix is more complex than expected.

> **Answer: B.** 💡 **Remember:** Direct execution is appropriate for simple, well-scoped changes: a single-file bug fix with a clear stack trace.

---

#### D3-15. `sgrid-test-06-plan-mode-cicd-52`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-52`</sub>

Your team needs to migrate from library X to library Y. The migration affects 45+ files across the codebase, and there are multiple valid approaches (gradual migration with adapters vs big-bang replacement). Which approach should you take?

- A) Direct execution with comprehensive upfront instructions detailing exactly how each file should change.
- **B) Plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.** ✅
- C) Direct execution, changing files one at a time and fixing issues as they arise.
- D) Create a script that does automated find-and-replace across all files.

> **Answer: B.** 💡 **Remember:** Plan mode is designed for complex tasks involving: large-scale changes (45+ files), multiple valid approaches (gradual vs big-bang), and architectural decisions (adapter patterns, dependency management).

---

#### D3-16. `sgrid-test-06-plan-mode-cicd-53`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-53`</sub>

During a complex multi-phase task, the Explore subagent is used for verbose discovery. Why is this preferred over doing discovery in the main conversation?

- A) The Explore subagent has access to more tools than the main conversation.
- **B) The Explore subagent isolates verbose discovery output and returns summaries, preserving main conversation context from being exhausted by exploration data.** ✅
- C) The Explore subagent runs faster than the main conversation.
- D) The Explore subagent can access files that the main conversation cannot.

> **Answer: B.** 💡 **Remember:** The Explore subagent's primary benefit is context isolation. Verbose discovery output (reading many files, searching across the codebase) consumes significant context tokens.

---

#### D3-17. `sgrid-test-06-plan-mode-cicd-54`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-54`</sub>

Your CI pipeline needs to run Claude Code for automated code review on every PR. The current command `claude "Review this PR"` hangs indefinitely. What is the fix?

- A) Set `CLAUDE_HEADLESS=true` environment variable.
- B) Add `< /dev/null` to redirect stdin.
- **C) Use the `-p` flag: `claude -p "Review this PR"`.** ✅
- D) Add `--batch` flag: `claude --batch "Review this PR"`.

> **Answer: C.** 💡 **Remember:** The `-p` (or `--print`) flag runs Claude Code in non-interactive mode: it processes the prompt, outputs the result to stdout, and exits without waiting for user input.

---

#### D3-18. `sgrid-test-06-plan-mode-cicd-55`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-55`</sub>

Your CI review pipeline needs to output structured findings that can be automatically posted as inline PR comments. Which CLI flags should you use?

- A) `-p --verbose` to get detailed output in text format.
- **B) `-p --output-format json --json-schema <schema>` to produce machine-parseable structured findings.** ✅
- C) `-p --format markdown` to get formatted output.
- D) `-p > output.json` to redirect output to a JSON file.

> **Answer: B.** 💡 **Remember:** `--output-format json` combined with `--json-schema` produces structured output that matches a defined schema, making it machine-parseable for automated posting as inline PR comments.

---

#### D3-19. `sgrid-test-06-plan-mode-cicd-56`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-56`</sub>

Your CI pipeline runs Claude Code to generate tests. The generated tests frequently duplicate scenarios already covered by the existing test suite. How should you fix this?

- A) Add a deduplication step that removes duplicate tests after generation.
- **B) Provide existing test files in context so test generation avoids suggesting duplicate scenarios already covered.** ✅
- C) Limit the number of generated tests to reduce the chance of duplication.
- D) Run generated tests against the existing suite and delete any that test the same thing.

> **Answer: B.** 💡 **Remember:** Providing existing test files in the context allows Claude to see what is already covered and generate only new, non-duplicative test scenarios.

---

#### D3-20. `sgrid-test-06-plan-mode-cicd-57`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-57`</sub>

The same Claude session that generated code is tasked with reviewing that code for bugs. The review finds no issues, but an independent reviewer later discovers several bugs. Why did the self-review fail?

- A) The model's context window was too full to perform a thorough review.
- **B) The model retains reasoning context from generation, making it less likely to question its own decisions in the same session.** ✅
- C) The review prompt was not detailed enough.
- D) The model cannot perform both generation and review tasks.

> **Answer: B.** 💡 **Remember:** Self-review within the same session is inherently limited because the model retains the reasoning context that led to its original decisions.

---

#### D3-21. `sgrid-test-06-plan-mode-cicd-58`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-58`</sub>

Your CI pipeline re-runs reviews after new commits are pushed. Previous review comments remain on the PR, and the new review produces duplicate findings for issues that were already flagged. How do you fix this?

- A) Delete all previous review comments before each new review run.
- **B) Include prior review findings in context when re-running, instructing Claude to report only new or still-unaddressed issues.** ✅
- C) Use a different review template for re-reviews.
- D) Only review the files changed in the latest commit, ignoring previously reviewed files.

> **Answer: B.** 💡 **Remember:** Including prior review findings in the context allows the new review to distinguish between already-flagged issues and new ones.

---

#### D3-22. `sgrid-test-06-plan-mode-cicd-59`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-59`</sub>

You want to improve the quality of CI-generated tests. Which CLAUDE.md configuration would be most effective?

- A) Add a generic instruction: "Generate high-quality tests."
- **B) Document testing standards, valuable test criteria, available fixtures, and examples of good vs low-value tests in CLAUDE.md.** ✅
- C) Specify the minimum number of tests to generate per file.
- D) List every possible edge case that tests should cover.

> **Answer: B.** 💡 **Remember:** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code. Documenting testing standards (what makes a test valuable), available fixtures (what test infrastructure exists), and examples of good vs bad tests gives Claude the context...

---

#### D3-23. `sgrid-test-06-plan-mode-cicd-60`
<sub>**D3** · `sgrid` · path 2 · `sgrid-test-06-plan-mode-cicd-60`</sub>

A developer finds that natural language descriptions produce inconsistent results when asking Claude to transform code. They have tried rewording the instructions several times. What technique is most effective for communicating the exact transformation expected?

- A) Add more detailed prose descriptions of the transformation.
- **B) Provide 2-3 concrete input/output examples showing the transformation applied to real code.** ✅
- C) Use technical jargon to be more precise about the transformation.
- D) Break the transformation into 10 smaller steps.

> **Answer: B.** 💡 **Remember:** Concrete input/output examples are the most effective way to communicate expected transformations when prose descriptions are interpreted inconsistently. 2-3 examples demonstrating the exact before-and-after pattern resolve ambiguity that words alone cannot.

---

#### D3-24. `q-ccd-001`
<sub>**D3** · Task 3.1 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-001`</sub>

Your CI/CD pipeline repository has a root CLAUDE.md with general rules and a `.github/` directory with a second CLAUDE.md defining rules specific to GitHub Actions workflow files. A developer opens Claude Code while in the `.github/workflows/` directory. Which CLAUDE.md files are loaded?

- A) Only the .github/ CLAUDE.md — the root is overridden by the more specific file.
- **B) The root CLAUDE.md and the .github/ CLAUDE.md — both ancestor files apply.** ✅
- C) All CLAUDE.md files in the repository, regardless of location.
- D) None — CLAUDE.md files do not apply in hidden directories starting with ".".

> **Answer: B.** 💡 **Remember:** CLAUDE.md files are loaded from every directory in the ancestor chain from the current working directory to the project root.

---

#### D3-25. `q-csa-006`
<sub>**D3** · Task 3.1 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-006`</sub>

Your support agent repository has a root CLAUDE.md with general communication guidelines and a `tools/` subdirectory with a second CLAUDE.md defining tool-calling conventions. A developer opens Claude Code from the `tools/` directory. Which instructions apply?

- A) Only the tools/ CLAUDE.md applies — child files override parent files completely.
- B) Only the root CLAUDE.md applies — Claude Code always reads from the project root.
- **C) Both files apply — the root CLAUDE.md and the tools/ CLAUDE.md are merged, with tool-specific rules available alongside general guidelines.** ✅
- D) The developer must manually specify which CLAUDE.md to load using the --config flag.

> **Answer: C.** 💡 **Remember:** CLAUDE.md files cascade: when Claude Code is invoked from a subdirectory, it reads CLAUDE.md files from the project root down to the current directory.

---

#### D3-26. `q-dep-003`
<sub>**D3** · Task 3.1 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-003`</sub>

Your monorepo has a root CLAUDE.md with general guidelines and separate CLAUDE.md files in `frontend/`, `backend/`, and `infra/`. A developer working on the backend wants ONLY the backend rules to apply — not the frontend or infra rules. Will they get what they want if they open Claude Code from the `backend/` directory?

- A) Yes — Claude Code only reads CLAUDE.md files in the current directory when invoked from a subdirectory.
- **B) No — Claude Code reads the root CLAUDE.md plus the backend/ CLAUDE.md, but not frontend/ or infra/.** ✅
- C) No — Claude Code reads all CLAUDE.md files in the entire repository regardless of working directory.
- D) Yes — the frontend/ and infra/ CLAUDE.md files are ignored because they are sibling directories, not ancestors.

> **Answer: B.** 💡 **Remember:** CLAUDE.md loading follows the ancestor chain from the current working directory to the project root.

---

#### D3-27. `olivier-41`
<sub>**D3** · Task 3.1 · `olivier` · path 2 · `olivier-41`</sub>

A senior engineer adds detailed coding standards and security guidelines to their `~/.claude/CLAUDE.md` file. When a new team member joins and clones the repository, they report that Claude Code behaves differently and does not appear to follow the team's documented standards. What is the most likely cause?

- A) The new team member's Claude Code version is outdated and does not support shared configuration files.
- **B) The `~/.claude/CLAUDE.md` file is user-scoped and not version-controlled, so teammates do not receive it when they clone the repository.** ✅
- C) CLAUDE.md files must be placed in the `.claude/` subdirectory to be recognized; a root-level `CLAUDE.md` is ignored.
- D) The configuration hierarchy requires the project-level file to explicitly import from user-level files using `@import`.

> **Answer: B.** 💡 **Remember:** User-level configuration in `~/.claude/CLAUDE.md` applies only to the individual developer and is never committed to version control.

---

#### D3-28. `olivier-42`
<sub>**D3** · Task 3.1 · `olivier` · path 2 · `olivier-42`</sub>

Your monorepo has a root `CLAUDE.md` that has grown to over 400 lines, covering Python conventions, TypeScript conventions, infrastructure rules, and testing standards. Developers report that Claude sometimes applies the wrong conventions to the wrong files, and the file is difficult to maintain. What is the best approach to reorganize this configuration?

- **A) Split the content into multiple files in `.claude/rules/`, with each file covering a focused topic, and use path-scoped YAML frontmatter to activate rules only for relevant files.** ✅
- B) Create a separate `CLAUDE.md` in each top-level package directory and delete the root file entirely.
- C) Add inline section headers to the monolithic file and use the `/memory` command to tell Claude which section to prioritize for each task.
- D) Break the root `CLAUDE.md` into topic files and use `@import` directives in the root file to pull them all in unconditionally.

> **Answer: A.** 💡 **Remember:** The `.claude/rules/` directory is designed for exactly this scenario: organizing topic-specific rule files with YAML frontmatter path scoping so each rule set activates only when editing relevant files.

---

#### D3-29. `olivier-54`
<sub>**D3** · Task 3.1 · `olivier` · path 2 · `olivier-54`</sub>

You maintain a monorepo with five packages: a Python backend, a TypeScript frontend, a Go service, shared infrastructure Terraform, and a documentation site. Each package has different linting standards, testing conventions, and framework-specific rules. The root `CLAUDE.md` has grown to 600 lines and developers report that rules intended for one package often bleed into sessions working on another. What is the most modular and maintainable solution using CLAUDE.md configuration?

- **A) Create a `CLAUDE.md` in each package directory with that package's rules, and use `@import` in the root `CLAUDE.md` to include shared conventions that apply to all packages.** ✅
- B) Keep the 600-line root file but add explicit section headers and instruct developers to tell Claude which section applies at the start of each session.
- C) Delete the root `CLAUDE.md` and rely entirely on package-level files, accepting that shared conventions must be duplicated across packages.
- D) Move all rules into `.claude/rules/` files and tag each with a `projects:` key in their frontmatter specifying which subdirectory the rule applies to.

> **Answer: A.** 💡 **Remember:** The `@import` syntax in CLAUDE.md is designed for exactly this modular pattern: shared conventions in the root file, package-specific rules in each package's own `CLAUDE.md`, with the root file importing common standards that apply globally.

---

#### D3-30. `q-dep-004`
<sub>**D3** · Task 3.2 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-004`</sub>

You create a slash command `/fix-lint` in `.claude/commands/fix-lint.md`. The command should run ESLint on the current file and auto-fix issues. Which approach makes the command most reusable across different files?

- A) Hardcode the file path in the command definition.
- **B) Use `{args}` to accept the file path as an argument: `Run ESLint --fix on {args}`.** ✅
- C) Create separate commands for each file type: /fix-lint-js, /fix-lint-ts, etc.
- D) Store the target file path in localStorage and read it from the command.

> **Answer: B.** 💡 **Remember:** The `{args}` placeholder in a Claude Code slash command template is substituted with whatever text the user types after the command name.

---

#### D3-31. `q-mar-007`
<sub>**D3** · Task 3.2 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-007`</sub>

Your research system uses a Claude Code custom slash command `/research-query` that prompts the agent to decompose and execute a research workflow. The command should pass the user's query as an argument. What is the correct way to reference the argument inside the command definition?

- **A) Use `{args}` in the command template to insert the user's argument.** ✅
- B) The slash command cannot accept arguments — arguments must be added to the system prompt instead.
- C) Use `$1` shell-style argument syntax.
- D) Arguments are not supported in Claude Code slash commands; use a named configuration file instead.

> **Answer: A.** 💡 **Remember:** Claude Code slash command templates use `{args}` as the placeholder for arguments passed after the command name.

---

#### D3-32. `olivier-43`
<sub>**D3** · Task 3.2 · `olivier` · path 2 · `olivier-43`</sub>

A developer wants a `/scaffold` skill that generates boilerplate for a new microservice. The skill runs many exploratory file reads and Bash commands to understand existing patterns before generating output, producing hundreds of lines of intermediate output. Teammates complain this pollutes their main conversation context. Which frontmatter setting resolves this?

- A) Set `allowed-tools: []` in the skill's frontmatter to prevent tool use during execution.
- **B) Set `context: fork` in the skill's frontmatter to run the skill in an isolated sub-agent context that does not affect the main session.** ✅
- C) Move the skill file from `.claude/skills/` to `.claude/commands/` so it runs as a command rather than a skill.
- D) Add `argument-hint: "service-name"` to the frontmatter so the skill receives a clean input without inheriting session context.

> **Answer: B.** 💡 **Remember:** The `context: fork` frontmatter option runs the skill in an isolated sub-agent context.

---

#### D3-33. `q-ccd-011`
<sub>**D3** · Task 3.3 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-011`</sub>

Your CI/CD pipeline covers two repos: a Node.js frontend and a Go backend. Coding standards differ significantly. You want rules scoped precisely to each repo type. Using a single shared Claude Code configuration, what is the correct approach?

- A) Use a single root CLAUDE.md that lists all rules with language tags (## Node.js Rules, ## Go Rules) and rely on Claude to apply the right section.
- **B) Use separate CLAUDE.md files in the frontend/ and backend/ directories with path-specific rules; the root CLAUDE.md contains only cross-repo conventions.** ✅
- C) Maintain two completely separate repository configurations with no shared root.
- D) Use environment variables to toggle which rule set is active.

> **Answer: B.** 💡 **Remember:** Path-specific CLAUDE.md files in frontend/ and backend/ apply automatically when Claude Code operates in each subdirectory.

---

#### D3-34. `q-dep-005`
<sub>**D3** · Task 3.3 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-005`</sub>

Your repository has both Python and TypeScript code. The root CLAUDE.md has general rules. You want Python-specific linting conventions only when Claude works in `src/python/` and TypeScript conventions only when working in `src/ts/`. What is the cleanest implementation?

- A) Add both Python and TypeScript rules to the root CLAUDE.md with conditional language: "Apply Python rules only to .py files."
- **B) Create CLAUDE.md files inside src/python/ and src/ts/ with their respective conventions; the root CLAUDE.md stays general.** ✅
- C) Create a single CLAUDE.md with a section for each language and instruct Claude to read only the relevant section.
- D) Use environment variables to switch which CLAUDE.md file Claude Code reads at startup.

> **Answer: B.** 💡 **Remember:** Path-specific CLAUDE.md files are exactly the mechanism designed for this use case. When Claude Code operates in src/python/, it loads root/CLAUDE.md + src/python/CLAUDE.md — getting general + Python-specific rules.

---

#### D3-35. `olivier-44`
<sub>**D3** · Task 3.3 · `olivier` · path 2 · `olivier-44`</sub>

Your team uses Terraform for infrastructure but only in the `infra/` directory. You want Claude to automatically apply Terraform naming conventions and module structure rules only when editing `.tf` files, without those rules appearing in unrelated Python or TypeScript sessions. What is the correct approach?

- A) Create a `CLAUDE.md` file inside `infra/` that contains the Terraform rules so they apply only within that subdirectory.
- **B) Create a rules file in `.claude/rules/terraform.md` with YAML frontmatter specifying `paths: ["infra/**/*"]` and listing the Terraform conventions.** ✅
- C) Add the Terraform rules to the root `CLAUDE.md` under a clearly marked section, and instruct Claude in the system prompt to apply them only to `.tf` files.
- D) Create a skill in `.claude/skills/terraform.md` with `allowed-tools` restricted to file operations on the `infra/` directory.

> **Answer: B.** 💡 **Remember:** The `.claude/rules/` directory with YAML frontmatter path scoping is the correct mechanism for conditionally loading conventions.

---

#### D3-36. `olivier-6`
<sub>**D3** · Task 3.3 · `olivier` · path 2 · `olivier-6`</sub>

Your codebase has distinct areas with different conventions. Test files are spread throughout the codebase alongside the code they test. You want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?

- **A) Create rule files in `.claude/rules/` with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.** ✅
- B) Consolidate all conventions in the root `CLAUDE.md` file under headers for each area, relying on Claude to infer which section applies.
- C) Create skills in `.claude/skills/` for each code type that include the relevant conventions in their `SKILL.md` files.
- D) Place a separate `CLAUDE.md` file in each subdirectory containing that area's specific conventions.

> **Answer: A.** 💡 **Remember:** `.claude/rules/` with glob patterns (e.g., `**/*.test.tsx`) allows conventions to be automatically applied based on file paths regardless of directory location.

---

#### D3-37. `q-csa-007`
<sub>**D3** · Task 3.4 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-007`</sub>

A support team lead wants Claude Code to draft a multi-step refund workflow script that will interact with five different internal APIs. The task is well-defined. Should plan mode be used before execution?

- A) Yes — plan mode is required for all tasks involving external API calls to prevent unintended side effects.
- **B) Yes — the multi-step nature and multiple API interactions make this a strong candidate for plan-then-execute to get team lead sign-off before any writes occur.** ✅
- C) No — the task is well-defined so Claude should execute directly without a planning phase.
- D) No — plan mode only applies to infrastructure changes, not application code generation.

> **Answer: B.** 💡 **Remember:** Plan mode is the right choice when a task has multiple steps, touches multiple systems, and where a mistake would be hard to reverse.

---

#### D3-38. `q-dex-012`
<sub>**D3** · Task 3.4 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-012`</sub>

A data extraction job arrives: "Extract all financial obligations from this 50-page contract and format them in our standard template." Should plan mode be used?

- **A) No — the task is well-specified with a clear input and output format.** ✅
- B) Yes — the multi-step nature (reading a 50-page document, extracting multiple fields, formatting) warrants a plan to review before execution.
- C) Yes — all tasks involving external files must use plan mode.
- D) No — plan mode is only needed for tasks that modify production systems.

> **Answer: A.** 💡 **Remember:** This task has a clear input (50-page contract), clear objective (extract financial obligations), and a known output format (standard template).

---

#### D3-39. `olivier-45`
<sub>**D3** · Task 3.4 · `olivier` · path 2 · `olivier-45`</sub>

A developer asks Claude Code to add a single null-check to one function in a utility module. The function signature, expected behavior, and fix are all clear. Should they use plan mode or direct execution?

- A) Plan mode, because any code change could have unexpected side effects that need exploration before committing.
- **B) Direct execution, because the task is well-scoped with a clear fix that does not require architectural decisions or multi-file analysis.** ✅
- C) Plan mode, because exploring the codebase first prevents Claude from making assumptions about dependencies.
- D) Use direct execution first, but run a quick plan mode scan afterward to catch any side effects before committing.

> **Answer: B.** 💡 **Remember:** Direct execution is appropriate for simple, well-understood, single-location changes with clear scope.

---

#### D3-40. `olivier-46`
<sub>**D3** · Task 3.4 · `olivier` · path 2 · `olivier-46`</sub>

A developer is using plan mode to explore a large codebase before deciding how to approach a library migration. During exploration, Claude generates dozens of tool results including full file reads, search outputs, and dependency traces. The developer notices the main conversation context is filling up rapidly and fears context exhaustion before the plan is complete. What is the most appropriate technique to preserve main session context during verbose exploration?

- A) Switch to direct execution partway through exploration so that Claude uses fewer tool calls.
- **B) Use the Explore subagent to isolate verbose discovery output, having it return a structured summary to the main session rather than accumulating raw results.** ✅
- C) Run `/compact` immediately after each tool call to keep the context window from growing.
- D) Restrict Claude to reading only entry point files during plan mode to limit tool call volume.

> **Answer: B.** 💡 **Remember:** The Explore subagent is specifically designed to isolate verbose discovery work from the main conversation context.

---

#### D3-41. `q-mar-008`
<sub>**D3** · Task 3.5 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-008`</sub>

The research agent's first draft synthesis often misses connections between findings from different subagents. You want to use iterative refinement to improve it. What is the most effective single-pass refinement prompt?

- A) "Rewrite the synthesis to be more comprehensive."
- **B) "Review the synthesis and identify any claims from the market leaders section that contradict or reinforce claims in the technology trends section. Revise to make these connections explicit."** ✅
- C) "Make the synthesis longer by adding more detail to each section."
- D) "Rate the synthesis quality from 1-10 and suggest what is missing."

> **Answer: B.** 💡 **Remember:** Effective refinement prompts specify exactly what dimension to improve and how. Asking for cross-section connection analysis gives the model a concrete task: examine specific pairs of sections and surface relationships.

---

#### D3-42. `olivier-47`
<sub>**D3** · Task 3.5 · `olivier` · path 2 · `olivier-47`</sub>

A developer asks Claude Code to reformat date strings in a data pipeline. After the first attempt, the output format is partially correct but inconsistent: some dates are formatted as `YYYY-MM-DD`, others as `MM/DD/YYYY`. Prose instructions like "always use ISO 8601" have been tried twice without improvement. What technique is most likely to resolve the inconsistency?

- A) Rewrite the instruction to be more emphatic, using capitalization and repetition to signal importance.
- **B) Provide 2-3 concrete input/output examples showing the exact transformation expected, including edge cases like two-digit years and ambiguous formats.** ✅
- C) Switch to plan mode so Claude can explore the codebase before formatting dates.
- D) Ask Claude to generate a formatting function first, then apply it in a second pass.

> **Answer: B.** 💡 **Remember:** Concrete input/output examples are the most effective way to communicate expected transformations when prose instructions are interpreted inconsistently.

---

#### D3-43. `olivier-48`
<sub>**D3** · Task 3.5 · `olivier` · path 2 · `olivier-48`</sub>

A development team is using Claude Code to implement a new authentication module. Before any implementation begins, the team lead wants to ensure Claude surfaces potential security considerations, edge cases, and design tradeoffs that the team may not have anticipated. Which iterative refinement technique is most appropriate here?

- A) Write a detailed specification document and pass it to Claude for direct implementation.
- **B) Use the interview pattern: ask Claude to question the team about their requirements, constraints, and assumptions before proposing a design.** ✅
- C) Start with a minimal implementation and iterate by describing issues found during code review.
- D) Provide a complete test suite first and ask Claude to write code that passes all tests.

> **Answer: B.** 💡 **Remember:** The interview pattern is designed to surface design considerations and uncover assumptions the developer may not have anticipated before any implementation begins.

---

#### D3-44. `olivier-49`
<sub>**D3** · Task 3.5 · `olivier` · path 2 · `olivier-49`</sub>

Claude Code generated a data transformation function that has three separate issues: an off-by-one error in a loop, a missing null check for an optional field, and an incorrect sort order. Each issue is in a completely different part of the function and none of them interact. What is the recommended approach for addressing these issues?

- A) Report all three issues in a single detailed message so Claude has full context for all fixes at once.
- **B) Fix them sequentially: address each issue in a separate message and verify the fix before moving to the next.** ✅
- C) Ask Claude to regenerate the entire function from scratch rather than patching the existing code.
- D) Address the off-by-one error and null check together since they are in loops, then fix the sort order separately.

> **Answer: B.** 💡 **Remember:** When issues are independent, sequential iteration is appropriate: fixing each one separately and verifying the fix before moving on reduces the chance of fixes interfering with each other and makes each change easier to review.

---

#### D3-45. `olivier-51`
<sub>**D3** · Task 3.5 · `olivier` · path 2 · `olivier-51`</sub>

A developer has identified three issues in a data processing module: two logic bugs that interact because they both affect the same intermediate result, and a set of five inconsistent variable names scattered across multiple files. The logic bugs produce incorrect output only when both are present; the naming violations are independent style issues. How should these issues be addressed using iterative refinement?

- A) Report all eight issues in a single message so Claude can resolve them together with full context.
- **B) Send the two interacting logic bugs in one message so Claude can resolve them together, then address the naming violations sequentially in separate follow-up messages after verifying the bug fixes.** ✅
- C) Fix all naming violations first since they are simpler, then tackle the two logic bugs in a single message.
- D) Fix each of the eight issues in eight separate sequential messages, verifying each before proceeding.

> **Answer: B.** 💡 **Remember:** The guidance for batching issues is based on whether they interact. The two logic bugs interact and Claude needs full context on both to resolve them correctly, so they should be reported together.

---

#### D3-46. `olivier-52`
<sub>**D3** · Task 3.5 · `olivier` · path 2 · `olivier-52`</sub>

A team is adding a caching layer to an existing microservice. The service was written two years ago by engineers who are no longer on the team, and its internal patterns for dependency injection and lifecycle management are unfamiliar to the current developer. Before writing any code, the developer wants to ensure Claude surfaces all relevant design considerations. Which iterative refinement technique is most appropriate?

- A) Ask Claude to implement a generic Redis-based caching layer using standard patterns for the framework, then review its output for compatibility issues.
- **B) Use the interview pattern: ask Claude to question you about the service's architecture, existing lifecycle hooks, and caching requirements before proposing any design.** ✅
- C) Provide the service's entry point files to Claude and ask it to generate a caching design document for review.
- D) Start with a minimal proof-of-concept cache for one endpoint and iterate by describing any failures encountered during testing.

> **Answer: B.** 💡 **Remember:** The interview pattern is specifically designed for situations where the developer may not have anticipated all relevant design considerations.

---

#### D3-47. `q-ccd-002`
<sub>**D3** · Task 3.6 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-002`</sub>

Your GitHub Actions CI review workflow runs `claude -p "Review this PR diff: $(git diff HEAD~1)"`. On large PRs, the diff exceeds the shell argument length limit and the command fails. What is the correct fix?

- A) Increase the shell's ARG_MAX limit to accommodate larger diffs.
- **B) Write the diff to a temporary file and pass the file path to Claude using stdin or a file-based input method.** ✅
- C) Split the diff into 10KB chunks and run claude multiple times.
- D) Use the GitHub API to fetch the diff instead of git diff.

> **Answer: B.** 💡 **Remember:** Writing large inputs to a file and piping them via stdin (e.g., `git diff HEAD~1 | claude -p "Review this diff" --stdin`) or passing a file path avoids shell argument length limits.

---

#### D3-48. `q-csa-015`
<sub>**D3** · Task 3.6 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-015`</sub>

You are integrating Claude Code into a GitHub Actions pipeline that runs on every support agent code change. The workflow calls `claude -p "Review this diff for tool schema regressions"`. The pipeline sometimes times out after 4 minutes. What is the most likely cause?

- A) The GitHub Actions runner does not have internet access to reach the Claude API.
- B) The -p flag is invalid for non-interactive CI use — use --prompt instead.
- **C) The diff passed to Claude contains a large file that inflates the prompt beyond what completes in CI time budget, causing the API call to run long.** ✅
- D) GitHub Actions kills processes that produce no stdout for 2 minutes, but Claude buffers output until completion.

> **Answer: C.** 💡 **Remember:** In CI environments, large diffs (e.g., auto-generated files, lockfiles, large data files) dramatically increase prompt size and response time.

---

#### D3-49. `q-dep-006`
<sub>**D3** · Task 3.6 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-006`</sub>

You integrate Claude Code into GitHub Actions using `claude -p "..."` in a non-interactive step. The step exits with code 0 but produces no output. The workflow shows no review comments. What is the most likely cause?

- A) The -p flag only works in interactive mode and silently does nothing in CI.
- **B) The ANTHROPIC_API_KEY environment variable is not set in the Actions environment, causing silent failure.** ✅
- C) Claude Code requires a CLAUDE.md file to be present to operate in CI.
- D) The output was sent to stderr instead of stdout and the workflow capture is missing 2>&1.

> **Answer: B.** 💡 **Remember:** A missing ANTHROPIC_API_KEY causes the Claude Code CLI to fail silently in some configurations — it exits 0 but produces no output.

---

#### D3-50. `olivier-50`
<sub>**D3** · Task 3.6 · `olivier` · path 2 · `olivier-50`</sub>

A CI pipeline runs Claude Code to generate test cases for each pull request. The team discovers that Claude is consistently suggesting test scenarios that already exist in the existing test files, wasting review time. Which approach in the CLAUDE.md configuration most directly addresses this problem?

- A) Add the `-p` flag to the CI invocation command to prevent interactive prompts.
- B) Use `--output-format json` with `--json-schema` so that test suggestions are machine-parseable for deduplication.
- **C) Document in `CLAUDE.md` the testing standards, available fixtures, and instruct Claude to review existing test files before suggesting new scenarios.** ✅
- D) Add a post-processing script to the pipeline that compares Claude's suggestions against the existing test files and filters duplicates.

> **Answer: C.** 💡 **Remember:** Providing existing test files in context and documenting testing standards in `CLAUDE.md` directly instructs Claude to avoid duplicate suggestions at generation time.

---

#### D3-51. `olivier-53`
<sub>**D3** · Task 3.6 · `olivier` · path 2 · `olivier-53`</sub>

A CI pipeline uses Claude Code to review pull requests and needs to post inline comments on specific lines in GitHub. The pipeline currently receives Claude's output as unstructured text, which requires a fragile regex parser to extract file paths, line numbers, and comment text. The parser breaks regularly as Claude's output format drifts between runs. What is the most robust solution?

- A) Add stricter formatting instructions to the system prompt specifying the exact text structure expected, and add validation to reject any response that does not match.
- **B) Use `--output-format json` combined with `--json-schema` to define a schema with `file`, `line`, and `comment` fields, so each finding is machine-parseable by construction.** ✅
- C) Add a post-processing step that uses a second Claude call to normalize the first response into a consistent structured format.
- D) Switch from inline comments to a single summary comment, which is easier to extract since it does not require line-level parsing.

> **Answer: B.** 💡 **Remember:** Using `--output-format json` with `--json-schema` produces structured output that conforms to the defined schema by construction, eliminating format drift entirely.

---


<a name="domain-4"></a>
## Domain 4: Prompt Engineering & Structured Output (20%)

*55 questions*

#### D4-1. `dnacenta-d4-10`
<sub>**D4** · `dnacenta` · path 2 · `dnacenta-d4-10`</sub>

A code review system flags "use your best judgment" as a criterion for reporting issues. What should be changed?

- A) Add more examples of past reviews
- **B) Replace with explicit criteria defining exactly what qualifies as a reportable issue** ✅
- C) Increase the model's temperature for more nuanced judgment
- D) Add a confidence score threshold

> **Answer: B.** 💡 **Remember:** Vague instructions like "use your best judgment" produce inconsistent results. Replace with explicit criteria that define exactly what qualifies and what doesn't.

---

#### D4-2. `dnacenta-d4-11`
<sub>**D4** · `dnacenta` · path 2 · `dnacenta-d4-11`</sub>

An invoice extraction system uses strict mode but sometimes returns a total that doesn't match the sum of line items. What's happening?

- A) Strict mode is broken
- B) The schema is misconfigured
- **C) Strict mode guarantees schema compliance, not semantic correctness** ✅
- D) The model needs fine-tuning

> **Answer: C.** 💡 **Remember:** Strict mode ensures the output conforms to the JSON schema (correct types, required fields) but cannot validate semantic correctness (whether the math adds up).

---

#### D4-3. `dnacenta-d4-12`
<sub>**D4** · `dnacenta` · path 2 · `dnacenta-d4-12`</sub>

A batch processing job has 1,000 documents. 50 fail. What's the correct approach?

- A) Resubmit the entire batch of 1,000
- **B) Use `custom_id` to identify and resubmit only the 50 failed documents** ✅
- C) Switch to synchronous processing
- D) Increase the batch timeout

> **Answer: B.** 💡 **Remember:** Use `custom_id` to correlate requests with responses and resubmit only the failures. Resubmitting the entire batch wastes credits and reprocesses already-successful documents.

---

#### D4-4. `sgrid-test-07-prompt-engineering-61`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-61`</sub>

Your automated code review flags 40% false positives, primarily in the "comment accuracy" category. Developers have stopped trusting the review output entirely, including the accurate bug and security findings. What is the most effective immediate action?

- A) Add "be more conservative" to the review prompt.
- B) Add "only report high-confidence findings" to reduce output volume.
- **C) Temporarily disable the high false-positive category (comment accuracy) to restore developer trust while improving prompts for that category separately.** ✅
- D) Switch to a more capable model that will naturally produce fewer false positives.

> **Answer: C.** 💡 **Remember:** High false positive rates in one category undermine confidence in all categories. The most effective immediate action is to disable the problematic category, restoring trust in the remaining accurate findings.

---

#### D4-5. `sgrid-test-07-prompt-engineering-62`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-62`</sub>

Your code review prompt says "check that comments are accurate." This produces many false positives where Claude flags comments that are technically imprecise but not misleading. How should you refine the prompt?

- A) Change to "carefully check that comments are accurate, being conservative in your findings."
- **B) Replace with explicit criteria: "Flag comments only when the claimed behavior directly contradicts the actual code behavior. Do not flag comments that are merely incomplete or use imprecise terminology."** ✅
- C) Remove comment checking entirely since it is unreliable.
- D) Add a confidence threshold: "Only flag comments you are 95% confident are wrong."

> **Answer: B.** 💡 **Remember:** Explicit criteria defining what to flag (contradictory behavior) and what to skip (imprecise but not misleading) directly addresses the false positive source.

---

#### D4-6. `sgrid-test-07-prompt-engineering-63`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-63`</sub>

Your extraction pipeline produces inconsistently formatted output despite detailed prose instructions. Some extractions use bullet points, others use paragraphs, and field ordering varies. What technique most effectively achieves format consistency?

- A) Add more detailed formatting instructions with specific markdown templates.
- **B) Include 2-4 few-shot examples demonstrating the exact desired output format (location, issue, severity, suggested fix).** ✅
- C) Post-process the output to enforce formatting.
- D) Use a stricter system prompt tone.

> **Answer: B.** 💡 **Remember:** Few-shot examples are the most effective technique for achieving consistently formatted output.

---

#### D4-7. `sgrid-test-07-prompt-engineering-64`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-64`</sub>

Your tool selection prompt has few-shot examples for common scenarios but fails on ambiguous requests that do not match any example. How should you improve the few-shot examples?

- A) Add more examples (20+) to cover every possible scenario.
- **B) Create 2-4 targeted examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives.** ✅
- C) Remove few-shot examples and rely on tool descriptions only.
- D) Add a catch-all example: "When in doubt, ask the user for clarification."

> **Answer: B.** 💡 **Remember:** Few-shot examples for ambiguous cases should include reasoning explaining why one choice was made over alternatives.

---

#### D4-8. `sgrid-test-07-prompt-engineering-65`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-65`</sub>

You need to extract structured data (invoice number, line items, total, vendor name) from PDF invoices. The model occasionally returns JSON with syntax errors. What is the most reliable approach to guarantee schema-compliant output?

- A) Add "Return valid JSON" to the prompt and parse the text response.
- **B) Use `tool_use` with a JSON schema defining the extraction fields. Extract data from the `tool_use` response.** ✅
- C) Use regex to fix common JSON syntax errors in the model's text output.
- D) Ask the model to validate its own JSON before returning it.

> **Answer: B.** 💡 **Remember:** `tool_use` with JSON schemas is the most reliable approach for guaranteed schema-compliant structured output.

---

#### D4-9. `sgrid-test-07-prompt-engineering-66`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-66`</sub>

You have three document types (invoices, contracts, receipts), each with a different extraction schema. Documents arrive without type labels. Which `tool_choice` configuration ensures the model always produces structured output while choosing the correct schema?

- A) `tool_choice: "auto"` -- the model decides whether to use a tool.
- **B) `tool_choice: "any"` -- the model must call a tool but can choose which extraction schema.** ✅
- C) Force a specific tool: `tool_choice: {"type": "tool", "name": "extract_invoice"}`.
- D) Define all three schemas as one tool with conditional fields.

> **Answer: B.** 💡 **Remember:** `tool_choice: "any"` guarantees the model calls a tool (structured output) while allowing it to choose which extraction tool (invoice, contract, or receipt) based on the document content.

---

#### D4-10. `sgrid-test-07-prompt-engineering-67`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-67`</sub>

Your extraction schema has a `vendor_address` field marked as `required`. When processing invoices that do not include a vendor address, the model fabricates plausible addresses. How should you fix this?

- A) Add "Do not make up addresses" to the prompt.
- **B) Make `vendor_address` optional (nullable) in the schema so the model can return null when the information is absent.** ✅
- C) Add post-processing that validates addresses against a database.
- D) Remove the field entirely since not all invoices have it.

> **Answer: B.** 💡 **Remember:** When source documents may not contain certain information, schema fields should be optional/nullable.

---

#### D4-11. `sgrid-test-07-prompt-engineering-68`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-68`</sub>

Your extraction pipeline needs to categorize documents into types. Most documents fit into 5 known categories, but occasionally a new category appears. How should you design the enum field?

- A) Use a strict enum with only the 5 known categories.
- **B) Use an enum with the 5 known categories plus `"other"`, and add a separate `category_detail` string field for describing novel categories.** ✅
- C) Use a free-text string field instead of an enum.
- D) Add new enum values whenever a new category is discovered.

> **Answer: B.** 💡 **Remember:** The `"other"` + detail string pattern provides extensible categorization. Known categories get clean enum classification.

---

#### D4-12. `sgrid-test-07-prompt-engineering-69`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-69`</sub>

What is the key limitation of using `tool_use` with JSON schemas for structured output?

- A) It cannot handle nested objects or arrays.
- **B) It eliminates JSON syntax errors but does not prevent semantic errors (e.g., line items that do not sum to the total, values placed in wrong fields).** ✅
- C) It is slower than text-based extraction.
- D) It only works with simple flat schemas.

> **Answer: B.** 💡 **Remember:** Tool use with strict JSON schemas guarantees syntactically valid output matching the schema structure.

---

#### D4-13. `sgrid-test-07-prompt-engineering-70`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-07-prompt-engineering-70`</sub>

You need to extract metadata from documents before running enrichment tools. The metadata extraction MUST happen first. How do you configure this?

- A) Add "Always extract metadata first" to the system prompt.
- **B) Use `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the first API call, then switch to `tool_choice: "auto"` for subsequent calls.** ✅
- C) List `extract_metadata` first in the tools array.
- D) Use `tool_choice: "any"` and hope the model chooses metadata extraction first.

> **Answer: B.** 💡 **Remember:** Forced tool selection ensures a specific tool is called in a specific turn. For the first turn, force `extract_metadata`.

---

#### D4-14. `sgrid-test-08-validation-multipass-71`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-71`</sub>

Your extraction pipeline fails validation on 15% of documents. You implement a retry loop that resends the request with the same prompt. The retry success rate is only 10%. How should you improve the retry strategy?

- A) Increase the number of retries from 1 to 5.
- **B) Append the specific validation errors to the retry prompt, including the original document, the failed extraction, and what went wrong, so the model can self-correct.** ✅
- C) Switch to a more capable model for retries.
- D) Lower the validation strictness to accept more extractions.

> **Answer: B.** 💡 **Remember:** Retry-with-error-feedback is the effective pattern: include the original document, the failed extraction, and the specific validation errors in the retry prompt.

---

#### D4-15. `sgrid-test-08-validation-multipass-72`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-72`</sub>

Your retry loop shows that 30% of failures are due to missing information in the source document (e.g., no vendor phone number), not extraction errors. The retry keeps failing on these documents. What should you do?

- A) Add more retries -- eventually the model might find the information.
- **B) Identify when retries will be ineffective (information absent from source) versus when they will succeed (format mismatches, structural errors), and skip retries for absent-information failures.** ✅
- C) Have the model hallucinate plausible values to fill the gaps.
- D) Return a partial extraction with error messages for each retry failure.

> **Answer: B.** 💡 **Remember:** Retries are effective for format mismatches and structural output errors but ineffective when the required information simply does not exist in the source document.

---

#### D4-16. `sgrid-test-08-validation-multipass-73`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-73`</sub>

Your code review system flags findings that developers frequently dismiss. You want to understand which code patterns trigger false positives so you can improve the prompts. What should you add to the structured output?

- A) A confidence score for each finding.
- **B) A `detected_pattern` field that records which code construct triggered the finding, enabling systematic analysis of dismissal patterns.** ✅
- C) A "priority" field that ranks findings by importance.
- D) A "false_positive_likelihood" estimate.

> **Answer: B.** 💡 **Remember:** Adding a `detected_pattern` field creates a feedback loop: when developers dismiss findings, you can analyze which code patterns consistently trigger false positives and refine prompts to handle those patterns correctly.

---

#### D4-17. `sgrid-test-08-validation-multipass-74`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-74`</sub>

Your extraction includes a `stated_total` field from the invoice and individual `line_items` with amounts. In 5% of cases, the line items do not sum to the stated total, but both values are accurately extracted from the document. How should you handle this?

- A) Automatically adjust line items to match the total.
- **B) Extract `calculated_total` (sum of line items) alongside `stated_total` and add a `conflict_detected` boolean. Flag discrepancies for human review.** ✅
- C) Discard the extraction and retry.
- D) Always trust the stated total and ignore line item amounts.

> **Answer: B.** 💡 **Remember:** Self-correction validation flows should extract both values, compare them, and flag discrepancies.

---

#### D4-18. `sgrid-test-08-validation-multipass-75`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-75`</sub>

Your team runs two workflows: (1) pre-merge code review that blocks PRs until complete, and (2) weekly codebase audit reports reviewed Monday morning. Your manager wants to switch both to the Message Batches API for 50% cost savings. What is the correct assessment?

- A) Switch both -- the cost savings justify the latency.
- **B) Switch the weekly audit to batch processing; keep pre-merge reviews as synchronous API calls. Batch processing has up to 24-hour processing time with no guaranteed latency SLA.** ✅
- C) Keep both synchronous -- batch results cannot be correlated with original requests.
- D) Switch both to batch with polling fallback.

> **Answer: B.** 💡 **Remember:** The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA.

---

#### D4-19. `sgrid-test-08-validation-multipass-76`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-76`</sub>

You submit 100 documents as a batch. 95 succeed and 5 fail: 3 due to oversized context and 2 due to transient server errors. How should you handle the failures?

- A) Resubmit the entire batch of 100 documents.
- **B) Resubmit only the 5 failed documents (identified by `custom_id`), chunking the oversized ones and retrying the transient failures without modification.** ✅
- C) Discard the 5 failures and report results for the 95 successes only.
- D) Wait 24 hours and resubmit the 5 failures without changes.

> **Answer: B.** 💡 **Remember:** Use `custom_id` to identify failed documents and resubmit only those. Apply appropriate modifications: chunk the 3 oversized documents (address the root cause) and retry the 2 transient failures without modification (since the error was temporary).

---

#### D4-20. `sgrid-test-08-validation-multipass-77`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-77`</sub>

You want to batch-process 1000 documents with a 30-hour SLA (results needed within 30 hours of submission). The batch API has up to 24-hour processing time. How should you structure submissions?

- A) Submit all 1000 at once -- 24 hours is within the 30-hour SLA.
- **B) Submit in windows that account for processing time plus failure handling time (e.g., 4-hour submission windows to guarantee time for resubmission of failures within the SLA).** ✅
- C) Submit in batches of 10 every hour.
- D) Use synchronous API to guarantee timing.

> **Answer: B.** 💡 **Remember:** With a 24-hour batch processing window and a 30-hour SLA, you need to account for the possibility that some documents will fail and need resubmission.

---

#### D4-21. `sgrid-test-08-validation-multipass-78`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-78`</sub>

Before batch-processing 10,000 documents, what should you do first to maximize efficiency?

- A) Submit all 10,000 immediately to start processing as quickly as possible.
- **B) Run prompt refinement on a sample set first to maximize first-pass success rates and reduce iterative resubmission costs.** ✅
- C) Split into 10 batches of 1,000 and submit them all simultaneously.
- D) Process the first 100 synchronously, then batch the rest.

> **Answer: B.** 💡 **Remember:** Testing and refining prompts on a small sample before batch-processing large volumes maximizes first-pass success rates.

---

#### D4-22. `sgrid-test-08-validation-multipass-79`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-79`</sub>

A PR modifies 14 files. Your single-pass review produces detailed feedback for some files, superficial comments for others, and contradictory findings -- flagging a pattern as problematic in one file while approving identical code elsewhere. What is the root cause?

- A) The model cannot handle 14 files.
- **B) Attention dilution: when processing many files at once, the model gives inconsistent depth and may not notice the same pattern appearing in different files.** ✅
- C) The review prompt is too short.
- D) The files are too similar, confusing the model.

> **Answer: B.** 💡 **Remember:** Attention dilution occurs when the model processes too much content at once, leading to inconsistent depth across files and contradictory findings.

---

#### D4-23. `sgrid-test-08-validation-multipass-80`
<sub>**D4** · `sgrid` · path 2 · `sgrid-test-08-validation-multipass-80`</sub>

A code review system uses Claude to both generate code and review it in the same session. Adding "review your code critically" or enabling extended thinking does not improve review quality. What architectural change is needed?

- A) Use a more detailed review prompt in the same session.
- **B) Use a second independent Claude instance (without the generator's reasoning context) to review the code.** ✅
- C) Have the model review the code twice in the same session.
- D) Add a checklist of common issues to the review prompt.

> **Answer: B.** 💡 **Remember:** Self-review within the same session is limited because the model retains its generation reasoning context, making it biased toward confirming its own decisions.

---

#### D4-24. `q-ccd-004`
<sub>**D4** · Task 4.1 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-004`</sub>

A CI code review agent flags issues as: security, correctness, performance, style, or documentation. You observe it flagging all TODO comments as "documentation" issues with medium severity. You want TODO comments flagged only if they reference unresolved bugs. What prompt change is correct?

- **A) Add: "Flag TODO comments only when they contain a bug reference (e.g., 'TODO: fix bug #123' or 'TODO: this breaks when...'). Do not flag TODO comments that are general reminders or future work notes."** ✅
- B) Remove "documentation" from the category list.
- C) Lower the default severity for all documentation issues to low.
- D) Add a post-processing filter that removes all TODO-related findings.

> **Answer: A.** 💡 **Remember:** Precise criteria with positive examples of when to flag and negative examples of when not to directly address the over-flagging problem.

---

#### D4-25. `q-csa-008`
<sub>**D4** · Task 4.1 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-008`</sub>

Your agent classifies customer intent as one of: refund_request, escalation_request, status_inquiry, general_question, or abuse_report. You observe it labeling some polite but firm refund requests as escalation_request. What prompt change best reduces this false positive?

- **A) Add a rule: "Classify as escalation_request only when the customer explicitly uses words like 'manager', 'supervisor', or 'formal complaint'."** ✅
- B) Merge escalation_request and refund_request into a single category to eliminate the boundary.
- C) Increase the temperature parameter to make classifications more decisive.
- D) Add a second classification pass that reviews all escalation_request labels and downgrades ambiguous ones.

> **Answer: A.** 💡 **Remember:** Adding explicit, observable criteria for when to use a category reduces false positives at the boundary.

---

#### D4-26. `q-dep-008`
<sub>**D4** · Task 4.1 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-008`</sub>

A code review agent classifies issues as: security_vulnerability, performance_issue, style_violation, or logical_bug. You observe it tagging N+1 database query patterns as performance_issue instead of logical_bug. What prompt change is most effective?

- **A) Add: "N+1 query patterns should be classified as logical_bug because they represent incorrect algorithmic design, not just inefficiency."** ✅
- B) Remove the performance_issue category to force all performance-related issues into logical_bug.
- C) Add a confidence threshold so low-confidence classifications default to logical_bug.
- D) Add more examples of performance_issue to the prompt so the model better distinguishes them.

> **Answer: A.** 💡 **Remember:** Providing explicit boundary criteria for ambiguous categories is the most targeted fix.

---

#### D4-27. `q-dex-001`
<sub>**D4** · Task 4.1 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-001`</sub>

An extraction agent classifies contract clauses as: indemnification, limitation_of_liability, ip_ownership, confidentiality, or other. You see it classifying mutual NDA clauses as ip_ownership because they restrict IP disclosure. What is the most targeted fix?

- **A) Add a rule: "Classify as confidentiality when the clause restricts disclosure of information between parties, even if it mentions intellectual property."** ✅
- B) Merge ip_ownership and confidentiality into a single category.
- C) Add more ip_ownership examples to the few-shot prompt.
- D) Add a post-classification review step that re-reads all ip_ownership results.

> **Answer: A.** 💡 **Remember:** The NDA misclassification is a boundary problem: the clause mentions IP (triggering ip_ownership) but its purpose is controlling disclosure (confidentiality).

---

#### D4-28. `olivier-55`
<sub>**D4** · Task 4.1 · `olivier` · path 2 · `olivier-55`</sub>

A CI code review prompt flags 60% of pull requests for "potential security vulnerabilities." Developers have stopped reading the reports because nearly all flags are false positives on standard input validation patterns they consider acceptable. Adding "only report high-confidence findings" to the prompt has had no measurable effect. What is the most effective next step?

- A) Replace the security review prompt with a rule-based static analysis tool that has zero false positives.
- **B) Temporarily disable the security category and add explicit criteria defining which patterns constitute a reportable vulnerability versus acceptable practice, with concrete code examples for each.** ✅
- C) Increase the review model to a larger tier to improve its judgment on security issues.
- D) Add a post-processing confidence threshold: discard any finding where Claude rates its own confidence below 80%.

> **Answer: B.** 💡 **Remember:** General instructions like "only report high-confidence findings" fail to reduce false positives because they do not define what counts as a positive.

---

#### D4-29. `olivier-56`
<sub>**D4** · Task 4.1 · `olivier` · path 2 · `olivier-56`</sub>

A Claude-based pull request reviewer raises "magic number" warnings on every numeric literal in the codebase, including well-understood constants like HTTP status codes and standard buffer sizes. Developers want magic numbers flagged only when they appear in business logic with no explanation. How should the prompt be updated?

- A) Add an instruction to "use good judgment about whether numbers are truly magic numbers."
- **B) Define explicit criteria: flag numeric literals that appear in business logic calculations with no accompanying comment or named constant; exclude HTTP status codes, standard buffer sizes, and any value documented in a comment.** ✅
- C) Add a severity field to findings and instruct Claude to omit any finding with severity "low."
- D) Provide a list of allowed numeric values that should never be flagged.

> **Answer: B.** 💡 **Remember:** Explicit, specific criteria that define what to report and what to exclude are far more effective than general guidance or exclusion lists.

---

#### D4-30. `olivier-57`
<sub>**D4** · Task 4.1 · `olivier` · path 2 · `olivier-57`</sub>

A Claude-based code reviewer is generating inconsistent feedback on documentation quality: sometimes flagging missing docstrings for private helper functions, sometimes not; sometimes requiring full parameter descriptions, sometimes accepting one-line summaries. The team wants consistent, predictable documentation feedback on public API functions only. Which change most directly addresses the inconsistency?

- A) Instruct Claude to "apply documentation standards consistently and carefully."
- **B) Define explicit documentation criteria: public API functions must have a docstring with a one-sentence summary, parameter descriptions, and return value description; private functions are excluded from documentation checks.** ✅
- C) Run three parallel review instances and accept feedback that appears in at least two of the three.
- D) Restrict the review prompt to only one concern at a time, alternating between security, documentation, and style in separate runs.

> **Answer: B.** 💡 **Remember:** Explicit criteria that specify exactly what is required, for which functions, and at what level of detail eliminate the ambiguity that causes inconsistency.

---

#### D4-31. `q-ccd-005`
<sub>**D4** · Task 4.2 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-005`</sub>

You want the CI review agent to identify SQL injection vulnerabilities. You have 3 labeled examples from past reviews. How should examples be structured to be most effective?

- A) Show 3 examples of vulnerable code snippets, labeled as "SQL injection vulnerability."
- **B) Show 3 pairs: (vulnerable snippet → correct finding) AND (safe snippet → "no issue"), so the model learns both sides of the boundary.** ✅
- C) Show 3 examples of safe code snippets, labeled as "no issue", to calibrate false positives.
- D) Show 3 examples of the structured output format only, without example inputs.

> **Answer: B.** 💡 **Remember:** The most effective few-shot examples for a classifier show both positive cases (vulnerable code → issue) and negative cases (safe code → no issue).

---

#### D4-32. `q-dex-002`
<sub>**D4** · Task 4.2 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-002`</sub>

You are building a pipeline that extracts payment terms from invoices. You have 4 high-quality labeled examples. You want to add them as few-shot demonstrations. Which format produces the highest extraction consistency?

- A) Include all 4 examples in the system prompt as a reference section.
- **B) Include all 4 examples as user/assistant turn pairs in the conversation, immediately before the extraction request.** ✅
- C) Include 2 examples in the system prompt and 2 in the conversation.
- D) Include examples as XML-tagged blocks inside the user message alongside the document.

> **Answer: B.** 💡 **Remember:** Few-shot examples placed as user/assistant turn pairs in the conversation immediately before the task request are most effective because they create a clear pattern the model conditions on with high recency weight.

---

#### D4-33. `q-mar-009`
<sub>**D4** · Task 4.2 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-009`</sub>

The research system needs to extract a structured competitive analysis from analyst reports. You have 5 high-quality example extractions from past reports. How should few-shot examples be positioned for maximum effect?

- A) Place all 5 examples at the end of the prompt, after the target document to analyze.
- B) Place all 5 examples in the system prompt as background context.
- **C) Place examples in the conversation as alternating user/assistant turns before the target document, in the human turn before the final request.** ✅
- D) Randomly distribute the 5 examples throughout the prompt to expose the model to varied positions.

> **Answer: C.** 💡 **Remember:** Few-shot examples are most effective when placed as user/assistant turn pairs in the conversation history immediately before the task request.

---

#### D4-34. `olivier-58`
<sub>**D4** · Task 4.2 · `olivier` · path 2 · `olivier-58`</sub>

A team uses Claude to generate code review comments for pull requests. The comments are technically accurate but vary widely in format: some include file paths and line numbers, others are vague summaries, some use bullet points, and others write prose paragraphs. Developers want a consistent, actionable format: file path, line number, issue description, suggested fix. What is the most effective way to achieve this?

- A) Add a format specification to the system prompt listing the required fields.
- **B) Provide 2-4 few-shot examples in the prompt showing the exact desired output format for different types of issues, including file path, line number, issue description, and suggested fix.** ✅
- C) Use `--output-format json` and parse the results in a post-processing step to normalize format.
- D) Ask Claude to self-review its output and reformat any comment that does not match the required structure.

> **Answer: B.** 💡 **Remember:** Few-shot examples demonstrating the exact desired output format are the most effective technique for achieving consistently formatted output when detailed instructions alone produce inconsistent results.

---

#### D4-35. `olivier-59`
<sub>**D4** · Task 4.2 · `olivier` · path 2 · `olivier-59`</sub>

A structured data extraction system is extracting contract clauses from legal documents. The model handles standard clauses well but consistently misclassifies ambiguous clauses that could fit two or more categories, such as a clause that contains both termination conditions and force majeure language. What few-shot prompting approach is most effective for improving accuracy on these edge cases?

- A) Add more few-shot examples of standard, unambiguous clauses to reinforce the classification schema overall.
- **B) Create targeted few-shot examples that specifically demonstrate ambiguous-case handling: showing the reasoning for why a clause with both termination and force majeure language belongs to one category and not the other.** ✅
- C) Switch from classification to extraction: ask Claude to extract the clause text without categorizing it, then apply a rule-based classifier.
- D) Add a confidence score field and route all low-confidence classifications to human review without attempting to improve the model's judgment.

> **Answer: B.** 💡 **Remember:** Targeted few-shot examples for ambiguous scenarios that show the reasoning behind the classification decision are the most effective technique for improving handling of edge cases.

---

#### D4-36. `olivier-60`
<sub>**D4** · Task 4.2 · `olivier` · path 2 · `olivier-60`</sub>

A document extraction system uses Claude to pull financial figures from quarterly earnings reports. The reports have varied formats: some use tables, some use inline prose, some use both. Extraction accuracy for tabular data is high (94%) but prose-only documents show only 72% accuracy. What is the most targeted approach to improve prose extraction accuracy?

- A) Increase the system prompt's emphasis on accuracy with stronger language and more detailed instructions.
- **B) Add few-shot examples specifically showing correct extraction from prose-formatted documents, including cases where numbers appear in sentence form rather than tables.** ✅
- C) Pre-process all documents to convert prose financial data into table format before sending to Claude.
- D) Use a separate prompt for prose documents that instructs Claude to first identify all sentences containing numbers, then extract figures from those sentences only.

> **Answer: B.** 💡 **Remember:** Few-shot examples demonstrating correct extraction from documents with varied formats directly address the accuracy gap on prose documents.

---

#### D4-37. `q-ccd-006`
<sub>**D4** · Task 4.3 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-006`</sub>

The CI review agent must post comments in a structured format with fields: `file`, `line_start`, `line_end`, `severity`, `category`, `message`, `suggestion`. You see it sometimes omitting `suggestion` for fixable issues. What is the most reliable fix?

- A) Add to the prompt: "Always include a suggestion field, even if it says 'no suggestion available'."
- **B) Make suggestion a required field in the tool's JSON schema, with a minimum length of 10 characters.** ✅
- C) Add a post-processing step that adds a generic suggestion if the field is missing.
- D) Run a second pass that specifically asks the agent to add suggestions to all findings.

> **Answer: B.** 💡 **Remember:** Making suggestion a required field with a minimum length in the JSON schema enforces the constraint at the API level.

---

#### D4-38. `q-csa-009`
<sub>**D4** · Task 4.3 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-009`</sub>

You need the agent to always return its ticket analysis in a JSON object with fields: `category`, `priority`, `sentiment`, and `recommended_action`. Which approach most reliably enforces this structure?

- A) Instruct the agent in the system prompt: "Always respond in JSON with these fields."
- **B) Define a tool `submit_analysis(category, priority, sentiment, recommended_action)` and set tool_choice to force its use.** ✅
- C) Use a regex post-processor that extracts JSON from the response text.
- D) Ask the agent to respond in XML instead, which is more structured than JSON.

> **Answer: B.** 💡 **Remember:** Forcing tool use via tool_choice guarantees the model produces a structured call with typed parameters — the schema is enforced at the API level, not by hoping the model follows text instructions.

---

#### D4-39. `q-dep-009`
<sub>**D4** · Task 4.3 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-009`</sub>

A code review agent should return its findings as a JSON array of objects with fields: `file`, `line`, `severity`, `category`, `message`. You see it sometimes nesting findings inside a wrapper object. What is the most reliable fix?

- A) Add to the prompt: "Return only a raw JSON array, no wrapper object."
- **B) Define a `submit_findings(findings: Finding[])` tool with a JSON schema that enforces an array at the top level and use tool_choice to require its use.** ✅
- C) Write a post-processor that unwraps the object and extracts the findings array.
- D) Change the return type to a newline-delimited JSON format (NDJSON) to avoid nesting.

> **Answer: B.** 💡 **Remember:** Tool use with a JSON schema enforces structure at the API level — the model cannot produce a wrapper object when the schema requires a top-level array.

---

#### D4-40. `q-dex-003`
<sub>**D4** · Task 4.3 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-003`</sub>

An invoice extraction tool must return: `vendor_name` (string), `invoice_date` (ISO 8601 date), `line_items` (array of objects with description/quantity/unit_price), and `total_amount` (number). Which approach most reliably enforces this schema?

- A) Describe the expected format in the system prompt with an example JSON.
- **B) Define a `submit_invoice_data` tool with a JSON Schema specifying all types, required fields, and array item schemas, then set tool_choice to force its use.** ✅
- C) Use a regex to validate the output and ask Claude to fix any validation errors.
- D) Split into separate extractions: one call per field, then assemble in code.

> **Answer: B.** 💡 **Remember:** Tool use with a JSON Schema enforces the structure at the API level. The schema can specify field types (string, number, date format pattern), required fields, and array item schemas — all validated before the response is returned.

---

#### D4-41. `olivier-61`
<sub>**D4** · Task 4.3 · `olivier` · path 2 · `olivier-61`</sub>

Your extraction pipeline uses a prompt that requests JSON output with a code block. In production, approximately 3% of responses have JSON syntax errors: missing commas, unescaped characters, or truncated objects. These errors break your downstream parser and require manual reprocessing. What is the most reliable way to eliminate JSON syntax errors?

- A) Add a validation step that re-runs the prompt if the output fails JSON parsing, up to 3 retries.
- **B) Switch to tool use with a defined JSON schema as the input parameter; extract structured data from the `tool_use` response block.** ✅
- C) Add an instruction to the prompt: "Your response must be valid JSON. Double-check for syntax errors before responding."
- D) Use a regex post-processor to fix the most common syntax errors before passing output to the parser.

> **Answer: B.** 💡 **Remember:** Tool use with a JSON schema guarantees schema-compliant structured output by construction, eliminating syntax errors entirely.

---

#### D4-42. `olivier-62`
<sub>**D4** · Task 4.3 · `olivier` · path 2 · `olivier-62`</sub>

Your structured data extraction pipeline processes invoices. You have two extraction tools: `extract_invoice_schema` and `extract_receipt_schema`. For each document, you do not know in advance which type it is. After switching to `tool_choice: "auto"`, you observe that 30% of the time the model returns a text description of what it found rather than calling either tool. What is the correct fix?

- **A) Set `tool_choice: "any"` to guarantee the model calls one of the available extraction tools without specifying which one.** ✅
- B) Set `tool_choice: {"type": "tool", "name": "extract_invoice_schema"}` to always call a specific tool.
- C) Add a system prompt instruction: "Always call one of the extraction tools and never return text."
- D) Merge both schemas into a single `extract_document_schema` tool with an optional `document_type` field.

> **Answer: A.** 💡 **Remember:** `tool_choice: "any"` guarantees the model calls a tool rather than returning conversational text, without requiring you to specify which tool.

---

#### D4-43. `q-csa-010`
<sub>**D4** · Task 4.4 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-010`</sub>

An extraction agent pulls account data from free-text customer emails. In testing, 12% of extractions are missing the `order_id` field. What reliability pattern best handles this?

- A) Increase max_tokens so the model has more room to include all fields.
- **B) After each extraction, validate required fields and, if missing, re-prompt with: "The order_id field was not found. Please re-read the message and extract it, or return null if absent."** ✅
- C) Switch to a larger model for all extractions to improve accuracy.
- D) Make order_id optional in the schema to reduce validation failures.

> **Answer: B.** 💡 **Remember:** A validation-and-retry loop targeting the specific missing field is the standard reliability pattern.

---

#### D4-44. `q-dex-004`
<sub>**D4** · Task 4.4 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-004`</sub>

Your extraction pipeline has a 15% rate of missing the `payment_terms` field from contracts. The field is always present in the source documents. After reviewing failures, you find the terms are expressed in varied formats: "Net 30", "due within 30 days", "payable upon receipt". What is the most effective retry strategy?

- A) Retry with a higher temperature to encourage more creative extraction.
- **B) On missing payment_terms, re-prompt with: "The payment_terms field was not extracted. Look for any of these expressions: Net 30, due within N days, payable upon receipt, or similar payment timing language."** ✅
- C) Use a separate classification model to detect which format the payment terms use, then route to format-specific extractors.
- D) Increase max_tokens so the model has more room to include the field.

> **Answer: B.** 💡 **Remember:** A targeted re-prompt that enumerates the known format variations directly addresses the root cause: the model is not recognizing all variants of payment terms language.

---

#### D4-45. `olivier-63`
<sub>**D4** · Task 4.4 · `olivier` · path 2 · `olivier-63`</sub>

An invoice extraction pipeline uses tool use with a strict JSON schema. After validation, 8% of extracted invoices fail a business rule check: the sum of line item amounts does not equal the `total_amount` field. These are semantic errors, not schema syntax errors. The invoices are well-formed documents with no missing data. How should you implement the retry loop?

- A) Retry up to 3 times with the same prompt; schema-compliant extraction will converge on a valid answer with additional attempts.
- **B) On failure, append the original document, the failed extraction, and the specific validation error ("line items sum to X but total_amount is Y") to the follow-up prompt for model self-correction.** ✅
- C) Flag all invoices with this error as missing data and route them directly to human review without retry.
- D) Add a `calculated_total` field to the schema and populate it with the sum of line items in post-processing, then use the calculated total as the canonical value.

> **Answer: B.** 💡 **Remember:** Retry-with-error-feedback works by giving the model the specific discrepancy it needs to self-correct.

---

#### D4-46. `olivier-64`
<sub>**D4** · Task 4.4 · `olivier` · path 2 · `olivier-64`</sub>

A CI code review pipeline is generating false positive findings at a high rate. The team wants to understand which specific code constructs are being flagged incorrectly so they can refine the prompt. The current findings output only includes `file`, `line`, and `description`. What schema change would best enable systematic false positive analysis?

- A) Add a `confidence` field (0-100) to each finding so the team can filter by confidence threshold.
- **B) Add a `detected_pattern` field to each finding that records the specific code construct or pattern that triggered the finding.** ✅
- C) Add a `category` field so findings can be grouped by issue type for aggregate analysis.
- D) Add an `is_false_positive` boolean field and instruct Claude to self-label its own false positives.

> **Answer: B.** 💡 **Remember:** The `detected_pattern` field directly captures what code construct triggered each finding, enabling the team to identify which patterns produce the most false positives and update prompt criteria accordingly.

---

#### D4-47. `olivier-67`
<sub>**D4** · Task 4.4 · `olivier` · path 2 · `olivier-67`</sub>

A financial document extraction pipeline is failing on the "guarantor address" field for a set of loan summaries. After 3 retry attempts with error feedback, the field still extracts as null. Each retry prompt includes the original document and the validation error. What should you investigate before scheduling further retries?

- A) Increase the retry limit from 3 to 5, since complex field extraction may require more attempts to converge.
- **B) Check whether the guarantor address is actually present in the loan summary document, or whether the document only references it by directing the reader to an external exhibit.** ✅
- C) Switch to a larger model tier for the retry attempts, since the current model may lack the reasoning capacity for this field.
- D) Restructure the schema to make the guarantor address field optional, allowing the pipeline to proceed when the field cannot be extracted.

> **Answer: B.** 💡 **Remember:** Retries are only effective when the information needed to satisfy the validation is present in the document.

---

#### D4-48. `q-dex-005`
<sub>**D4** · Task 4.5 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-005`</sub>

You need to extract structured data from 10,000 contracts in 8 hours. Each extraction takes approximately 3 seconds. Sequential processing would take ~8.3 hours. Which strategy meets the deadline?

- A) Use the Anthropic Batch API to process all contracts in parallel, accepting up to 24-hour turnaround for higher throughput.
- **B) Use concurrent API calls (e.g., 20 parallel threads) to process contracts simultaneously within the 8-hour window.** ✅
- C) Reduce the extraction prompt length to make each call faster.
- D) Upgrade to a larger model to improve parallelism.

> **Answer: B.** 💡 **Remember:** 20 parallel threads processing ~3-second calls would process 10,000 contracts in approximately 10,000/(20 × 3600/3) ≈ 25 minutes — well within 8 hours.

---

#### D4-49. `q-mar-010`
<sub>**D4** · Task 4.5 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-010`</sub>

Your research pipeline processes 500 analyst reports per day. Each report requires three extraction passes (facts, claims, sources). Processing them one-at-a-time takes 14 hours. What batch processing strategy reduces wall-clock time most effectively?

- A) Combine all three extraction passes into a single prompt per document.
- **B) Process documents in parallel batches, with each pass in its own API call, using the Anthropic Batch API for throughput.** ✅
- C) Pre-sort documents by length and process shorter ones first.
- D) Cache the system prompt across all calls to reduce per-request overhead.

> **Answer: B.** 💡 **Remember:** Parallel processing with the Batch API is designed exactly for this use case — high-volume, latency-insensitive workloads.

---

#### D4-50. `olivier-65`
<sub>**D4** · Task 4.5 · `olivier` · path 2 · `olivier-65`</sub>

A compliance team runs a weekly audit that analyzes 50,000 contract documents for regulatory clauses. The audit results are reviewed by a compliance analyst every Monday morning. The team is considering the Message Batches API. A colleague raises a concern: "What if a batch fails partway through the 50,000 documents?" How should partial batch failures be handled?

- A) Always resubmit the entire batch; tracking partial failures adds implementation complexity.
- **B) Use the `custom_id` field to correlate each request with its response, identify which documents returned error responses, and resubmit only those documents in a new batch.** ✅
- C) Set a shorter processing window timeout to force faster completion and reduce the risk of partial failures.
- D) Switch to real-time API calls with retry logic; the batch API is not suitable for mission-critical compliance workloads.

> **Answer: B.** 💡 **Remember:** The `custom_id` field is specifically designed for correlating batch request and response pairs, enabling teams to identify which documents failed and resubmit only those, avoiding the cost of reprocessing the entire batch.

---

#### D4-51. `q-dep-010`
<sub>**D4** · Task 4.6 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-010`</sub>

You want a two-pass code review: the first pass identifies issues, the second pass prioritizes and deduplicates. Both passes use the same model. What architecture ensures the second pass is independent of the first?

- A) Use the same conversation thread — pass the first-pass output as context for the second.
- **B) Start a fresh conversation for the second pass, passing only the raw diff and the first-pass findings as input (no prior conversation history).** ✅
- C) Run both passes simultaneously and merge the outputs.
- D) Use a different model for the second pass to ensure independence.

> **Answer: B.** 💡 **Remember:** Independence in multi-pass review means the second pass should not be influenced by the reasoning process of the first pass — only its output.

---

#### D4-52. `q-dex-006`
<sub>**D4** · Task 4.6 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-006`</sub>

A two-pass extraction system first extracts raw data, then a second pass validates and normalizes it. You want the validation pass to be independent of the extraction pass's reasoning. What architecture ensures this?

- A) Continue the same conversation — pass the extracted data back to the same model thread for validation.
- **B) Start a fresh conversation for validation with only the original document and the extracted data as input — no prior conversation history.** ✅
- C) Use a different model for validation to ensure independence.
- D) Run both passes simultaneously with different random seeds.

> **Answer: B.** 💡 **Remember:** Independence means the validation pass evaluates the extracted data against the source document without being influenced by the extraction pass's intermediate reasoning.

---

#### D4-53. `q-mar-011`
<sub>**D4** · Task 4.6 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-011`</sub>

You want to fact-check the coordinator's final synthesis using multiple independent review passes. Which architecture best detects contradictions between the synthesis and source documents?

- A) A single reviewer agent with access to all source documents simultaneously.
- **B) Two independent reviewer agents each with a different subset of source documents, then a third agent that compares their findings.** ✅
- C) The original subagents re-read the synthesis and flag anything they did not contribute.
- D) A human reviewer who reads the synthesis after the agents complete.

> **Answer: B.** 💡 **Remember:** Multi-instance review with independent subsets and a comparison pass catches contradictions that a single reviewer might miss because it sees all documents and may rationalize inconsistencies.

---

#### D4-54. `olivier-66`
<sub>**D4** · Task 4.6 · `olivier` · path 2 · `olivier-66`</sub>

A developer generates a 300-line module using Claude Code in one session, then asks the same session to review the code for bugs. The review returns "looks good" with minor style suggestions but misses two logic errors that a colleague catches in manual review. What is the most likely cause, and what architectural change addresses it?

- A) The context window was too large; the fix is to limit code generation to smaller chunks so the review has less to process.
- **B) The reviewing instance retains reasoning context from generation, making it less likely to question its own decisions. Use a second independent Claude instance without the generation context to perform the review.** ✅
- C) The review prompt was too vague; adding more explicit review criteria to the same session would catch the missed errors.
- D) The model tier used for generation is more capable than the one used for review; switching both to the same tier resolves the quality gap.

> **Answer: B.** 💡 **Remember:** Self-review limitation is a known pattern: when a model retains the reasoning context from code generation, it is less likely to identify errors in its own output.

---

#### D4-55. `olivier-68`
<sub>**D4** · Task 4.6 · `olivier` · path 2 · `olivier-68`</sub>

A developer builds a code generation pipeline where Claude generates a 200-line module, and then the same session reviews the generated code for correctness. The review returns only minor style suggestions and misses a logic error in the error handling path. A second developer reviewing the code manually finds the bug immediately. What architectural change would make the review phase more effective?

- A) Add more explicit review criteria to the generation session's system prompt to help it catch logic errors.
- **B) Use a second independent Claude instance without the generation context to perform the review, since the generating instance retains reasoning context that makes it less likely to question its own decisions.** ✅
- C) Run the review immediately after generation before any other tool calls accumulate in the context window.
- D) Switch to a larger model tier for the review step to improve reasoning quality.

> **Answer: B.** 💡 **Remember:** When a model reviews code it generated in the same session, it retains the reasoning context from generation and is less likely to identify errors in its own output.

---


<a name="domain-5"></a>
## Domain 5: Context Management & Reliability (15%)

*49 questions*

#### D5-1. `dnacenta-d5-13`
<sub>**D5** · `dnacenta` · path 2 · `dnacenta-d5-13`</sub>

An agent is processing a customer support request. After context compression, the customer's order number ($149.99 order #67890) was summarized as "a recent order." What should have been done to prevent this?

- A) Increase the context window size
- **B) Extract critical transactional data into a persistent case facts block** ✅
- C) Disable context compression
- D) Repeat the order details in every message

> **Answer: B.** 💡 **Remember:** Extracting transactional facts (amounts, order numbers, dates) into a structured block that persists through compression prevents loss of critical details.

---

#### D5-2. `dnacenta-d5-14`
<sub>**D5** · `dnacenta` · path 2 · `dnacenta-d5-14`</sub>

A customer says "I AM SO ANGRY RIGHT NOW!!!" about a simple billing charge of $5. Should the agent escalate to a human?

- A) Yes, high sentiment indicates a complex issue
- B) Yes, capital letters indicate urgency
- **C) No, sentiment intensity does not indicate issue complexity -- the billing issue is simple and resolvable** ✅
- D) No, but reduce the agent's confidence score

> **Answer: C.** 💡 **Remember:** Sentiment ≠ complexity. An angry customer with a simple $5 billing issue doesn't need human escalation.

---

#### D5-3. `dnacenta-d5-15`
<sub>**D5** · `dnacenta` · path 2 · `dnacenta-d5-15`</sub>

An extraction system reports 97% overall accuracy. A stakeholder asks if it's ready for production. What additional information is needed?

- A) The system is ready at 97%
- **B) Check if accuracy is consistent across all document types and fields** ✅
- C) Run more documents through to increase the sample size
- D) Compare against competitor systems

> **Answer: B.** 💡 **Remember:** Aggregate accuracy can mask poor performance on specific document types. 97% overall might hide 45% accuracy on handwritten documents.

---

#### D5-4. `dnacenta-d5-16`
<sub>**D5** · `dnacenta` · path 2 · `dnacenta-d5-16`</sub>

Two research subagents return different values for the same metric. What should the coordinator do?

- A) Average the two values
- B) Use the most recent value
- **C) Annotate the conflict with source attribution and let the user decide** ✅
- D) Discard both and search again

> **Answer: C.** 💡 **Remember:** Conflicting data should be annotated with source attribution rather than silently resolved.

---

#### D5-5. `sgrid-test-09-context-reliability-81`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-81`</sub>

Your customer support agent handles multi-turn conversations. After 15 turns, it refers to a refund of "$47" that was actually $147.23 -- the exact amount was lost during context summarization. How should you preserve critical numerical data?

- A) Increase the context window size to avoid summarization.
- **B) Extract transactional facts (amounts, dates, order numbers, statuses) into a persistent "case facts" block included in each prompt, outside summarized history.** ✅
- C) Ask the customer to repeat important numbers periodically.
- D) Store all numbers in a database and query them each turn.

> **Answer: B.** 💡 **Remember:** Progressive summarization risks condensing numerical values, dates, and specific details into vague summaries.

---

#### D5-6. `sgrid-test-09-context-reliability-82`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-82`</sub>

Your customer has three open issues: a damaged item return, a billing dispute, and an address change. After resolving the first issue, the agent loses track of the other two. What structural change prevents this?

- A) Add "Remember to address all issues" to the system prompt.
- **B) Extract and persist structured issue data (order IDs, amounts, statuses) into a separate context layer for multi-issue sessions.** ✅
- C) Limit customers to one issue per conversation.
- D) Create separate conversation threads for each issue.

> **Answer: B.** 💡 **Remember:** For multi-issue sessions, structured issue data should be extracted into a separate context layer that tracks each issue's ID, status, and key details.

---

#### D5-7. `sgrid-test-09-context-reliability-83`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-83`</sub>

Your agent calls `lookup_order` which returns 40+ fields per order (shipping address, billing address, payment method details, warehouse location, carrier tracking, etc.). For most customer requests, only 5 fields are relevant. What should you do?

- A) Let the model process all 40 fields -- it can ignore irrelevant ones.
- **B) Trim verbose tool outputs to only relevant fields before they accumulate in context.** ✅
- C) Paginate the tool output, loading 10 fields at a time.
- D) Create 8 different order lookup tools, each returning a subset of fields.

> **Answer: B.** 💡 **Remember:** Verbose tool outputs consume context tokens disproportionate to their relevance. Trimming to only the fields relevant to the current request (e.g., keeping only return-relevant fields for a return request) prevents context bloat.

---

#### D5-8. `sgrid-test-09-context-reliability-84`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-84`</sub>

You are aggregating research findings from 5 subagents into a single prompt for the synthesis agent. The findings from the 3rd and 4th agents (middle of the input) are consistently underrepresented in the final synthesis. What is the cause and fix?

- A) The 3rd and 4th agents produced lower quality findings.
- **B) The "lost in the middle" effect: models reliably process information at the beginning and end but may omit findings from middle sections. Place key findings summaries at the beginning and use explicit section headers.** ✅
- C) The synthesis agent's context window is too small.
- D) The 3rd and 4th agents are taking too long, causing timeout issues.

> **Answer: B.** 💡 **Remember:** The "lost in the middle" effect is a known LLM behavior where information at the beginning and end of long inputs receives more attention than middle sections.

---

#### D5-9. `sgrid-test-09-context-reliability-85`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-85`</sub>

A customer explicitly says "I want to speak to a human agent." Your agent has already identified that the issue is a simple order status question it could answer in one tool call. What should the agent do?

- A) Answer the question first to demonstrate capability, then offer to transfer if the customer still wants a human.
- **B) Honor the customer's explicit request immediately and transfer to a human agent.** ✅
- C) Ask the customer why they want a human agent to determine if escalation is necessary.
- D) Provide the order status and mention that a human agent is also available.

> **Answer: B.** 💡 **Remember:** When a customer explicitly requests a human agent, honor that request immediately without first attempting investigation.

---

#### D5-10. `sgrid-test-09-context-reliability-86`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-86`</sub>

A customer says "This is so frustrating, nothing ever works!" but their issue is a straightforward product return within policy. The agent escalates based on the negative sentiment. Is this correct?

- A) Yes -- high frustration always warrants human escalation.
- **B) No -- sentiment-based escalation is unreliable. The agent should acknowledge frustration while offering to resolve the straightforward issue, escalating only if the customer reiterates their preference for a human.** ✅
- C) Yes -- the agent should err on the side of caution with frustrated customers.
- D) No -- the agent should ignore sentiment entirely and focus on the issue.

> **Answer: B.** 💡 **Remember:** Sentiment does not correlate with case complexity. A frustrated customer may have a simple issue that the agent can resolve perfectly.

---

#### D5-11. `sgrid-test-09-context-reliability-87`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-87`</sub>

Your tool returns multiple customer records for the name "John Smith." The agent selects the most recent account using a heuristic. This occasionally leads to misidentified accounts. What should the agent do instead?

- A) Select the account with the most orders as the most likely match.
- **B) Ask the customer for additional identifiers (email, phone number, or order number) to disambiguate rather than selecting based on heuristics.** ✅
- C) Present all matching accounts to the customer and ask them to confirm.
- D) Use the phone number from caller ID to automatically select the right account.

> **Answer: B.** 💡 **Remember:** When tool results return multiple matches, the agent should request additional identifiers from the customer for disambiguation rather than applying heuristics that may select the wrong record.

---

#### D5-12. `sgrid-test-09-context-reliability-88`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-88`</sub>

Your web search subagent returns an error: `{"status": "error", "message": "search unavailable"}`. The coordinator has no information about what failed, what was attempted, or whether partial results exist. What should the error response include instead?

- A) Just the HTTP status code for programmatic handling.
- **B) Structured error context: failure type (timeout), attempted query, partial results (3 of 5 sources returned), and potential alternative approaches (try alternative search API or narrower query).** ✅
- C) A retry count showing how many times the subagent already retried.
- D) The full stack trace for debugging.

> **Answer: B.** 💡 **Remember:** Structured error context enables the coordinator to make intelligent recovery decisions.

---

#### D5-13. `sgrid-test-09-context-reliability-89`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-89`</sub>

A subagent encounters a transient timeout error while fetching a document. It has local retry logic that succeeds on the second attempt. Should it report this error to the coordinator?

- A) Yes -- all errors should always be reported to the coordinator.
- **B) No -- subagents should implement local recovery for transient failures and only propagate errors they cannot resolve, along with what was attempted and partial results.** ✅
- C) Yes -- the coordinator needs to know about all timeouts for monitoring.
- D) No -- errors should be silently swallowed to keep the coordinator's context clean.

> **Answer: B.** 💡 **Remember:** Subagents should handle transient failures locally when possible (retry logic for timeouts, exponential backoff).

---

#### D5-14. `sgrid-test-09-context-reliability-90`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-09-context-reliability-90`</sub>

A subagent successfully queries a database and finds zero results matching the search criteria. It returns `{"status": "error", "message": "No results found"}`. Is this correct?

- A) Yes -- no results is an error condition.
- **B) No -- a successful query with zero results is a valid empty result, not an error. The response should indicate success with no matches to prevent the coordinator from treating it as a failure requiring retry.** ✅
- C) Yes -- the coordinator should retry with different search criteria.
- D) No -- it should return a fabricated result to avoid the empty result.

> **Answer: B.** 💡 **Remember:** A successful query that returns zero results is fundamentally different from a failed query.

---

#### D5-15. `sgrid-test-10-advanced-context-100`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-100`</sub>

Two subagents analyze the same topic but from different time periods. Subagent A reports 2023 data and Subagent B reports 2025 data. The synthesis agent flags them as "contradictory findings." What metadata would prevent this misinterpretation?

- A) Confidence scores for each finding.
- **B) Publication or data collection dates in structured outputs, enabling correct temporal interpretation.** ✅
- C) Source credibility ratings.
- D) Word count of the original source document.

> **Answer: B.** 💡 **Remember:** Requiring subagents to include publication or data collection dates in their structured outputs enables the synthesis agent to correctly interpret temporal differences.

---

#### D5-16. `sgrid-test-10-advanced-context-91`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-91`</sub>

After 2 hours of codebase exploration, your Claude Code session starts giving inconsistent answers and referencing "typical patterns" rather than the specific classes it discovered earlier. What is happening?

- A) The model is experiencing a bug.
- **B) Context degradation in extended sessions: the model's ability to reference specific earlier findings deteriorates as context fills with exploration output.** ✅
- C) The codebase is too complex for the model to understand.
- D) The model's temperature is set too high.

> **Answer: B.** 💡 **Remember:** Context degradation is a known issue in extended exploration sessions. As context fills with verbose tool outputs from file reads, searches, and analysis, the model's ability to accurately reference specific earlier findings deteriorates.

---

#### D5-17. `sgrid-test-10-advanced-context-92`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-92`</sub>

During a long exploration session, you want the agent to maintain reliable access to key findings as context fills. What technique helps?

- A) Periodically restart the session to clear context.
- **B) Have the agent maintain scratchpad files recording key findings, referencing them for subsequent questions to counteract context degradation.** ✅
- C) Reduce the verbosity of the model's responses.
- D) Use a model with a larger context window.

> **Answer: B.** 💡 **Remember:** Scratchpad files persist key findings outside the conversation context. The agent writes important discoveries to files and references them when needed, ensuring access to accurate information regardless of how much context has accumulated.

---

#### D5-18. `sgrid-test-10-advanced-context-93`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-93`</sub>

You need to investigate multiple aspects of a large codebase: find all test files, trace the refund flow, identify API endpoints, and map database schemas. What is the best approach?

- A) Investigate all aspects sequentially in the main conversation, reading every relevant file.
- **B) Spawn subagents to investigate specific questions while the main agent preserves high-level coordination, summarizing findings between phases.** ✅
- C) Read all files into the main context first, then answer questions from memory.
- D) Use a single subagent that investigates everything and returns a single report.

> **Answer: B.** 💡 **Remember:** Subagent delegation isolates verbose exploration output while the main agent coordinates at a high level.

---

#### D5-19. `sgrid-test-10-advanced-context-94`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-94`</sub>

Your multi-agent system crashes during a complex research task. On restart, all agent state is lost and the coordinator has to start from scratch. What architectural pattern prevents this?

- A) Use longer-running agent processes that are less likely to crash.
- **B) Design crash recovery using structured agent state exports (manifests): each agent exports state to a known location, and the coordinator loads the manifest on resume and injects prior state into agent prompts.** ✅
- C) Run duplicate agents so one can take over if the other fails.
- D) Store all intermediate results in a database that the agent can query.

> **Answer: B.** 💡 **Remember:** Structured state persistence for crash recovery means each agent periodically exports its current state (findings, progress, next steps) to a known location.

---

#### D5-20. `sgrid-test-10-advanced-context-95`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-95`</sub>

During an extended exploration session, your context is filling with verbose discovery output from reading dozens of files. What command can reduce context usage?

- A) `/reset`
- **B) `/compact`** ✅
- C) `/clear`
- D) `/trim`

> **Answer: B.** 💡 **Remember:** `/compact` reduces context usage during extended sessions by summarizing or compressing verbose discovery output.

---

#### D5-21. `sgrid-test-10-advanced-context-96`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-96`</sub>

Your extraction pipeline reports 97% aggregate accuracy across all document types. After deploying, users report frequent errors on a specific document type (handwritten receipts). What went wrong?

- A) The 97% accuracy is wrong -- the evaluation was flawed.
- **B) Aggregate accuracy metrics mask poor performance on specific document types. You should validate accuracy by document type and field segment before automating.** ✅
- C) Handwritten receipts are impossible to process.
- D) The model was not trained on handwritten text.

> **Answer: B.** 💡 **Remember:** Aggregate accuracy metrics (97% overall) can mask significant performance gaps on specific document types or fields.

---

#### D5-22. `sgrid-test-10-advanced-context-97`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-97`</sub>

You have automated high-confidence extractions (removing human review for those). How should you monitor for quality degradation over time?

- A) Monitor aggregate accuracy monthly.
- **B) Implement stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel error pattern detection.** ✅
- C) Trust the confidence scores -- if they are high, the extractions are correct.
- D) Only review extractions that downstream systems reject.

> **Answer: B.** 💡 **Remember:** Stratified random sampling continuously monitors even high-confidence extractions for errors.

---

#### D5-23. `sgrid-test-10-advanced-context-98`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-98`</sub>

Your synthesis agent combines findings from multiple sources. Two credible sources report different statistics for the same metric: Source A says "market grew 15%" while Source B says "market grew 22%." How should the synthesis handle this?

- A) Average the two values and report 18.5%.
- B) Use the more recent source.
- **C) Preserve both values with source attribution and annotate the conflict, rather than arbitrarily selecting one.** ✅
- D) Report only the lower value to be conservative.

> **Answer: C.** 💡 **Remember:** When credible sources conflict, the synthesis should preserve both values with full source attribution and explicitly annotate the conflict.

---

#### D5-24. `sgrid-test-10-advanced-context-99`
<sub>**D5** · `sgrid` · path 2 · `sgrid-test-10-advanced-context-99`</sub>

Your subagents return research findings as prose paragraphs. After synthesis, source attribution is completely lost -- the final report makes claims without any source references. What structural change fixes this?

- A) Add "Always cite sources" to the synthesis agent's prompt.
- **B) Require subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts) that downstream agents must preserve through synthesis.** ✅
- C) Have the synthesis agent search for source references in the prose.
- D) Add a post-processing step that matches claims to sources using semantic similarity.

> **Answer: B.** 💡 **Remember:** The fix is structural: require subagents to output findings as structured claim-source mappings rather than prose.

---

#### D5-25. `q-csa-011`
<sub>**D5** · Task 5.1 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-011`</sub>

A customer support session spans 40 turns and is approaching Claude's context window limit. The agent has gathered account details, issue history, and three attempted resolutions. What is the best context management strategy to continue the session?

- A) Truncate the oldest turns from the conversation history to fit within the window.
- B) Start a fresh session and ask the customer to re-explain their issue.
- **C) Generate a structured summary of critical facts (account ID, issue, resolutions attempted) and pass it as a system prompt prefix in the new context window.** ✅
- D) Increase the model's context window by upgrading to a larger variant.

> **Answer: C.** 💡 **Remember:** Summarizing critical facts into a structured prefix preserves the semantically important state while discarding the verbatim turns that consume tokens.

---

#### D5-26. `q-dep-011`
<sub>**D5** · Task 5.1 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-011`</sub>

A developer productivity agent is refactoring a large codebase across 20 files. After 30 tool calls, the context window is almost full and the agent has not finished. How should the agent preserve progress?

- **A) Summarize completed changes and pending tasks into a structured handoff document, then start a new session with that document as context.** ✅
- B) Commit all changes made so far and restart from the beginning with the same prompt.
- C) Increase the context window by switching to a model with larger context.
- D) Continue the current session — Claude will automatically compress old context as needed.

> **Answer: A.** 💡 **Remember:** A structured handoff document summarizing completed edits and remaining tasks is the correct pattern for long-running agentic work that hits context limits.

---

#### D5-27. `q-dex-009`
<sub>**D5** · Task 5.1 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-009`</sub>

A contract extraction session is processing a 200-page agreement. After 25 pages of extraction, the context window is filling. The agent has already extracted parties, effective date, and governing law. What is the correct approach to continue without losing progress?

- A) Continue adding pages until the context limit is hit, then start fresh.
- **B) Summarize the already-extracted structured data into a compact state object and inject it as a prefix for the next context window before processing remaining pages.** ✅
- C) Process the remaining pages without the previously extracted data, then merge at the end.
- D) Upgrade to a model with a larger context window.

> **Answer: B.** 💡 **Remember:** The structured extraction results already produced are compact — a JSON object with a few fields takes minimal tokens.

---

#### D5-28. `olivier-69`
<sub>**D5** · Task 5.1 · `olivier` · path 2 · `olivier-69`</sub>

A customer support agent is handling a complex billing dispute that spans 20+ turns. A customer mentioned early in the conversation that they were charged $847.50 on March 3rd for a service they cancelled on February 28th. Midway through the conversation, the agent references the charge as "the overcharge from last month" without the specific amount. The customer disputes the agent's understanding of the case. What context management technique would prevent this?

- A) Use `/compact` at the start of each conversation to summarize prior turns into a shorter representation.
- **B) Extract transactional facts (amounts, dates, order numbers, statuses) into a persistent "case facts" block that is included at the beginning of every subsequent prompt in the conversation.** ✅
- C) Increase the model's context window by switching to a larger tier to retain the full conversation without summarization.
- D) Instruct the agent to re-read the full conversation history before each response.

> **Answer: B.** 💡 **Remember:** Extracting precise transactional facts into a persistent "case facts" block ensures that specific numerical values, dates, and customer-stated details are explicitly available in every prompt turn rather than buried in growing conversation history.

---

#### D5-29. `olivier-70`
<sub>**D5** · Task 5.1 · `olivier` · path 2 · `olivier-70`</sub>

A multi-agent research pipeline aggregates findings from six subagents, each returning 800-1,200 tokens of raw tool output and reasoning. The synthesis agent receives all results in a single large message. The final report consistently omits or contradicts findings that appeared in the middle sections of the aggregated input. What is the most likely cause and the most effective mitigation?

- A) The subagents are returning conflicting information; add a deduplication step before synthesis.
- B) The synthesis agent is hitting its output token limit; increase `max_tokens` to allow a longer response.
- **C) The "lost in the middle" effect causes models to reliably process content at the beginning and end of long inputs but miss middle sections. Mitigate by placing key findings summaries at the beginning of aggregated inputs and organizing sections with explicit headers.** ✅
- D) The synthesis agent's context window is exhausted; route some subagent outputs through a secondary summarization agent before passing to synthesis.

> **Answer: C.** 💡 **Remember:** The "lost in the middle" effect is a well-documented limitation where models attend less reliably to content in the middle of long inputs.

---

#### D5-30. `q-ccd-015`
<sub>**D5** · Task 5.2 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-015`</sub>

A CI review agent encounters a diff where a function's behavior change is ambiguous — it could be a bug fix or an intentional breaking change. The agent cannot determine intent from the code alone. What is the correct escalation pattern?

- A) Assume it is a bug fix (the more common case) and flag it with low severity.
- **B) Post a review comment asking for clarification: "This change to [function] may be intentional or may be a regression. Could the author confirm whether this is a deliberate breaking change?"** ✅
- C) Flag it as a critical security issue to ensure it gets reviewed by a human.
- D) Skip the finding entirely since the agent cannot be certain.

> **Answer: B.** 💡 **Remember:** When an automated agent cannot resolve an ambiguity from available information, the correct pattern is to surface the ambiguity to a human with a specific, targeted question.

---

#### D5-31. `q-csa-012`
<sub>**D5** · Task 5.2 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-012`</sub>

A customer asks: "Can you refund the charges from last month?" The agent's account lookup shows three charges last month ($12.99, $24.99, $9.99). The agent does not know which charge the customer means. What is the correct escalation pattern?

- A) Refund all three charges to avoid guessing incorrectly.
- B) Refund the largest charge since it is most likely to be disputed.
- **C) Ask the customer to clarify which charge: "I see three charges from last month. Could you confirm which one you'd like refunded?"** ✅
- D) Escalate immediately to a human agent because the request is ambiguous.

> **Answer: C.** 💡 **Remember:** When the agent has insufficient information to act without risk of error, the correct pattern is targeted clarification — asking the minimum question needed to resolve the ambiguity.

---

#### D5-32. `q-dex-014`
<sub>**D5** · Task 5.2 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-014`</sub>

An extraction agent encounters an invoice where the vendor name is partially obscured (a document scan artifact). The agent can read "Acme Corp" or "Acne Corp" from the image. What is the correct handling?

- A) Choose the more common company name ("Acme Corp") and proceed.
- **B) Return `{ "vendor_name": "Acme Corp [OCR uncertain — possible: Acne Corp]", "confidence": "low" }` to preserve uncertainty information.** ✅
- C) Mark the entire extraction as failed due to scan quality.
- D) Return null for vendor_name and let the downstream system handle it.

> **Answer: B.** 💡 **Remember:** When the agent has genuine uncertainty about extracted data, it should surface that uncertainty rather than silently committing to a guess.

---

#### D5-33. `olivier-71`
<sub>**D5** · Task 5.2 · `olivier` · path 2 · `olivier-71`</sub>

A customer opens a support chat saying "I'd like to speak to a human please. I've been dealing with this billing issue for three weeks and I'm frustrated." The agent has already identified this as a standard billing adjustment that it can resolve in 2 steps using its available tools. Your agent responds by saying "I can help with that right away, let me pull up your account." and proceeds to investigate. The customer repeats their request for a human. What is wrong with this behavior and what should be corrected?

- **A) The agent should honor an explicit customer request for a human agent immediately on first request, without attempting investigation first.** ✅
- B) The agent should detect negative sentiment and escalate once the frustration score exceeds a defined threshold.
- C) The agent should complete its investigation, present the proposed solution, and escalate only if the customer still insists afterward.
- D) The agent should apologize for the wait, then proceed with automated resolution since the case is within its capability.

> **Answer: A.** 💡 **Remember:** When a customer explicitly requests a human agent, that request must be honored immediately regardless of whether the agent believes it can resolve the issue.

---

#### D5-34. `q-ccd-008`
<sub>**D5** · Task 5.3 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-008`</sub>

A CI review pipeline has a security subagent and a coordinator. The security subagent cannot connect to the CVE database (a transient network error). How should this be communicated to the coordinator?

- A) The security subagent runs a partial review without CVE lookups and returns its findings without disclosing the missing data source.
- **B) The security subagent returns its findings with a metadata flag: `{ "cve_check_status": "failed", "reason": "CVE database unreachable" }`.** ✅
- C) The security subagent fails completely and returns no findings.
- D) The security subagent retries indefinitely until the CVE database becomes available.

> **Answer: B.** 💡 **Remember:** Partial results with explicit metadata about what failed are more useful than either silent omission or complete failure.

---

#### D5-35. `q-csa-013`
<sub>**D5** · Task 5.3 · Customer Support Resolution Agent · `moisesprat` · path 1 · `q-csa-013`</sub>

Your support system has three layers: a router agent, a specialist agent, and a fulfillment agent. The fulfillment agent fails with "payment gateway timeout". How should this error propagate?

- A) The fulfillment agent silently retries until it succeeds, shielding upper layers from transient errors.
- **B) The fulfillment agent returns a structured error to the specialist agent, which decides whether to retry, escalate, or inform the customer.** ✅
- C) The error is logged but not returned — the specialist agent receives an empty response and infers failure.
- D) The router agent polls the fulfillment agent every 5 seconds to check if it succeeded.

> **Answer: B.** 💡 **Remember:** Each agent layer should receive structured error information so it can make an informed decision about retry vs. escalation vs. user notification.

---

#### D5-36. `q-dep-012`
<sub>**D5** · Task 5.3 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-012`</sub>

A developer productivity pipeline has three agents: a planner, an implementer, and a tester. The tester reports a compilation error. The error message needs to reach the planner so it can revise the implementation plan. How should error propagation be designed?

- A) The tester writes the error to a shared log file that the planner polls.
- **B) The tester returns the structured error to the implementer, which passes it back to the planner as a task failure result.** ✅
- C) The tester sends the error directly to the planner, bypassing the implementer.
- D) The error is suppressed and the tester retries the compilation 3 times before reporting.

> **Answer: B.** 💡 **Remember:** Error propagation should follow the established agent hierarchy: tester → implementer → planner.

---

#### D5-37. `olivier-72`
<sub>**D5** · Task 5.3 · `olivier` · path 2 · `olivier-72`</sub>

Your web search subagent encounters a timeout while fetching results for a competitor analysis. The engineering team implements a change so the subagent catches the timeout internally and returns an empty result set with `status: "success"` and `results: []`. The coordinator receives this and the synthesis agent produces a report that is missing the competitive section entirely, with no indication anything went wrong. What is the problem with this approach?

- **A) Silently returning an empty success result prevents the coordinator from making any recovery decision and allows incomplete work to pass as complete output.** ✅
- B) The synthesis agent should be responsible for detecting empty sections and re-triggering the search subagent directly.
- C) The coordinator should always validate that each subagent returned non-empty results before proceeding to synthesis.
- D) The timeout threshold should be increased so that the subagent does not time out before returning real results.

> **Answer: A.** 💡 **Remember:** Silently suppressing errors by returning empty results as success is an explicitly documented anti-pattern.

---

#### D5-38. `q-ccd-009`
<sub>**D5** · Task 5.4 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-009`</sub>

The CI agent needs to understand a code change that spans 30 files across a large codebase. Reading all 30 changed files plus their dependencies would exceed the context window. What is the most effective large codebase exploration strategy?

- A) Read all 30 changed files and truncate the least-changed ones to fit in the window.
- **B) Use Grep to find relevant context (function signatures, interfaces, imports) from the unchanged dependency files, reading only the most referenced symbols.** ✅
- C) Read only the files with the most lines changed, ignoring small diffs.
- D) Ask the PR author to provide a summary of the changes instead of reading the diff.

> **Answer: B.** 💡 **Remember:** For large codebase exploration, targeted symbol-level reads using Grep are more context-efficient than full-file reads.

---

#### D5-39. `q-mar-012`
<sub>**D5** · Task 5.4 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-012`</sub>

A research subagent is analyzing a 400-page regulatory document to extract requirements relevant to battery storage. The document exceeds the context window. What is the most effective approach?

- A) Split the document into 50-page chunks and process each chunk independently.
- B) Use keyword search to pre-filter the document to sections mentioning "battery", "storage", or "energy" before sending to Claude.
- C) Ask the subagent to read only the table of contents and infer relevant sections.
- **D) Use a retrieval step to embed the document and retrieve only the most semantically relevant sections before sending to Claude.** ✅

> **Answer: D.** 💡 **Remember:** Retrieval-augmented approaches (embedding + semantic search) are the standard solution for large document exploration within context limits.

---

#### D5-40. `olivier-73`
<sub>**D5** · Task 5.4 · `olivier` · path 2 · `olivier-73`</sub>

An agent is performing a deep exploration of a 200,000-line legacy codebase to understand its payment processing flow. After approximately 90 minutes and dozens of file reads, the agent begins referencing "standard patterns in payment systems" rather than the specific classes and flows it found earlier, and its answers become inconsistent with findings from the first hour. What is the most likely cause and the best mitigation strategy?

- A) The agent has reached a rate limit; the fix is to add delays between tool calls to stay within limits.
- **B) Context degradation: as the session grows, specific findings from early in the session compete with general knowledge and the agent's position-attention effects. Mitigate by having the agent maintain a scratchpad file recording key findings throughout the session.** ✅
- C) The legacy codebase's file structure is too complex for a single agent; break it into independent subsystems and run separate agents on each subsystem simultaneously.
- D) The agent is using the wrong tools; switching from `Read` to `Grep` for file exploration would reduce context consumption.

> **Answer: B.** 💡 **Remember:** Context degradation in extended sessions is a known pattern: models start giving inconsistent answers and referencing general knowledge rather than specific findings discovered earlier.

---

#### D5-41. `olivier-74`
<sub>**D5** · Task 5.4 · `olivier` · path 2 · `olivier-74`</sub>

You are running a multi-phase codebase investigation using the Claude Agent SDK. After 45 minutes of exploration (reading files, tracing call chains, building a dependency map) you move into the second phase: identifying security vulnerabilities in the authentication module. You notice the agent is now describing the authentication module as "using standard JWT patterns" when earlier in the session it had found a custom token signing implementation. What technique would most effectively preserve key findings across these phase boundaries?

- **A) Have the agent maintain a scratchpad file that records key findings after each phase, and reference that file at the start of subsequent phases rather than relying on conversation history.** ✅
- B) Use `/compact` before starting the second phase to free up context space and allow the agent to re-read files as needed.
- C) Restart the session with a fresh context at the start of each phase, passing a manual summary of what you found.
- D) Increase the `max_tokens` parameter so the model can hold more context without compressing earlier findings.

> **Answer: A.** 💡 **Remember:** Scratchpad files are the recommended technique for persisting key findings across context boundaries when context degradation becomes apparent.

---

#### D5-42. `q-ccd-010`
<sub>**D5** · Task 5.5 · CI/CD Code Review Pipeline · `moisesprat` · path 1 · `q-ccd-010`</sub>

The CI review agent assigns confidence scores to its findings: high, medium, low. You observe that the agent assigns "high" confidence to 85% of findings. This leads reviewers to ignore the confidence signal. What is the most effective calibration fix?

- A) Normalize confidence post-hoc: map the top 20% to high, next 30% to medium, rest to low.
- **B) Add criteria: "Assign high confidence only when: (1) the issue is definitively present in the diff with no ambiguity about the code's intent AND (2) you can cite the exact line causing the problem."** ✅
- C) Remove confidence scores entirely to prevent misleading signals.
- D) Set a system-level cap: no more than 30% of findings in any review may be high confidence.

> **Answer: B.** 💡 **Remember:** Over-confidence is caused by under-specified criteria. Adding concrete, observable conditions for high confidence (definitive presence + exact location) forces the model to apply a higher bar.

---

#### D5-43. `q-dep-013`
<sub>**D5** · Task 5.5 · Developer Productivity Pipeline · `moisesprat` · path 1 · `q-dep-013`</sub>

A code review agent assigns severity levels: critical, high, medium, low. After deployment, you observe it assigning "critical" to 40% of all findings. This seems over-inflated. What is the most effective fix?

- A) Add a maximum: "No more than 10% of findings should be critical."
- **B) Add explicit criteria: "Critical: security vulnerabilities that allow data exfiltration or authentication bypass. High: bugs that cause data loss or incorrect behavior in production. Medium: issues that affect code correctness in edge cases. Low: style or readability issues."** ✅
- C) Remove the critical severity level and fold those issues into high.
- D) Run a calibration pass where a separate agent re-reviews all critical findings and downgrades false positives.

> **Answer: B.** 💡 **Remember:** Over-inflation of high-severity labels is caused by under-specified criteria. Adding explicit, observable examples for each severity level gives the model concrete anchors for calibration.

---

#### D5-44. `q-mar-013`
<sub>**D5** · Task 5.5 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-013`</sub>

The research coordinator must decide whether to include a finding in the final report. The finding comes from a single source with moderate confidence. What confidence calibration pattern should the coordinator use?

- **A) Include the finding but tag it with its source and confidence level so readers can judge.** ✅
- B) Exclude any finding that comes from fewer than three independent sources.
- C) Include the finding without qualification to avoid cluttering the report with caveats.
- D) Ask the human operator for approval before including single-source findings.

> **Answer: A.** 💡 **Remember:** Preserving provenance and confidence metadata allows downstream consumers to apply their own judgment.

---

#### D5-45. `olivier-75`
<sub>**D5** · Task 5.5 · `olivier` · path 2 · `olivier-75`</sub>

A structured data extraction system for insurance claims achieves 97% overall accuracy on a validation set. The team proposes automating the full workflow without human review. A colleague argues this aggregate metric masks important risks. What is the most important concern?

- A) 97% accuracy means 3% of claims will have errors, which could create legal liability if unchecked.
- **B) Aggregate accuracy metrics can mask poor performance on specific document types or fields. A claim type or field category with 85% accuracy would be hidden by strong performance elsewhere, and stratified analysis is needed before automating.** ✅
- C) The validation set may not be representative of production data volumes, so the 97% figure cannot be trusted.
- D) Human review should always be retained regardless of accuracy metrics because automation of insurance decisions creates regulatory risk.

> **Answer: B.** 💡 **Remember:** The core risk is that aggregate metrics can hide poor performance on specific segments.

---

#### D5-46. `olivier-76`
<sub>**D5** · Task 5.5 · `olivier` · path 2 · `olivier-76`</sub>

An extraction pipeline achieves high accuracy on average but the team wants to implement confidence-based routing: high-confidence extractions proceed automatically while low-confidence ones go to human review. A developer proposes using the model's stated confidence scores directly as the routing threshold. What is the critical flaw in this approach?

- A) Confidence scores add tokens to every response, increasing API costs unnecessarily.
- **B) Model confidence scores must be calibrated against a labeled validation set to determine what score threshold actually corresponds to acceptable accuracy. Uncalibrated raw scores are not reliable predictors of extraction correctness.** ✅
- C) Confidence scores only work when the model outputs a single extraction; multi-field documents require a different approach.
- D) Routing on confidence scores creates two separate code paths that are harder to maintain than a single uniform review workflow.

> **Answer: B.** 💡 **Remember:** A model's raw confidence scores need calibration: without comparing stated confidence against actual correctness on a labeled validation set, there is no reliable mapping between a score of "0.85" and an acceptable error rate.

---

#### D5-47. `q-dex-008`
<sub>**D5** · Task 5.6 · Structured Data Extraction · `moisesprat` · path 1 · `q-dex-008`</sub>

An extraction agent pulls financial figures from three analyst reports covering the same company. Report A states revenue of $4.2B, Report B states $4.1B, Report C states $4.3B (all for the same period). How should the agent handle this in its output?

- A) Use the average: $4.2B, without noting the variance.
- **B) Use the median value ($4.2B) and note that values ranged from $4.1B to $4.3B across sources, citing all three.** ✅
- C) Use the most recent report's figure regardless of value.
- D) Mark the field as extraction_failed due to conflicting sources.

> **Answer: B.** 💡 **Remember:** Presenting the central estimate with the observed range and source citations preserves information provenance and gives consumers the data they need to assess confidence.

---

#### D5-48. `q-mar-014`
<sub>**D5** · Task 5.6 · Multi-Agent Research System · `moisesprat` · path 1 · `q-mar-014`</sub>

The synthesis combines findings from three sources: an academic paper (high credibility), a vendor whitepaper (medium credibility, potential bias), and a blog post (low credibility). Two sources agree on a claim; the blog post contradicts it. How should the synthesis handle this?

- A) Accept the majority (2-source) claim and omit the blog post finding.
- **B) Present the majority claim as the primary finding while noting the dissenting blog post, flagging the credibility differential.** ✅
- C) Treat all three sources equally and present the conflict without resolution.
- D) Default to the most recently published source regardless of credibility.

> **Answer: B.** 💡 **Remember:** Credibility-weighted synthesis presents the best-supported claim as primary while preserving the dissenting view with appropriate context.

---

#### D5-49. `olivier-77`
<sub>**D5** · Task 5.6 · `olivier` · path 2 · `olivier-77`</sub>

A research synthesis agent is combining findings from five subagents that searched different sources. The final report states that "AI adoption in healthcare reached 45% in 2024" but does not cite which source this came from. A reviewer cannot verify the claim because the subagents' individual outputs were not preserved. What structural change to the pipeline would prevent this provenance loss?

- A) Require the synthesis agent to add a generic "Sources consulted" section at the end of the report listing all sources accessed.
- **B) Require subagents to output structured claim-source mappings (claim text, source URL, document name, relevant excerpt) and instruct the synthesis agent to preserve and merge these mappings into the final report rather than summarizing them away.** ✅
- C) Store all raw subagent outputs in a separate log file so they can be consulted if a claim needs verification.
- D) Add a post-synthesis review step where a separate agent checks each claim in the report against the raw subagent outputs.

> **Answer: B.** 💡 **Remember:** The root cause of provenance loss is that summarization steps compress findings without preserving claim-to-source mappings.

---


<a name="scenario-based"></a>
## Scenario-based questions (no fixed domain)

*128 questions — drill these for scenario judgment; map them to domains using §3–§7 of `STUDY_GUIDE.md`.*


### Claude Code for CI  (2 q)

#### S-1. `paul-examples-10`
<sub>**scenario-only** · Claude Code for CI · `paullarionov` · path 1 · `paul-examples-10`</sub>

A pipeline runs `claude "Analyze this pull request for security issues"`, but hangs waiting for interactive input.

What is the correct approach?

- **A) Use the `-p` flag: `claude -p "Analyze this pull request for security issues"`** ✅
- B) Set `CLAUDE_HEADLESS=true`
- C) Redirect stdin from `/dev/null`
- D) Use `--batch`

> **Answer: A.** 💡 **Remember:** `-p` (or `--print`) is the documented way to run Claude Code in non-interactive mode.

---

#### S-2. `paul-examples-11`
<sub>**scenario-only** · Claude Code for CI · `paullarionov` · path 1 · `paul-examples-11`</sub>

The team wants to reduce API cost for automated analysis. Claude currently serves two workflows in real time: (1) a blocking pre-merge check that must complete before developers can merge a PR, and (2) a tech-debt report generated overnight for morning review. A manager proposes moving both to the Message Batches API to save 50%.

How should you evaluate this proposal?

- **A) Use batch processing only for tech-debt reports; keep real-time calls for pre-merge checks** ✅
- B) Move both workflows to batch processing and poll for completion
- C) Keep real-time calls for both to avoid ordering issues in batch results
- D) Move both to batch processing with a fallback to real time if a batch takes too long

> **Answer: A.** 💡 **Remember:** The Message Batches API saves 50%, but processing time can be up to 24 hours with no guaranteed latency SLA.

---


### Claude Code for Continuous Integration  (22 q)

#### S-1. `paul-practice-16`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-16`</sub>

Your CI pipeline runs the Claude Code CLI (in `--print` mode) using CLAUDE.md to provide project context for code review, and developers generally find the reviews substantive. However, they report that integrating findings into the workflow is difficult--Claude outputs narrative paragraphs that must be manually copied into PR comments. The team wants to automatically post each finding as a separate inline PR comment at the relevant place in code, which requires structured data with file path, line number, severity level, and suggested fix. Which approach is most effective?

Which approach is most effective?

- A) Add an "Output Format for Review" section to CLAUDE.md with examples of structured findings so Claude learns the expected format from project context.
- **B) Use the CLI flags `--output-format json` and `--json-schema` to enforce structured findings, then parse the output to post inline comments via the GitHub API.** ✅
- C) Include explicit formatting instructions in the review prompt requiring each finding to follow a parseable template like `[FILE:path] [LINE:n] [SEVERITY:level] ...`.
- D) Keep narrative review format but add a summarization step that uses Claude to generate a structured JSON summary of findings.

> **Answer: B.** 💡 **Remember:** Using `--output-format json` with `--json-schema` enforces structured output at the CLI level, guaranteeing well-formed JSON with the required fields (file path, line number, severity, suggested fix) that can be reliably parsed and posted as inline PR comme...

---

#### S-2. `paul-practice-17`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-17`</sub>

Your team uses Claude Code for generating code suggestions, but you notice a pattern: non-obvious issues--performance optimizations that break edge cases, cleanups that unexpectedly change behavior--are only caught when another team member reviews the PR. Claude's reasoning during generation shows it considered these cases but concluded its approach was correct. Which approach directly addresses the root cause of this self-check limitation?

Which approach directly addresses the root cause?

- **A) Run a second independent instance of Claude Code to review the changes without access to the generator's reasoning.** ✅
- B) Enable extended thinking mode for the generation stage to allow more thorough deliberation before producing suggestions.
- C) Add explicit self-review instructions to the generation prompt asking Claude to critique its own suggestions before finalizing output.
- D) Include full test files and documentation in prompt context so Claude better understands expected behavior during generation.

> **Answer: A.** 💡 **Remember:** A second independent Claude Code instance without access to the generator's reasoning directly addresses the root cause by avoiding confirmation bias.

---

#### S-3. `paul-practice-18`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-18`</sub>

Your code review component is iterative: Claude analyzes the changed file, then may request related files (imports, base classes, tests) via tool calls to understand context before providing final feedback. Your application defines a tool that lets Claude request file contents; Claude calls the tool, gets results, and continues analysis. You're evaluating batch processing to reduce API cost. What is the primary technical limitation when considering batch processing for this workflow?

What is the primary technical limitation?

- A) Batch processing does not include correlation IDs to map outputs back to input requests.
- **B) The asynchronous model cannot execute tools mid-request and return results for Claude to continue analysis.** ✅
- C) The Batch API does not support tool definitions in request parameters.
- D) The batch processing latency of up to 24 hours is too slow for pull request feedback, although the workflow would otherwise function.

> **Answer: B.** 💡 **Remember:** A "fire-and-forget" asynchronous Batch API model has no mechanism to intercept a tool call during a request, execute the tool, and return results for Claude to continue analysis.

---

#### S-4. `paul-practice-19`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-19`</sub>

Your CI/CD system runs three Claude-based analyses: (1) fast style checks on every PR that block merging until completion, (2) comprehensive weekly security audits of the entire codebase, and (3) nightly test-case generation for recently changed modules. The Message Batches API offers 50% savings but processing can take up to 24 hours. You want to optimize API cost while maintaining an acceptable developer experience. Which combination correctly matches each task to an API approach?

Which combination is correct?

- A) Use the Message Batches API for all three tasks to maximize 50% savings, configuring the pipeline to poll for batch completion.
- **B) Use synchronous calls for PR style checks; use the Message Batches API for weekly security audits and nightly test generation.** ✅
- C) Use synchronous calls for all three tasks for consistent response times, relying on prompt caching to reduce costs across workloads.
- D) Use synchronous calls for PR style checks and nightly test generation; use the Message Batches API only for weekly security audits.

> **Answer: B.** 💡 **Remember:** PR style checks block developers and require immediate responses via synchronous calls, while weekly security audits and nightly test generation are scheduled tasks with flexible deadlines that can tolerate up to a 24-hour batch window--capturing 50% saving...

---

#### S-5. `paul-practice-20`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-20`</sub>

Your automated reviews find real issues, but developers report the feedback is not actionable. Findings include phrases like "complex ticket routing logic" or "potential null pointer" without specifying what exactly to change. When you add detailed instructions like "always include concrete fix suggestions," the model still produces inconsistent output--sometimes detailed, sometimes vague. Which prompting technique most reliably produces consistently actionable feedback?

Which prompting technique is most reliable?

- A) Further refine instructions with more explicit requirements for each part of the feedback format (location, issue, severity, proposed fix).
- B) Expand the context window to include more surrounding codebase so the model has enough information to propose concrete fixes.
- C) Implement a two-pass approach where one prompt identifies issues and a second generates fixes, allowing specialization.
- **D) Add 3-4 few-shot examples showing the exact required format: identified issue, location in code, concrete fix suggestion.** ✅

> **Answer: D.** 💡 **Remember:** Few-shot examples are the most effective technique for achieving consistent output format when instructions alone produce variable results.

---

#### S-6. `paul-practice-21`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-21`</sub>

Your CI pipeline includes two Claude-based code review modes: a pre-merge-commit hook that blocks PR merge until completion, and a "deep analysis" that runs overnight, polls for batch completion, and posts detailed suggestions to the PR. You want to reduce API cost using the Message Batches API, which offers 50% savings but requires polling and can take up to 24 hours. Which mode should use batch processing?

Which mode should use batch processing?

- A) Only the pre-merge-commit hook.
- **B) Only the deep analysis.** ✅
- C) Both modes.
- D) Neither mode.

> **Answer: B.** 💡 **Remember:** Deep analysis is an ideal candidate for batch processing because it already runs overnight, tolerates delay, and uses a polling model before publishing results--matching the asynchronous, polling-based architecture of the Message Batches API while capturing...

---

#### S-7. `paul-practice-22`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-22`</sub>

Your automated review analyzes comments and docstrings. The current prompt instructs Claude to "check that comments are accurate and up to date." Findings often flag acceptable patterns (TODO markers, simple descriptions) while missing comments describing behavior the code no longer implements. What change addresses the root cause of this inconsistent analysis?

What change addresses the root cause?

- A) Include `git blame` data so Claude can identify comments that predate recent code changes.
- B) Add few-shot examples of misleading comments to help the model recognize similar patterns in the codebase.
- C) Filter TODO, FIXME, and descriptive comment patterns before analysis to reduce noise.
- **D) Specify explicit criteria: flag comments only when the behavior they claim contradicts the code's actual behavior.** ✅

> **Answer: D.** 💡 **Remember:** Explicit criteria--flagging comments only when claimed behavior contradicts actual code behavior--directly addresses the root cause by replacing a vague instruction with a precise definition of what constitutes a problem.

---

#### S-8. `paul-practice-23`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-23`</sub>

Your automated code review system shows inconsistent severity ratings--similar issues like null pointer risks are rated "critical" in some PRs but only "medium" in others. Developer surveys show growing distrust--many start dismissing findings without reading because "half are wrong." High-false-positive categories erode trust in accurate categories. Which approach best restores developer trust while improving the system?

Which approach best restores developer trust?

- **A) Temporarily disable high-false-positive categories (style, naming, documentation) and keep only high-precision categories while improving prompts.** ✅
- B) Keep all categories enabled but display confidence scores with each finding so developers can decide what to investigate.
- C) Keep all categories enabled and add few-shot examples to improve accuracy for each category over the next few weeks.
- D) Apply a uniform strictness reduction across all categories to bring the overall false-positive rate down.

> **Answer: A.** 💡 **Remember:** Temporarily disabling high-false-positive categories immediately stops trust erosion by removing noisy findings that cause developers to dismiss everything, while preserving value from high-precision categories like security and correctness.

---

#### S-9. `paul-practice-24`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-24`</sub>

Your automated review generates test-case suggestions for each PR. Reviewing a PR that adds course completion tracking, Claude suggests 10 test cases, but developer feedback shows that 6 duplicate scenarios already covered by the existing test suite. What change most effectively reduces duplicate suggestions?

What change is most effective?

- **A) Include the existing test file in context so Claude can determine what scenarios are already covered.** ✅
- B) Reduce the requested number of suggestions from 10 to 5, assuming Claude prioritizes the most valuable cases first.
- C) Add instructions directing Claude to focus exclusively on edge cases and error conditions rather than success paths.
- D) Implement post-processing that filters suggestions whose descriptions match existing test names via keyword overlap.

> **Answer: A.** 💡 **Remember:** Including the existing test file fixes the root cause of duplication: Claude can only avoid suggesting already-covered scenarios if it knows what tests already exist.

---

#### S-10. `paul-practice-25`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-25`</sub>

After an initial automated review identifies 12 findings, a developer pushes new commits to address issues. Re-running review produces 8 findings, but developers report that 5 duplicate previous comments on code that was already fixed in the new commits. What is the most effective way to eliminate this redundant feedback while maintaining thoroughness?

What is the most effective way to eliminate redundant feedback?

- A) Run review only when the PR is created and in the final pre-merge state, skipping intermediate commits.
- B) Add a post-processing filter that removes findings that match previous ones by file paths and issue descriptions before posting comments.
- C) Restrict review scope to files changed in the most recent push, excluding files from earlier commits.
- **D) Include previous review findings in context and instruct Claude to report only new or still-unresolved issues.** ✅

> **Answer: D.** 💡 **Remember:** Including prior review findings in context lets Claude distinguish new problems from those already addressed in recent commits.

---

#### S-11. `paul-practice-26`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-26`</sub>

Your pipeline script runs `claude "Analyze this pull request for security issues"`, but the job hangs indefinitely. Logs show Claude Code is waiting for interactive input. What is the correct approach to run Claude Code in an automated pipeline?

What is the correct approach?

- A) Add a `--batch` flag: `claude --batch "Analyze this pull request for security issues"`.
- **B) Add the `-p` flag: `claude -p "Analyze this pull request for security issues"`.** ✅
- C) Redirect stdin from `/dev/null`: `claude "Analyze this pull request for security issues" < /dev/null`.
- D) Set the environment variable `CLAUDE_HEADLESS=true` before running the command.

> **Answer: B.** 💡 **Remember:** The `-p` (or `--print`) flag is the documented way to run Claude Code non-interactively.

---

#### S-12. `paul-practice-27`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-27`</sub>

A pull request changes 14 files in an inventory tracking module. A single-pass review that analyzes all files together produces inconsistent results: detailed feedback on some files but shallow comments on others, missed obvious bugs, and contradictory feedback (a pattern is flagged in one file but identical code is approved in another file in the same PR). How should you restructure the review?

How should you restructure the review?

- A) Run three independent full-PR review passes and flag only issues that appear in at least two of the three runs.
- **B) Split into focused passes: review each file individually for local issues, then run a separate integration-oriented pass to examine cross-file data flows.** ✅
- C) Require developers to split large PRs into smaller submissions of 3-4 files before running automated review.
- D) Switch to a larger model with a bigger context window so it can pay sufficient attention to all 14 files in one pass.

> **Answer: B.** 💡 **Remember:** Focused per-file passes address the root cause--attention dilution--by ensuring consistent depth and reliable local issue detection.

---

#### S-13. `paul-practice-28`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-28`</sub>

Your automated code review averages 15 findings per pull request, and developers report a 40% false-positive rate. The bottleneck is investigation time: developers must click into each finding to read Claude's rationale before deciding whether to fix or dismiss it. Your CLAUDE.md already contains comprehensive rules for acceptable patterns, and stakeholders rejected any approach that filters findings before developers see them. What change best addresses investigation time?

What change best addresses investigation time?

- **A) Require Claude to include its rationale and confidence estimate directly in each finding.** ✅
- B) Add a post-processor that analyzes finding patterns and automatically suppresses those that match historical false-positive signatures.
- C) Categorize findings as "blocking issues" vs "suggestions," with different review requirements by level.
- D) Configure Claude to show only high-confidence findings, filtering uncertain flags before developers see them.

> **Answer: A.** 💡 **Remember:** Including rationale and confidence directly in each finding reduces investigation time by letting developers quickly triage without opening each finding.

---

#### S-14. `paul-practice-29`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-29`</sub>

Analysis of your automated code review shows large differences in false-positive rates by finding category: security/correctness findings have 8% false positives, performance findings 18%, style/naming findings 52%, and documentation findings 48%. Developer surveys show growing distrust--many start dismissing findings without reading because "half are wrong." High-false-positive categories erode trust in accurate categories. Which approach best restores developer trust while improving the system?

Which approach best restores developer trust?

- **A) Temporarily disable high-false-positive categories (style, naming, documentation) and keep only high-precision categories while improving prompts.** ✅
- B) Keep all categories enabled but display confidence scores with each finding so developers can decide what to investigate.
- C) Keep all categories enabled and add few-shot examples to improve accuracy for each category over the next few weeks.
- D) Apply a uniform strictness reduction across all categories to bring the overall false-positive rate down.

> **Answer: A.** 💡 **Remember:** Temporarily disabling high-false-positive categories immediately stops trust erosion by removing noisy findings that cause developers to dismiss everything, while preserving value from high-precision categories like security and correctness.

---

#### S-15. `paul-practice-30`
<sub>**scenario-only** · Claude Code for Continuous Integration · `paullarionov` · path 1 · `paul-practice-30`</sub>

Your team wants to reduce API costs for automated analysis. Currently, synchronous Claude calls support two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes moving both to the Message Batches API to save 50%. How should you evaluate this proposal?

How should you evaluate this proposal?

- A) Move both to batch processing with fallback to synchronous calls if batches take too long.
- B) Move both workflows to batch processing with status polling to verify completion.
- **C) Use batch processing only for technical debt reports; keep synchronous calls for pre-merge checks.** ✅
- D) Keep synchronous calls for both workflows to avoid issues with batch result ordering.

> **Answer: C.** 💡 **Remember:** Message Batches API processing can take up to 24 hours with no latency SLA, which is acceptable for overnight technical debt reports but unacceptable for blocking pre-merge checks where developers wait.

---

#### S-16. `sgrid-fullexam-31`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-31`</sub>

Your CI job runs `claude "Review this PR"` and hangs. What is the fix?

- A) Set `CLAUDE_HEADLESS=true`.
- **B) Use `claude -p "Review this PR"` with the `-p` flag for non-interactive mode.** ✅
- C) Redirect stdin from `/dev/null`.
- D) Use `claude --batch "Review this PR"`.

> **Answer: B.** 💡 **Remember:** The `-p` (or `--print`) flag is the documented way to run Claude Code in non-interactive mode for CI/CD.

---

#### S-17. `sgrid-fullexam-32`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-32`</sub>

CI review output needs to be structured JSON for automated inline PR comments. Which flags?

- A) `-p --verbose`
- **B) `-p --output-format json --json-schema <schema>`** ✅
- C) `-p --format json`
- D) `-p | jq`

> **Answer: B.** 💡 **Remember:** `--output-format json` with `--json-schema` produces machine-parseable structured output.

---

#### S-18. `sgrid-fullexam-33`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-33`</sub>

Your manager wants to switch both pre-merge code review and overnight debt analysis to the batch API for 50% savings. What is correct?

- A) Switch both.
- **B) Switch overnight debt analysis to batch; keep pre-merge reviews synchronous. Batch has up to 24-hour processing with no guaranteed latency SLA.** ✅
- C) Keep both synchronous.
- D) Switch both with timeout fallback.

> **Answer: B.** 💡 **Remember:** Batch API is for latency-tolerant workloads only. Pre-merge checks are blocking and need real-time responses.

---

#### S-19. `sgrid-fullexam-34`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-34`</sub>

A 14-file PR review produces contradictory findings: flagging a pattern as problematic in one file while approving identical code elsewhere. What is the fix?

- A) Use a larger context window model.
- **B) Split into per-file local analysis passes plus a separate cross-file integration pass.** ✅
- C) Require smaller PRs.
- D) Run three reviews and take majority vote.

> **Answer: B.** 💡 **Remember:** Multi-pass review (per-file + integration) addresses attention dilution in large reviews.

---

#### S-20. `sgrid-fullexam-35`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-35`</sub>

The same Claude session generates code and reviews it. The review finds no issues, but an independent reviewer later finds bugs. Why?

- A) The review prompt was inadequate.
- **B) The model retains generation reasoning context, making it biased toward confirming its own decisions.** ✅
- C) The model cannot review code.
- D) Extended thinking was not enabled.

> **Answer: B.** 💡 **Remember:** Self-review in the same session is limited by retained reasoning context bias.

---

#### S-21. `sgrid-fullexam-37`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-37`</sub>

Generated tests frequently duplicate existing test scenarios. What prevents this?

- A) Limit the number of generated tests.
- **B) Provide existing test files in context so Claude avoids duplicating already-covered scenarios.** ✅
- C) Run a deduplication filter on generated tests.
- D) Only generate tests for new code.

> **Answer: B.** 💡 **Remember:** Context awareness of existing tests prevents duplication at generation time.

---

#### S-22. `sgrid-fullexam-38`
<sub>**scenario-only** · Claude Code for Continuous Integration · `sgrid` · path 2 · `sgrid-fullexam-38`</sub>

You want CI-generated tests to follow project conventions and use available fixtures. What is the most effective way to convey this?

- A) Add "Generate high-quality tests" to the CI prompt.
- **B) Document testing standards, valuable test criteria, and available fixtures in CLAUDE.md.** ✅
- C) Specify exact test patterns in the CI script.
- D) Post-process tests to add fixture imports.

> **Answer: B.** 💡 **Remember:** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code.

---


### Code Generation with Claude Code  (24 q)

#### S-1. `paul-examples-4`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-examples-4`</sub>

You need a custom `/review` command for standard code review that is available to the whole team when they clone the repository.

Where should you create the command file?

- **A) `.claude/commands/` in the project repository** ✅
- B) `~/.claude/commands/`
- C) Root `CLAUDE.md`
- D) `.claude/config.json`

> **Answer: A.** 💡 **Remember:** Project commands stored in `.claude/commands/` are version-controlled and automatically available to everyone.

---

#### S-2. `paul-examples-5`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-examples-5`</sub>

You need to restructure a monolith into microservices (dozens of files, service-boundary decisions).

What approach should you use?

- **A) Planning mode: explore the codebase, understand dependencies, design an approach** ✅
- B) Direct execution incrementally
- C) Direct execution with detailed up-front instructions
- D) Direct execution and switch to planning when it gets hard

> **Answer: A.** 💡 **Remember:** Planning mode is designed for large changes, multiple possible approaches, and architectural decisions.

---

#### S-3. `paul-examples-6`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-examples-6`</sub>

A codebase has different conventions across areas (React, API, database). Tests are co-located with code. You want conventions to be applied automatically.

What approach should you use?

- **A) `.claude/rules/` files with YAML frontmatter and glob patterns** ✅
- B) Put everything in the root CLAUDE.md
- C) Skills in `.claude/skills/`
- D) CLAUDE.md in every directory

> **Answer: A.** 💡 **Remember:** `.claude/rules/` with glob patterns (e.g., `**/*.test.tsx`) enables automatic convention application based on file paths--ideal for tests spread across the codebase.

---

#### S-4. `paul-practice-31`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-31`</sub>

You asked Claude Code to implement a function that transforms API responses into an internal normalized format. After two iterations, the output structure still doesn't match expectations--some fields are nested differently and timestamps are formatted incorrectly. You described requirements in prose, but Claude interprets them differently each time.

Which approach is most effective for the next iteration?

- A) Write a JSON schema describing the expected output structure and validate Claude's output against it after each iteration.
- **B) Provide 2-3 concrete input-output examples showing the expected transformation for representative API responses.** ✅
- C) Rewrite requirements with more technical precision, specifying exact field mappings, nesting rules, and timestamp format strings.
- D) Ask Claude to explain its current understanding of the requirements to identify where interpretations diverge.

> **Answer: B.** 💡 **Remember:** Concrete input-output examples remove ambiguity inherent in prose descriptions by showing Claude the exact expected transformation results.

---

#### S-5. `paul-practice-32`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-32`</sub>

You need to add Slack as a new notification channel. The existing codebase has clear, established patterns for email, SMS, and push channels. However, Slack's API offers fundamentally different integration approaches--incoming webhooks (simple, one-way), bot tokens (support delivery confirmation and programmatic control), or Slack Apps (two-way events, requires workspace approval). Your task says "add Slack support" without specifying integration method or requiring advanced features like delivery tracking.

How should you approach this task?

- A) Start in direct execution mode using incoming webhooks to match the existing one-way notification pattern.
- **B) Switch to planning mode to explore integration options and architectural implications, then present a recommendation before implementation.** ✅
- C) Start in direct execution mode by scaffolding a Slack channel class using existing patterns, deferring the integration method decision.
- D) Start in direct execution mode using a bot-token approach to ensure delivery confirmation is possible.

> **Answer: B.** 💡 **Remember:** Slack integration has multiple valid approaches with significantly different architectural implications, and requirements are ambiguous.

---

#### S-6. `paul-practice-33`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-33`</sub>

Your CLAUDE.md file has grown to 400+ lines containing coding standards, testing conventions, a detailed PR review checklist, deployment instructions, and database migration procedures. You want Claude to always follow coding standards and testing conventions, but apply PR review, deploy, and migration guidance only when doing those tasks.

Which restructuring approach is most effective?

- A) Move all guidance into separate Skills files organized by workflow type, leaving only a brief project description in CLAUDE.md.
- B) Keep everything in CLAUDE.md but use `@import` syntax to organize into separately maintained files by category.
- C) Split CLAUDE.md into files under `.claude/rules/` with path-bound glob patterns so each rule loads only for the relevant file types.
- **D) Keep universal standards in CLAUDE.md and create Skills for workflow-specific guidance (PR review, deploy, migrations) with trigger keywords.** ✅

> **Answer: D.** 💡 **Remember:** CLAUDE.md content loads in every session, ensuring coding standards and testing conventions always apply, while Skills are invoked on demand when Claude detects trigger keywords--ideal for workflow-specific guidance like PR review, deployment, and migrations.

---

#### S-7. `paul-practice-34`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-34`</sub>

You're tasked with restructuring your team's monolithic application into microservices. This impacts changes across dozens of files and requires decisions about service boundaries and module dependencies.

Which approach should you choose?

- **A) Switch to planning mode to explore the codebase, understand dependencies, and design the implementation approach before making changes.** ✅
- B) Start in direct execution mode and switch to planning only after encountering unexpected complexity during implementation.
- C) Start in direct execution mode and make incremental changes, letting implementation reveal natural service boundaries.
- D) Use direct execution with detailed upfront instructions that specify each service structure.

> **Answer: A.** 💡 **Remember:** Planning mode is the right strategy for complex architectural restructuring like splitting a monolith: it allows safe exploration and informed decisions about boundaries before committing to potentially expensive changes across many files.

---

#### S-8. `paul-practice-35`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-35`</sub>

Your team created a `/analyze-codebase` skill that performs deep code analysis--dependency scanning, test coverage counts, and code quality metrics. After running the command, team members report Claude becomes less responsive in the session and loses the context of the original task.

How do you most effectively fix this while keeping full analysis capabilities?

- **A) Add `context: fork` in the skill frontmatter to run the analysis in an isolated subagent context.** ✅
- B) Add `model: haiku` in frontmatter to use a faster, cheaper model for analysis.
- C) Split the skill into three smaller skills, each producing less output.
- D) Add instructions to the skill to compress all results into a short summary before displaying them.

> **Answer: A.** 💡 **Remember:** `context: fork` runs the analysis in an isolated subagent context so the large output does not pollute the main session's context window and Claude does not lose track of the original task.

---

#### S-9. `paul-practice-36`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-36`</sub>

Your team uses a `/commit` skill in `.claude/skills/commit/SKILL.md`. A developer wants to customize it for their personal workflow (different commit message format, extra checks) without affecting teammates.

What do you recommend?

- A) Create a personal version under `~/.claude/skills/` with a different name, e.g., `/my-commit`.
- B) Add conditional logic based on username in the project skill frontmatter.
- **C) Create a personal version at `~/.claude/skills/commit/SKILL.md` with the same name.** ✅
- D) Set `override: true` in the personal skill frontmatter to prioritize it over the project version.

> **Answer: C.** 💡 **Remember:** Personal skills take precedence over project skills with the same name. A personal skill at `~/.claude/skills/commit/SKILL.md` will override the team's project skill, allowing the developer to customize their workflow while maintaining the familiar `/commit...

---

#### S-10. `paul-practice-37`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-37`</sub>

Your team has used Claude Code for months. Recently, three developers report Claude follows the guidance "always include comprehensive error handling," but a fourth developer who just joined says Claude does not follow it. All four work in the same repo and have up-to-date code.

What is the most likely cause and fix?

- **A) The guidance lives in the original developers' user-level `~/.claude/CLAUDE.md` files, not in the project `.claude/CLAUDE.md`. Move the instruction to the project-level file so all team members receive it.** ✅
- B) The new developer's `~/.claude/CLAUDE.md` contains conflicting instructions overriding project settings; they should delete the conflicting section.
- C) Claude Code learns per-user preferences over time; the new developer must repeat the requirement until Claude "remembers" it.
- D) Claude Code caches CLAUDE.md after first read; original developers use cached versions. Everyone should clear the Claude Code cache.

> **Answer: A.** 💡 **Remember:** If the guidance was added only to the original developers' user-level configs and not to the project-level `.claude/CLAUDE.md`, new team members won't receive it.

---

#### S-11. `paul-practice-38`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-38`</sub>

You find that including 2-3 full endpoint implementation examples as context significantly improves consistency when generating new API endpoints. However, this context is useful only when creating new endpoints--not when debugging, reviewing code, or other work in the API directory.

Which configuration approach is most effective?

- A) Add endpoint examples and pattern documentation to the project CLAUDE.md so they are always available.
- B) Manually reference endpoint examples in every generation request by copying code into the prompt.
- C) Configure path-specific rules in `.claude/rules/api/` that include endpoint examples and activate when working in the API directory.
- **D) Create a skill that references the endpoint examples and contains pattern-following instructions, invoked on demand via a slash command.** ✅

> **Answer: D.** 💡 **Remember:** A skill invoked on demand loads the example context only when generating new endpoints, not during unrelated tasks like debugging or review.

---

#### S-12. `paul-practice-39`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-39`</sub>

Your team created a `/migration` skill that generates database migration files. It takes the migration name via `$ARGUMENTS`. In production you observe three issues: (1) developers often run the skill without arguments, causing poorly named files, (2) the skill sometimes uses database schema details from unrelated prior conversations, and (3) a developer accidentally ran destructive test cleanup when the skill had broad tool access.

Which configuration approach fixes all three problems?

- A) Use positional parameters `$1` and `$2` instead of `$ARGUMENTS` to enforce specific inputs, include explicit schema file references via `@` syntax for context control, and add a frontmatter description warning about destructive operations.
- **B) Add `argument-hint` in frontmatter to request required parameters, use `context: fork` to isolate execution, and restrict `allowed-tools` to file-write operations.** ✅
- C) Split into `/migration-create` and `/migration-apply` skills, add validation instructions to request migration name if missing, and use different `allowed-tools` scopes for each.
- D) Add validation instructions in the skill SKILL.md to ensure `$ARGUMENTS` is a valid name, add prompts to ignore prior conversation context, and list prohibited operations to avoid.

> **Answer: B.** 💡 **Remember:** This uses three separate configuration features to address each problem: `argument-hint` improves argument entry and reduces missing arguments, `context: fork` prevents context leakage from prior conversations, and `allowed-tools` constrains the skill to sa...

---

#### S-13. `paul-practice-40`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-40`</sub>

Your codebase contains areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow the repository pattern. Test files are distributed across the codebase next to the code under test (e.g., `Button.test.tsx` next to `Button.tsx`), and you want all tests to follow the same conventions regardless of location.

What is the most supported way to ensure Claude automatically applies the correct conventions when generating code?

- A) Put all conventions in the root CLAUDE.md under headings for each area and rely on Claude to infer which section applies.
- B) Create skills in `.claude/skills/` for each code type, embedding conventions in each SKILL.md.
- C) Place a separate CLAUDE.md file in each subdirectory containing conventions for that area.
- **D) Create rule files under `.claude/rules/` with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.** ✅

> **Answer: D.** 💡 **Remember:** `.claude/rules/` files with YAML frontmatter and glob patterns (e.g., `**/*.test.tsx`, `src/api/**/*.ts`) enable deterministic, path-based convention application regardless of directory structure.

---

#### S-14. `paul-practice-41`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-41`</sub>

You want to create a custom slash command `/review` that runs your team's standard code review checklist. It should be available to every developer when they clone or update the repository.

Where should you create the command file?

- A) In `~/.claude/commands/` in each developer's home directory.
- **B) In the project repository under `.claude/commands/`.** ✅
- C) In `.claude/config.json` as an array of commands.
- D) In the root project CLAUDE.md.

> **Answer: B.** 💡 **Remember:** Putting custom slash commands under `.claude/commands/` inside the project repository ensures they are version-controlled and automatically available to every developer who clones or updates the repo.

---

#### S-15. `paul-practice-42`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-42`</sub>

Your team's CLAUDE.md grew beyond 500 lines mixing TypeScript conventions, testing guidance, API patterns, and deployment procedures. Developers find it hard to locate and update the right sections.

What approach does Claude Code support to organize project-level instructions into focused topical modules?

- A) Define a `.claude/config.yaml` mapping file patterns to specific sections inside CLAUDE.md.
- **B) Create separate Markdown files in `.claude/rules/`, each covering one topic (e.g., `testing.md`, `api-conventions.md`).** ✅
- C) Split instructions into README.md files in relevant subdirectories that Claude automatically loads as instructions.
- D) Create multiple files named CLAUDE.md at different levels of the directory tree, each overriding parent instructions.

> **Answer: B.** 💡 **Remember:** Claude Code supports a `.claude/rules/` directory where you can create separate Markdown files for topical guidance (e.g., `testing.md`, `api-conventions.md`), allowing teams to organize large instruction sets into focused, maintainable modules.

---

#### S-16. `paul-practice-43`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-43`</sub>

You create a custom skill `/explore-alternatives` that your team uses to brainstorm and evaluate implementation approaches before choosing one. Developers report that after running the skill, subsequent Claude responses are influenced by the alternatives discussion--sometimes referencing rejected approaches or retaining exploration context that interferes with actual implementation.

How should you most effectively configure this skill?

- A) Use the `!` prefix in the skill to run exploration logic as a bash subprocess.
- **B) Add `context: fork` in the skill frontmatter.** ✅
- C) Split into two skills--`/explore-start` and `/explore-end`--to mark boundaries when exploration context should be discarded.
- D) Create the skill in `~/.claude/skills/` instead of `.claude/skills/`.

> **Answer: B.** 💡 **Remember:** `context: fork` runs the skill in an isolated subagent context so exploration discussions do not pollute the main conversation history.

---

#### S-17. `paul-practice-44`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-44`</sub>

Your team wants to add a GitHub MCP server for searching PRs and checking CI status via Claude Code. Each of six developers has their own personal GitHub access token. You want consistent tooling across the team without committing credentials to version control.

Which configuration approach is most effective?

- A) Have each developer add the server in user scope via `claude mcp add --scope user`.
- B) Create an MCP server wrapper that reads tokens from a `.env` file and proxies GitHub API calls, then add the wrapper to the project `.mcp.json`.
- **C) Add the server to the project `.mcp.json` using environment variable substitution (`${GITHUB_TOKEN}`) for auth and document the required environment variable in the project README.** ✅
- D) Configure the server in project scope with a placeholder token, then tell developers to override it in their local config.

> **Answer: C.** 💡 **Remember:** A project `.mcp.json` with environment variable substitution is idiomatic: it provides a single version-controlled source of truth for MCP configuration while letting each developer supply credentials via environment variables.

---

#### S-18. `paul-practice-45`
<sub>**scenario-only** · Code Generation with Claude Code · `paullarionov` · path 1 · `paul-practice-45`</sub>

You're adding error-handling wrappers around external API calls across a 120-file codebase. The work has three phases: (1) discover all call sites and patterns, (2) collaboratively design the error-handling approach, and (3) implement wrappers consistently. In Phase 1, Claude generates large output listing hundreds of call sites with context, quickly filling the context window before discovery finishes.

Which approach is most effective to complete the task while maintaining implementation consistency?

- **A) Use an Explore subagent for Phase 1 to isolate verbose discovery output and return a summary, then continue Phases 2-3 in the main conversation.** ✅
- B) Do all phases in the main conversation, periodically using `/compact` to reduce context usage while moving through files.
- C) Switch to headless mode with `--continue`, passing explicit context summaries between batch calls to maintain continuity.
- D) Define the error-handling pattern in CLAUDE.md, then process files in batches across multiple sessions relying on the shared memory file for consistency.

> **Answer: A.** 💡 **Remember:** An Explore subagent isolates the verbose discovery output in a separate context and returns only a concise summary to the main conversation.

---

#### S-19. `sgrid-fullexam-11`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-11`</sub>

Test files are spread throughout the codebase (e.g., `Button.test.tsx` next to `Button.tsx`) and should all follow the same testing conventions regardless of location. What is the most maintainable configuration?

- A) Add testing conventions to the root CLAUDE.md.
- **B) Create rule files in `.claude/rules/` with YAML frontmatter glob patterns like `paths: ["**/*.test.tsx"]`.** ✅
- C) Place a CLAUDE.md in every directory containing test files.
- D) Create a testing skill that developers must invoke before writing tests.

> **Answer: B.** 💡 **Remember:** Path-specific rules with glob patterns apply conventions to files by type regardless of directory location, which is ideal for test files spread throughout the codebase.

---

#### S-20. `sgrid-fullexam-13`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-13`</sub>

A developer asks Claude to transform function signatures from camelCase to snake_case. After multiple attempts with different prose instructions, the results are inconsistent. What technique works best?

- A) More detailed written instructions.
- **B) 2-3 concrete input/output examples showing the exact transformation.** ✅
- C) A regular expression replacement.
- D) A stricter system prompt tone.

> **Answer: B.** 💡 **Remember:** Concrete examples are the most effective way to communicate transformations when prose produces inconsistent results.

---

#### S-21. `sgrid-fullexam-14`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-14`</sub>

A large CLAUDE.md (600 lines) covers API conventions, testing, deployment, and security. Maintenance is becoming difficult. What is the best refactoring?

- A) Add section headers and a table of contents.
- **B) Split into focused files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`).** ✅
- C) Move to external documentation and link from CLAUDE.md.
- D) Create separate CLAUDE.md files in each subdirectory.

> **Answer: B.** 💡 **Remember:** `.claude/rules/` is designed for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md.

---

#### S-22. `sgrid-fullexam-15`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-15`</sub>

A skill produces verbose codebase analysis output that consumes significant context. How do you prevent it from polluting the main conversation?

- A) Reduce the analysis depth.
- **B) Use `context: fork` in the SKILL.md frontmatter to run the skill in an isolated sub-agent context.** ✅
- C) Summarize the output manually.
- D) Use `output: minimal` in the frontmatter.

> **Answer: B.** 💡 **Remember:** `context: fork` runs the skill in isolation, preventing verbose output from consuming main conversation context.

---

#### S-23. `sgrid-fullexam-16`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-16`</sub>

Your monorepo has React, Angular, and Go packages. Each needs different coding standards. What is the most maintainable configuration?

- A) Put all standards in root CLAUDE.md with headers for each technology.
- **B) Use `@import` in each package's CLAUDE.md to include relevant standards files.** ✅
- C) Duplicate a comprehensive CLAUDE.md in each package directory.
- D) Use runtime detection of the current file's language.

> **Answer: B.** 💡 **Remember:** `@import` enables selective inclusion of relevant standards files per package while avoiding duplication.

---

#### S-24. `sgrid-fullexam-9`
<sub>**scenario-only** · Code Generation with Claude Code · `sgrid` · path 2 · `sgrid-fullexam-9`</sub>

A new developer joins the team and reports Claude Code is not following the project's coding standards. Other developers do not have this issue. The standards are in a CLAUDE.md file. What is the most likely cause?

- A) The new developer's Claude Code version is outdated.
- **B) The coding standards are in `~/.claude/CLAUDE.md` (user-level) on another developer's machine, not in the project-level config.** ✅
- C) The CLAUDE.md file is too large.
- D) The standards use syntax that Claude Code does not support.

> **Answer: B.** 💡 **Remember:** User-level config is not shared via version control. Project-level config (.claude/CLAUDE.md or root CLAUDE.md) is needed for team-wide standards.

---


### Conversational AI Architecture Patterns  (16 q)

#### S-1. `paul-practice-61`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-61`</sub>

Your `remove_team_member` tool uses a `dry_run: boolean` parameter for previewing impacts before execution. Production monitoring shows the agent bypasses the preview step by calling with `dry_run=false` directly. You need to ensure every removal is preceded by a preview that the user explicitly confirms.

What is the most reliable approach?

- A) Add server-side validation that permits `dry_run=false` only when a `dry_run=true` call with identical parameters occurred within the past 60 seconds.
- B) Annotate the tool as requiring confirmation and configure the orchestration layer to prompt the user for approval before forwarding any calls to annotated tools.
- C) Add detailed instructions and few-shot examples to the tool description requiring the agent to always call with `dry_run=true` first and wait for user confirmation before calling again.
- **D) Replace with two tools: `preview_remove_member` returns impact details and a single-use confirmation token; `execute_remove_member` requires that token, binding execution to the preview.** ✅

> **Answer: D.** 💡 **Remember:** The two-tool token-binding approach makes it architecturally impossible to execute without a prior preview--the execute tool literally requires a token that only the preview tool can generate.

---

#### S-2. `paul-practice-62`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-62`</sub>

Production monitoring shows your `search_catalog` tool fails 12% of the time: 8% are network timeouts that succeed when retried, and 4% are query syntax errors that never succeed regardless of retries. Currently both error types are returned identically, causing wasted retries.

How should you modify the tool's error handling?

- A) Add few-shot examples to your system prompt demonstrating how to distinguish network errors from syntax errors.
- B) Apply exponential backoff retry logic to all errors uniformly.
- **C) Implement automatic retry with backoff for network timeouts inside the tool; return syntax errors immediately with parameter validation details.** ✅
- D) Return all errors with a `retryable` boolean flag and error type details.

> **Answer: C.** 💡 **Remember:** Handling retries at the tool level for transient errors is the correct abstraction boundary--the tool has definitive knowledge of the error type and can implement deterministic retry logic without relying on the agent to interpret a flag (D) or follow promp...

---

#### S-3. `paul-practice-63`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-63`</sub>

Over several turns discussing investment strategy, a user stated "I have a very low risk tolerance" and later "I want to maximize my returns." They now ask: "What should I invest in?"

Which approach best ensures the recommendation aligns with the user's actual priority?

- **A) Surface the contradiction and ask the user to clarify which matters more.** ✅
- B) Provide separate recommendations for both scenarios.
- C) Proceed with the most recently stated preference.
- D) Recommend a balanced portfolio without addressing the conflict.

> **Answer: A.** 💡 **Remember:** When user preferences directly contradict each other, surfacing the conflict and asking for clarification is the only way to guarantee the recommendation aligns with the user's true intent.

---

#### S-4. `paul-practice-64`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-64`</sub>

Users refine playlist preferences over multiple conversation turns. Two messages after a user said "I love jazz," Claude asks "What genres do you enjoy?"

What is the most likely cause?

- A) Claude requires a vector database connection to maintain conversation memory.
- B) The model's context window has been exceeded.
- C) The Claude API requires a `session_id` parameter.
- **D) Your application isn't including prior messages in the `messages` array.** ✅

> **Answer: D.** 💡 **Remember:** Claude has no server-side memory--every API call is stateless. Without including the full conversation history in the `messages` array of each request, Claude has no knowledge of prior turns.

---

#### S-5. `paul-practice-65`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-65`</sub>

After a 40-minute cooking session, the conversation reaches 78,000 tokens. History includes allergies, recipe scaling, clarified cooking terms, and general discussion. You must reduce tokens while preserving important information.

What approach best balances preservation with token reduction?

- A) Summarize the entire conversation history.
- B) Keep only the most recent 20,000 tokens.
- **C) Extract critical structured data (allergies, quantities, preferences), summarize general discussion, and keep recent exchanges verbatim.** ✅
- D) Store the full conversation externally and retrieve relevant parts via semantic search.

> **Answer: C.** 💡 **Remember:** The hybrid approach preserves the highest-value information at the lowest cost. Critical facts like allergies and recipe quantities are extracted into a compact structured block (preventing the precision loss that occurs during summarization), general discu...

---

#### S-6. `paul-practice-66`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-66`</sub>

Users report that during extended conversations the assistant loses track of earlier topics and preferences. Your current implementation keeps only the last 25 message pairs.

What is the most effective solution?

- **A) Hybrid approach: summarize older messages while keeping recent ones verbatim.** ✅
- B) Vector similarity search over the full conversation history.
- C) Increase the window to 50 message pairs.
- D) Summarize dropped messages every turn and prepend the running summary.

> **Answer: A.** 💡 **Remember:** The hybrid approach addresses both dimensions of the problem: retaining exact recent context (critical for conversational coherence) while maintaining a compressed representation of earlier preferences (preventing total loss when pairs are dropped).

---

#### S-7. `paul-practice-67`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-67`</sub>

Users report that latency increases and costs rise when conversations exceed 50 turns.

What is the primary cause?

- **A) The entire conversation history is included with each API request.** ✅
- B) The model generates progressively longer responses.
- C) Database operations slow down as history grows.
- D) The model builds an internal user profile requiring more processing.

> **Answer: A.** 💡 **Remember:** Claude's API is fully stateless--every request must include the complete conversation history in the `messages` array.

---

#### S-8. `paul-practice-68`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-68`</sub>

After three months of weekly sessions, conversation history grows to 85,000 tokens. When a user asks "What did we conclude about the theme of isolation?", the assistant gives generic answers instead of referencing previous discussions.

What is the most effective approach?

- A) Rolling window truncation.
- B) Progressive summarization capturing key conclusions.
- **C) Semantic embeddings with retrieval of relevant exchanges.** ✅
- D) Add structured XML tags marking discussion conclusions.

> **Answer: C.** 💡 **Remember:** Semantic search over conversation history is the only approach that scales to three months of discussion while being able to surface specific relevant exchanges on demand.

---

#### S-9. `paul-practice-69`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-69`</sub>

During QA testing, Claude follows system prompt guidelines for the first 10-15 turns, but later responses deviate. The conversation is still within token limits.

What is the best solution?

- A) Move behavioral guidelines into the first user message.
- B) Start a new conversation after 20 turns.
- **C) Insert user-role messages reinforcing guidelines at conversation breakpoints.** ✅
- D) Use post-response validation to regenerate non-compliant responses.

> **Answer: C.** 💡 **Remember:** Periodic injection of behavioral reminders directly combats instruction drift by re-establishing constraints at regular intervals as conversation history accumulates.

---

#### S-10. `paul-practice-70`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-70`</sub>

Your AI tutor has a 2,800-token system prompt defining teaching methodology and adaptation rules. After 12 turns, the assistant starts ignoring proficiency levels.

What is the most effective fix?

- A) Inject reminders every 4-5 turns.
- **B) Replace verbose rules with few-shot examples demonstrating proficiency-level adaptation.** ✅
- C) Place critical rules at the end of the system prompt.
- D) Evaluate responses and regenerate if difficulty level mismatches.

> **Answer: B.** 💡 **Remember:** A 2,800-token system prompt with declarative rules is vulnerable to drift because abstract rules require the model to reason about them on every turn.

---

#### S-11. `paul-practice-71`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-71`</sub>

Your assistant must maintain an enthusiastic tone, explain its reasoning, and ask clarifying questions. Where should these behavioral guidelines be defined?

Where should these behavioral guidelines be defined?

- A) Prepended to each user message.
- **B) In the system prompt.** ✅
- C) In the first assistant message.
- D) In environment variables.

> **Answer: B.** 💡 **Remember:** The system prompt is specifically designed for persistent behavioral constraints and guidelines that apply throughout the entire conversation.

---

#### S-12. `paul-practice-72`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-72`</sub>

Users report repetitive response openings like "Certainly!" and "I'd be happy to help!"

What is the most effective approach?

- **A) Append a partial assistant message with a direct response opening.** ✅
- B) Lower the temperature setting.
- C) Post-process responses to remove greetings.
- D) Add system prompt instructions to avoid those phrases.

> **Answer: A.** 💡 **Remember:** Prefilling the assistant's response with the beginning of a direct answer prevents greeting patterns at the generation level--the model continues from the prefill rather than generating new opening phrases.

---

#### S-13. `paul-practice-73`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-73`</sub>

A webhook notifies your system that a user's package has shipped while the user is actively chatting. You want the assistant to incorporate this naturally into the next response.

What is the best approach?

- A) Add shipping status to the system prompt.
- B) Send an immediate synthetic user message.
- C) Force the assistant to call a status tool on each turn.
- **D) Append the status update as a prefix to the next user message.** ✅

> **Answer: D.** 💡 **Remember:** Prefixing the status update to the next user message injects real-time context at a natural conversation boundary without disrupting the flow.

---

#### S-14. `paul-practice-74`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-74`</sub>

Users frequently send requests like "Book a venue for the party." The assistant asks 4+ clarifying questions, causing 35% abandonment.

What approach best improves the trade-off?

- A) Proceed with hidden defaults.
- B) Ask all clarifying questions in one compound message.
- **C) State assumptions explicitly and proceed while inviting corrections.** ✅
- D) Use a structured intake form.

> **Answer: C.** 💡 **Remember:** Stating assumptions explicitly and proceeding gives the user an immediate, useful response while preserving their ability to correct wrong assumptions.

---

#### S-15. `paul-practice-75`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-75`</sub>

Your assistant uses a contractor-persona system prompt. Early turns follow the rules, but by turn 7 the assistant gives generic advice. Conversation length is only 2,500 tokens.

What is the most likely cause?

- A) System prompts only establish initial behavior.
- B) Model attention weakens as turns accumulate.
- **C) Accumulated assistant responses dilute system prompt influence.** ✅
- D) The system prompt is only sent once.

> **Answer: C.** 💡 **Remember:** As assistant responses accumulate in the conversation history, the proportion of text reflecting the system prompt's behavioral constraints decreases relative to the growing body of assistant-generated content.

---

#### S-16. `paul-practice-76`
<sub>**scenario-only** · Conversational AI Architecture Patterns · `paullarionov` · path 1 · `paul-practice-76`</sub>

Users ask vague requests like "Can you help with the report?" The assistant responds by asking multiple questions (which report? what help? deadline?), causing 40% abandonment.

What is the best solution?

- **A) Make reasonable assumptions, state them explicitly, and offer to adjust.** ✅
- B) Classify ambiguity with a smaller model before responding.
- C) Use predefined interpretations without stating assumptions.
- D) Limit the assistant to one clarifying question per turn.

> **Answer: A.** 💡 **Remember:** Proceeding with reasonable stated assumptions eliminates the back-and-forth entirely while keeping the user informed and in control.

---


### Customer Support Agent  (18 q)

#### S-1. `paul-examples-1`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-examples-1`</sub>

Data shows that in 12% of cases the agent skips `get_customer` and calls `lookup_order` using only the customer's name, which leads to incorrect refunds.

Which change is most effective?

- **A) Add a programmatic precondition that blocks `lookup_order` and `process_refund` until an ID is obtained from `get_customer`** ✅
- B) Improve the system prompt
- C) Add few-shot examples
- D) Implement a routing classifier

> **Answer: A.** 💡 **Remember:** When critical business logic requires a specific tool sequence, software provides **deterministic guarantees** that prompt-based approaches (B, C) cannot.

---

#### S-2. `paul-examples-2`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-examples-2`</sub>

The agent often calls `get_customer` instead of `lookup_order` for order-related questions. Tool descriptions are minimal and similar.

What is the first step?

- A) Few-shot examples
- **B) Expand each tool's description with input formats, examples, and boundaries** ✅
- C) Add a routing layer
- D) Merge the tools

> **Answer: B.** 💡 **Remember:** Tool descriptions are the model's primary selection mechanism. This is the lowest-effort, highest-impact fix.

---

#### S-3. `paul-examples-3`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-examples-3`</sub>

The agent resolves only 55% of issues with a target of 80%. It escalates simple cases and tries to handle complex policy exceptions autonomously.

How do you improve calibration?

- **A) Add explicit escalation criteria with few-shot examples** ✅
- B) Self-rated confidence (1-10) with automatic escalation
- C) A separate classifier trained on historical data
- D) Sentiment analysis

> **Answer: A.** 💡 **Remember:** It directly addresses the root cause--unclear decision boundaries. B is unreliable (the model can be confidently wrong).

---

#### S-4. `paul-practice-46`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-46`</sub>

While testing, you notice the agent often calls `get_customer` when users ask about order status, even though `lookup_order` would be more appropriate. What should you check first to address this problem?

What should you check first?

- A) Implement a preprocessing classifier to detect order-related requests and route them directly to `lookup_order`.
- B) Reduce the number of tools available to the agent to simplify choice.
- C) Add few-shot examples to the system prompt covering all possible order request patterns to improve tool selection.
- **D) Check the tool descriptions to ensure they clearly differentiate each tool's purpose.** ✅

> **Answer: D.** 💡 **Remember:** Tool descriptions are the primary input the model uses to decide which tool to call. When an agent consistently picks the wrong tool, the first diagnostic step is to verify that tool descriptions clearly separate each tool's purpose and usage boundaries.

---

#### S-5. `paul-practice-47`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-47`</sub>

Your agent handles single-issue requests with 94% accuracy (e.g., "I need a refund for order #1234"). But when customers include multiple issues in one message (e.g., "I need a refund for order #1234 and also want to update the shipping address for order #5678"), tool selection accuracy drops to 58%. The agent usually solves only one issue or mixes parameters across requests. What approach most effectively improves reliability for multi-issue requests?

What approach is most effective?

- A) Implement a preprocessing layer that uses a separate model call to decompose multi-issue messages into separate requests, handle each independently, and merge results.
- B) Combine related tools into fewer universal tools.
- **C) Add few-shot examples to the prompt demonstrating correct reasoning and tool sequencing for multi-issue requests.** ✅
- D) Implement response validation that detects incomplete answers and automatically reprompts the agent to resolve missed issues.

> **Answer: C.** 💡 **Remember:** Few-shot examples that demonstrate correct reasoning and tool sequencing for multi-issue requests are most effective because the agent already performs well on single issues--what it needs is guidance on the pattern for decomposing and routing multiple issu...

---

#### S-6. `paul-practice-48`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-48`</sub>

Production logs show that for simple requests like "refund for order #1234," your agent resolves the issue in 3-4 tool calls with 91% success. But for complex requests like "I was billed twice, my discount didn't apply, and I want to cancel," the agent averages 12+ tool calls with only 54% success--often investigating issues sequentially and fetching redundant customer data for each. What change most effectively improves handling of complex requests?

What change is most effective?

- A) Add explicit verification checkpoints between stages, requiring the agent to record progress after resolving each issue before moving to the next.
- B) Reduce the number of tools by combining `get_customer`, `lookup_order`, and billing-related tools into a single `investigate_issue` tool.
- **C) Decompose the request into separate issues, then investigate each in parallel using shared customer context before synthesizing a final resolution.** ✅
- D) Add few-shot examples to the system prompt demonstrating ideal tool-call sequences for various multi-faceted billing scenarios.

> **Answer: C.** 💡 **Remember:** Decomposing into separate issues and investigating in parallel with shared customer context fixes both key problems: it eliminates redundant data retrieval by reusing shared context across issues and reduces total tool-call loops by parallelizing investigat...

---

#### S-7. `paul-practice-49`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-49`</sub>

Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates simple cases (standard replacements for damaged goods with photo proof) while trying to handle complex situations requiring policy exceptions autonomously. What is the most effective way to improve escalation calibration?

What is the most effective way to improve escalation calibration?

- A) Require the agent to self-rate confidence on a 1-10 scale before each response and automatically route to humans when confidence drops below a threshold.
- B) Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent starts processing.
- **C) Add explicit escalation criteria to the system prompt with few-shot examples showing when to escalate versus resolve autonomously.** ✅
- D) Implement sentiment analysis to determine customer frustration level and automatically escalate past a negative sentiment threshold.

> **Answer: C.** 💡 **Remember:** Explicit escalation criteria with few-shot examples directly address the root cause--unclear decision boundaries between simple and complex cases.

---

#### S-8. `paul-practice-50`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-50`</sub>

After calling `get_customer` and `lookup_order`, the agent has all available system data but still faces uncertainty. Which situation is the most justified trigger for calling `escalate_to_human`?

Which situation is most justified for escalation?

- A) A customer wants to cancel an order shipped yesterday and arriving tomorrow. The agent should escalate because the customer might change their mind after receiving the package.
- B) A customer claims they didn't receive an order, but tracking shows it was delivered and signed for at their address three days ago. The agent should escalate because presenting contradictory evidence could harm the customer relationship.
- **C) A customer requests competitor price matching. Your policies allow price adjustments for price drops on your own site within 14 days, but say nothing about competitor prices. The agent should escalate for policy interpretation.** ✅
- D) A customer message contains both a billing question and a product return. The agent should escalate so a human can coordinate both issues in one interaction.

> **Answer: C.** 💡 **Remember:** This is a genuine policy gap: company rules cover price drops on your own site but do not address competitor price matching.

---

#### S-9. `paul-practice-51`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-51`</sub>

Production logs show that in 12% of cases your agent skips `get_customer` and calls `lookup_order` directly using only the customer-provided name, sometimes leading to misidentified accounts and incorrect refunds. What change most effectively fixes this reliability problem?

What change is most effective?

- A) Add few-shot examples showing that the agent always calls `get_customer` first, even when customers voluntarily provide order details.
- B) Implement a routing classifier that analyzes each request and enables only a subset of tools appropriate for that request type.
- **C) Add a programmatic precondition that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer identifier.** ✅
- D) Strengthen the system prompt stating that customer verification via `get_customer` is mandatory before any order operations.

> **Answer: C.** 💡 **Remember:** A programmatic precondition provides a deterministic guarantee that required sequencing is followed.

---

#### S-10. `paul-practice-52`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-52`</sub>

Production metrics show that when resolving complex billing disputes or multi-order returns, customer satisfaction scores are 15% lower than for simple cases--even when the resolution is technically correct. Root-cause analysis shows the agent provides accurate solutions but inconsistently explains rationale: sometimes omitting relevant policy details, sometimes missing timeline info or next steps. The specific context gaps vary case by case. You want to improve solution quality without adding human oversight. What approach is most effective?

What approach is most effective?

- **A) Add a self-critique stage where the agent evaluates a draft response for completeness--ensuring it resolves the customer's issue, includes relevant context, and anticipates follow-up questions.** ✅
- B) Add a confirmation stage where the agent asks "Does this fully resolve your issue?" before closing, allowing customers to request additional information if needed.
- C) Upgrade the model from Haiku to Sonnet for complex cases, routing based on a defined complexity metric.
- D) Implement few-shot examples in the system prompt showing complete explanations for five common complex case types, demonstrating how to include policy context, timelines, and next steps.

> **Answer: A.** 💡 **Remember:** A self-critique stage (the evaluator-optimizer pattern) directly addresses inconsistent explanation completeness by forcing the agent to assess its own draft against concrete criteria--such as policy context, timelines, and next steps--before presenting it.

---

#### S-11. `paul-practice-53`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-53`</sub>

Production metrics show your agent averages 4+ API loops per resolution. Analysis reveals Claude often requests `get_customer` and `lookup_order` in separate sequential turns even when both are needed initially. What is the most effective way to reduce the number of loops?

What is the most effective way to reduce loops?

- A) Implement speculative execution that automatically calls likely-needed tools in parallel with any requested tool and returns all results regardless of what was requested.
- B) Increase `max_tokens` to give Claude more room to plan and naturally combine tool requests.
- C) Create composite tools like `get_customer_with_orders` that bundle common lookup combinations into single calls.
- **D) Instruct Claude in the prompt to bundle tool requests into one turn and return all results together before the next API call.** ✅

> **Answer: D.** 💡 **Remember:** Prompting Claude to bundle related tool requests into a single turn leverages its native ability to request multiple tools at once.

---

#### S-12. `paul-practice-54`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-54`</sub>

Production logs show a pattern: customers reference specific amounts (e.g., "the 15% discount I mentioned"), but the agent responds with incorrect values. Investigation shows these details were mentioned 20+ turns ago and condensed into vague summaries like "promotional pricing was discussed." What fix is most effective?

What fix is most effective?

- A) Increase the summarization threshold from 70% to 85% so conversations have more room before summarization triggers.
- B) Store full conversation history in external storage and implement retrieval when the agent detects references like "as I mentioned."
- **C) Extract transactional facts (amounts, dates, order numbers) into a persistent "case facts" block included in every prompt outside the summarized history.** ✅
- D) Revise the summarization prompt to explicitly preserve all numbers, percentages, dates, and customer-stated expectations verbatim.

> **Answer: C.** 💡 **Remember:** Summarization inherently loses precise details. Extracting transactional facts into a structured "case facts" block outside the summarized history preserves critical information so it's reliably available in every prompt regardless of how many turns have be...

---

#### S-13. `paul-practice-55`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-55`</sub>

Your `get_customer` tool returns all matches when searching by name. Currently, when there are multiple results, Claude picks the customer with the most recent order, but production data shows this selects the wrong account 15% of the time for ambiguous matches. How should you address this?

How should you address this?

- A) Implement a confidence scoring system that acts autonomously above 85% confidence and requests clarification below the threshold.
- **B) Instruct Claude to request an additional identifier (email, phone, or order number) when `get_customer` returns multiple matches before taking any customer-specific action.** ✅
- C) Modify `get_customer` to return only a single most-likely match based on a ranking algorithm, eliminating ambiguity.
- D) Add few-shot examples to the prompt demonstrating correct reasoning and tool sequencing for ambiguous matches.

> **Answer: B.** 💡 **Remember:** Asking the user for an additional identifier is the most reliable way to resolve ambiguity because the user has definitive knowledge of their identity.

---

#### S-14. `paul-practice-56`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-56`</sub>

Production logs show a consistent pattern: when customers include the word "account" in their message (e.g., "I want to check my account for an order I made yesterday"), the agent calls `get_customer` first 78% of the time. When customers phrase similar requests without "account" (e.g., "I want to check an order I made yesterday"), it calls `lookup_order` first 93% of the time. Tool descriptions are clear and unambiguous. What is the most likely root cause of this discrepancy?

What is the most likely root cause?

- **A) The system prompt contains keyword-sensitive instructions that steer behavior based on terms like "account," creating unintended tool-selection patterns.** ✅
- B) The model's base training creates associations between "account" terminology and customer-related operations that override tool descriptions.
- C) The model needs more training data on multi-concept messages and should be fine-tuned on examples containing both account and order terminology.
- D) Tool descriptions need additional negative examples specifying when NOT to use each tool to prevent this keyword-induced confusion.

> **Answer: A.** 💡 **Remember:** The systematic keyword-driven pattern (78% vs 93%) strongly indicates explicit routing logic in the system prompt reacting to the word "account" and steering the agent toward customer-related tools.

---

#### S-15. `paul-practice-57`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-57`</sub>

Production logs show the agent often calls `get_customer` when users ask about orders (e.g., "check my order #12345") instead of calling `lookup_order`. Both tools have minimal descriptions ("Gets customer information" / "Gets order details") and accept similar-looking identifier formats. What is the most effective first step to improve tool selection reliability?

What is the most effective first step?

- A) Implement a routing layer that analyzes user input before each turn and preselects the correct tool based on detected keywords and ID patterns.
- B) Combine both tools into a single `lookup_entity` that accepts any identifier and internally decides which backend to query.
- C) Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples routing order-related queries to `lookup_order`.
- **D) Expand each tool's description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools.** ✅

> **Answer: D.** 💡 **Remember:** Expanding tool descriptions with input formats, example queries, edge cases, and clear boundaries directly fixes the root cause--minimal descriptions that don't give the LLM enough information to distinguish similar tools.

---

#### S-16. `paul-practice-58`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-58`</sub>

You are implementing the agent loop for your support agent. After each Claude API call, you must decide whether to continue the loop (run requested tools and call Claude again) or stop (present the final answer to the customer). What determines this decision?

What determines this decision?

- **A) Check the `stop_reason` field in Claude's response--continue if it is `tool_use` and stop if it is `end_turn`.** ✅
- B) Parse Claude's text for phrases like "I'm done" or "Can I help with anything else?"--natural language signals indicate task completion.
- C) Set a maximum iteration count (e.g., 10 calls) and stop when reached, regardless of whether Claude indicates more work is needed.
- D) Check whether the response contains assistant text content--if Claude generated explanatory text, the loop should terminate.

> **Answer: A.** 💡 **Remember:** `stop_reason` is Claude's explicit structured signal for loop control: `tool_use` indicates Claude wants to run a tool and receive results back, while `end_turn` indicates Claude has completed its response and the loop should end.

---

#### S-17. `paul-practice-59`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-59`</sub>

Production logs show the agent misinterprets outputs from your MCP tools: Unix timestamps from `get_customer`, ISO 8601 dates from `lookup_order`, and numeric status codes (1=pending, 2=shipped). Some tools are third-party MCP servers you cannot modify. Which approach to data format normalization is most maintainable?

Which approach is most maintainable?

- **A) Use a PostToolUse hook to intercept tool outputs and apply formatting transformations before the agent processes them.** ✅
- B) Modify tools you control to return human-readable formats and create wrappers for third-party tools.
- C) Create a `normalize_data` tool that the agent calls after every data retrieval to transform values.
- D) Add detailed format documentation to the system prompt explaining each tool's data conventions.

> **Answer: A.** 💡 **Remember:** A PostToolUse hook provides a centralized, deterministic point to intercept and normalize all tool outputs--including third-party MCP server data--before the agent processes them.

---

#### S-18. `paul-practice-60`
<sub>**scenario-only** · Customer Support Agent · `paullarionov` · path 1 · `paul-practice-60`</sub>

Production logs show the agent sometimes chooses `get_customer` when `lookup_order` would be more appropriate, especially for ambiguous queries like "I need help with my recent purchase." You decide to add few-shot examples to the system prompt to improve tool selection. Which approach most effectively addresses the problem?

Which approach is most effective?

- A) Add explicit "use when" and "don't use when" guidance in each tool description covering ambiguous cases.
- B) Add examples grouped by tool--all `get_customer` scenarios together, then all `lookup_order` scenarios.
- **C) Add 4-6 examples targeted at ambiguous scenarios, each with rationale for why one tool was chosen over plausible alternatives.** ✅
- D) Add 10-15 examples of clear, unambiguous requests demonstrating correct tool choice for typical scenarios for each tool.

> **Answer: C.** 💡 **Remember:** Targeting few-shot examples at the specific ambiguous scenarios where errors occur, with explicit rationale for why one tool is preferable to alternatives, teaches the model the comparative decision process needed for edge cases.

---


### Customer Support Resolution Agent  (8 q)

#### S-1. `sgrid-fullexam-1`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-1`</sub>

The agent occasionally processes refunds for the wrong customer because it uses the customer's stated name to call `lookup_order` instead of first verifying identity through `get_customer`. The system prompt clearly instructs it to verify identity first. What is the most reliable fix?

- A) Rephrase the system prompt with stronger language about verification requirements.
- B) Add 5 few-shot examples showing correct verification-first sequences.
- **C) Implement a programmatic prerequisite that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID.** ✅
- D) Add a pre-processing classifier that detects when verification is needed.

> **Answer: C.** 💡 **Remember:** Programmatic enforcement provides deterministic guarantees. Prompt-based approaches (A, B) have non-zero failure rates.

---

#### S-2. `sgrid-fullexam-2`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-2`</sub>

The agent's `get_customer` and `lookup_order` tools have minimal descriptions: "Gets customer info" and "Gets order info." Agents frequently call the wrong one. What is the most effective first step?

- A) Add few-shot examples for each tool call scenario.
- **B) Expand tool descriptions to include input formats, example queries, edge cases, and clear boundaries between the two tools.** ✅
- C) Consolidate into one `lookup` tool.
- D) Add a routing layer before the agent.

> **Answer: B.** 💡 **Remember:** Tool descriptions are the primary mechanism for tool selection. Expanding them with clear differentiation is the highest-leverage, lowest-effort fix.

---

#### S-3. `sgrid-fullexam-3`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-3`</sub>

A customer says: "I need to return my broken headphones AND I was charged twice on my last order." The agent resolves the return but forgets the billing dispute. What architecture prevents this?

- A) Add "Address all customer concerns" to the system prompt.
- **B) Decompose multi-concern requests into distinct items, investigate each with shared context, then synthesize a unified resolution.** ✅
- C) Limit customers to one issue per message.
- D) Use a checklist tool.

> **Answer: B.** 💡 **Remember:** Explicit decomposition into distinct items with parallel investigation and unified synthesis ensures complete coverage.

---

#### S-4. `sgrid-fullexam-4`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-4`</sub>

Order lookups return 40+ fields. Most requests need only 5 fields. Context is growing rapidly. What should you do?

- A) Use a model with a larger context window.
- **B) Trim tool outputs to only the fields relevant to the current request type.** ✅
- C) Paginate the results.
- D) Cache frequently accessed fields.

> **Answer: B.** 💡 **Remember:** Trimming verbose tool outputs to relevant fields prevents disproportionate context consumption.

---

#### S-5. `sgrid-fullexam-5`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-5`</sub>

A PostToolUse hook receives dates in three formats from different MCP tools: Unix timestamps, ISO 8601, and "MM/DD/YYYY". What should the hook do?

- A) Let the model figure out the formats.
- **B) Normalize all dates to ISO 8601 before the model processes them.** ✅
- C) Convert all to Unix timestamps for consistency.
- D) Add format labels to each date field.

> **Answer: B.** 💡 **Remember:** PostToolUse hooks should normalize heterogeneous data formats to a consistent format before model processing.

---

#### S-6. `sgrid-fullexam-6`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-6`</sub>

The company policy caps automated refunds at $500. The agent occasionally processes $600+ refunds despite prompt instructions. What provides guaranteed compliance?

- A) Bold the $500 limit in the system prompt.
- **B) Implement a tool call interception hook that blocks `process_refund` when amount exceeds $500 and redirects to human escalation.** ✅
- C) Add a confirmation step where the agent double-checks the amount.
- D) Log all refund amounts for post-hoc auditing.

> **Answer: B.** 💡 **Remember:** Tool call interception hooks provide deterministic enforcement of business rules.

---

#### S-7. `sgrid-fullexam-7`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-7`</sub>

A customer says "I want to talk to a real person" about a simple order status question. What should the agent do?

- A) Answer the question first to save the customer time, then offer transfer.
- **B) Honor the explicit request immediately and transfer to a human agent.** ✅
- C) Ask why they want a human to assess if escalation is truly needed.
- D) Provide the answer and a link to contact support.

> **Answer: B.** 💡 **Remember:** Explicit customer requests for human agents must be honored immediately.

---

#### S-8. `sgrid-fullexam-8`
<sub>**scenario-only** · Customer Support Resolution Agent · `sgrid` · path 2 · `sgrid-fullexam-8`</sub>

The agent escalates based on negative customer sentiment. A frustrated customer with a simple, policy-covered return gets escalated unnecessarily. What is wrong?

- A) The sentiment threshold is too low.
- **B) Sentiment-based escalation is unreliable because sentiment does not correlate with case complexity. Use explicit escalation criteria instead.** ✅
- C) The agent should never escalate.
- D) Add positive sentiment detection to balance the escalation trigger.

> **Answer: B.** 💡 **Remember:** Sentiment != complexity. Explicit criteria (policy gaps, customer explicit requests, inability to progress) are more reliable than sentiment-based triggers.

---


### Developer Productivity with Claude  (4 q)

#### S-1. `sgrid-fullexam-25`
<sub>**scenario-only** · Developer Productivity with Claude · `sgrid` · path 2 · `sgrid-fullexam-25`</sub>

A developer needs to find all callers of `processPayment()` across the codebase. Which built-in tool should they start with?

- A) Glob to find all JavaScript files, then Read each one.
- **B) Grep to search for `processPayment` in file contents across the codebase.** ✅
- C) Read to load every file and search manually.
- D) Bash to run a custom search script.

> **Answer: B.** 💡 **Remember:** Grep is the built-in tool for content search -- searching file contents for patterns like function names.

---

#### S-2. `sgrid-fullexam-26`
<sub>**scenario-only** · Developer Productivity with Claude · `sgrid` · path 2 · `sgrid-fullexam-26`</sub>

A developer needs to find all files matching `*.test.tsx` in the project. Which tool?

- A) Grep
- B) Read
- **C) Glob** ✅
- D) Bash with `find`

> **Answer: C.** 💡 **Remember:** Glob is for file path pattern matching -- finding files by name/extension patterns.

---

#### S-3. `sgrid-fullexam-27`
<sub>**scenario-only** · Developer Productivity with Claude · `sgrid` · path 2 · `sgrid-fullexam-27`</sub>

Edit fails because the anchor text is not unique in the file. What is the correct fallback?

- A) Use Bash with `sed` for the edit.
- **B) Use Read to load the full file contents, then Write the entire modified file.** ✅
- C) Try Edit with a smaller anchor text.
- D) Manually edit the file.

> **Answer: B.** 💡 **Remember:** When Edit cannot find unique anchor text, Read + Write is the documented fallback for reliable file modification.

---

#### S-4. `sgrid-fullexam-29`
<sub>**scenario-only** · Developer Productivity with Claude · `sgrid` · path 2 · `sgrid-fullexam-29`</sub>

A team wants to share an MCP server configuration but each developer needs their own auth token. How should this be configured?

- A) Each developer manually configures the server in their local config.
- **B) Use `.mcp.json` in the project repo with `${JIRA_TOKEN}` environment variable expansion for credentials.** ✅
- C) Commit the token to the repo's `.mcp.json`.
- D) Store tokens in CLAUDE.md.

> **Answer: B.** 💡 **Remember:** Project-scoped `.mcp.json` with environment variable expansion enables shared config with individual credentials.

---


### Multi-Agent Research System  (4 q)

#### S-1. `sgrid-fullexam-19`
<sub>**scenario-only** · Multi-Agent Research System · `sgrid` · path 2 · `sgrid-fullexam-19`</sub>

The web search subagent times out. It returns: `{"status": "error", "message": "search unavailable"}`. The coordinator cannot make a recovery decision. What should the error response include?

- A) Just the HTTP status code.
- **B) Structured error context: failure type, attempted query, partial results, and potential alternative approaches.** ✅
- C) A retry counter.
- D) The full stack trace.

> **Answer: B.** 💡 **Remember:** Structured error context enables intelligent coordinator recovery decisions.

---

#### S-2. `sgrid-fullexam-20`
<sub>**scenario-only** · Multi-Agent Research System · `sgrid` · path 2 · `sgrid-fullexam-20`</sub>

The synthesis agent frequently needs to verify simple facts (dates, names, statistics) during synthesis. Currently this requires coordinator round-trips adding 40% latency. 85% of verifications are simple fact-checks. What is the best approach?

- A) Give synthesis all web search tools for direct access.
- **B) Give synthesis a scoped `verify_fact` tool for simple lookups; complex verifications continue through the coordinator.** ✅
- C) Have synthesis batch all verification needs and return them at once.
- D) Have web search proactively cache extra context.

> **Answer: B.** 💡 **Remember:** A scoped verification tool handles the 85% common case while preserving the coordination pattern for complex cases.

---

#### S-3. `sgrid-fullexam-23`
<sub>**scenario-only** · Multi-Agent Research System · `sgrid` · path 2 · `sgrid-fullexam-23`</sub>

The coordinator's `allowedTools` list includes standard tools but not "Task". What happens when it tries to spawn subagents?

- A) It falls back to inline processing.
- **B) It cannot spawn subagents because Task is not in its allowed tools.** ✅
- C) It spawns subagents with restricted permissions.
- D) It automatically gains Task access.

> **Answer: B.** 💡 **Remember:** `allowedTools` must explicitly include "Task" for a coordinator to invoke subagents.

---

#### S-4. `sgrid-fullexam-24`
<sub>**scenario-only** · Multi-Agent Research System · `sgrid` · path 2 · `sgrid-fullexam-24`</sub>

Three subagents research overlapping subtopics, producing duplicate findings. How do you reduce duplication?

- A) Add deduplication in the coordinator after all subagents complete.
- **B) Partition research scope across subagents (distinct subtopics or source types) to minimize overlap.** ✅
- C) Reduce to one subagent.
- D) Have each subagent check with the coordinator before each search.

> **Answer: B.** 💡 **Remember:** Partitioning scope at assignment time is more efficient than post-hoc deduplication.

---


### Multi-agent Research System  (18 q)

#### S-1. `paul-examples-7`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-examples-7`</sub>

The system researches "AI impact on creative industries," but reports cover only visual art. The coordinator decomposed the topic into: "AI in digital art," "AI in graphic design," "AI in photography."

What's the cause?

- A) The synthesis agent does not detect gaps
- **B) The coordinator decomposed the task too narrowly** ✅
- C) The web search agent does not search thoroughly enough
- D) The document analysis agent filters out non-visual sources

> **Answer: B.** 💡 **Remember:** The logs show the coordinator decomposed "creative industries" only into visual subtopics, completely missing music, literature, and film.

---

#### S-2. `paul-examples-8`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-examples-8`</sub>

A web-search subagent times out while researching a complex topic. You need to design how error information is passed back to the coordinator.

Which error propagation approach best enables intelligent recovery?

- **A) Return structured error context to the coordinator: failure type, query, partial results, and alternatives** ✅
- B) Implement automatic retries with exponential backoff inside the subagent, then return a generic "search unavailable" status
- C) Catch the timeout inside the subagent and return an empty result set marked as success
- D) Propagate the timeout exception to a top-level handler that terminates the whole workflow

> **Answer: A.** 💡 **Remember:** Structured error context gives the coordinator what it needs to decide whether to retry with a modified query, try an alternative approach, or continue with partial results.

---

#### S-3. `paul-examples-9`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-examples-9`</sub>

The synthesis agent often needs to verify specific claims while merging results. Currently, when verification is needed, the synthesis agent hands control back to the coordinator, which calls the web-search agent and then re-runs synthesis with the new results. This adds 2-3 extra round trips per task and increases latency by 40%. Your assessment shows that 85% of these checks are simple fact checks (dates, names, statistics), while 15% require deeper investigation.

How do you reduce overhead while maintaining reliability?

- **A) Give the synthesis agent a limited `verify_fact` tool for simple checks, and continue routing complex verification through the coordinator** ✅
- B) Accumulate all verification needs into a batch and return them to the coordinator at the end
- C) Give the synthesis agent full access to all web-search tools
- D) Proactively cache additional context around each source

> **Answer: A.** 💡 **Remember:** This applies the principle of least privilege: the synthesis agent gets exactly what it needs for the 85% common case (simple fact checks) while preserving the coordinator-mediated path for complex investigations.

---

#### S-4. `paul-practice-1`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-1`</sub>

A document analysis agent discovers that two credible sources contain directly contradictory statistics for a key metric: a government report states 40% growth, while an industry analysis states 12%. Both sources look credible, and the discrepancy could materially affect the research conclusions. How should the document analysis agent handle this situation most effectively?

Which approach is most effective?

- A) Apply credibility heuristics to pick the most likely correct number, finish analysis with that value, and add a footnote mentioning the discrepancy.
- B) Include both numbers in the analysis output without marking them as conflicting, letting the synthesis agent decide which to use based on broader context.
- C) Stop analysis and immediately escalate to the coordinator, asking it to decide which source is more authoritative before continuing.
- **D) Complete analysis with both numbers, explicitly annotate the conflict with source attribution, and let the coordinator decide how to reconcile the data before passing to synthesis.** ✅

> **Answer: D.** 💡 **Remember:** This approach preserves separation of responsibilities: the analysis agent completes its core work without blocking, preserves both conflicting values with clear attribution, and correctly passes reconciliation to the coordinator, which has broader context.

---

#### S-5. `paul-practice-10`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-10`</sub>

In your system design, you gave the document analysis agent access to a general-purpose tool `fetch_url` so it could download documents by URL. Production logs show this agent now frequently downloads search engine results pages to perform ad hoc web search--behavior that should be routed through the web-search agent--causing inconsistent results. Which fix is most effective?

Which fix is most effective?

- **A) Replace `fetch_url` with a `load_document` tool that validates that URLs point to document formats.** ✅
- B) Remove `fetch_url` from the document analysis agent and route all URL fetching through the coordinator to the web-search agent.
- C) Implement filtering that blocks `fetch_url` calls to known search engine domains while allowing other URLs.
- D) Add instructions to the document analysis agent prompt that `fetch_url` should only be used to download document URLs, not to search.

> **Answer: A.** 💡 **Remember:** Replacing a general-purpose tool with a document-specific tool that validates URLs against document formats fixes the root cause by constraining capability at the interface level.

---

#### S-6. `paul-practice-11`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-11`</sub>

While researching a broad topic, you observe that the web-search agent and the document analysis agent investigate the same subtopics, leading to substantial duplication in their outputs. Token usage nearly doubles without a proportional increase in research breadth or depth. What is the most effective way to address this?

What is the most effective way to address this?

- A) Allow both agents to finish in parallel, then have the coordinator deduplicate overlapping results before passing them to the synthesis agent.
- **B) The coordinator explicitly partitions the research space before delegating, assigning each agent distinct subtopics or source types.** ✅
- C) Implement a shared-state mechanism where agents log their current focus area so other agents can dynamically avoid duplication during execution.
- D) Switch to sequential execution where document analysis runs only after web search completes, using web-search results as context to avoid duplication.

> **Answer: B.** 💡 **Remember:** Having the coordinator explicitly partition the research space before delegating is most effective because it addresses the root cause--unclear task boundaries--before any work begins.

---

#### S-7. `paul-practice-12`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-12`</sub>

During research, the web-search subagent queries three source categories with different outcomes: academic databases return 15 relevant papers, industry reports return "0 results," and patent databases return "Connection timeout." When designing error propagation to the coordinator, which approach enables the best recovery decisions?

Which approach enables the best recovery decisions?

- A) Aggregate the results into a single success-percentage metric (e.g., "67% source coverage") with detailed logs available on demand.
- B) Report both "timeout" and "0 results" as failures requiring coordinator intervention.
- C) Retry transient failures internally and report only persistent errors.
- **D) Distinguish access failures (timeout) that require a retry decision from valid empty results ("0 results") that represent successful queries.** ✅

> **Answer: D.** 💡 **Remember:** A timeout (access failure) and "0 results" (valid empty result) are semantically different outcomes requiring different responses.

---

#### S-8. `paul-practice-13`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-13`</sub>

Production monitoring shows inconsistent synthesis quality. When aggregated results are ~75K tokens, the synthesis agent reliably cites information from the first 15K tokens (web-search headlines/snippets) and the last 10K tokens (document analysis conclusions), but often misses critical findings in the middle 50K tokens--even when they directly answer the research question. How should you restructure the aggregated input?

How should you restructure the aggregated input?

- A) Summarize all subagent outputs to under 20K tokens before aggregation to keep content within the model's reliable processing range.
- B) Stream subagent results to the synthesis agent incrementally, processing web-search results first to completion, then adding document analysis results.
- **C) Place a key-findings summary at the start of the aggregated input and organize detailed results with explicit section headings for easier navigation.** ✅
- D) Implement rotation that alternates which subagent's results appear first across research tasks to ensure both sources get equal top positioning over time.

> **Answer: C.** 💡 **Remember:** Putting a key-findings summary at the start leverages primacy effects so critical information sits in the most reliably processed position.

---

#### S-9. `paul-practice-14`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-14`</sub>

In testing, the combined output of the web-search agent (85K tokens including page content) and the document analysis agent (70K tokens including chains of thought) totals 155K tokens, but the synthesis agent performs best with inputs under 50K tokens. Which solution is most effective?

Which solution is most effective?

- **A) Modify upstream agents to return structured data (key facts, quotes, relevance scores) instead of verbose content and reasoning.** ✅
- B) Add an intermediate summarization agent that condenses findings before passing them to synthesis.
- C) Have the synthesis agent process findings in sequential batches, maintaining state between calls.
- D) Store findings in a vector database and give the synthesis agent search tools to query during its work.

> **Answer: A.** 💡 **Remember:** Modifying upstream agents to return structured data fixes the root cause by reducing token volume at the source while preserving essential information.

---

#### S-10. `paul-practice-15`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-15`</sub>

In testing, you observe that the synthesis agent often needs to verify specific claims while merging results. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which calls the web-search agent and then re-invokes synthesis with the results. This adds 2-3 extra loops per task and increases latency by 40%. Your assessment shows 85% of these verifications are simple fact checks (dates, names, stats) and 15% require deeper research. Which approach most effectively reduces overhead while preserving system reliability?

Which approach is most effective?

- A) Give the synthesis agent access to all web-search tools so it can handle any verification need directly without coordinator loops.
- B) Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end, which then sends them all to the web-search agent at once.
- C) Have the web-search agent proactively cache extra context around each source during initial research in anticipation of synthesis needing verification.
- **D) Give the synthesis agent a limited-scope `verify_fact` tool for simple checks, while routing complex verifications through the coordinator to the web-search agent.** ✅

> **Answer: D.** 💡 **Remember:** A limited-scope fact-verification tool lets the synthesis agent handle 85% of simple checks directly, eliminating most loops, while preserving the coordinator delegation path for the 15% of complex verifications.

---

#### S-11. `paul-practice-2`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-2`</sub>

The web-search and document-analysis agents have completed their tasks and returned results to the coordinator. What is the next step for creating an integrated research report?

Which next step is most appropriate?

- A) Each agent sends its results directly to the report-writing agent, bypassing the coordinator.
- B) The document analysis agent requests web-search results and merges them internally.
- **C) The coordinator passes both sets of results to the synthesis agent for a unified integration.** ✅
- D) The coordinator concatenates the raw outputs from both agents and returns them as the final result.

> **Answer: C.** 💡 **Remember:** In a coordinator-subagent architecture, the coordinator forwards both result sets to the synthesis agent for centralized integration, preserving control and ensuring high-quality merging.

---

#### S-12. `paul-practice-3`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-3`</sub>

A document analysis subagent frequently fails when processing PDF files: some have corrupted sections that trigger parsing exceptions, others are password-protected, and sometimes the parsing library hangs on large files. Currently, any exception immediately terminates the subagent and returns an error to the coordinator, which must decide whether to retry, skip, or fail the whole task. This causes excessive coordinator involvement in routine error handling. What architectural improvement is most effective?

Which improvement is most effective?

- A) Create a dedicated error-handling agent that monitors all failures via a shared queue and decides recovery actions, sending restart commands directly to subagents.
- B) Configure the subagent to always return partial results with a success status, embedding error details in metadata; the coordinator treats all responses as successful.
- C) Make the coordinator validate all documents before sending them to the subagent, rejecting documents that might cause failures.
- **D) Implement local recovery in the subagent for transient failures and escalate to the coordinator only errors it cannot resolve, including attempted steps and partial results.** ✅

> **Answer: D.** 💡 **Remember:** Handle errors at the lowest level capable of resolving them. Local recovery reduces coordinator workload while still escalating truly unrecoverable issues with full context and partial progress.

---

#### S-13. `paul-practice-4`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-4`</sub>

After running the system on "AI impact on creative industries," you observe that every subagent completes successfully: the web-search agent finds relevant articles, the document analysis agent summarizes them correctly, and the synthesis agent produces coherent text. However, final reports cover only visual art and completely miss music, literature, and film. In the coordinator logs, you see it decomposed the topic into three subtasks: "AI in digital art," "AI in graphic design," and "AI in photography." What is the most likely root cause?

What is the most likely root cause?

- A) The synthesis agent lacks instructions to detect coverage gaps.
- B) The document analysis agent filters out non-visual sources due to overly strict relevance criteria.
- **C) The coordinator's task decomposition is too narrow, assigning subagents work that does not cover all relevant areas.** ✅
- D) The web-search agent's queries are insufficient and should be broadened to cover more sectors.

> **Answer: C.** 💡 **Remember:** The coordinator decomposed a broad topic only into visual-art subtasks, missing music, literature, and film entirely.

---

#### S-14. `paul-practice-5`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-5`</sub>

The web-search subagent returns results for only 3 of 5 requested source categories (competitor sites and industry reports succeed, but news archives and social feeds time out). The document analysis subagent successfully processes all provided documents. The synthesis subagent must produce a summary from mixed-quality upstream inputs. Which error-propagation strategy is most effective?

Which error-propagation strategy is most effective?

- A) Continue synthesis using only successful sources and produce an output without mentioning which data was unavailable.
- B) The synthesis subagent returns an error to the coordinator, triggering a full retry or task failure due to incomplete data.
- C) The synthesis subagent asks the coordinator to retry timed-out sources with a longer timeout before starting synthesis.
- **D) Structure the synthesis output with coverage annotations that indicate which conclusions are well-supported and where gaps exist due to unavailable sources.** ✅

> **Answer: D.** 💡 **Remember:** Coverage annotations implement graceful degradation with transparency, preserving value from completed work while propagating uncertainty to enable informed decisions about confidence.

---

#### S-15. `paul-practice-6`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-6`</sub>

The document analysis subagent encounters a corrupted PDF file that it cannot parse. When designing the system's error handling, what is the most effective way to handle this failure?

Which approach is most effective?

- **A) Return an error with context to the coordinator agent, allowing it to decide how to proceed.** ✅
- B) Silently skip the corrupted document and continue processing the remaining files to avoid interrupting the workflow.
- C) Automatically retry parsing the document three times with exponential backoff before reporting a failure.
- D) Throw an exception that terminates the entire research workflow.

> **Answer: A.** 💡 **Remember:** Returning an error with context to the coordinator is the most effective approach because it lets the coordinator make an informed decision--skip the file, try an alternative parsing method, or notify the user--while maintaining visibility into the failure.

---

#### S-16. `paul-practice-7`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-7`</sub>

Production logs show a persistent pattern: requests like "analyze the uploaded quarterly report" are routed to the web-search agent 45% of the time instead of the document analysis agent. Reviewing tool definitions, you find that the web-search agent has a tool `analyze_content` described as "analyzes content and extracts key information," while the document analysis agent has a tool `analyze_document` described as "analyzes documents and extracts key information." How should you fix the misrouting problem?

How should you fix the misrouting problem?

- A) Add a pre-routing classifier that detects whether the user refers to uploaded files or web content before the coordinator decides on delegation.
- **B) Rename the web-search tool to `extract_web_results` and update its description to "processes and returns information retrieved from web search and URLs."** ✅
- C) Add few-shot examples to the coordinator prompt showing correct routing: "User uploads a quarterly report → document analysis agent" and "User asks about a web page → web-search agent."
- D) Expand the document analysis tool description with usage examples like "Use for uploaded PDFs, Word docs, and spreadsheets," leaving the web-search tool unchanged.

> **Answer: B.** 💡 **Remember:** Renaming the web-search tool to `extract_web_results` and updating its description to explicitly reference web search and URLs directly removes the root cause by eliminating semantic overlap between the two tool names and descriptions.

---

#### S-17. `paul-practice-8`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-8`</sub>

A colleague proposes that the document analysis agent should send its results directly to the synthesis agent, bypassing the coordinator. What is the main advantage of keeping the coordinator as the central hub for all communication between subagents?

What is the main advantage of keeping the coordinator as the central hub?

- **A) The coordinator can observe all interactions, handle errors uniformly, and decide what information each subagent should receive.** ✅
- B) The coordinator batches multiple requests to subagents, reducing total API calls and overall latency.
- C) Routing through the coordinator enables automatic retry logic that direct inter-agent calls cannot support.
- D) Subagents use isolated memory, and direct communication would require complex serialization that only the coordinator can perform.

> **Answer: A.** 💡 **Remember:** The coordinator pattern provides centralized visibility into all interactions, uniform error handling across the system, and fine-grained control over what information each subagent receives--these are the primary advantages of a star-shaped communication t...

---

#### S-18. `paul-practice-9`
<sub>**scenario-only** · Multi-agent Research System · `paullarionov` · path 1 · `paul-practice-9`</sub>

The web-search subagent times out while researching a complex topic. You need to design how information about this failure is returned to the coordinator. Which error-propagation approach best enables intelligent recovery?

Which error-propagation approach best enables intelligent recovery?

- **A) Return structured error context to the coordinator including the failure type, the query executed, any partial results, and potential alternative approaches.** ✅
- B) Catch the timeout within the subagent and return an empty result set marked as successful.
- C) Implement automatic exponential-backoff retries inside the subagent, only returning a generic "search unavailable" status after exhausting retries.
- D) Propagate the timeout exception directly to the top-level handler, terminating the entire research workflow.

> **Answer: A.** 💡 **Remember:** Returning structured error context--including failure type, executed query, partial results, and alternative approaches--gives the coordinator everything needed to make intelligent recovery decisions (e.g., retry with a modified query or continue with parti...

---


### Multi-file Code Review  (1 q)

#### S-1. `paul-examples-12`
<sub>**scenario-only** · Multi-file Code Review · `paullarionov` · path 1 · `paul-examples-12`</sub>

A pull request changes 14 files in an inventory tracking module. A single-pass review of all files produces inconsistent results: detailed comments for some files but superficial ones for others, missed obvious bugs, and contradictory feedback (a pattern is flagged as problematic in one file but approved in identical code in another file).

How should you restructure the review?

- **A) Split into focused passes: analyze each file individually for local issues, then run a separate integration pass for cross-file data flows** ✅
- B) Require developers to split large PRs into submissions of 3-4 files
- C) Switch to a higher-tier model with a larger context window to review all 14 files in one pass
- D) Run three independent full-PR review passes and report only issues found in at least two runs

> **Answer: A.** 💡 **Remember:** Focused passes directly address the root cause--attention dilution when processing many files at once.

---


### Structured Data Extraction  (11 q)

#### S-1. `sgrid-fullexam-39`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-39`</sub>

Your extraction tool uses `tool_use` with a JSON schema. It never produces JSON syntax errors but occasionally places vendor names in the address field. What type of error is this?

- A) Schema syntax error.
- **B) Semantic error -- tool_use eliminates syntax errors but not logical/semantic errors.** ✅
- C) Configuration error.
- D) Model hallucination.

> **Answer: B.** 💡 **Remember:** Tool use with JSON schemas eliminates syntax errors but cannot prevent semantic errors (values in wrong fields, logical inconsistencies).

---

#### S-2. `sgrid-fullexam-40`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-40`</sub>

An invoice has no phone number, but your schema marks `phone` as required. The model generates a plausible phone number. How do you fix this?

- A) Add "Do not fabricate values" to the prompt.
- **B) Make the `phone` field optional (nullable) so the model can return null when information is absent.** ✅
- C) Post-validate phone numbers against a directory.
- D) Remove the phone field entirely.

> **Answer: B.** 💡 **Remember:** Nullable fields allow the model to signal "not found" rather than fabricating values to satisfy required constraints.

---

#### S-3. `sgrid-fullexam-41`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-41`</sub>

Validation fails on 20% of extractions. Your retry sends the same prompt again. Success rate on retry is only 8%. How do you improve?

- A) Retry 5 times instead of once.
- **B) Include the original document, the failed extraction, and specific validation errors in the retry prompt for model self-correction.** ✅
- C) Use a different model for retries.
- D) Lower validation thresholds.

> **Answer: B.** 💡 **Remember:** Retry-with-error-feedback gives the model specific information about what went wrong.

---

#### S-4. `sgrid-fullexam-42`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-42`</sub>

Some retry failures are due to missing information (the source document simply does not contain the data). What should you do about these?

- A) Keep retrying with modified prompts.
- **B) Recognize that retries are ineffective when information is absent from the source and mark those fields as unavailable rather than continuing to retry.** ✅
- C) Have the model search external sources for the missing data.
- D) Fabricate plausible values.

> **Answer: B.** 💡 **Remember:** Retries cannot conjure information that does not exist in the source document.

---

#### S-5. `sgrid-fullexam-43`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-43`</sub>

You need to extract data from invoices, contracts, and receipts. Documents arrive without type labels. How do you ensure structured output while allowing correct schema selection?

- A) Use `tool_choice: "auto"`.
- **B) Use `tool_choice: "any"` with three extraction tools (one per document type).** ✅
- C) Force `tool_choice` to always use the invoice schema.
- D) Use a single generic extraction schema.

> **Answer: B.** 💡 **Remember:** `"any"` guarantees a tool call while letting the model choose the correct extraction schema for the document type.

---

#### S-6. `sgrid-fullexam-44`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-44`</sub>

Your extraction pipeline reports 97% accuracy overall. Users report problems with handwritten receipts. What metric should you have checked before deploying?

- A) Overall accuracy with a larger sample.
- **B) Accuracy by document type and field to verify consistent performance across all segments.** ✅
- C) Processing speed per document type.
- D) Model confidence distribution.

> **Answer: B.** 💡 **Remember:** Accuracy must be validated per document type and per field before automating. Aggregate metrics mask segment-specific failures.

---

#### S-7. `sgrid-fullexam-45`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-45`</sub>

You have automated high-confidence extractions. How do you detect if accuracy drifts over time?

- A) Wait for user complaints.
- **B) Implement stratified random sampling of high-confidence extractions for ongoing error rate measurement.** ✅
- C) Monitor model confidence scores for trends.
- D) Re-validate monthly with a fixed test set.

> **Answer: B.** 💡 **Remember:** Stratified sampling provides continuous monitoring for quality degradation and novel error patterns.

---

#### S-8. `sgrid-fullexam-46`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-46`</sub>

Your category enum has 5 values. Occasionally documents do not fit any category. How do you handle this?

- A) Force the closest match.
- **B) Add `"other"` to the enum plus a `category_detail` string field for describing novel categories.** ✅
- C) Add more enum values proactively.
- D) Skip uncategorizable documents.

> **Answer: B.** 💡 **Remember:** The "other" + detail string pattern provides extensible categorization.

---

#### S-9. `sgrid-fullexam-48`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-48`</sub>

Your batch of 100 documents has 5 failures: 3 exceeded context limits, 2 had transient server errors. How do you handle them?

- A) Resubmit the entire batch.
- **B) Resubmit only the 5 failures by `custom_id`: chunk the 3 oversized documents and retry the 2 transient failures as-is.** ✅
- C) Discard the failures.
- D) Wait and resubmit without changes.

> **Answer: B.** 💡 **Remember:** Targeted resubmission with appropriate modifications (chunking for context issues, simple retry for transient errors).

---

#### S-10. `sgrid-fullexam-49`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-49`</sub>

An extraction has both a `stated_total` and individual `line_items`. The items sum to a different total than the stated one. Both are accurately extracted. What should the system do?

- A) Adjust line items to match the total.
- **B) Flag the discrepancy with a `conflict_detected` boolean and include both `stated_total` and `calculated_total` for human review.** ✅
- C) Trust the stated total only.
- D) Reject the extraction.

> **Answer: B.** 💡 **Remember:** Self-correction validation that extracts both values and flags discrepancies preserves accuracy while alerting to document-level issues.

---

#### S-11. `sgrid-fullexam-50`
<sub>**scenario-only** · Structured Data Extraction · `sgrid` · path 2 · `sgrid-fullexam-50`</sub>

Your extraction handles formal invoices well but struggles with informal receipts that use abbreviations and varied layouts. Few-shot examples of formal invoices do not help. What should you add?

- A) More formal invoice examples.
- **B) Few-shot examples demonstrating extraction from documents with varied formats (abbreviations, informal measurements, different layouts).** ✅
- C) A pre-processing step that converts all documents to a standard format.
- D) A separate model trained on informal documents.

> **Answer: B.** 💡 **Remember:** Few-shot examples showing correct handling of varied document structures (the specific challenge) enable the model to generalize to informal formats.

---
