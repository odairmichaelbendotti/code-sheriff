import { Octokit } from "@octokit/rest";

export async function getPullChangedFiles({
  owner,
  repo,
  prNumber,
  accessToken,
}: {
  owner: string;
  repo: string;
  prNumber: string;
  accessToken: string | null;
}) {
  try {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    const octokit = new Octokit({ auth: accessToken });

    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: Number(prNumber),
    });
    return data;
  } catch (error) {
    throw new Error("Failed to fetch pull request files");
  }
}
