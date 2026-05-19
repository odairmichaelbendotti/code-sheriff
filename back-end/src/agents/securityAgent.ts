import { runAgent } from "./runAgent.js";

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

function buildPrompt(file: FileContext): string {
  return `You are an expert security engineer performing a code review. Your job is to find REAL, CONCRETE security vulnerabilities in the code — not theoretical risks or style issues.

SEVERITY GUIDE:
- critical: exploitable vulnerability that can lead to data breach, RCE, authentication bypass, or privilege escalation
- warning: bad practice that creates a meaningful attack surface (e.g. missing input validation, weak crypto, exposed token)
- suggestion: minor hardening improvement worth making but not immediately dangerous

ONLY report findings that:
1. Have a specific, identifiable line number where the problem exists
2. Are caused by actual code in this file (not hypothetical future code)
3. Would be flagged in a professional pentest or security audit

DO NOT report:
- Generic advice like "add input validation" without pointing to a specific vulnerable line
- Issues that require assumptions about code outside this file
- Style issues or missing documentation

Focus areas:
- eval() or Function() with user-controlled input
- SQL/NoSQL/LDAP/command injection via string concatenation or template literals
- Hardcoded secrets, tokens, passwords, or private keys
- Unsafe deserialization
- Missing authentication or authorization checks on sensitive operations
- Insecure cryptography (MD5, SHA1 for passwords, Math.random() for tokens)
- XSS via innerHTML, document.write, or dangerouslySetInnerHTML
- Path traversal via unsanitized file paths
- SSRF via unsanitized URLs in fetch/axios/http calls
- Prototype pollution
- Exposed sensitive data in logs or error messages

File: ${file.filename}

Full file content:
${file.content}

Diff (changed lines):
${file.patch ?? "No diff available"}

Return ONLY a valid JSON array. No markdown, no explanation, no code blocks outside the JSON.
[
  {
    "agent": "security",
    "file": "${file.filename}",
    "line": <exact line number as integer>,
    "severity": "critical" | "warning" | "suggestion",
    "message": "Specific description of the vulnerability and why it is dangerous",
    "suggestion": "Concrete fix with explanation of what to change and why it is safer",
    "code_fix": [
      { "type": "context", "code": "<line before the problem>" },
      { "type": "removed", "code": "<the exact problematic line>" },
      { "type": "added", "code": "<the corrected replacement line>" },
      { "type": "context", "code": "<line after the problem>" }
    ]
  }
]

If no real vulnerabilities are found, return: []`;
}

export async function securityAgent(files: FileContext[]): Promise<Finding[]> {
  return runAgent(files, buildPrompt);
}
