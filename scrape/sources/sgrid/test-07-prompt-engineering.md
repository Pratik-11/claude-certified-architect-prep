# Practice Test 7: Prompt Engineering & Structured Output (Week 7)
Domain 4: Prompt Engineering & Structured Output -- Task Statements 4.1-4.3

---

## Question 1
Your automated code review flags 40% false positives, primarily in the "comment accuracy" category. Developers have stopped trusting the review output entirely, including the accurate bug and security findings. What is the most effective immediate action?

A) Add "be more conservative" to the review prompt.
B) Add "only report high-confidence findings" to reduce output volume.
C) Temporarily disable the high false-positive category (comment accuracy) to restore developer trust while improving prompts for that category separately.
D) Switch to a more capable model that will naturally produce fewer false positives.

<details>
<summary>Answer</summary>

**C)** High false positive rates in one category undermine confidence in all categories. The most effective immediate action is to disable the problematic category, restoring trust in the remaining accurate findings. Then improve the prompts for the disabled category offline before re-enabling it. Generic confidence instructions (A, B) do not improve precision -- they need specific criteria. Model changes (D) do not address the prompt design issue.
</details>

---

## Question 2
Your code review prompt says "check that comments are accurate." This produces many false positives where Claude flags comments that are technically imprecise but not misleading. How should you refine the prompt?

A) Change to "carefully check that comments are accurate, being conservative in your findings."
B) Replace with explicit criteria: "Flag comments only when the claimed behavior directly contradicts the actual code behavior. Do not flag comments that are merely incomplete or use imprecise terminology."
C) Remove comment checking entirely since it is unreliable.
D) Add a confidence threshold: "Only flag comments you are 95% confident are wrong."

<details>
<summary>Answer</summary>

**B)** Explicit criteria defining what to flag (contradictory behavior) and what to skip (imprecise but not misleading) directly addresses the false positive source. Vague modifiers like "conservative" (A) or confidence thresholds (D) do not help the model distinguish between genuinely wrong comments and merely imprecise ones. Removing the category (C) is giving up rather than fixing the problem.
</details>

---

## Question 3
Your extraction pipeline produces inconsistently formatted output despite detailed prose instructions. Some extractions use bullet points, others use paragraphs, and field ordering varies. What technique most effectively achieves format consistency?

A) Add more detailed formatting instructions with specific markdown templates.
B) Include 2-4 few-shot examples demonstrating the exact desired output format (location, issue, severity, suggested fix).
C) Post-process the output to enforce formatting.
D) Use a stricter system prompt tone.

<details>
<summary>Answer</summary>

**B)** Few-shot examples are the most effective technique for achieving consistently formatted output. When detailed instructions alone produce inconsistent results, concrete examples showing the exact desired format (field order, formatting style, level of detail) give the model a clear template to follow. Post-processing (C) is a workaround, not a fix. Stricter tone (D) does not improve format compliance.
</details>

---

## Question 4
Your tool selection prompt has few-shot examples for common scenarios but fails on ambiguous requests that do not match any example. How should you improve the few-shot examples?

A) Add more examples (20+) to cover every possible scenario.
B) Create 2-4 targeted examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives.
C) Remove few-shot examples and rely on tool descriptions only.
D) Add a catch-all example: "When in doubt, ask the user for clarification."

<details>
<summary>Answer</summary>

**B)** Few-shot examples for ambiguous cases should include reasoning explaining why one choice was made over alternatives. This teaches the model the decision framework rather than just the answer, enabling it to generalize to novel ambiguous patterns. More examples (A) add token overhead without teaching judgment. Removing examples (C) loses the benefit. A catch-all (D) over-escalates.
</details>

---

## Question 5
You need to extract structured data (invoice number, line items, total, vendor name) from PDF invoices. The model occasionally returns JSON with syntax errors. What is the most reliable approach to guarantee schema-compliant output?

A) Add "Return valid JSON" to the prompt and parse the text response.
B) Use `tool_use` with a JSON schema defining the extraction fields. Extract data from the `tool_use` response.
C) Use regex to fix common JSON syntax errors in the model's text output.
D) Ask the model to validate its own JSON before returning it.

<details>
<summary>Answer</summary>

