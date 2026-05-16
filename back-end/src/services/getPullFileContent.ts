import { Octokit } from "@octokit/rest";
import { access } from "node:fs";

type PullFileContentParams = {
  owner: string;
  repo: string;
  filename: string;
  sha: string;
  accessToken: string | null;
};

export async function getPullFileContent({
  owner,
  repo,
  filename,
  sha,
  accessToken,
}: PullFileContentParams) {
  if (!accessToken) throw new Error("Access token is required");

  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filename,
      sha,
    });

    return Buffer.from(data.toString(), "base64").toString("utf-8");
  } catch (error) {
    throw new Error("Failed to fetch file content");
  }
}
