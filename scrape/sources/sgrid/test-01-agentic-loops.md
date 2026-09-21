# Practice Test 1: Agentic Loops (Week 1)
Domain 1: Agentic Architecture & Orchestration -- Task Statement 1.1

---

## Question 1
You are building a customer support agent. Your agentic loop currently checks if the assistant's response contains the phrase "I've completed the task" to decide when to stop iterating. During testing, the agent sometimes generates this phrase mid-conversation while still needing to call additional tools. What should you change?

A) Add additional termination phrases like "No further action needed" to make detection more robust.
B) Check `stop_reason` in the API response: continue when it equals `"tool_use"` and terminate when it equals `"end_turn"`.
C) Set a maximum iteration count and stop after that many loops regardless of the response content.
D) Parse the assistant's response for tool call JSON to determine if more tools need to be invoked.

<details>
<summary>Answer</summary>

**B)** The `stop_reason` field is the reliable, API-provided mechanism for determining whether the model wants to call a tool or has finished its response. Parsing natural language (A, D) is an anti-pattern -- the model may include completion-sounding phrases while still intending to call tools. Arbitrary iteration caps (C) are a secondary safety measure, not a primary stopping mechanism.
</details>

---

## Question 2
Your agentic loop processes tool results but does not append them to the conversation history before sending the next request. The agent appears to "forget" what tools returned and re-calls the same tools repeatedly. What is the root cause?

A) The model's context window is too small to hold the tool results.
B) Tool results must be appended to the conversation history so the model can reason about them in the next iteration.
C) The model needs a system prompt instruction telling it not to repeat tool calls.
D) You need to implement a deduplication layer that prevents the same tool from being called twice.

<details>
<summary>Answer</summary>

**B)** Tool results must be added to the conversation history between iterations. Without this, the model has no record of previous tool outputs and cannot incorporate that information into its reasoning. The issue is not context window size (A), prompt instructions (C), or deduplication (D) -- it is the fundamental requirement that tool results be part of the conversation context.
</details>

---

## Question 3
A developer implements an agentic loop with `max_iterations = 5` as the primary stopping condition. The agent frequently hits this limit mid-task, producing incomplete responses. The developer's fix is to increase the limit to 20. What is the better approach?

A) Use `stop_reason == "end_turn"` as the primary termination condition, with the iteration cap as a safety fallback only.
B) Set `max_iterations = 50` to ensure the agent always has enough room to complete.
C) Remove the iteration cap entirely and let the agent run until it finishes naturally.
D) Add a timer-based cutoff (e.g., 60 seconds) instead of an iteration count.

<details>
<summary>Answer</summary>

**A)** The primary loop control should be the model's own `stop_reason`. When the model returns `"end_turn"`, it has decided it is done. An iteration cap should exist as a safety fallback to prevent runaway loops, but should not be the primary mechanism for determining when the agent is finished. Removing caps entirely (C) is dangerous. Increasing them (B) just moves the problem. Timer-based cutoffs (D) do not align with task completion.
</details>

---

## Question 4
In your agentic loop, after the model returns a response with `stop_reason: "tool_use"`, you execute the requested tool and get a result. What should happen next?

A) Send a new API request with only the tool result as the user message.
B) Append the assistant's response (with the tool call) and the tool result to the conversation history, then send the full updated history in the next API request.
C) Parse the tool result and include a summary in the next system prompt update.
D) Store the tool result in a database and include a reference ID in the next message.

<details>
<summary>Answer</summary>

**B)** The complete conversation history, including the assistant's tool call request and the tool's result, must be appended and sent in the next API request. This gives the model full context to reason about the result and decide what to do next. Sending only the tool result (A) loses conversation context. Summarizing in the system prompt (C) or storing externally (D) breaks the conversational flow the model needs.
</details>

---

## Question 5
You notice your agentic loop terminates when the assistant message contains text content alongside a tool call. The code checks `if response.content[0].type == "text": break`. Why is this incorrect?

A) The `content` array can contain both text blocks and tool_use blocks in the same response. The model often explains its reasoning (text) before or after requesting a tool call.
B) Text content is only present in error responses, so this check is correct for normal flow.
C) The `content` array always has exactly one element, so checking the first element is fine.
D) Tool calls are never mixed with text content in the same response.

<details>
<summary>Answer</summary>

