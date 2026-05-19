import type { Response } from "express";
import { unifiedAgent } from "./unifiedAgent.js";
import type { FileContext } from "./securityAgent.js";
import { prisma } from "../lib/prisma.js";

type SSEEvent =
  | { type: "agent_start"; agent: "unified" }
  | { type: "agent_done"; agent: "unified" }
  | { type: "finding"; data: object }
  | { type: "done" };

type OrchestratorContext = {
  userId: string;
  owner: string;
  repo: string;
  prNumber: string;
};

function send(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function orchestrator(
  files: FileContext[],
  res: Response,
  ctx: OrchestratorContext,
): Promise<void> {
  send(res, { type: "agent_start", agent: "unified" });

  const findings = await unifiedAgent(files);

  for (const finding of findings) {
    send(res, { type: "finding", data: finding });
  }

  send(res, { type: "agent_done", agent: "unified" });
  send(res, { type: "done" });
  res.end();

  await prisma.analysis.create({
    data: {
      userId: ctx.userId,
      owner: ctx.owner,
      repo: ctx.repo,
      prNumber: parseInt(ctx.prNumber),
      criticalCount: findings.filter((f) => f.severity === "critical").length,
      warningCount: findings.filter((f) => f.severity === "warning").length,
      suggestionCount: findings.filter((f) => f.severity === "suggestion").length,
      findings: findings,
    },
  });
}
