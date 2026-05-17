import { Octokit } from "@octokit/rest";

export async function getChangedFiles({
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

    const changedFiles = {
      owner: owner,
      repo: repo,
      prNumber: prNumber,
      files: data.map((file) => ({
        filename: file.filename,
        status: file.status,
        patch: file.patch,
        sha: file.sha,
        additions: file.additions,
        deletions: file.deletions,
      })),
    };

    return changedFiles;
  } catch (error) {
    throw new Error("Failed to fetch pull request files");
  }
}
