import { Octokit } from "@octokit/rest";

type PullFileContentParams = {
  accessToken: string;
  owner: string;
  repo: string;
  filename: string;
  branchName: string;
};

export async function getFileContent({
  accessToken,
  owner,
  repo,
  filename,
  branchName,
}: PullFileContentParams) {
  if (!accessToken) throw new Error("Access token is required");

  try {
    const octokit = new Octokit({ auth: accessToken });

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filename,
      ref: branchName,
    });

    if (Array.isArray(data) || data.type !== "file") {
      throw new Error("Path is not a file");
    }

    const content = {
      name: data.name,
      path: data.path,
      size: data.size,
      sha: data.sha,
      html_url: data.html_url ?? "",
      content: Buffer.from(data.content, "base64").toString("utf-8"),
    };

    return content;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch file content");
  }
}
