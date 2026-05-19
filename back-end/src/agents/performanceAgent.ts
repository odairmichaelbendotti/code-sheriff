import type { Finding, FileContext } from "./securityAgent.js";
import { runAgent } from "./runAgent.js";

function buildPrompt(file: FileContext): string {
  return `You are an expert performance engineer performing a code review. Your job is to find REAL, MEASURABLE performance problems in the code — not micro-optimizations or theoretical concerns.

SEVERITY GUIDE:
- critical: will cause significant latency, memory leak, or crashes under load (e.g. N+1 in a loop, synchronous blocking in an async context)
- warning: meaningful inefficiency that degrades performance in real usage (e.g. repeated expensive computation, unnecessary allocations in a hot path)
- suggestion: minor improvement worth considering (e.g. prefer Map over repeated Array.find)

ONLY report findings that:
1. Point to a specific line where the inefficiency exists
2. Are caused by actual code patterns visible in this file
3. Would have a real impact on runtime performance, memory usage, or scalability

DO NOT report:
- Theoretical issues that require assumptions about call frequency
- Micro-optimizations with negligible real-world impact
- Issues that require profiling data to confirm

Focus areas:
- N+1 queries: database calls or fetches inside loops
- Synchronous I/O or CPU-intensive work blocking the event loop
- Memory leaks: event listeners, timers, or closures not cleaned up
- Redundant computation: same value computed multiple times in a loop
- Inefficient array operations: nested loops that could use a Map/Set
- Missing pagination on potentially large result sets
- Unnecessary await in parallel-safe operations (should use Promise.all)
- Large payloads fetched when only a subset is needed
- Missing indexes or full-table scan patterns in raw queries

File: ${file.filename}

Full file content:
${file.content}

Diff (changed lines):
${file.patch ?? "No diff available"}

Return ONLY a valid JSON array. No markdown, no explanation, no code blocks outside the JSON.
[
  {
    "agent": "performance",
    "file": "${file.filename}",
    "line": <exact line number as integer>,
    "severity": "critical" | "warning" | "suggestion",
    "message": "Specific description of the inefficiency and its real performance impact",
    "suggestion": "Concrete fix with explanation of why it is faster or more efficient",
    "code_fix": [
      { "type": "context", "code": "<line before the problem>" },
      { "type": "removed", "code": "<the exact inefficient line>" },
      { "type": "added", "code": "<the optimized replacement line>" },
      { "type": "context", "code": "<line after the problem>" }
    ]
  }
]

If no real performance issues are found, return: []`;
}

export async function performanceAgent(files: FileContext[]): Promise<Finding[]> {
  return runAgent(files, buildPrompt);
}
