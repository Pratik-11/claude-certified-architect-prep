# Practice Test 8: Validation, Batch & Multi-Pass (Week 8)
Domain 4: Prompt Engineering & Structured Output -- Task Statements 4.4-4.6

---

## Question 1
Your extraction pipeline fails validation on 15% of documents. You implement a retry loop that resends the request with the same prompt. The retry success rate is only 10%. How should you improve the retry strategy?

A) Increase the number of retries from 1 to 5.
B) Append the specific validation errors to the retry prompt, including the original document, the failed extraction, and what went wrong, so the model can self-correct.
C) Switch to a more capable model for retries.
D) Lower the validation strictness to accept more extractions.

<details>
<summary>Answer</summary>

**B)** Retry-with-error-feedback is the effective pattern: include the original document, the failed extraction, and the specific validation errors in the retry prompt. This gives the model concrete information about what went wrong and how to fix it. Blind retries (A) without feedback are unlikely to produce different results. Lowering standards (D) masks quality issues.
</details>

---

## Question 2
Your retry loop shows that 30% of failures are due to missing information in the source document (e.g., no vendor phone number), not extraction errors. The retry keeps failing on these documents. What should you do?

A) Add more retries -- eventually the model might find the information.
B) Identify when retries will be ineffective (information absent from source) versus when they will succeed (format mismatches, structural errors), and skip retries for absent-information failures.
C) Have the model hallucinate plausible values to fill the gaps.
D) Return a partial extraction with error messages for each retry failure.

<details>
<summary>Answer</summary>

**B)** Retries are effective for format mismatches and structural output errors but ineffective when the required information simply does not exist in the source document. Distinguishing between these failure types prevents wasted retry attempts. For absent information, mark the field as null/unavailable rather than retrying or hallucinating (C). More retries (A) waste resources on impossible extractions.
</details>

---

## Question 3
Your code review system flags findings that developers frequently dismiss. You want to understand which code patterns trigger false positives so you can improve the prompts. What should you add to the structured output?

A) A confidence score for each finding.
B) A `detected_pattern` field that records which code construct triggered the finding, enabling systematic analysis of dismissal patterns.
C) A "priority" field that ranks findings by importance.
D) A "false_positive_likelihood" estimate.

<details>
<summary>Answer</summary>

**B)** Adding a `detected_pattern` field creates a feedback loop: when developers dismiss findings, you can analyze which code patterns consistently trigger false positives and refine prompts to handle those patterns correctly. Confidence scores (A) and false positive estimates (D) are model self-assessments, which are poorly calibrated. Priority (C) does not address the false positive pattern.
</details>

---

## Question 4
Your extraction includes a `stated_total` field from the invoice and individual `line_items` with amounts. In 5% of cases, the line items do not sum to the stated total, but both values are accurately extracted from the document. How should you handle this?

A) Automatically adjust line items to match the total.
B) Extract `calculated_total` (sum of line items) alongside `stated_total` and add a `conflict_detected` boolean. Flag discrepancies for human review.
C) Discard the extraction and retry.
D) Always trust the stated total and ignore line item amounts.

<details>
<summary>Answer</summary>

**B)** Self-correction validation flows should extract both values, compare them, and flag discrepancies. Adding `calculated_total` alongside `stated_total` with a `conflict_detected` boolean preserves the accurate extraction while alerting reviewers to document-level inconsistencies. The conflict may be in the source document itself, not the extraction. Auto-adjusting (A) masks real discrepancies.
</details>

---

## Question 5
Your team runs two workflows: (1) pre-merge code review that blocks PRs until complete, and (2) weekly codebase audit reports reviewed Monday morning. Your manager wants to switch both to the Message Batches API for 50% cost savings. What is the correct assessment?

A) Switch both -- the cost savings justify the latency.
B) Switch the weekly audit to batch processing; keep pre-merge reviews as synchronous API calls. Batch processing has up to 24-hour processing time with no guaranteed latency SLA.
C) Keep both synchronous -- batch results cannot be correlated with original requests.
D) Switch both to batch with polling fallback.

<details>
<summary>Answer</summary>

