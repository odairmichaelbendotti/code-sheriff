import type { Response } from "express";
import { unifiedAgent } from "./unifiedAgent.js";
import type { FileContext } from "./securityAgent.js";

type SSEEvent =
  | { type: "agent_start"; agent: "unified" }
  | { type: "agent_done"; agent: "unified" }
  | { type: "finding"; data: object }
  | { type: "done" };

function send(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function orchestrator(
  files: FileContext[],
  res: Response,
): Promise<void> {
  send(res, { type: "agent_start", agent: "unified" });

  const findings = await unifiedAgent(files);

  for (const finding of findings) {
    send(res, { type: "finding", data: finding });
  }

  send(res, { type: "agent_done", agent: "unified" });
  send(res, { type: "done" });
  res.end();
}
