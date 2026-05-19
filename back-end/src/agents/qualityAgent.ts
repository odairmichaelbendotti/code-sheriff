import type { Finding, FileContext } from "./securityAgent.js";
import { runAgent } from "./runAgent.js";

function buildPrompt(file: FileContext): string {
  return `You are a senior software engineer performing a code quality review. Your job is to find REAL issues that affect maintainability, readability, and correctness — not subjective style preferences.

SEVERITY GUIDE:
- critical: code that is demonstrably incorrect, will cause bugs, or makes the codebase unmaintainable (e.g. missing error handling on async operations, any as a type escape hatch hiding real bugs)
- warning: meaningful quality problem that will cause issues as the codebase grows (e.g. function doing 3+ unrelated things, duplicated business logic in two places)
- suggestion: clear improvement worth making that improves readability or future-proofing (e.g. better variable name, extract a well-named helper)

ONLY report findings that:
1. Point to a specific line where the problem is
2. Are concrete issues visible in this file
3. A senior engineer would flag in a real code review

DO NOT report:
- Subjective preferences with no clear better alternative
- Issues that only matter with specific requirements not visible in the code
- Formatting issues (that is what linters are for)

Focus areas:
- Functions or methods with more than one clear responsibility (SRP violation)
- Duplicated logic that should be extracted into a shared utility
- Variables, parameters, or functions with misleading or ambiguous names
- Missing TypeScript types, use of any, or type assertions that hide real type errors
- Unhandled promise rejections or missing try/catch on async operations
- Magic numbers or strings that should be named constants
- Boolean parameters that make call sites unreadable
- Functions with too many parameters (> 3-4) that should use an options object
- Deeply nested conditionals that could be flattened with early returns
- Dead code: unreachable branches, unused exports, or commented-out blocks

File: ${file.filename}

Full file content:
${file.content}

Diff (changed lines):
${file.patch ?? "No diff available"}

Return ONLY a valid JSON array. No markdown, no explanation, no code blocks outside the JSON.
[
  {
    "agent": "quality",
    "file": "${file.filename}",
    "line": <exact line number as integer>,
    "severity": "critical" | "warning" | "suggestion",
    "message": "Specific description of the quality issue and why it matters",
    "suggestion": "Concrete improvement with a clear explanation of what to change",
    "code_fix": [
      { "type": "context", "code": "<line before the problem>" },
      { "type": "removed", "code": "<the exact problematic line>" },
      { "type": "added", "code": "<the improved replacement line>" },
      { "type": "context", "code": "<line after the problem>" }
    ]
  }
]

If no real quality issues are found, return: []`;
}

export async function qualityAgent(files: FileContext[]): Promise<Finding[]> {
  return runAgent(files, buildPrompt);
}
