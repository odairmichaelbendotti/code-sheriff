import Anthropic from "@anthropic-ai/sdk";
import type { Finding, FileContext } from "./securityAgent.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractSnippet(content: string, line: number, context = 3) {
  const lines = content.split("\n");
  const start = Math.max(0, line - 1 - context);
  const end = Math.min(lines.length, line + context);
  return lines.slice(start, end).map((code, i) => ({
    line: start + i + 1,
    code,
    highlight: start + i + 1 === line,
  }));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prepareFileBlock(file: FileContext, index: number): string {
  const diff = file.patch ?? "(no diff — binary or empty file)";
  return `--- FILE ${index + 1}: ${file.filename} ---\n${diff}\n--- END FILE ${index + 1} ---`;
}

function buildPrompt(files: FileContext[]): string {
  const filesBlock = files.map(prepareFileBlock).join("\n\n");

  return `You are a senior security and software engineering expert doing a thorough code review. These files CONTAIN REAL BUGS — some intentionally planted. Your job is to find every single one, no matter how subtle.

CRITICAL INSTRUCTION: Do NOT be conservative. Do NOT skip a finding because you are "not 100% sure". If you see something that looks wrong, report it. A false positive is far better than a missed bug. The developer NEEDS to know about every problem in this code.

ANALYSIS PROCESS:
PHASE 1 — DEEP READING: Read every file completely, line by line. For each file, ask yourself:
  - Is any user-controlled data used unsafely (eval, SQL concat, shell exec)?
  - Are there hardcoded credentials, secrets, or tokens?
  - Is crypto used correctly (never Math.random for security, never MD5/SHA1 for passwords)?
  - Are there DB queries or expensive operations inside loops?
  - Are there unhandled errors, missing awaits, or swallowed exceptions?
  - Is there dead code, unreachable branches, or logic that can never work?
  - Are there type assertions or \`any\` casts that hide real errors?
  - Is there any code that would fail at runtime with real data?
PHASE 2 — REPORT: Output every problem you found as a JSON array. One finding per root cause. If the same bug appears on multiple lines (e.g. replace() without /g flag on lines 36 and 37), report it ONCE on the first line where it occurs. Never report the same root cause twice.

SEVERITY — be precise, not generous:
- critical: broken RIGHT NOW — SQL/command injection, hardcoded secret/token, missing auth check on a route, Math.random() for security, eval() with user input, null dereference that WILL crash at runtime
- warning: works today but will cause a real production problem — N+1 query inside a loop, sync blocking call in async context, unhandled promise rejection that swallows errors silently, logic that produces wrong output for valid inputs
- suggestion: code smell with a clear fix — duplicated logic worth extracting, misleading name, missing return type on a public function, magic number that should be a named constant

NEVER report:
- Incomplete guard logic or edge cases that the developer CHOSE not to handle (e.g. a zero-leading check that doesn't cover every case — that is a design choice, not a bug)
- Refactoring suggestions framed as bugs ("consider splitting state from display string")
- Things that "could" be a problem under hypothetical conditions you are inventing
- Style preferences, formatting, or code organisation opinions
- Anything already handled by a comment in the code explaining the intent
- Missing features or improvements to existing logic that works as written

ANALYSIS DIMENSIONS:
- "security": injection attacks, hardcoded secrets, insecure crypto, missing auth/authz, XSS, path traversal, SSRF, prototype pollution, sensitive data in logs or responses
- "performance": N+1 queries (DB call inside a loop), sync blocking in async context, missing pagination on unbounded queries, missing Promise.all for independent sequential awaits, memory leaks from uncleaned listeners/timers
- "quality": unhandled promise rejections, missing try/catch on async operations that throw, \`any\` hiding a real type error, dead/unreachable code, logic bug that produces wrong output (wrong operator, off-by-one on a boundary, condition that is always true or always false)

FILES TO ANALYZE:

${filesBlock}

Return ONLY a valid JSON array. Absolutely no markdown, no explanation, no prose — just the raw JSON array starting with [ and ending with ].
[
  {
    "agent": "security" | "performance" | "quality",
    "file": "<exact filename as shown above>",
    "line": <exact integer line number from the numbered file content>,
    "severity": "critical" | "warning" | "suggestion",
    "message": "Specific description: WHAT is wrong, WHY it is dangerous or broken, WHAT will happen if not fixed",
    "suggestion": "Concrete fix: exactly what to change, what to use instead, and why it is correct",
    "code_fix": [
      { "type": "context", "code": "<1-2 lines before the problem for context>" },
      { "type": "removed", "code": "<the exact problematic line(s)>" },
      { "type": "added", "code": "<the corrected replacement line(s)>" },
      { "type": "context", "code": "<1-2 lines after the problem for context>" }
    ]
  }
]

If genuinely no issues exist anywhere in all the files, return: []`;
}

export async function unifiedAgent(files: FileContext[]): Promise<Finding[]> {
  const prompt = buildPrompt(files);

  async function callClaude(): Promise<Finding[]> {
    console.log(`[unifiedAgent] prompt size: ${prompt.length} chars (~${Math.round(prompt.length / 4)} tokens estimated)`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    console.log(`[unifiedAgent] usage: input=${response.usage.input_tokens} output=${response.usage.output_tokens} total=${response.usage.input_tokens + response.usage.output_tokens}`);

    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";

    const contentByFile = new Map(files.map((f) => [f.filename, f.content]));

    try {
      const rawFindings = JSON.parse(text) as Omit<Finding, "code_snippet">[];
      const seen = new Set<string>();
      const deduped = rawFindings.filter((f) => {
        // Deduplicate: same file + agent + severity + exact line
        const exactKey = `${f.file}:${f.agent}:${f.severity}:${f.line}`;
        // Also deduplicate: same file + agent + first 10 words (same root cause, different line)
        const words = f.message.toLowerCase().split(/\s+/).slice(0, 10).join(" ");
        const msgKey = `${f.file}:${f.agent}:${words}`;
        if (seen.has(exactKey) || seen.has(msgKey)) return false;
        seen.add(exactKey);
        seen.add(msgKey);
        return true;
      });
      return deduped.map((f) => ({
        ...f,
        code_snippet: extractSnippet(contentByFile.get(f.file) ?? "", f.line),
        code_fix: f.code_fix ?? [],
      }));
    } catch {
      return [];
    }
  }

  try {
    return await callClaude();
  } catch (error: unknown) {
    const is429 =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 429;

    if (is429) {
      await sleep(12000);
      try {
        return await callClaude();
      } catch {
        return [];
      }
    }
    return [];
  }
}
