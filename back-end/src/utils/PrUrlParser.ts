export function PrUrlParser(url: string) {
  const parts = url.split("/");
  return {
    owner: parts[3],
    repo: parts[4],
    prNumber: parts[6],
  };
}
