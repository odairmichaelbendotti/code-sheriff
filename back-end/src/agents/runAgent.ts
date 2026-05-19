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

export async function runAgent(
  files: FileContext[],
  buildPrompt: (file: FileContext) => string,
): Promise<Finding[]> {
  const results: Finding[][] = [];

  for (const file of files) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: buildPrompt(file) }],
      });

      const block = response.content[0];
      const text = block?.type === "text" ? block.text : "";

      try {
        const findings = JSON.parse(text) as Omit<Finding, "code_snippet">[];
        results.push(
          findings.map((f) => ({
            ...f,
            code_snippet: extractSnippet(file.content, f.line),
            code_fix: f.code_fix ?? [],
          })),
        );
      } catch {
        results.push([]);
      }
    } catch (error: unknown) {
      // rate limit — aguarda e tenta novamente uma vez
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: number }).status === 429
      ) {
        await sleep(12000);
        try {
          const retry = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            messages: [{ role: "user", content: buildPrompt(file) }],
          });
          const block = retry.content[0];
          const text = block?.type === "text" ? block.text : "";
          try {
            const findings = JSON.parse(text) as Omit<Finding, "code_snippet">[];
            results.push(
              findings.map((f) => ({
                ...f,
                code_snippet: extractSnippet(file.content, f.line),
                code_fix: f.code_fix ?? [],
              })),
            );
          } catch {
            results.push([]);
          }
        } catch {
          results.push([]);
        }
      } else {
        results.push([]);
      }
    }

    // delay entre arquivos para não estourar o rate limit
    if (files.indexOf(file) < files.length - 1) {
      await sleep(1200);
    }
  }

  return results.flat();
}