**B)** `tool_use` with JSON schemas is the most reliable approach for guaranteed schema-compliant structured output. The model is forced to produce output matching the defined schema, eliminating JSON syntax errors entirely. Text-based approaches (A) are error-prone. Regex fixes (C) are fragile. Self-validation (D) is unreliable. Note: tool_use eliminates syntax errors but not semantic errors (values in wrong fields, line items not summing to total).
</details>

---

## Question 6
You have three document types (invoices, contracts, receipts), each with a different extraction schema. Documents arrive without type labels. Which `tool_choice` configuration ensures the model always produces structured output while choosing the correct schema?

A) `tool_choice: "auto"` -- the model decides whether to use a tool.
B) `tool_choice: "any"` -- the model must call a tool but can choose which extraction schema.
C) Force a specific tool: `tool_choice: {"type": "tool", "name": "extract_invoice"}`.
D) Define all three schemas as one tool with conditional fields.

<details>
<summary>Answer</summary>

**B)** `tool_choice: "any"` guarantees the model calls a tool (structured output) while allowing it to choose which extraction tool (invoice, contract, or receipt) based on the document content. Option A might return text instead of calling a tool. Option C forces a specific schema regardless of document type. Option D creates an overly complex schema.
</details>

---

## Question 7
Your extraction schema has a `vendor_address` field marked as `required`. When processing invoices that do not include a vendor address, the model fabricates plausible addresses. How should you fix this?

A) Add "Do not make up addresses" to the prompt.
B) Make `vendor_address` optional (nullable) in the schema so the model can return null when the information is absent.
C) Add post-processing that validates addresses against a database.
D) Remove the field entirely since not all invoices have it.

<details>
<summary>Answer</summary>

**B)** When source documents may not contain certain information, schema fields should be optional/nullable. Required fields force the model to produce a value even when none exists, leading to fabrication. Making the field nullable explicitly allows the model to return null, signaling that the information was not found. Prompt instructions (A) are less reliable than schema design. Removing the field (D) loses it for documents that do have it.
</details>

---

## Question 8
Your extraction pipeline needs to categorize documents into types. Most documents fit into 5 known categories, but occasionally a new category appears. How should you design the enum field?

A) Use a strict enum with only the 5 known categories.
B) Use an enum with the 5 known categories plus `"other"`, and add a separate `category_detail` string field for describing novel categories.
C) Use a free-text string field instead of an enum.
D) Add new enum values whenever a new category is discovered.

<details>
<summary>Answer</summary>

**B)** The `"other"` + detail string pattern provides extensible categorization. Known categories get clean enum classification. Novel categories are captured with "other" and a free-text detail field that describes the new category. This preserves structured analysis for known categories while handling edge cases. Strict enums (A) force incorrect classification. Free text (C) loses structured analysis. Dynamic enum updates (D) require constant schema changes.
</details>

---

## Question 9
What is the key limitation of using `tool_use` with JSON schemas for structured output?

A) It cannot handle nested objects or arrays.
B) It eliminates JSON syntax errors but does not prevent semantic errors (e.g., line items that do not sum to the total, values placed in wrong fields).
C) It is slower than text-based extraction.
D) It only works with simple flat schemas.

<details>
<summary>Answer</summary>

**B)** Tool use with strict JSON schemas guarantees syntactically valid output matching the schema structure. However, it cannot prevent semantic errors: line items that do not add up to the stated total, values placed in the wrong fields, or logically inconsistent data. Semantic validation requires additional validation logic beyond the schema itself.
</details>

---

## Question 10
You need to extract metadata from documents before running enrichment tools. The metadata extraction MUST happen first. How do you configure this?

A) Add "Always extract metadata first" to the system prompt.
B) Use `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the first API call, then switch to `tool_choice: "auto"` for subsequent calls.
C) List `extract_metadata` first in the tools array.
D) Use `tool_choice: "any"` and hope the model chooses metadata extraction first.

<details>
<summary>Answer</summary>

**B)** Forced tool selection ensures a specific tool is called in a specific turn. For the first turn, force `extract_metadata`. Then switch to `"auto"` for subsequent turns where the model can choose enrichment tools based on the extracted metadata. Prompt instructions (A) are probabilistic. Tool ordering (C) does not guarantee selection order. `"any"` (D) guarantees a tool call but not which tool.
</details>
