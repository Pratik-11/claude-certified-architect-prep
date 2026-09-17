# Practice Test 6: Plan Mode & CI/CD (Week 6)
Domain 3: Claude Code Configuration & Workflows -- Task Statements 3.4-3.6

---

## Question 1
A developer needs to add a null check to a single function in one file. The bug is clear from the stack trace. Which mode should they use?

A) Plan mode to explore the codebase and understand the full impact before making the change.
B) Direct execution -- the change is well-understood, single-file, and has clear scope.
C) Plan mode first, then direct execution for the implementation.
D) Start in direct execution and switch to plan mode if the fix is more complex than expected.

<details>
<summary>Answer</summary>

**B)** Direct execution is appropriate for simple, well-scoped changes: a single-file bug fix with a clear stack trace. Plan mode adds unnecessary overhead for changes where the scope and solution are already understood. Plan mode is for complex tasks with multiple valid approaches and architectural decisions.
</details>

---

## Question 2
Your team needs to migrate from library X to library Y. The migration affects 45+ files across the codebase, and there are multiple valid approaches (gradual migration with adapters vs big-bang replacement). Which approach should you take?

A) Direct execution with comprehensive upfront instructions detailing exactly how each file should change.
B) Plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.
C) Direct execution, changing files one at a time and fixing issues as they arise.
D) Create a script that does automated find-and-replace across all files.

<details>
<summary>Answer</summary>

**B)** Plan mode is designed for complex tasks involving: large-scale changes (45+ files), multiple valid approaches (gradual vs big-bang), and architectural decisions (adapter patterns, dependency management). Plan mode enables safe exploration and design before committing to changes, preventing costly rework when dependencies are discovered late (C) or when the chosen approach proves wrong (A).
</details>

---

## Question 3
During a complex multi-phase task, the Explore subagent is used for verbose discovery. Why is this preferred over doing discovery in the main conversation?

A) The Explore subagent has access to more tools than the main conversation.
B) The Explore subagent isolates verbose discovery output and returns summaries, preserving main conversation context from being exhausted by exploration data.
C) The Explore subagent runs faster than the main conversation.
D) The Explore subagent can access files that the main conversation cannot.

<details>
<summary>Answer</summary>

**B)** The Explore subagent's primary benefit is context isolation. Verbose discovery output (reading many files, searching across the codebase) consumes significant context tokens. By delegating this to the Explore subagent, only the summarized findings return to the main conversation, preventing context window exhaustion during multi-phase tasks.
</details>

---

## Question 4
Your CI pipeline needs to run Claude Code for automated code review on every PR. The current command `claude "Review this PR"` hangs indefinitely. What is the fix?

A) Set `CLAUDE_HEADLESS=true` environment variable.
B) Add `< /dev/null` to redirect stdin.
C) Use the `-p` flag: `claude -p "Review this PR"`.
D) Add `--batch` flag: `claude --batch "Review this PR"`.

<details>
<summary>Answer</summary>

**C)** The `-p` (or `--print`) flag runs Claude Code in non-interactive mode: it processes the prompt, outputs the result to stdout, and exits without waiting for user input. This is the documented approach for CI/CD pipelines. Options A and D reference non-existent features. Option B is a Unix workaround that does not properly address Claude Code's command syntax.
</details>

---

## Question 5
Your CI review pipeline needs to output structured findings that can be automatically posted as inline PR comments. Which CLI flags should you use?

A) `-p --verbose` to get detailed output in text format.
B) `-p --output-format json --json-schema <schema>` to produce machine-parseable structured findings.
C) `-p --format markdown` to get formatted output.
D) `-p > output.json` to redirect output to a JSON file.

<details>
<summary>Answer</summary>

**B)** `--output-format json` combined with `--json-schema` produces structured output that matches a defined schema, making it machine-parseable for automated posting as inline PR comments. Simple text output (A, C) requires parsing. Redirecting to a file (D) does not make the output structured.
</details>

---

## Question 6
Your CI pipeline runs Claude Code to generate tests. The generated tests frequently duplicate scenarios already covered by the existing test suite. How should you fix this?

A) Add a deduplication step that removes duplicate tests after generation.
B) Provide existing test files in context so test generation avoids suggesting duplicate scenarios already covered.
C) Limit the number of generated tests to reduce the chance of duplication.
D) Run generated tests against the existing suite and delete any that test the same thing.

<details>
<summary>Answer</summary>

**B)** Providing existing test files in the context allows Claude to see what is already covered and generate only new, non-duplicative test scenarios. This is the preventive approach -- avoid generating duplicates in the first place rather than filtering them after (A, D). Limiting count (C) does not ensure the generated tests are unique.
</details>

---

## Question 7
The same Claude session that generated code is tasked with reviewing that code for bugs. The review finds no issues, but an independent reviewer later discovers several bugs. Why did the self-review fail?

A) The model's context window was too full to perform a thorough review.
B) The model retains reasoning context from generation, making it less likely to question its own decisions in the same session.
C) The review prompt was not detailed enough.
D) The model cannot perform both generation and review tasks.

<details>
<summary>Answer</summary>

**B)** Self-review within the same session is inherently limited because the model retains the reasoning context that led to its original decisions. It is biased toward confirming its own choices rather than questioning them. An independent review instance (without prior reasoning context) is more effective at catching subtle issues. This is a key concept for CI review architectures.
</details>

---

## Question 8
Your CI pipeline re-runs reviews after new commits are pushed. Previous review comments remain on the PR, and the new review produces duplicate findings for issues that were already flagged. How do you fix this?

A) Delete all previous review comments before each new review run.
B) Include prior review findings in context when re-running, instructing Claude to report only new or still-unaddressed issues.
C) Use a different review template for re-reviews.
D) Only review the files changed in the latest commit, ignoring previously reviewed files.

<details>
<summary>Answer</summary>

**B)** Including prior review findings in the context allows the new review to distinguish between already-flagged issues and new ones. Instruct Claude to report only new or still-unaddressed issues to avoid duplicate comments. Deleting comments (A) loses valuable feedback history. Ignoring files (D) might miss issues introduced by interactions between old and new changes.
</details>

---

## Question 9
You want to improve the quality of CI-generated tests. Which CLAUDE.md configuration would be most effective?

A) Add a generic instruction: "Generate high-quality tests."
B) Document testing standards, valuable test criteria, available fixtures, and examples of good vs low-value tests in CLAUDE.md.
C) Specify the minimum number of tests to generate per file.
D) List every possible edge case that tests should cover.

<details>
<summary>Answer</summary>

**B)** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code. Documenting testing standards (what makes a test valuable), available fixtures (what test infrastructure exists), and examples of good vs bad tests gives Claude the context needed to generate high-quality, relevant tests. Generic instructions (A) lack specificity. Counts (C) and exhaustive lists (D) are rigid and unscalable.
</details>

---

## Question 10
A developer finds that natural language descriptions produce inconsistent results when asking Claude to transform code. They have tried rewording the instructions several times. What technique is most effective for communicating the exact transformation expected?

A) Add more detailed prose descriptions of the transformation.
B) Provide 2-3 concrete input/output examples showing the transformation applied to real code.
C) Use technical jargon to be more precise about the transformation.
D) Break the transformation into 10 smaller steps.

<details>
<summary>Answer</summary>

**B)** Concrete input/output examples are the most effective way to communicate expected transformations when prose descriptions are interpreted inconsistently. 2-3 examples demonstrating the exact before-and-after pattern resolve ambiguity that words alone cannot. This is a core iterative refinement technique that consistently outperforms more detailed prose (A), jargon (C), or excessive decomposition (D).
</details>