**A)** A single assistant response can contain both text blocks (the model's reasoning or explanation) and `tool_use` blocks in the same `content` array. Checking for text content as a completion indicator is an anti-pattern because the model frequently explains its reasoning alongside tool calls. The correct check is `stop_reason`, not content type inspection.
</details>

---

## Question 6
Your customer support agent uses an agentic loop. In production, you observe that the agent sometimes enters an infinite loop, calling the same two tools alternately without making progress. What is the best mitigation?

A) Parse each tool result for the word "error" and terminate the loop if detected.
B) Maintain a reasonable iteration safety cap as a fallback and monitor for repeated identical tool calls as a signal to investigate prompt or tool design issues.
C) After each tool call, ask the model "Are you done?" and terminate if it says yes.
D) Limit each tool to being called only once per session.

<details>
<summary>Answer</summary>

**B)** An iteration safety cap prevents infinite loops, while monitoring for repeated identical calls helps identify root causes (poor tool descriptions, ambiguous results). Parsing for "error" (A) is unreliable natural language parsing. Asking "Are you done?" (C) adds unnecessary turns. Limiting tools to one call (D) is too restrictive -- legitimate workflows may need to call the same tool multiple times with different parameters.
</details>

---

## Question 7
What distinguishes model-driven decision-making in an agentic loop from a pre-configured decision tree?

A) Model-driven decision-making is slower but more accurate than decision trees.
B) In model-driven loops, Claude reasons about which tool to call next based on the current context, rather than following a fixed sequence of tool calls.
C) Decision trees use the API while model-driven approaches use local inference.
D) Model-driven approaches require fewer tools to be defined.

<details>
<summary>Answer</summary>

**B)** The key distinction is that in model-driven agentic loops, Claude analyzes the current context (conversation history, tool results, user request) and dynamically decides which tool to call. This contrasts with pre-configured decision trees where the sequence of tool calls is determined by hard-coded logic. Model-driven approaches are more flexible and can adapt to novel situations.
</details>

---

## Question 8
You are designing an agentic loop for a billing dispute agent. The agent must: (1) look up the customer, (2) retrieve the disputed charge, (3) check the refund policy, and (4) either process the refund or escalate. A junior developer suggests hard-coding this sequence. What is the tradeoff?

A) Hard-coding is always better because it guarantees the correct order.
B) Hard-coding ensures the sequence but loses the model's ability to adapt when steps fail or when context makes some steps unnecessary. A hybrid approach using programmatic prerequisites for critical steps and model-driven logic for adaptive steps is often better.
C) Model-driven is always better because it is more flexible.
D) There is no difference -- the model will follow the same sequence either way.

<details>
<summary>Answer</summary>

**B)** Neither extreme is always best. Hard-coding ensures order but loses adaptability (e.g., if the customer already provided their ID, `get_customer` might not be needed). Model-driven logic allows adaptation but might skip critical steps. The best approach is a hybrid: use programmatic enforcement for non-negotiable prerequisites (e.g., customer verification before refunds) while letting the model reason about optional or adaptive steps.
</details>

---

## Question 9
Your agentic loop implementation sends the API request, receives a response, and checks `stop_reason`. The response has `stop_reason: "max_tokens"`. What does this indicate and how should you handle it?

A) The model finished its response normally. Terminate the loop.
B) The model's response was truncated because it hit the `max_tokens` limit. You should continue the conversation so the model can complete its response, or increase `max_tokens`.
C) The model encountered an error. Retry the same request.
D) The model wants to call a tool but ran out of space to specify which one. Terminate and report an error.

<details>
<summary>Answer</summary>

**B)** `stop_reason: "max_tokens"` means the response was cut off before the model finished. This is distinct from `"end_turn"` (model chose to stop) and `"tool_use"` (model wants to call a tool). The response is incomplete and may contain a partial tool call or truncated text. You should either increase `max_tokens` or send a continuation request.
</details>

---

## Question 10
Which of the following is the correct agentic loop control flow?

A) Send request -> Check if response contains tool JSON -> Execute tool -> Loop until no tool JSON found
B) Send request -> Check `stop_reason` -> If `"tool_use"`: execute tool, append results to history, send next request -> If `"end_turn"`: return final response
C) Send request -> Execute all tools defined in the system -> Append results -> Send next request -> Check for "done" in response text
D) Send request -> If response has text content, return it -> If response has tool content, execute and loop

<details>
<summary>Answer</summary>

**B)** The correct flow is: (1) send the API request, (2) check `stop_reason`, (3) if `"tool_use"`, execute the requested tools, append both the assistant's response and tool results to the conversation history, and send the next request, (4) if `"end_turn"`, return the final response. This is the canonical agentic loop pattern. Options A and D check content types instead of `stop_reason`. Option C executes tools proactively rather than on-demand.
</details>
