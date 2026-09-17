# Practice Test 10: Advanced Context & Provenance (Week 10)
Domain 5: Context Management & Reliability -- Task Statements 5.4-5.6

---

## Question 1
After 2 hours of codebase exploration, your Claude Code session starts giving inconsistent answers and referencing "typical patterns" rather than the specific classes it discovered earlier. What is happening?

A) The model is experiencing a bug.
B) Context degradation in extended sessions: the model's ability to reference specific earlier findings deteriorates as context fills with exploration output.
C) The codebase is too complex for the model to understand.
D) The model's temperature is set too high.

<details>
<summary>Answer</summary>

**B)** Context degradation is a known issue in extended exploration sessions. As context fills with verbose tool outputs from file reads, searches, and analysis, the model's ability to accurately reference specific earlier findings deteriorates. It falls back to general knowledge ("typical patterns") rather than specific discovered facts. This is a context management issue, not a model capability issue.
</details>

---

## Question 2
During a long exploration session, you want the agent to maintain reliable access to key findings as context fills. What technique helps?

A) Periodically restart the session to clear context.
B) Have the agent maintain scratchpad files recording key findings, referencing them for subsequent questions to counteract context degradation.
C) Reduce the verbosity of the model's responses.
D) Use a model with a larger context window.

<details>
<summary>Answer</summary>

**B)** Scratchpad files persist key findings outside the conversation context. The agent writes important discoveries to files and references them when needed, ensuring access to accurate information regardless of how much context has accumulated. This counteracts degradation because the information is stored externally and re-read fresh rather than relied upon from deep in the conversation history.
</details>

---

## Question 3
You need to investigate multiple aspects of a large codebase: find all test files, trace the refund flow, identify API endpoints, and map database schemas. What is the best approach?

A) Investigate all aspects sequentially in the main conversation, reading every relevant file.
B) Spawn subagents to investigate specific questions while the main agent preserves high-level coordination, summarizing findings between phases.
C) Read all files into the main context first, then answer questions from memory.
D) Use a single subagent that investigates everything and returns a single report.

<details>
<summary>Answer</summary>

**B)** Subagent delegation isolates verbose exploration output while the main agent coordinates at a high level. Each subagent investigates one specific question, returns its findings, and the main agent summarizes before spawning the next batch. This prevents the main context from being overwhelmed with exploration output. Summarizing between phases (injecting summaries into the next subagent's context) maintains continuity.
</details>

---

## Question 4
Your multi-agent system crashes during a complex research task. On restart, all agent state is lost and the coordinator has to start from scratch. What architectural pattern prevents this?

A) Use longer-running agent processes that are less likely to crash.
B) Design crash recovery using structured agent state exports (manifests): each agent exports state to a known location, and the coordinator loads the manifest on resume and injects prior state into agent prompts.
C) Run duplicate agents so one can take over if the other fails.
D) Store all intermediate results in a database that the agent can query.

<details>
<summary>Answer</summary>

**B)** Structured state persistence for crash recovery means each agent periodically exports its current state (findings, progress, next steps) to a known location. On crash recovery, the coordinator loads this manifest and injects the prior state into agent prompts. This allows work to resume from the last checkpoint rather than restarting from scratch. Database storage (D) is similar in concept but a manifest pattern is more directly integrated with the agent architecture.
</details>

---

## Question 5
During an extended exploration session, your context is filling with verbose discovery output from reading dozens of files. What command can reduce context usage?

A) `/reset`
B) `/compact`
C) `/clear`
D) `/trim`

<details>
<summary>Answer</summary>

**B)** `/compact` reduces context usage during extended sessions by summarizing or compressing verbose discovery output. This is particularly useful when exploration has consumed significant context with file reads and search results that are no longer needed in their full form. The other options are not the designated commands for this purpose.
</details>

---

## Question 6
Your extraction pipeline reports 97% aggregate accuracy across all document types. After deploying, users report frequent errors on a specific document type (handwritten receipts). What went wrong?

A) The 97% accuracy is wrong -- the evaluation was flawed.
B) Aggregate accuracy metrics mask poor performance on specific document types. You should validate accuracy by document type and field segment before automating.
C) Handwritten receipts are impossible to process.
D) The model was not trained on handwritten text.

<details>
<summary>Answer</summary>

**B)** Aggregate accuracy metrics (97% overall) can mask significant performance gaps on specific document types or fields. If handwritten receipts are 5% of the volume but have 60% error rate, the aggregate still looks good. Accuracy must be validated by document type and by field before automating, ensuring consistent performance across all segments.
</details>

---

## Question 7
You have automated high-confidence extractions (removing human review for those). How should you monitor for quality degradation over time?

A) Monitor aggregate accuracy monthly.
B) Implement stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel error pattern detection.
C) Trust the confidence scores -- if they are high, the extractions are correct.
D) Only review extractions that downstream systems reject.

<details>
<summary>Answer</summary>

**B)** Stratified random sampling continuously monitors even high-confidence extractions for errors. This catches quality degradation over time (as document patterns drift), detects novel error patterns that the model has not encountered before, and provides ongoing validation that confidence scores remain calibrated. Trusting confidence blindly (C) risks undetected degradation.
</details>

---

## Question 8
Your synthesis agent combines findings from multiple sources. Two credible sources report different statistics for the same metric: Source A says "market grew 15%" while Source B says "market grew 22%." How should the synthesis handle this?

A) Average the two values and report 18.5%.
B) Use the more recent source.
C) Preserve both values with source attribution and annotate the conflict, rather than arbitrarily selecting one.
D) Report only the lower value to be conservative.

<details>
<summary>Answer</summary>

**C)** When credible sources conflict, the synthesis should preserve both values with full source attribution and explicitly annotate the conflict. Readers can then evaluate the sources themselves. Arbitrarily selecting (B, D) or averaging (A) destroys information and masks legitimate uncertainty. The report should distinguish well-established findings from contested ones.
</details>

---

## Question 9
Your subagents return research findings as prose paragraphs. After synthesis, source attribution is completely lost -- the final report makes claims without any source references. What structural change fixes this?

A) Add "Always cite sources" to the synthesis agent's prompt.
B) Require subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts) that downstream agents must preserve through synthesis.
C) Have the synthesis agent search for source references in the prose.
D) Add a post-processing step that matches claims to sources using semantic similarity.

<details>
<summary>Answer</summary>

**B)** The fix is structural: require subagents to output findings as structured claim-source mappings rather than prose. Each finding includes the claim, evidence excerpt, source URL/document name, and publication date. The synthesis agent receives and preserves these mappings, ensuring source attribution survives the synthesis process. Prompt instructions (A) without structured data are unreliable.
</details>

---

## Question 10
Two subagents analyze the same topic but from different time periods. Subagent A reports 2023 data and Subagent B reports 2025 data. The synthesis agent flags them as "contradictory findings." What metadata would prevent this misinterpretation?

A) Confidence scores for each finding.
B) Publication or data collection dates in structured outputs, enabling correct temporal interpretation.
C) Source credibility ratings.
D) Word count of the original source document.

<details>
<summary>Answer</summary>

**B)** Requiring subagents to include publication or data collection dates in their structured outputs enables the synthesis agent to correctly interpret temporal differences. Without dates, different values for the same metric from different years appear contradictory. With dates, the synthesis can correctly present them as temporal trends rather than conflicts.
</details>
