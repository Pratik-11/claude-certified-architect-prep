# Full Practice Exam 1 (Week 11)
50 Questions -- All 6 Scenarios -- Simulates Actual Exam Format
Target time: 90 minutes | Passing score: 36/50 (720/1000)

---

## Scenario A: Customer Support Resolution Agent

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles returns, billing disputes, and account issues via MCP tools (get_customer, lookup_order, process_refund, escalate_to_human). Target: 80%+ first-contact resolution.

### Q1
The agent occasionally processes refunds for the wrong customer because it uses the customer's stated name to call `lookup_order` instead of first verifying identity through `get_customer`. The system prompt clearly instructs it to verify identity first. What is the most reliable fix?

A) Rephrase the system prompt with stronger language about verification requirements.
B) Add 5 few-shot examples showing correct verification-first sequences.
C) Implement a programmatic prerequisite that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID.
D) Add a pre-processing classifier that detects when verification is needed.

<details><summary>Answer</summary>**C)** Programmatic enforcement provides deterministic guarantees. Prompt-based approaches (A, B) have non-zero failure rates. A classifier (D) adds complexity without guaranteed compliance.</details>

### Q2
The agent's `get_customer` and `lookup_order` tools have minimal descriptions: "Gets customer info" and "Gets order info." Agents frequently call the wrong one. What is the most effective first step?

A) Add few-shot examples for each tool call scenario.
B) Expand tool descriptions to include input formats, example queries, edge cases, and clear boundaries between the two tools.
C) Consolidate into one `lookup` tool.
D) Add a routing layer before the agent.

<details><summary>Answer</summary>**B)** Tool descriptions are the primary mechanism for tool selection. Expanding them with clear differentiation is the highest-leverage, lowest-effort fix.</details>

### Q3
A customer says: "I need to return my broken headphones AND I was charged twice on my last order." The agent resolves the return but forgets the billing dispute. What architecture prevents this?

A) Add "Address all customer concerns" to the system prompt.
B) Decompose multi-concern requests into distinct items, investigate each with shared context, then synthesize a unified resolution.
C) Limit customers to one issue per message.
D) Use a checklist tool.

<details><summary>Answer</summary>**B)** Explicit decomposition into distinct items with parallel investigation and unified synthesis ensures complete coverage.</details>

### Q4
Order lookups return 40+ fields. Most requests need only 5 fields. Context is growing rapidly. What should you do?

A) Use a model with a larger context window.
B) Trim tool outputs to only the fields relevant to the current request type.
C) Paginate the results.
D) Cache frequently accessed fields.

<details><summary>Answer</summary>**B)** Trimming verbose tool outputs to relevant fields prevents disproportionate context consumption.</details>

### Q5
A PostToolUse hook receives dates in three formats from different MCP tools: Unix timestamps, ISO 8601, and "MM/DD/YYYY". What should the hook do?

A) Let the model figure out the formats.
B) Normalize all dates to ISO 8601 before the model processes them.
C) Convert all to Unix timestamps for consistency.
D) Add format labels to each date field.

<details><summary>Answer</summary>**B)** PostToolUse hooks should normalize heterogeneous data formats to a consistent format before model processing.</details>

### Q6
The company policy caps automated refunds at $500. The agent occasionally processes $600+ refunds despite prompt instructions. What provides guaranteed compliance?

A) Bold the $500 limit in the system prompt.
B) Implement a tool call interception hook that blocks `process_refund` when amount exceeds $500 and redirects to human escalation.
C) Add a confirmation step where the agent double-checks the amount.
D) Log all refund amounts for post-hoc auditing.

<details><summary>Answer</summary>**B)** Tool call interception hooks provide deterministic enforcement of business rules.</details>

### Q7
A customer says "I want to talk to a real person" about a simple order status question. What should the agent do?

A) Answer the question first to save the customer time, then offer transfer.
B) Honor the explicit request immediately and transfer to a human agent.
C) Ask why they want a human to assess if escalation is truly needed.
D) Provide the answer and a link to contact support.

<details><summary>Answer</summary>**B)** Explicit customer requests for human agents must be honored immediately.</details>

### Q8
The agent escalates based on negative customer sentiment. A frustrated customer with a simple, policy-covered return gets escalated unnecessarily. What is wrong?

