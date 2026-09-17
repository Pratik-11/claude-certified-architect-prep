## Domain 4: Prompt Engineering & Structured Output (20%)

**Domain in a nutshell:**
- This is the precision domain: it tests whether you can replace vague, confidence-based instructions with specific categorical criteria.
- Core distinction throughout: `tool_use` + JSON Schema eliminates *syntax* errors but never *semantic* errors — business-logic validation is always a separate layer.
- Retries fix format/structural errors; they cannot conjure information that isn't in the source document.
- Async cost optimization (Message Batches API, 50% cheaper) trades away latency guarantees and multi-turn tool calling — match the API to the workflow's latency need.
- Maps primarily to Scenario 5 (CI/CD) and Scenario 6 (Structured Data Extraction), but explicit criteria, few-shot, and schema-enforced output are universal skills.

---

### 4.1 — Design prompts with explicit criteria to improve precision and reduce false positives
**What it's about:** Vague instructions like "be conservative" or "only report high-confidence findings" consistently fail; only explicit categorical criteria (what to report vs. what to skip) reliably reduce false positive rates.

**Key knowledge:**
- False positives are a *prompt precision* problem, not a model-quality problem.
- "Only report high-confidence findings" is a confidence filter over an unchanged decision process — the model makes the same borderline calls, just reports fewer. It does not change what is in scope.
- **Exam Principle:** only specific categorical criteria change which issues are considered in scope.
- High false-positive rates cause cascading trust failure — developers start ignoring an entire category (including the correct findings). A 30% false-positive rate erodes trust in the 70% that were right.
- Define explicit severity levels (CRITICAL / HIGH / MEDIUM / SKIP) with concrete code examples for each, so classification is consistent across runs.

