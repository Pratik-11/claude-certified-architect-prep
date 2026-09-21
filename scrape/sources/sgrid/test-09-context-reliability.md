# Practice Test 9: Context Management & Reliability (Week 9)
Domain 5: Context Management & Reliability -- Task Statements 5.1-5.3

---

## Question 1
Your customer support agent handles multi-turn conversations. After 15 turns, it refers to a refund of "$47" that was actually $147.23 -- the exact amount was lost during context summarization. How should you preserve critical numerical data?

A) Increase the context window size to avoid summarization.
B) Extract transactional facts (amounts, dates, order numbers, statuses) into a persistent "case facts" block included in each prompt, outside summarized history.
C) Ask the customer to repeat important numbers periodically.
D) Store all numbers in a database and query them each turn.

<details>
<summary>Answer</summary>

**B)** Progressive summarization risks condensing numerical values, dates, and specific details into vague summaries. The solution is to extract critical transactional facts into a structured "case facts" block that persists outside the summarized conversation history. This block is included in each prompt, ensuring exact values are always available regardless of how much conversation history is summarized.
</details>

---

## Question 2
Your customer has three open issues: a damaged item return, a billing dispute, and an address change. After resolving the first issue, the agent loses track of the other two. What structural change prevents this?

A) Add "Remember to address all issues" to the system prompt.
B) Extract and persist structured issue data (order IDs, amounts, statuses) into a separate context layer for multi-issue sessions.
C) Limit customers to one issue per conversation.
D) Create separate conversation threads for each issue.

<details>
<summary>Answer</summary>

**B)** For multi-issue sessions, structured issue data should be extracted into a separate context layer that tracks each issue's ID, status, and key details. This persists across turns regardless of conversation summarization, ensuring no issues are forgotten. Prompt instructions (A) are unreliable for state tracking. Limiting issues (C) degrades customer experience.
</details>

---

## Question 3
Your agent calls `lookup_order` which returns 40+ fields per order (shipping address, billing address, payment method details, warehouse location, carrier tracking, etc.). For most customer requests, only 5 fields are relevant. What should you do?

A) Let the model process all 40 fields -- it can ignore irrelevant ones.
B) Trim verbose tool outputs to only relevant fields before they accumulate in context.
C) Paginate the tool output, loading 10 fields at a time.
D) Create 8 different order lookup tools, each returning a subset of fields.

<details>
<summary>Answer</summary>

**B)** Verbose tool outputs consume context tokens disproportionate to their relevance. Trimming to only the fields relevant to the current request (e.g., keeping only return-relevant fields for a return request) prevents context bloat. Letting all fields accumulate (A) wastes context budget. Too many specialized tools (D) creates tool selection problems. Pagination (C) adds unnecessary complexity.
</details>

---

## Question 4
You are aggregating research findings from 5 subagents into a single prompt for the synthesis agent. The findings from the 3rd and 4th agents (middle of the input) are consistently underrepresented in the final synthesis. What is the cause and fix?

A) The 3rd and 4th agents produced lower quality findings.
B) The "lost in the middle" effect: models reliably process information at the beginning and end but may omit findings from middle sections. Place key findings summaries at the beginning and use explicit section headers.
C) The synthesis agent's context window is too small.
D) The 3rd and 4th agents are taking too long, causing timeout issues.

<details>
<summary>Answer</summary>

**B)** The "lost in the middle" effect is a known LLM behavior where information at the beginning and end of long inputs receives more attention than middle sections. The mitigation is to place key findings summaries at the beginning of the aggregated input and organize detailed results with explicit section headers to help the model navigate the content.
</details>

---

## Question 5
A customer explicitly says "I want to speak to a human agent." Your agent has already identified that the issue is a simple order status question it could answer in one tool call. What should the agent do?

A) Answer the question first to demonstrate capability, then offer to transfer if the customer still wants a human.
B) Honor the customer's explicit request immediately and transfer to a human agent.
C) Ask the customer why they want a human agent to determine if escalation is necessary.
D) Provide the order status and mention that a human agent is also available.

<details>
<summary>Answer</summary>

**B)** When a customer explicitly requests a human agent, honor that request immediately without first attempting investigation. The customer has stated their preference, and ignoring it to demonstrate capability (A, D) or questioning their decision (C) creates friction and violates the escalation principle.
</details>