A) The sentiment threshold is too low.
B) Sentiment-based escalation is unreliable because sentiment does not correlate with case complexity. Use explicit escalation criteria instead.
C) The agent should never escalate.
D) Add positive sentiment detection to balance the escalation trigger.

<details><summary>Answer</summary>**B)** Sentiment != complexity. Explicit criteria (policy gaps, customer explicit requests, inability to progress) are more reliable than sentiment-based triggers.</details>

---

## Scenario B: Code Generation with Claude Code

You are using Claude Code to accelerate development. Your team uses it for code generation, refactoring, debugging, and documentation with custom slash commands and CLAUDE.md configurations.

### Q9
A new developer joins the team and reports Claude Code is not following the project's coding standards. Other developers do not have this issue. The standards are in a CLAUDE.md file. What is the most likely cause?

A) The new developer's Claude Code version is outdated.
B) The coding standards are in `~/.claude/CLAUDE.md` (user-level) on another developer's machine, not in the project-level config.
C) The CLAUDE.md file is too large.
D) The standards use syntax that Claude Code does not support.

<details><summary>Answer</summary>**B)** User-level config is not shared via version control. Project-level config (.claude/CLAUDE.md or root CLAUDE.md) is needed for team-wide standards.</details>

### Q10
You want to create a `/review` command available to every developer when they clone the repo. Where do you create it?

A) `.claude/commands/review.md` in the project repository.
B) `~/.claude/commands/review.md` in each developer's home directory.
C) In the root CLAUDE.md file.
D) In `.claude/config.json`.

<details><summary>Answer</summary>**A)** Project-scoped commands in `.claude/commands/` are version-controlled and available to all developers automatically.</details>

### Q11
Test files are spread throughout the codebase (e.g., `Button.test.tsx` next to `Button.tsx`) and should all follow the same testing conventions regardless of location. What is the most maintainable configuration?

A) Add testing conventions to the root CLAUDE.md.
B) Create rule files in `.claude/rules/` with YAML frontmatter glob patterns like `paths: ["**/*.test.tsx"]`.
C) Place a CLAUDE.md in every directory containing test files.
D) Create a testing skill that developers must invoke before writing tests.

<details><summary>Answer</summary>**B)** Path-specific rules with glob patterns apply conventions to files by type regardless of directory location, which is ideal for test files spread throughout the codebase.</details>

### Q12
You need to restructure a monolith into microservices, affecting dozens of files with multiple valid approaches. Which mode should you use?

A) Direct execution with comprehensive upfront instructions.
B) Plan mode to explore the codebase, understand dependencies, and design an approach before making changes.
C) Direct execution, changing files incrementally.
D) Direct execution and switch to plan mode only if stuck.

<details><summary>Answer</summary>**B)** Plan mode is designed for complex tasks with large-scale changes, multiple valid approaches, and architectural decisions.</details>

### Q13
A developer asks Claude to transform function signatures from camelCase to snake_case. After multiple attempts with different prose instructions, the results are inconsistent. What technique works best?

A) More detailed written instructions.
B) 2-3 concrete input/output examples showing the exact transformation.
C) A regular expression replacement.
D) A stricter system prompt tone.

<details><summary>Answer</summary>**B)** Concrete examples are the most effective way to communicate transformations when prose produces inconsistent results.</details>

### Q14
A large CLAUDE.md (600 lines) covers API conventions, testing, deployment, and security. Maintenance is becoming difficult. What is the best refactoring?