**✅ Do / ❌ Don't:**
- ✅ Define categorical scope: explicitly list what IS and is NOT in scope; remove ambiguous categories entirely.
- ✅ When a category has unacceptably high false positives, *temporarily disable* it, fix its criteria, then re-enable.
- ✅ Define each severity level with a concrete code example so triage is consistent.
- ❌ Add "only report high-confidence findings" to reduce false positives (confidence filter, doesn't fix scope).
- ❌ Keep a noisy category enabled "to avoid missing real issues" — it destroys trust in all its findings.
- ❌ Use vague severity labels (low/medium/high) with no definitions — produces inconsistent classification.

**⚠️ Exam traps:**
- *"Only flag when highly confident" → wrong:* it's a confidence filter; the root cause is vague scope. Fix with categorical scope ("flag ONLY when claimed behavior contradicts actual code behavior").
- *Add a disclaimer to a noisy category instead of disabling it → wrong:* disclaimers erode trust further. Temporarily disable and fix offline.
- *Permanently remove categories → wrong:* over-aggressive; temporary disable for improvement is the right move.
- *Add few-shot of good code with no explanation → weaker than:* explicit exclusion criteria (e.g., "do not flag functions with full test coverage, under 20 lines, no branching"), which generalize to unseen patterns.

---

### 4.2 — Apply few-shot prompting to improve output consistency and quality
**What it's about:** When detailed instructions alone yield inconsistent results, few-shot examples are the most effective remedy — they demonstrate judgment on ambiguous cases, lock in output format, and enable generalization to novel inputs.

**Key knowledge:**
- Effective examples show the *reasoning* ("Why reported" / "Why skipped"), not just the verdict — this enables generalization rather than mere pattern-matching.
- **Exam Principle:** few-shot is most powerful for (1) ambiguous-case handling, (2) exact output-format enforcement, and (3) reducing hallucination in extraction across varied document structures.
- 2–4 targeted examples at the hard/ambiguous boundary beat exhaustive 10+ example coverage (which only inflates tokens).
- Use the same output structure (location, issue, severity, suggested fix) in every example — models reproduce the structure they're shown.
- For extraction, include examples from each major document variant (inline citations vs. bibliographies, narrative vs. tables); one format fails to generalize.
- For optional fields, include an example showing correct `null` output when info is absent, to prevent hallucinated values.

**✅ Do / ❌ Don't:**
- ✅ Use 2–4 examples focused on the hardest/ambiguous cases.
- ✅ Include explicit reasoning in each example so the rule generalizes.
- ✅ Include an example of an acceptable pattern that is NOT an issue (reduces false positives while keeping generalization).
- ✅ Cover multiple document formats for extraction tasks.
- ❌ Provide 10+ examples covering every case (token bloat, diminishing returns).
- ❌ Show only correct answers without reasoning (forces pattern-matching, no generalization).
- ❌ Use a single document format in extraction examples.

**⚠️ Exam traps:**
- *Methodology field null because it's described inline, not in a "Methods" heading → fix with few-shot* showing inline-described methodology; making the field required just causes fabrication, and retrying looks in the same place again.
- *Fixing two distinct failure modes → add one targeted example per mode, most frequent failure first;* a single combined example makes iteration harder.
- *Inconsistent revenue formatting → 2–3 targeted format examples (each a different magnitude)* beat 50 examples (cost) or description-only (showing > telling for format).

---

### 4.3 — Enforce structured output using tool use and JSON schemas
**What it's about:** `tool_use` with a JSON Schema is the most reliable structured-output mechanism — the API enforces structure before returning. But it only guarantees syntax, and `tool_choice` has three modes with very different guarantees.

**Key knowledge:**
- Asking Claude to "return JSON" in a prompt is unreliable (markdown wrapping, prose, malformed JSON). Defining an extraction function via `tool_use` guarantees syntax-valid output.
- **Critical limit:** tool use eliminates *syntax* errors (malformed JSON, wrong types, missing required fields) but NOT *semantic* errors (line items not summing to total, values in wrong fields, invalid dates passing as strings, currency-unit mistakes).
- `tool_choice` modes:
  - `"auto"` — model may call a tool or return plain text (use when tool calling is optional).
  - `"any"` — model must call one of the available tools, can't return text, still chooses which (use when structured output is required and multiple schemas exist).
  - `{"type":"tool","name":"X"}` — forced; model must call exactly that tool (use when a specific extraction must run first).
- Schema design: make optional fields nullable (prevents fabrication to satisfy required fields); use an `enum` with an `"other"` + detail-string fallback for extensible categorization; add an `"unclear"` enum value for ambiguous data; put format-normalization rules (e.g., ISO 8601 dates) in the *prompt* since schemas enforce structure, not format.

**✅ Do / ❌ Don't:**
- ✅ Use `tool_choice: "any"` (or forced selection) when extraction is required every time.
- ✅ Mark only truly mandatory fields as required; use nullable types for fields that may be absent.
- ✅ Add a semantic validation layer after schema validation (computed totals, date ranges, cross-field consistency).
- ✅ Use open enums (`"other"` + detail) for unknown categories.
- ❌ Use `tool_choice: "auto"` when you require structured output (it may return text).
- ❌ Mark all fields required "for completeness" (forces hallucination of absent values).
- ❌ Assume schema validation eliminates all extraction errors (it only catches syntax).

**⚠️ Exam traps:**
- *Line items don't sum to total despite strict schema → right answer is a separate semantic validation layer;* schemas can't express cross-field arithmetic, min/max on one field won't help, better tool descriptions don't fix arithmetic.
- *Three doc types, type unknown in advance → use `"any"`* (guarantees a tool, model picks the right one); `"auto"` may return text, forcing one tool mis-maps the others.
- *termination_date before start_date passes schema → add cross-field semantic validation;* markdown JSON is strictly worse, more required fields don't catch relational errors, few-shot isn't a deterministic safety net.

---

### 4.4 — Implement validation, retry, and feedback loops for extraction quality
**What it's about:** Retry-with-error-feedback fixes correctable errors (format, structure); it cannot fix information that simply isn't in the source. Knowing the difference prevents wasted calls and fabricated data.

**Key knowledge:**
- Effective retry appends the assistant's prior output AND the *specific* validation errors plus the original document, then asks for correction — not just resending the same prompt.
- **Key distinction:** retries fix format/structural problems (date format mismatch, type errors, field misplacement); they do NOT fix missing info (absent date, external references not provided, ambiguous/conflicting source data) — retrying there just produces fabrication.
- Feedback-loop design fields: add a `detected_pattern` field to findings to track which constructs trigger false-positive dismissals; add self-validation fields (`calculated_total` vs. `stated_total`, `conflict_detected: boolean`) to surface semantic errors; have the model self-report a confidence score per finding to route low-confidence items to human review.
- Sample-before-batch: refine the prompt on a representative 10–20 document sample before processing thousands — maximizes first-pass success and avoids costly mass reprocessing.

**✅ Do / ❌ Don't:**
- ✅ Distinguish correctable (format/structural) errors from absent information; route absent-info cases to human review or accept `null`.
- ✅ Include the original document, the failed extraction, and the specific errors in the retry message.
- ✅ Classify the failure type first, then apply a targeted correction prompt per root cause.
- ✅ Test on a 10–20 doc sample before running at scale.
- ❌ Retry when a field is null because the info isn't in the document (repeats null or fabricates).
- ❌ Retry without providing the specific validation error (same prompt → same output).
- ❌ Batch-process 10,000 docs with no sample test first.

**⚠️ Exam traps:**
- *15% null dates = 8% truly absent + 7% non-standard format → retry with format guidance fixes the 7%; the 8% stay null or get fabricated.* Inferring dates from context is fabrication, not extraction.
- *Multiple distinct root causes after retries → classify failure type, then targeted correction per cause;* a single generic retry (temperature=0, longer context, or upfront warnings) doesn't address all.
- *Validator approves what humans reject → it only had the JSON + schema, not the source document,* so it can verify structure but not factual accuracy.

---

### 4.5 — Design efficient batch processing strategies
**What it's about:** The Message Batches API gives 50% cost savings but no latency SLA (up to 24h) and no multi-turn tool calling. The exam tests SLA-window calculation and partial-failure recovery.

**Key knowledge:**
- Batch API suits async-tolerant workloads (overnight reports, weekly audits, bulk processing). Completion is non-deterministic — up to 24 hours, sometimes minutes; never build a blocking workflow on "usually faster."
- **Critical limitation:** the batch API does NOT support multi-turn tool calling within a request — agentic/tool-calling workflows must use the synchronous API.
- Every request carries a `custom_id`; results return with the same ID, enabling correlation regardless of completion order — essential for partial-failure recovery.
- **SLA calculation:** submission window = SLA − max batch processing time (24h). E.g., a 30h SLA leaves a 6h submission window; a 36h SLA leaves 12h. With continuous arrivals, submit at least that often.
- Failure recovery: resubmit only failed docs (identified by `custom_id`), not the whole batch; for docs that exceeded context limits, chunk before resubmitting.

**✅ Do / ❌ Don't:**
- ✅ Match API to latency: synchronous for blocking pre-merge checks, batch for non-urgent overnight/weekly work.
- ✅ Resubmit only failed documents via `custom_id`.
- ✅ Chunk oversized documents before resubmitting.
- ✅ Use smaller batches to limit blast radius of a single malformed item.
- ❌ Use batch API for a blocking pre-merge check developers wait on (unbounded 24h window).
- ❌ Use batch API for a workflow that calls tools mid-extraction (no multi-turn tool calling).
- ❌ Resubmit the entire batch when a few docs fail (wastes cost, may overwrite good results).

**⚠️ Exam traps:**
- *36h SLA with 24h processing → submit every 12h (36 − 24);* submitting every 24h or 36h leads to ~48h total for a just-missed document.
- *Ticket arrives 11:58 PM, batch at midnight, 24h processing, 36h SLA → ~12h buffer remains* (deadline T+36h, completion ~T+24h).
- *Single malformed ticket fails a 10,000-ticket batch → use smaller batches (e.g., 100)* to limit blast radius; retrying the whole batch repeats the problem, validation/dead-letter queues are complementary but don't bound the radius directly.

---

### 4.6 — Design multi-instance and multi-pass review architectures
**What it's about:** A model reviewing its own output in the same session is biased by retained generation context. Independence removes that bias; multi-pass removes attention dilution. The fixes are architectural, not instructional.

**Key knowledge:**
- Same-session self-review is less effective because the model retains the reasoning/assumptions from generation and is biased toward its own decisions — not because it "can't review code."
- **Exam Principle:** the fix is structural — a fresh independent instance given only the code (no generation history), which evaluates on the merits with the same capability but no bias.
- Review architectures:
  - **Independent instance review** — second instance with no generation history, code only (use after any generation).
  - **Per-file + integration pass** — pass 1 reviews each file individually (consistent depth, no attention dilution); pass 2 is a separate cross-file integration review (data flow, interface contracts). Use for PRs with 5+ files.
  - **Confidence-scored routing** — model self-reports confidence per finding; high-confidence → automated action, low-confidence → human review. Use for high-stakes automation.
- Larger context windows do NOT solve attention dilution. Consensus filtering (report only findings in 2/3 runs) suppresses intermittently-detected real bugs.

**✅ Do / ❌ Don't:**
- ✅ Use a second independent instance without the generator's reasoning context.
- ✅ Split large multi-file reviews into per-file passes plus a separate cross-file integration pass.
- ✅ Run verification passes with model-reported confidence scores for calibrated routing.
- ❌ Add "critically review your own output" in the same session (context bias remains).
- ❌ Switch to a larger-context model to review many files in one pass (doesn't fix attention dilution).
- ❌ Use 3-run consensus filtering to suppress findings (drops intermittently-caught real bugs).

**⚠️ Exam traps:**
- *"Be critical of your own code" same-session instruction → marginal at best;* retained generation context is architectural, fix with an independent instance. Extended thinking still runs within the same session context.
- *14-file PR with inconsistent/contradictory findings → per-file passes + a separate integration pass;* larger context window is the canonical trap (doesn't fix dilution), consensus filtering suppresses real bugs, instruction-based depth fixes are probabilistic.
- *Multi-pass research where low-credibility sources dominate → add explicit prioritization criteria to Pass 2* (weight by credibility tier, recency, majority consistency); equal citation enforces the flawed default, more sources dilute signal, two runs average the same flawed synthesis.
