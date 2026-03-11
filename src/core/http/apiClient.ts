import { fromHttpStatus, makeNetworkError, type AppError } from './errors'

const BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'
const TIMEOUT_MS = 15_000

/** 由 auth.service 在启动时注入——避免循环依赖 */
let _onUnauthorized: (() => Promise<string | null>) | null = null
let _onLogout: (() => void) | null = null
let _getToken: (() => string | null) | null = null

export function registerAuthHooks(opts: {
  getToken: () => string | null
  onUnauthorized: () => Promise<string | null>
  onLogout: () => void
}) {
  _getToken = opts.getToken
  _onUnauthorized = opts.onUnauthorized
  _onLogout = opts.onLogout
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: AppError }

async function _fetch(input: string, init: RequestInit, retry = true): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const token = _getToken?.()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  try {
    const res = await fetch(`${BASE_URL}${input}`, {
      ...init,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.status === 401 && retry && _onUnauthorized) {
      // refresh 一次，重试
      const newToken = await _onUnauthorized()
      if (newToken) {
        return _fetch(input, init, false)
      } else {
        _onLogout?.()
        throw { kind: 'auth', message: '登录已过期，请重新登录', status: 401 } as AppError
      }
    }

    return res
  } catch (err) {
    clearTimeout(timer)
    if ((err as AppError).kind === 'auth') throw err
    throw makeNetworkError(err)
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await _fetch(
      path,
      { method, body: body !== undefined ? JSON.stringify(body) : undefined },
    )
    const data = await parseBody(res)
    if (!res.ok) {
      return { ok: false, error: fromHttpStatus(res.status, data) }
    }
    return { ok: true, data: data as T }
  } catch (err) {
    return { ok: false, error: err as AppError }
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
