import Anthropic from "@anthropic-ai/sdk";

export type Finding = {
  agent: "security" | "performance" | "quality";
  file: string;
  line: number;
  severity: "critical" | "warning" | "suggestion";
  message: string;
  suggestion: string;
  code_snippet: { line: number; code: string; highlight: boolean }[];
  code_fix: { type: "removed" | "added" | "context"; code: string }[];
};

export type FileContext = {
  filename: string;
  content: string;
  patch: string | undefined;
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(file: FileContext): string {
  return `You are a security code review agent. Analyze the code below and identify security vulnerabilities.

Focus on:
- SQL injection, NoSQL injection
- Exposed secrets, API keys, tokens
- OWASP Top 10 vulnerabilities
- Insecure authentication or authorization
- Sensitive data exposure

File: ${file.filename}

Full file content:
${file.content}

Diff (changed lines):
${file.patch ?? "No diff available"}

Return ONLY a valid JSON array with no explanation, no markdown, no code blocks.
Each item must follow this exact format:
[
  {
    "agent": "security",
    "file": "${file.filename}",
    "line": <line number as integer>,
    "severity": "critical" | "warning" | "suggestion",
    "message": "description of the issue",
    "suggestion": "short explanation of the fix",
    "code_fix": [
      { "type": "context", "code": "// surrounding line for context" },
      { "type": "removed", "code": "- the problematic line as it is" },
      { "type": "added", "code": "+ the corrected line" },
      { "type": "context", "code": "// surrounding line for context" }
    ]
  }
]

"code_fix" must show the diff: "removed" for the bad line, "added" for the fix, "context" for surrounding lines.
If no issues are found, return an empty array: []`;
}

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

export async function securityAgent(files: FileContext[]): Promise<Finding[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: buildPrompt(file) }],
      });

      const block = response.content[0];
      const text = block?.type === "text" ? block.text : "";

      try {
        const findings = JSON.parse(text) as Omit<Finding, "code_snippet">[];
        return findings.map((f) => ({
          ...f,
          code_snippet: extractSnippet(file.content, f.line),
          code_fix: f.code_fix ?? [],
        }));
      } catch {
        return [];
      }
    }),
  );

  return results.flat();
}
