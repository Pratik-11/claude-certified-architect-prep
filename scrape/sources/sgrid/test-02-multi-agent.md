# Practice Test 2: Multi-Agent Systems (Week 2)
Domain 1: Agentic Architecture & Orchestration -- Task Statements 1.2, 1.3

---

## Question 1
You are building a multi-agent research system with a coordinator, a web search agent, a document analysis agent, and a synthesis agent. The synthesis agent produces reports that consistently miss findings from the document analysis agent. Investigation shows the coordinator passes web search results to synthesis but only passes a summary reference to the document analysis output. What is the most likely fix?

A) Increase the synthesis agent's context window to accommodate more data.
B) Include complete findings from the document analysis agent directly in the synthesis subagent's prompt, not just summary references.
C) Have the synthesis agent call the document analysis agent directly to retrieve the full results.
D) Add instructions to the coordinator to always include all results, assuming the current prompt just needs better wording.

<details>
<summary>Answer</summary>

**B)** Subagent context must be explicitly provided -- subagents do not inherit parent context or share memory. The coordinator must include the complete document analysis findings directly in the synthesis agent's prompt. Option C violates the hub-and-spoke pattern (subagents should not call each other directly). Option D assumes the issue is prompt wording rather than missing data in the prompt. Option A does not address missing data.
</details>

---

## Question 2
Your coordinator agent needs to invoke three subagents: web search, document analysis, and fact checking. The web search and document analysis can run independently, but fact checking needs the results from both. What is the optimal execution pattern?

A) Run all three sequentially: web search, then document analysis, then fact checking.
B) Have the coordinator emit two Task tool calls in a single response (web search + document analysis) for parallel execution, then invoke fact checking in the next turn with both results.
C) Run all three in parallel and have fact checking poll for results from the other two.
D) Create a pipeline where web search feeds into document analysis which feeds into fact checking.

<details>
<summary>Answer</summary>

**B)** Parallel subagent execution is achieved by emitting multiple Task tool calls in a single coordinator response. Since web search and document analysis are independent, they can run in parallel. Fact checking depends on both results, so it must run after both complete. Option A is unnecessarily sequential. Option C is not how subagent coordination works (no polling). Option D creates false dependencies between web search and document analysis.
</details>

---

## Question 3
A team configures their coordinator agent but forgets to include "Task" in the `allowedTools` list. What happens when the coordinator tries to spawn a subagent?

A) The coordinator automatically gains Task tool access when it detects the need for subagents.
B) The coordinator cannot spawn subagents because Task is not in its allowed tools.
C) The coordinator spawns subagents but they run with restricted permissions.
D) The system falls back to running the subagent's work inline within the coordinator's context.

<details>
<summary>Answer</summary>

**B)** `allowedTools` must explicitly include "Task" for a coordinator to invoke subagents. Without it, the coordinator simply cannot call the Task tool and will be unable to delegate work. There is no automatic fallback or permission escalation.
</details>

---

## Question 4
Your multi-agent system uses a coordinator that delegates research on "renewable energy policy" to three subagents. You observe the subagents frequently research overlapping topics, producing duplicate findings that waste tokens and processing time. What is the most effective fix?

A) Add deduplication logic in the coordinator that filters duplicate findings after all subagents complete.
B) Partition the research scope across subagents to minimize overlap (e.g., assign distinct subtopics or source types to each agent).
C) Reduce the number of subagents to one to eliminate duplication entirely.
D) Have each subagent check with the coordinator before researching each subtopic.

<details>
<summary>Answer</summary>

**B)** The coordinator should partition the research scope so each subagent has a distinct assignment (e.g., one handles academic sources, one handles news, one handles government reports, or each covers a distinct subtopic). This minimizes duplication at the source. Option A wastes resources by allowing duplication then filtering. Option C loses the benefits of parallelism. Option D adds excessive coordination overhead.
</details>

---

## Question 5
In a hub-and-spoke architecture, a subagent encounters an error while analyzing a document. The developer configures the subagent to send a message directly to the synthesis subagent explaining the failure. Why is this problematic?

A) Subagents cannot communicate with each other -- all inter-subagent communication must route through the coordinator for observability, consistent error handling, and controlled information flow.
B) The synthesis agent might not be running yet when the error occurs.
C) Direct communication is fine but should use a different message format than normal results.
D) The error should be logged to a file instead of communicated to any agent.

<details>
<summary>Answer</summary>