A) Add section headers and a table of contents.
B) Split into focused files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`).
C) Move to external documentation and link from CLAUDE.md.
D) Create separate CLAUDE.md files in each subdirectory.

<details><summary>Answer</summary>**B)** `.claude/rules/` is designed for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md.</details>

### Q15
A skill produces verbose codebase analysis output that consumes significant context. How do you prevent it from polluting the main conversation?

A) Reduce the analysis depth.
B) Use `context: fork` in the SKILL.md frontmatter to run the skill in an isolated sub-agent context.
C) Summarize the output manually.
D) Use `output: minimal` in the frontmatter.

<details><summary>Answer</summary>**B)** `context: fork` runs the skill in isolation, preventing verbose output from consuming main conversation context.</details>

### Q16
Your monorepo has React, Angular, and Go packages. Each needs different coding standards. What is the most maintainable configuration?

A) Put all standards in root CLAUDE.md with headers for each technology.
B) Use `@import` in each package's CLAUDE.md to include relevant standards files.
C) Duplicate a comprehensive CLAUDE.md in each package directory.
D) Use runtime detection of the current file's language.

<details><summary>Answer</summary>**B)** `@import` enables selective inclusion of relevant standards files per package while avoiding duplication.</details>

---

## Scenario C: Multi-Agent Research System

A coordinator agent delegates to subagents: web search, document analysis, synthesis, and report generation. The system produces cited research reports.

### Q17
The system researches "impact of AI on creative industries" but the report covers only visual arts, missing music, writing, and film. The coordinator decomposed the topic into "AI in digital art creation," "AI in graphic design," and "AI in photography." What is the root cause?

A) The synthesis agent lacks gap-detection instructions.
B) The coordinator's task decomposition is too narrow, only covering visual arts subtopics.
C) The web search agent's queries are not broad enough.
D) The document analysis agent filters out non-visual content.

<details><summary>Answer</summary>**B)** The coordinator's decomposition directly caused the coverage gap by only assigning visual arts subtopics to subagents.</details>

### Q18
Web search and document analysis subagents can run independently, but synthesis needs results from both. What is the optimal execution pattern?

A) Run all three sequentially.
B) Emit two Task tool calls in one coordinator response (web search + document analysis) for parallel execution, then invoke synthesis with both results.
C) Run all three in parallel with a polling mechanism.
D) Pipeline: web search -> document analysis -> synthesis.

<details><summary>Answer</summary>**B)** Parallel execution via multiple Task calls in a single response, followed by synthesis after both complete.</details>

### Q19
The web search subagent times out. It returns: `{"status": "error", "message": "search unavailable"}`. The coordinator cannot make a recovery decision. What should the error response include?

A) Just the HTTP status code.
B) Structured error context: failure type, attempted query, partial results, and potential alternative approaches.
C) A retry counter.
D) The full stack trace.

<details><summary>Answer</summary>**B)** Structured error context enables intelligent coordinator recovery decisions.</details>

### Q20
The synthesis agent frequently needs to verify simple facts (dates, names, statistics) during synthesis. Currently this requires coordinator round-trips adding 40% latency. 85% of verifications are simple fact-checks. What is the best approach?

A) Give synthesis all web search tools for direct access.
B) Give synthesis a scoped `verify_fact` tool for simple lookups; complex verifications continue through the coordinator.
C) Have synthesis batch all verification needs and return them at once.
D) Have web search proactively cache extra context.

<details><summary>Answer</summary>**B)** A scoped verification tool handles the 85% common case while preserving the coordination pattern for complex cases. This follows the principle of least privilege.</details>

### Q21
Subagent findings are returned as prose paragraphs. After synthesis, source attribution is lost. What structural change preserves provenance?

A) Tell the synthesis agent to "always cite sources."
B) Require subagents to output structured claim-source mappings (source URL, document name, excerpt, date) that the synthesis agent must preserve.
C) Have synthesis search for URLs in the prose.
D) Add a post-processing attribution step.

<details><summary>Answer</summary>**B)** Structured claim-source mappings are the architectural fix. Prose-based approaches lose information through summarization.</details>

### Q22
Two credible sources report different market growth figures: 15% and 22%. How should the synthesis handle this?

A) Average to 18.5%.
B) Use the more recent source.
C) Preserve both values with source attribution and annotate the conflict.
D) Report the lower value to be conservative.

<details><summary>Answer</summary>**C)** Preserve both values, annotate the conflict, and let readers evaluate the sources.</details>

### Q23
The coordinator's `allowedTools` list includes standard tools but not "Task". What happens when it tries to spawn subagents?

A) It falls back to inline processing.
B) It cannot spawn subagents because Task is not in its allowed tools.
C) It spawns subagents with restricted permissions.
D) It automatically gains Task access.

<details><summary>Answer</summary>**B)** `allowedTools` must explicitly include "Task" for a coordinator to invoke subagents.</details>

### Q24
Three subagents research overlapping subtopics, producing duplicate findings. How do you reduce duplication?

A) Add deduplication in the coordinator after all subagents complete.
B) Partition research scope across subagents (distinct subtopics or source types) to minimize overlap.
C) Reduce to one subagent.
D) Have each subagent check with the coordinator before each search.

<details><summary>Answer</summary>**B)** Partitioning scope at assignment time is more efficient than post-hoc deduplication.</details>

---

## Scenario D: Developer Productivity with Claude

Building developer tools using the Agent SDK. The agent explores codebases, understands legacy systems, generates boilerplate, and automates tasks using built-in tools and MCP servers.

### Q25
A developer needs to find all callers of `processPayment()` across the codebase. Which built-in tool should they start with?

A) Glob to find all JavaScript files, then Read each one.
B) Grep to search for `processPayment` in file contents across the codebase.
C) Read to load every file and search manually.
D) Bash to run a custom search script.

<details><summary>Answer</summary>**B)** Grep is the built-in tool for content search -- searching file contents for patterns like function names.</details>

### Q26
A developer needs to find all files matching `*.test.tsx` in the project. Which tool?

A) Grep
B) Read
C) Glob
D) Bash with `find`

<details><summary>Answer</summary>**C)** Glob is for file path pattern matching -- finding files by name/extension patterns.</details>

### Q27
Edit fails because the anchor text is not unique in the file. What is the correct fallback?

A) Use Bash with `sed` for the edit.
B) Use Read to load the full file contents, then Write the entire modified file.
C) Try Edit with a smaller anchor text.
D) Manually edit the file.

<details><summary>Answer</summary>**B)** When Edit cannot find unique anchor text, Read + Write is the documented fallback for reliable file modification.</details>

### Q28
An MCP server provides a `search_issues` tool with detailed Jira integration. But the agent keeps using Grep to search for issue references in code instead. What is the likely cause?

A) Built-in tools always take priority.
B) The MCP tool's description does not clearly explain its capabilities, causing the agent to prefer familiar built-in tools.
C) The MCP server is not connected.
D) Grep is always better for searching.

<details><summary>Answer</summary>**B)** Vague MCP tool descriptions cause the agent to default to familiar built-in alternatives. Enhanced descriptions fix this.</details>

### Q29
A team wants to share an MCP server configuration but each developer needs their own auth token. How should this be configured?

A) Each developer manually configures the server in their local config.
B) Use `.mcp.json` in the project repo with `${JIRA_TOKEN}` environment variable expansion for credentials.
C) Commit the token to the repo's `.mcp.json`.
D) Store tokens in CLAUDE.md.

<details><summary>Answer</summary>**B)** Project-scoped `.mcp.json` with environment variable expansion enables shared config with individual credentials.</details>

### Q30
A developer adds a personal experimental MCP server. Where should it be configured?

A) `.mcp.json` in the project repo with a "personal" flag.
B) `~/.claude.json` (user-scoped configuration).
C) `.mcp.local.json` in the project directory.
D) A separate config file referenced from CLAUDE.md.

<details><summary>Answer</summary>**B)** User-scoped `~/.claude.json` for personal/experimental servers that should not affect teammates.</details>

---

## Scenario E: Claude Code for Continuous Integration

Integrating Claude Code into CI/CD for automated code reviews, test generation, and PR feedback.

### Q31
Your CI job runs `claude "Review this PR"` and hangs. What is the fix?

A) Set `CLAUDE_HEADLESS=true`.
B) Use `claude -p "Review this PR"` with the `-p` flag for non-interactive mode.
C) Redirect stdin from `/dev/null`.
D) Use `claude --batch "Review this PR"`.

<details><summary>Answer</summary>**B)** The `-p` (or `--print`) flag is the documented way to run Claude Code in non-interactive mode for CI/CD.</details>

### Q32
CI review output needs to be structured JSON for automated inline PR comments. Which flags?

A) `-p --verbose`
B) `-p --output-format json --json-schema <schema>`
C) `-p --format json`
D) `-p | jq`

<details><summary>Answer</summary>**B)** `--output-format json` with `--json-schema` produces machine-parseable structured output.</details>

### Q33
Your manager wants to switch both pre-merge code review and overnight debt analysis to the batch API for 50% savings. What is correct?

A) Switch both.
B) Switch overnight debt analysis to batch; keep pre-merge reviews synchronous. Batch has up to 24-hour processing with no guaranteed latency SLA.
C) Keep both synchronous.
D) Switch both with timeout fallback.

<details><summary>Answer</summary>**B)** Batch API is for latency-tolerant workloads only. Pre-merge checks are blocking and need real-time responses.</details>

### Q34
A 14-file PR review produces contradictory findings: flagging a pattern as problematic in one file while approving identical code elsewhere. What is the fix?

A) Use a larger context window model.
B) Split into per-file local analysis passes plus a separate cross-file integration pass.
C) Require smaller PRs.
D) Run three reviews and take majority vote.

<details><summary>Answer</summary>**B)** Multi-pass review (per-file + integration) addresses attention dilution in large reviews.</details>

### Q35
The same Claude session generates code and reviews it. The review finds no issues, but an independent reviewer later finds bugs. Why?

A) The review prompt was inadequate.
B) The model retains generation reasoning context, making it biased toward confirming its own decisions.
C) The model cannot review code.
D) Extended thinking was not enabled.

<details><summary>Answer</summary>**B)** Self-review in the same session is limited by retained reasoning context bias.</details>

### Q36
CI re-runs reviews after new commits. Previous findings are duplicated. How do you fix this?

A) Delete previous comments before each run.
B) Include prior review findings in context, instructing Claude to report only new or still-unaddressed issues.
C) Use a different review template for re-reviews.
D) Only review newly changed files.

<details><summary>Answer</summary>**B)** Including prior findings prevents duplicate reporting while maintaining awareness of all issues.</details>

### Q37
Generated tests frequently duplicate existing test scenarios. What prevents this?

A) Limit the number of generated tests.
B) Provide existing test files in context so Claude avoids duplicating already-covered scenarios.
C) Run a deduplication filter on generated tests.
D) Only generate tests for new code.

<details><summary>Answer</summary>**B)** Context awareness of existing tests prevents duplication at generation time.</details>

### Q38
You want CI-generated tests to follow project conventions and use available fixtures. What is the most effective way to convey this?

A) Add "Generate high-quality tests" to the CI prompt.
B) Document testing standards, valuable test criteria, and available fixtures in CLAUDE.md.
C) Specify exact test patterns in the CI script.
D) Post-process tests to add fixture imports.

<details><summary>Answer</summary>**B)** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code.</details>

---

## Scenario F: Structured Data Extraction

Building a system that extracts data from unstructured documents, validates output with JSON schemas, and maintains high accuracy.

### Q39
Your extraction tool uses `tool_use` with a JSON schema. It never produces JSON syntax errors but occasionally places vendor names in the address field. What type of error is this?

A) Schema syntax error.
B) Semantic error -- tool_use eliminates syntax errors but not logical/semantic errors.
C) Configuration error.
D) Model hallucination.

<details><summary>Answer</summary>**B)** Tool use with JSON schemas eliminates syntax errors but cannot prevent semantic errors (values in wrong fields, logical inconsistencies).</details>

### Q40
An invoice has no phone number, but your schema marks `phone` as required. The model generates a plausible phone number. How do you fix this?

A) Add "Do not fabricate values" to the prompt.
B) Make the `phone` field optional (nullable) so the model can return null when information is absent.
C) Post-validate phone numbers against a directory.
D) Remove the phone field entirely.

<details><summary>Answer</summary>**B)** Nullable fields allow the model to signal "not found" rather than fabricating values to satisfy required constraints.</details>

### Q41
Validation fails on 20% of extractions. Your retry sends the same prompt again. Success rate on retry is only 8%. How do you improve?

A) Retry 5 times instead of once.
B) Include the original document, the failed extraction, and specific validation errors in the retry prompt for model self-correction.
C) Use a different model for retries.
D) Lower validation thresholds.

<details><summary>Answer</summary>**B)** Retry-with-error-feedback gives the model specific information about what went wrong.</details>

### Q42
Some retry failures are due to missing information (the source document simply does not contain the data). What should you do about these?

A) Keep retrying with modified prompts.
B) Recognize that retries are ineffective when information is absent from the source and mark those fields as unavailable rather than continuing to retry.
C) Have the model search external sources for the missing data.
D) Fabricate plausible values.

<details><summary>Answer</summary>**B)** Retries cannot conjure information that does not exist in the source document.</details>

### Q43
You need to extract data from invoices, contracts, and receipts. Documents arrive without type labels. How do you ensure structured output while allowing correct schema selection?

A) Use `tool_choice: "auto"`.
B) Use `tool_choice: "any"` with three extraction tools (one per document type).
C) Force `tool_choice` to always use the invoice schema.
D) Use a single generic extraction schema.

<details><summary>Answer</summary>**B)** `"any"` guarantees a tool call while letting the model choose the correct extraction schema for the document type.</details>

### Q44
Your extraction pipeline reports 97% accuracy overall. Users report problems with handwritten receipts. What metric should you have checked before deploying?

A) Overall accuracy with a larger sample.
B) Accuracy by document type and field to verify consistent performance across all segments.
C) Processing speed per document type.
D) Model confidence distribution.

<details><summary>Answer</summary>**B)** Accuracy must be validated per document type and per field before automating. Aggregate metrics mask segment-specific failures.</details>

### Q45
You have automated high-confidence extractions. How do you detect if accuracy drifts over time?

A) Wait for user complaints.
B) Implement stratified random sampling of high-confidence extractions for ongoing error rate measurement.
C) Monitor model confidence scores for trends.
D) Re-validate monthly with a fixed test set.

<details><summary>Answer</summary>**B)** Stratified sampling provides continuous monitoring for quality degradation and novel error patterns.</details>

### Q46
Your category enum has 5 values. Occasionally documents do not fit any category. How do you handle this?

A) Force the closest match.
B) Add `"other"` to the enum plus a `category_detail` string field for describing novel categories.
C) Add more enum values proactively.
D) Skip uncategorizable documents.

<details><summary>Answer</summary>**B)** The "other" + detail string pattern provides extensible categorization.</details>

### Q47
Before batch-processing 10,000 documents, what should you do first?

A) Submit all 10,000 immediately.
B) Refine prompts on a sample set first to maximize first-pass success rates.
C) Split into 100 batches of 100.
D) Process the first 1,000 synchronously.

<details><summary>Answer</summary>**B)** Prompt refinement on a sample before scaling reduces iterative resubmission costs.</details>

### Q48
Your batch of 100 documents has 5 failures: 3 exceeded context limits, 2 had transient server errors. How do you handle them?

A) Resubmit the entire batch.
B) Resubmit only the 5 failures by `custom_id`: chunk the 3 oversized documents and retry the 2 transient failures as-is.
C) Discard the failures.
D) Wait and resubmit without changes.

<details><summary>Answer</summary>**B)** Targeted resubmission with appropriate modifications (chunking for context issues, simple retry for transient errors).</details>

### Q49
An extraction has both a `stated_total` and individual `line_items`. The items sum to a different total than the stated one. Both are accurately extracted. What should the system do?

A) Adjust line items to match the total.
B) Flag the discrepancy with a `conflict_detected` boolean and include both `stated_total` and `calculated_total` for human review.
C) Trust the stated total only.
D) Reject the extraction.

<details><summary>Answer</summary>**B)** Self-correction validation that extracts both values and flags discrepancies preserves accuracy while alerting to document-level issues.</details>

### Q50
Your extraction handles formal invoices well but struggles with informal receipts that use abbreviations and varied layouts. Few-shot examples of formal invoices do not help. What should you add?

A) More formal invoice examples.
B) Few-shot examples demonstrating extraction from documents with varied formats (abbreviations, informal measurements, different layouts).
C) A pre-processing step that converts all documents to a standard format.
D) A separate model trained on informal documents.

<details><summary>Answer</summary>**B)** Few-shot examples showing correct handling of varied document structures (the specific challenge) enable the model to generalize to informal formats.</details>

---

## Scoring

Count your correct answers: ___/50

| Score | Scaled (approx) | Result |
|-------|-----------------|--------|
| 45-50 | 900-1000 | Strong pass |
| 40-44 | 800-880 | Pass |
| 36-39 | 720-780 | Borderline pass |
| 30-35 | 600-700 | Needs more study |
| <30 | <600 | Review all domains |

## Domain Breakdown
Track which domains your wrong answers fall into:

- D1 (Agentic Architecture): Q1, Q2, Q3, Q6, Q17, Q18, Q20, Q23, Q24
- D2 (Tool Design & MCP): Q2, Q4, Q5, Q25, Q26, Q27, Q28, Q29, Q30
- D3 (Claude Code Config): Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16
- D4 (Prompt Engineering): Q13, Q39, Q40, Q41, Q42, Q43, Q46, Q47, Q48, Q49, Q50
- D5 (Context & Reliability): Q4, Q7, Q8, Q19, Q21, Q22, Q34, Q35, Q44, Q45
