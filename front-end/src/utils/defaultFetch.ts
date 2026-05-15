type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function defaultFetch<T = unknown>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const url = `${serverUrl}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const body = options?.body ? JSON.stringify(options.body) : undefined;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
