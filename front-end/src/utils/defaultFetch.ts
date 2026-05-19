type DefaultFetchProps = Omit<RequestInit, "body"> & {
  endpoint: string;
  body?: unknown;
};

export async function defaultFetch<T = unknown>({
  endpoint,
  body,
  ...options
}: DefaultFetchProps): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error ?? `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}
