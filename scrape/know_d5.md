## Domain 5: Context Management & Reliability (15%)

**Domain in a nutshell:**
- This is the reliability domain — everything that prevents production agent systems from silently degrading.
- Context windows are finite and fail in predictable ways: summarisation loses numbers, tool results bloat, and findings in the middle get dropped ("lost in the middle").
- Errors should propagate as structured context (not be silently suppressed or terminate whole workflows) so a coordinator can recover intelligently.
- Escalation, human review, and confidence routing must be calibrated — aggregate metrics and self-reported confidence hide real failures.
- Source attribution (provenance) is lost at every summarisation step unless structured claim→source mappings are preserved through synthesis.
- These concerns are universal across the exam's scenarios (customer support, research pipelines, CI/CD, structured extraction).

### 5.1 — Manage conversation context to preserve critical information across long interactions
**What it's about:** Long conversations fail in predictable ways; context management is the set of architectural choices that prevent quantitative facts, key findings, and useful tokens from being lost as context fills.
**Key knowledge:**
- Three distinct failure modes, three distinct fixes: (1) progressive summarisation loses numbers → extract facts into a persistent "case facts" block; (2) tool results bloat → trim to relevant fields before storing; (3) lost-in-the-middle → place key findings at the beginning of aggregated inputs.
- Summaries collapse transactional facts (order IDs, amounts, dates, statuses) into vague prose. Keep those facts in a persistent block *outside* the summarised history; only summarise conversational tone/context.
- For multi-issue sessions, use a separate structured context layer per issue so issues don't collapse into each other.
- "Lost in the middle": models process the beginning and end of long inputs reliably, the middle unreliably. Put a condensed key-findings summary first and use explicit section headers (## Web Results, ## Document Analysis, ## Prior Findings) as attention anchors.
- Require subagents to emit structured output with metadata (dates, source locations); compress upstream (key facts, citations, relevance scores) when downstream context is tight.
- Tool results with 40+ fields bloat context in proportion to the number of lookups; trim to the ~5 fields the agent actually needs before appending.
- Critical persistent context (account number, preferences, unresolved issues) belongs in a persistent "active commitments" block, never in rolling-window conversation turns.
**✅ Do / ❌ Don't:**
- ✅ Keep transactional facts in a persistent case-facts block outside summarised history.
- ❌ Summarise conversation history wholesale to save tokens (collapses exact values needed for action).
- ✅ Place key findings at position 1 of aggregated inputs and use explicit section headers.
- ❌ Bury key findings in the middle of a large aggregated input.
- ✅ Trim tool outputs to relevant fields before appending to context.
- ❌ Append full 40-field tool result objects to history.
**⚠️ Exam traps:**
- *Increase summarisation interval (every 15 turns vs 5)* → only delays fact loss; the fix is a persistent case-facts block.
- *Switch to a larger context window model* → doesn't prevent summarisation-induced fact loss if you're still summarising.
- *Reports 3–6 dropped while 1–2 and 7–8 kept* → diagnostic signature of lost-in-the-middle, not low report quality, format, or window size.
- *Lengthen the rolling window* → critical persistent context still eventually falls out; store it separately.

### 5.2 — Design effective escalation and ambiguity resolution patterns
**What it's about:** Calibrated escalation requires explicit decision criteria, not self-reported confidence or sentiment detection. The exam distinguishes mandatory escalation, offer-to-resolve-first, and clarification cases.
**Key knowledge:**
- Official Q3 pattern: for a poorly-calibrated agent (e.g., 55% first-contact resolution), the correct first fix is always **explicit escalation criteria with few-shot examples** — not confidence scoring, sentiment analysis, or ML classifiers, which add infrastructure without fixing unclear decision boundaries.
- Mandatory/immediate escalation triggers: explicit customer request for a human (escalate immediately, no investigation first); policy gap (policy silent/ambiguous on the request — don't extrapolate); inability to make meaningful progress after reasonable investigation (complexity alone is not the trigger).
- Frustration + within-capability issue → acknowledge frustration, offer to resolve; escalate only if the customer reiterates preference for a human after the offer.
- Ambiguous identity (multiple customer matches): ask for additional identifiers (email, phone, account number); never use heuristics like "most recent order" or "closest name match."
- Verify both the triggering event AND the claimed causal consequence before remedial action — confirming event X occurred is not confirming X caused outcome Y (e.g., shipping delay confirmed, but did it actually spoil the groceries?).
**✅ Do / ❌ Don't:**
- ✅ Use explicit categorical escalation criteria (policy gap, explicit request, no progress) with few-shot examples.
- ❌ Trigger escalation from self-reported confidence scores (an agent confidently doing the wrong thing still scores 8/10).
- ✅ Escalate on case *type*, not emotional state.
- ❌ Escalate on sentiment thresholds (frustration ≠ complexity).
- ✅ Honor an explicit human request immediately.
- ❌ Investigate first "to prepare a case summary" when a human was explicitly requested.
- ✅ Request additional identifiers on multiple matches.
- ❌ Heuristically pick the "best" customer match.
**⚠️ Exam traps:**
- *Self-reported confidence below 5 → escalate* → same model that misclassifies also miscalibrates its confidence.
- *Sentiment analysis escalation* → solves a different problem; calm policy-exception customer needs escalation, furious standard-return customer does not.
- *One investigation attempt before transferring on explicit request* → still violates the explicit request; escalate immediately.
- *Issue $45 credit after confirming only the delay* → missing step is verifying causation, not the dollar threshold.

### 5.3 — Implement error propagation strategies across multi-agent systems
**What it's about:** When a subagent fails, the coordinator needs enough information to decide whether to retry, use an alternative, proceed with partial results, or escalate. Two anti-patterns dominate: silently suppressing errors and terminating the whole workflow on a single failure.
**Key knowledge:**
- Official Q8 pattern: on a subagent timeout, return **structured error context** — errorType, attemptedQuery, partialResults, alternativeApproaches, isRetryable — so the coordinator can choose to retry (possibly modified query), use an alternative, or proceed with partial findings.
- A generic "search unavailable" status hides whether the failure was a timeout (retryable), invalid query (not retryable), or rate limit (wait then retry).
- Empty result vs access failure: a query that finds no matching documents is a *successful* operation with `isError:false` and empty results (don't blindly retry); a timeout is an *access failure* with `isError:true`, `errorType:"timeout"`, `isRetryable:true`.
- Subagents should implement local recovery (retry with exponential backoff) for transient failures and only propagate what they can't resolve locally.
- For partial completion, pass a structured partial-completion context block (completed sources, pending sources, preliminary findings) so synthesis can use available findings without over-claiming; annotate coverage gaps in the final report.
- For expensive sequential pipelines (Retrieval → Analysis → Synthesis), use checkpointing: persist completed-stage outputs to *durable* storage so a later-stage failure resumes from the checkpoint rather than re-running from scratch (in-memory cache may not survive a crash).
**✅ Do / ❌ Don't:**
- ✅ Return structured error context (type, attempted query, partial results, alternatives, retryable flag).
- ❌ Return empty results marked successful to hide an access failure.
- ✅ Propagate the error and let the coordinator decide; continue with partial results from other subagents.
- ❌ Terminate the entire workflow on a single subagent failure.
- ✅ Reserve empty results for genuinely successful zero-match queries.
- ❌ Return generic "search unavailable" on timeout.
**⚠️ Exam traps:**
- *Local retry then generic "search unavailable" after exhaustion* → right idea about local retry, but the generic status still hides context the coordinator needs.
- *Catch timeout, return empty success* → worst outcome; incomplete research treated as complete.
- *Exclude a partially-complete subagent entirely* → loses already-valid work; include it with a structured partial-completion block.
- *Cache + retry vs checkpointing* → "cache" implies non-durable storage; durable checkpointing provides true fault tolerance.

### 5.4 — Manage context effectively in large codebase exploration
**What it's about:** Extended exploration sessions degrade silently — the model starts answering from training-data "typical patterns" instead of the specific classes it discovered earlier. Externalising state prevents this.
**Key knowledge:**
- Context degradation is insidious and unannounced; the signature is referencing generic "typical service layer pattern" instead of a specific class (e.g., `OrderService`) analysed earlier. At ~80%+ context utilisation, recall and cross-referencing of earlier content degrades.
- **Scratchpad files**: agents record key findings, unresolved questions, files analysed, and session phase to a file; reference the file rather than in-context memory because files persist across context boundaries.
- **Subagent delegation**: spawn subagents for focused questions ("find all test files," "trace refund flow"); verbose output stays in the subagent's context and the main agent receives only structured summaries, preserving coordination context.
- **Phase summaries**: summarise the current phase's findings and inject them into the next phase's subagent context so phases don't start blind.
- `/compact` reduces token usage in extended sessions while preserving explicitly-referenced key findings.
- **Crash recovery**: each agent exports state (current task, findings, open questions) to a known location at checkpoints; a coordinator loads a manifest on resume and injects it so agents continue rather than restart. Prefer structured state exports over plain `--resume` session resumption — prior tool results may be stale if files changed.
- For exhaustive coverage of a huge codebase (e.g., 2,000 files), use a deterministic tool (Grep) to enumerate candidate files, then spawn per-file/small-batch Claude sessions so each has full context — don't sample or let the model self-select files.
**✅ Do / ❌ Don't:**
- ✅ Maintain scratchpad files and reference them explicitly for later questions.
- ❌ Rely on in-context memory for findings across a multi-hour session.
- ✅ Delegate focused exploration to subagents; keep only summaries in the main context.
- ❌ Run verbose exploration directly in the main agent context.
- ✅ Load a structured state manifest on resume and re-explore only what changed.
- ❌ Resume a crashed session with `--resume` without checking what changed (stale tool results).
**⚠️ Exam traps:**
- *Restart and re-analyse / "Claude is making errors"* → misdiagnoses a context-management problem as a model error.
- *Switch to a larger context window* → even 200k fills in a long session; scratchpad files have no such limit.
- *Use `/clear`* → wipes useful earlier findings too; scratchpad preserves findings while resetting verbose output.
- *Sample 200 representative files / let Claude self-select* → non-exhaustive and based on naming conventions, not actual contents; use Grep + per-file sessions.

### 5.5 — Design human review workflows and confidence calibration
**What it's about:** Human review capacity is finite. Aggregate accuracy hides segment failures, and routing must avoid both over-automation and wasting reviewers on cases the model handles reliably.
**Key knowledge:**
- Exam principle: validate accuracy by **document type and field segment** before reducing human review. A 97% aggregate can mask, e.g., 99.8% on standard invoices but 71% on handwritten receipts and 62% on foreign-language docs — automate only segments that individually meet the target.
- Use **field-level confidence scores**, not document-level — a document can be 98% confident on `vendor_name` and 60% on `line_items`; route only the uncertain fields for review.
- Raw model confidence is not inherently calibrated; calibrate thresholds against labeled validation sets (find the score above which actual accuracy exceeds your target). Don't assume 90% confidence = 90% accuracy.
- Maintain ongoing **stratified random sampling** of high-confidence outputs to catch novel error patterns (new formats/distributions) before they scale; don't stop sampling just because a 97% rate was once established.
- Routing priority under limited capacity: low-confidence fields first → known poor-performance document types → ambiguous/contradictory source documents → high-confidence standard-format docs last. Route ambiguous/contradictory sources to humans regardless of confidence.
- Distribution shift matters: when failures cluster in a new segment, or when scope expands to a higher-risk domain (safety, regulatory), re-calibrate/increase oversight for that segment rather than reducing it broadly.
**✅ Do / ❌ Don't:**
- ✅ Stratify by document type and field before any automation decision.
- ❌ Use aggregate accuracy (97%) to justify reducing human review.
- ✅ Route uncertain fields independently using field-level confidence.
- ❌ Route whole documents on a single document-level confidence threshold.
- ✅ Keep ongoing stratified random sampling of high-confidence extractions.
- ❌ Stop sampling once an accuracy rate is established.
**⚠️ Exam traps:**
- *"97% isn't high enough; target 99.5%"* → wrong; there's no universal threshold, it depends on stakes and per-segment performance. The real risk is aggregate masking.
- *Blanket-remove review for the 85% with a 5% post-hoc audit* → fails when failures cluster in a new segment; route by segment and keep review for the problematic one.
- *Reduce billing/shipping review to offset new defect-claim load* → reduces oversight in a validated domain to subsidise a higher-risk one (wrong direction); scope expansion to safety/regulatory needs re-calibrated, not reduced, oversight.

### 5.6 — Preserve information provenance and handle uncertainty in multi-source synthesis
**What it's about:** Source attribution is silently lost at every summarisation step. Conflicting statistics need annotation (not arbitrary selection), and temporal data needs dates to distinguish genuine contradictions from time-based evolution.
**Key knowledge:**
- Require subagents to emit structured **claim→source mappings** (claim, source_url, source_name, publication_date, relevant_excerpt, methodology_notes, confidence) that the synthesis agent must preserve and merge — not summarise into prose. The fix is upstream at the subagent output stage, because prose summaries strip attribution before synthesis ever sees it.
- Conflicting statistics from credible sources → **annotate the conflict with both sources** (and their dates/methodology); don't arbitrarily pick the "higher-quality" one or average them. Let the coordinator/reader decide.
- Require **publication / data-collection dates** in all structured outputs; without them, temporal evolution (35% in 2020 vs 67% in 2023) looks like a contradiction.
- Include **methodological context** (sample size, methodology, geographic scope) — two figures can differ because they measure different populations, not because one is wrong. Example annotation: "McKinsey (Oct 2023, n=1,500, global): 67%; Gartner (Mar 2023, n=800 US): 45% — different populations/methodologies, not directly comparable."
- Pass conflicts upstream: document analysis should include and annotate conflicting values and let the coordinator reconcile, rather than silently selecting one at the analysis stage.
- Structure reports with explicit sections separating well-established findings from contested ones (with conflict annotations) and coverage gaps; render content types appropriately (financial data as tables, news as prose, technical findings as lists) instead of forcing a uniform format.
**✅ Do / ❌ Don't:**
- ✅ Pass structured claim-source mappings; synthesis generates prose with attribution preserved.
- ❌ Summarise subagent findings into prose before synthesis (strips URLs, statistics, dates permanently).
- ✅ Annotate conflicting sources with both values, dates, and methodology.
- ❌ Keep the "higher-quality" source and discard the other.
- ✅ Require publication/collection dates in every structured output.
- ❌ Omit dates to save tokens (turns temporal evolution into a false contradiction).
**⚠️ Exam traps:**
- *"Always include source citations in the final report"* → instructs the synthesis agent to cite sources it no longer has; attribution was lost upstream.
- *Embed citations in prose summaries for later extraction* → prose-embedded attribution is fragile and error-prone to parse.
- *Post-synthesis citation extraction pass* → tries to recover already-lost attribution; expensive and unreliable. Fix is structured mappings from subagents.
