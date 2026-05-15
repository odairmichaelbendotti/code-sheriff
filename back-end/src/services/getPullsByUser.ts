import { Octokit } from "@octokit/rest";

export async function getPullsByUser(accessToken: string) {
  if (!accessToken) {
    throw new Error("GitHub account not linked");
  }
  const octokit = new Octokit({ auth: accessToken });

  const { data } = await octokit.search.issuesAndPullRequests({
    q: `is:pr is:open author:@me`,
  });

  const pulls = data.items.map((item) => {
    return {
      id: item.id,
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      repository_url: item.repository_url,
      state: item.state,
      created_at: item.created_at,
      updated_at: item.updated_at,
      draft: item.draft,
      user: { login: item.user?.login, avatar_url: item.user?.avatar_url },
    };
  });

  return pulls;
}
