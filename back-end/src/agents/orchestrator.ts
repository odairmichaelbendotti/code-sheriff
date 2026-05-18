import type { Response } from "express";
import { securityAgent, type FileContext } from "./securityAgent.js";

type AgentType = "security" | "performance" | "quality";

export async function orchestrator(
  files: FileContext[],
  agents: AgentType[],
  res: Response,
): Promise<void> {
  const tasks: Promise<void>[] = [];

  // cada agente envia os findings conforme termina, sem esperar os outros
  if (agents.includes("security")) {
    tasks.push(
      securityAgent(files).then((findings) => {
        for (const finding of findings) {
          res.write(`data: ${JSON.stringify(finding)}\n\n`);
        }
      }),
    );
  }

  await Promise.all(tasks);

  res.write("data: [DONE]\n\n");
  res.end();
}