**A)** In hub-and-spoke architecture, the coordinator manages all inter-subagent communication. Routing through the coordinator ensures observability (you can log and monitor all agent interactions), consistent error handling (the coordinator applies uniform recovery strategies), and controlled information flow. Direct subagent-to-subagent communication bypasses all of these guarantees.
</details>

---

## Question 6
You need to configure subagent definitions. Which elements should an `AgentDefinition` include?

A) Only a system prompt -- everything else is inherited from the coordinator.
B) Descriptions, system prompts, and tool restrictions for each subagent type.
C) Only tool restrictions -- the model determines its own role from context.
D) A reference to the coordinator's configuration that the subagent clones.

<details>
<summary>Answer</summary>

**B)** An `AgentDefinition` should include descriptions (explaining the agent's role and capabilities), system prompts (guiding its behavior), and tool restrictions (limiting which tools it can access). Subagents do not inherit from the coordinator -- they operate with isolated context and need explicit configuration.
</details>

---

## Question 7
Your coordinator receives results from a web search subagent. The results contain source URLs, article titles, and extracted content, but this metadata is mixed into the prose of the findings. When the synthesis agent later uses these results, source attribution is lost. What should you change?

A) Have the synthesis agent search for URLs in the text using regex to extract sources.
B) Use structured data formats to separate content from metadata (source URLs, document names, page numbers) when passing context between agents.
C) Have the coordinator add source attributions after synthesis is complete.
D) Include instructions in the synthesis agent's prompt to preserve any URLs it finds.

<details>
<summary>Answer</summary>

**B)** Using structured data formats (e.g., JSON or clearly delimited sections) to separate content from metadata ensures that source information is preserved through the synthesis step. This is a foundational principle of inter-agent context passing. Options A and D rely on unreliable text parsing. Option C is too late -- attribution context may already be lost.
</details>

---

## Question 8
Your coordinator agent always routes every query through the full pipeline: web search -> document analysis -> synthesis -> report generation, even for simple factual questions that only need a web search. What should you change?

A) Add a timeout to each agent so simple queries complete faster.
B) Design the coordinator to analyze query requirements and dynamically select which subagents to invoke rather than always routing through the full pipeline.
C) Create a separate "simple query" coordinator that only uses web search.
D) Add a classifier model before the coordinator that decides the pipeline.

<details>
<summary>Answer</summary>

**B)** The coordinator should dynamically assess query complexity and invoke only the subagents needed. Simple factual queries might only need web search; complex analytical queries might need the full pipeline. This is a core coordinator responsibility: task decomposition and selective delegation. Option C creates unnecessary infrastructure duplication. Option D adds complexity when the coordinator itself can make this decision.
</details>

---

## Question 9
You are designing a coordinator prompt for a research system. A colleague suggests writing detailed step-by-step procedural instructions: "Step 1: Call web search agent with query X. Step 2: Take result and call document analysis agent..." Why might this approach be suboptimal?

A) Procedural instructions are always better because they ensure consistent behavior.
B) Coordinator prompts should specify research goals and quality criteria rather than step-by-step procedures, to enable subagent adaptability to different query types.
C) Procedural instructions use more tokens than goal-oriented instructions.
D) The coordinator cannot follow step-by-step instructions with the Agent SDK.

<details>
<summary>Answer</summary>

**B)** Goal-oriented prompts allow the coordinator to adapt its strategy based on the specific query. Procedural instructions lock in a single approach regardless of context, preventing the coordinator from skipping unnecessary steps, running agents in parallel, or adapting to unexpected results. The coordinator should know what to achieve and what quality standards to meet, not be micromanaged on how to achieve it.
</details>

---

## Question 10
You want to explore two different testing strategies for a legacy codebase from a shared analysis baseline. You have already completed an initial codebase analysis. What is the best approach?

A) Start two completely new sessions, re-running the codebase analysis in each.
B) Use `fork_session` to create independent branches from the shared analysis baseline to explore each strategy without re-doing the initial analysis.
C) Use the same session for both explorations sequentially, clearing context between them.
D) Create two subagents that each receive a copy of the analysis and explore one strategy.

<details>
<summary>Answer</summary>

**B)** `fork_session` creates independent branches from a shared analysis baseline. Both branches retain the initial codebase analysis context and can explore divergent approaches independently. Option A wastes time re-running analysis. Option C risks context contamination between explorations. Option D could work but `fork_session` is the purpose-built mechanism for this exact use case.
</details>
