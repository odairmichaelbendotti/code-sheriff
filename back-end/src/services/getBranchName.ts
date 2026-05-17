import { Octokit } from "@octokit/rest";

interface GetBranchNameParams {
  accessToken: string;
  owner: string;
  repo: string;
  prNumber: string;
}

export async function getBranchName({
  accessToken,
  owner,
  repo,
  prNumber,
}: GetBranchNameParams) {
  const octokit = new Octokit({ auth: accessToken });

  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: Number(prNumber),
  });

  if (!data.head || !data.head.ref) {
    throw new Error("Branch name not found");
  }

  return data.head.ref;
}
