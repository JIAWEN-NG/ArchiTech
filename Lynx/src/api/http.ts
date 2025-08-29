// src/api/http.ts
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

let BASE = 'http://10.0.2.2:7002'           // Android emulator default
const FALLBACKS = ['http://127.0.0.1:7002'] // iOS sim / web preview

async function pickBaseOnce() {
  for (const b of [BASE, ...FALLBACKS]) {
    try {
      const r = await fetch(`${b}/health`, { method: 'GET' })
      if (r.ok) { BASE = b; return }
    } catch {
        // ignore
    }
  }
}
let baseChecked = false

export async function httpJSON<T>(
  path: string,
  init: { method?: Method; body?: unknown; headers?: Record<string,string> } = {}
): Promise<T> {
  if (!baseChecked) { baseChecked = true; await pickBaseOnce() }
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`)
  }
  return (res.status === 204 ? (undefined as T) : ((await res.json()) as T))
}
