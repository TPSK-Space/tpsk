// lib/apiClient.ts - Client-side fetch wrapper ke API route management.
// Semua operasi MANAGEMENT (trips, customers, ledgers, crew, rundown,
// pickup_points, update check-in) wajib lewat sini, BUKAN supabase anon.

async function request<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && (data as { error?: string }).error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const apiClient = {
  get: <T = unknown>(path: string) => request<{ data: T }>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  del: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body }),
};