**B)** The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This makes it ideal for latency-tolerant workloads (weekly audit reports) but unsuitable for blocking workflows (pre-merge checks where developers wait). Batch results CAN be correlated using `custom_id` fields (C is wrong).
</details>

---

## Question 6
You submit 100 documents as a batch. 95 succeed and 5 fail: 3 due to oversized context and 2 due to transient server errors. How should you handle the failures?

A) Resubmit the entire batch of 100 documents.
B) Resubmit only the 5 failed documents (identified by `custom_id`), chunking the oversized ones and retrying the transient failures without modification.
C) Discard the 5 failures and report results for the 95 successes only.
D) Wait 24 hours and resubmit the 5 failures without changes.

<details>
<summary>Answer</summary>

**B)** Use `custom_id` to identify failed documents and resubmit only those. Apply appropriate modifications: chunk the 3 oversized documents (address the root cause) and retry the 2 transient failures without modification (since the error was temporary). Resubmitting the entire batch (A) wastes resources. Discarding failures (C) loses data. Waiting without changes (D) does not fix the context size issue.
</details>

---

## Question 7
You want to batch-process 1000 documents with a 30-hour SLA (results needed within 30 hours of submission). The batch API has up to 24-hour processing time. How should you structure submissions?

A) Submit all 1000 at once -- 24 hours is within the 30-hour SLA.
B) Submit in windows that account for processing time plus failure handling time (e.g., 4-hour submission windows to guarantee time for resubmission of failures within the SLA).
C) Submit in batches of 10 every hour.
D) Use synchronous API to guarantee timing.

<details>
<summary>Answer</summary>

**B)** With a 24-hour batch processing window and a 30-hour SLA, you need to account for the possibility that some documents will fail and need resubmission. Submitting with enough buffer (e.g., 4-hour windows) ensures that even with one round of failure handling, results arrive within the SLA. Submitting all at once (A) leaves no time for failure handling if the batch takes the full 24 hours.
</details>

---

## Question 8
Before batch-processing 10,000 documents, what should you do first to maximize efficiency?

A) Submit all 10,000 immediately to start processing as quickly as possible.
B) Run prompt refinement on a sample set first to maximize first-pass success rates and reduce iterative resubmission costs.
C) Split into 10 batches of 1,000 and submit them all simultaneously.
D) Process the first 100 synchronously, then batch the rest.

<details>
<summary>Answer</summary>

**B)** Testing and refining prompts on a small sample before batch-processing large volumes maximizes first-pass success rates. A 5% error rate on 10,000 documents means 500 failures requiring resubmission -- costly in both time and money. Refining the prompt to reduce error rate from 5% to 1% saves 400 resubmissions. Always validate on a sample before scaling.
</details>

---

## Question 9
A PR modifies 14 files. Your single-pass review produces detailed feedback for some files, superficial comments for others, and contradictory findings -- flagging a pattern as problematic in one file while approving identical code elsewhere. What is the root cause?

A) The model cannot handle 14 files.
B) Attention dilution: when processing many files at once, the model gives inconsistent depth and may not notice the same pattern appearing in different files.
C) The review prompt is too short.
D) The files are too similar, confusing the model.

<details>
<summary>Answer</summary>

**B)** Attention dilution occurs when the model processes too much content at once, leading to inconsistent depth across files and contradictory findings. The model may deeply analyze some files while skimming others, and fail to maintain consistent judgment about code patterns across the full set. The fix is multi-pass review: per-file local analysis plus cross-file integration pass.
</details>

---

## Question 10
A code review system uses Claude to both generate code and review it in the same session. Adding "review your code critically" or enabling extended thinking does not improve review quality. What architectural change is needed?

A) Use a more detailed review prompt in the same session.
B) Use a second independent Claude instance (without the generator's reasoning context) to review the code.
C) Have the model review the code twice in the same session.
D) Add a checklist of common issues to the review prompt.

<details>
<summary>Answer</summary>

**B)** Self-review within the same session is limited because the model retains its generation reasoning context, making it biased toward confirming its own decisions. An independent review instance starts fresh without this bias and is more effective at catching subtle issues. Neither "review critically" instructions nor extended thinking overcome the fundamental self-review limitation within the same reasoning context.
</details>
