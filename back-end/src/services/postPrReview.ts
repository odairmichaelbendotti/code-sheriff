import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";

type CodeFixLine = {
  type: "removed" | "added" | "context";
  code: string;
};

type Finding = {
  file: string;
  line: number;
  message: string;
  suggestion: string;
  code_fix: CodeFixLine[];
};

export class PostReviewError extends Error {
  constructor(
    message: string,
    public readonly code: "forbidden" | "conflict" | "not_found" | "unknown",
  ) {
    super(message);
  }
}

function buildCommentBody(finding: Finding): string {
  const addedLines = finding.code_fix
    .filter((l) => l.type === "added")
    .map((l) => l.code.replace(/^\+\s?/, ""))
    .join("\n");

  const suggestionBlock = addedLines
    ? `\`\`\`suggestion\n${addedLines}\n\`\`\``
    : "";

  return `**${finding.message}**\n\n${finding.suggestion}${suggestionBlock ? `\n\n${suggestionBlock}` : ""}`;
}

export async function postPrReview({
  owner,
  repo,
  prNumber,
  accessToken,
  findings,
}: {
  owner: string;
  repo: string;
  prNumber: string;
  accessToken: string;
  findings: Finding[];
}) {
  const octokit = new Octokit({ auth: accessToken });

  const comments = findings.map((f) => ({
    path: f.file,
    line: f.line,
    body: buildCommentBody(f),
  }));

  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: Number(prNumber),
      event: "COMMENT",
      comments,
    });
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.status === 403) {
        throw new PostReviewError(
          "Your GitHub token does not have permission to post reviews. Make sure the token has the 'repo' scope.",
          "forbidden",
        );
      }
      if (error.status === 404) {
        throw new PostReviewError(
          "Pull request not found. Check that the PR is open and that your GitHub token has the 'repo' scope (not just 'read:user'). Re-login if needed.",
          "not_found",
        );
      }
      if (error.status === 422) {
        throw new PostReviewError(
          "Cannot post review. The pull request may have unresolved conflicts or the file line is invalid.",
          "conflict",
        );
      }
      throw new PostReviewError(`GitHub API error: ${error.message}`, "unknown");
    }
    throw new PostReviewError("Unexpected error while posting review to GitHub.", "unknown");
  }
}