---

## Question 6
A customer says "This is so frustrating, nothing ever works!" but their issue is a straightforward product return within policy. The agent escalates based on the negative sentiment. Is this correct?

A) Yes -- high frustration always warrants human escalation.
B) No -- sentiment-based escalation is unreliable. The agent should acknowledge frustration while offering to resolve the straightforward issue, escalating only if the customer reiterates their preference for a human.
C) Yes -- the agent should err on the side of caution with frustrated customers.
D) No -- the agent should ignore sentiment entirely and focus on the issue.

<details>
<summary>Answer</summary>

**B)** Sentiment does not correlate with case complexity. A frustrated customer may have a simple issue that the agent can resolve perfectly. The agent should acknowledge the frustration, offer to resolve the issue (which is within its capability), and escalate only if the customer explicitly requests a human. Ignoring sentiment entirely (D) is also wrong -- acknowledgment is important.
</details>

---

## Question 7
Your tool returns multiple customer records for the name "John Smith." The agent selects the most recent account using a heuristic. This occasionally leads to misidentified accounts. What should the agent do instead?

A) Select the account with the most orders as the most likely match.
B) Ask the customer for additional identifiers (email, phone number, or order number) to disambiguate rather than selecting based on heuristics.
C) Present all matching accounts to the customer and ask them to confirm.
D) Use the phone number from caller ID to automatically select the right account.

<details>
<summary>Answer</summary>

**B)** When tool results return multiple matches, the agent should request additional identifiers from the customer for disambiguation rather than applying heuristics that may select the wrong record. This is more reliable than presenting all accounts (C), which may expose other customers' information, and safer than any automated selection heuristic (A, D).
</details>

---

## Question 8
Your web search subagent returns an error: `{"status": "error", "message": "search unavailable"}`. The coordinator has no information about what failed, what was attempted, or whether partial results exist. What should the error response include instead?

A) Just the HTTP status code for programmatic handling.
B) Structured error context: failure type (timeout), attempted query, partial results (3 of 5 sources returned), and potential alternative approaches (try alternative search API or narrower query).
C) A retry count showing how many times the subagent already retried.
D) The full stack trace for debugging.

<details>
<summary>Answer</summary>

**B)** Structured error context enables the coordinator to make intelligent recovery decisions. Knowing the failure type (timeout vs permission denied), what was attempted (the query), partial results (what succeeded), and alternatives (different API, narrower query) gives the coordinator all the information needed to decide whether to retry, modify the approach, or proceed with partial data. Generic messages (like "search unavailable") hide this critical context.
</details>

---

## Question 9
A subagent encounters a transient timeout error while fetching a document. It has local retry logic that succeeds on the second attempt. Should it report this error to the coordinator?

A) Yes -- all errors should always be reported to the coordinator.
B) No -- subagents should implement local recovery for transient failures and only propagate errors they cannot resolve, along with what was attempted and partial results.
C) Yes -- the coordinator needs to know about all timeouts for monitoring.
D) No -- errors should be silently swallowed to keep the coordinator's context clean.

<details>
<summary>Answer</summary>

**B)** Subagents should handle transient failures locally when possible (retry logic for timeouts, exponential backoff). Only propagate to the coordinator errors that cannot be resolved locally. When propagating, include what was attempted and any partial results. This prevents the coordinator from being overwhelmed with recoverable issues while ensuring genuine failures are properly handled. Silent suppression (D) is an anti-pattern.
</details>

---

## Question 10
A subagent successfully queries a database and finds zero results matching the search criteria. It returns `{"status": "error", "message": "No results found"}`. Is this correct?

A) Yes -- no results is an error condition.
B) No -- a successful query with zero results is a valid empty result, not an error. The response should indicate success with no matches to prevent the coordinator from treating it as a failure requiring retry.
C) Yes -- the coordinator should retry with different search criteria.
D) No -- it should return a fabricated result to avoid the empty result.

<details>
<summary>Answer</summary>

**B)** A successful query that returns zero results is fundamentally different from a failed query. The query executed correctly -- there simply were no matches. Reporting this as an error causes the coordinator to apply recovery strategies (retries, alternative approaches) that are inappropriate since the "failure" is actually valid information. The distinction between access failures (needing retry) and valid empty results is critical.
</details>
