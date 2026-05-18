import Anthropic from "@anthropic-ai/sdk";

export type Finding = {
  agent: "security" | "performance" | "quality";
  file: string;
  line: number;
  severity: "critical" | "warning" | "suggestion";
  message: string;
  suggestion: string;
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
    "suggestion": "how to fix it"
  }
]

If no issues are found, return an empty array: []`;
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
        return JSON.parse(text) as Finding[];
      } catch {
        return [];
      }
    }),
  );

  return results.flat();
}
