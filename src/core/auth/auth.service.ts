import { tokenStore } from './token.store'
import { sessionStore } from './session.store'
import { authApi, type LoginRequest } from './auth.api'
import { registerAuthHooks } from '@/core/http/apiClient'
import type { AppError } from '@/core/http/errors'

export type AuthResult = { ok: true } | { ok: false; error: AppError }

let _onLogoutCallback: (() => void) | null = null

/** 在应用启动时调用，注入 apiClient 的 auth hooks */
export function initAuthService(onLogout: () => void): void {
  _onLogoutCallback = onLogout
  registerAuthHooks({
    getToken: () => tokenStore.get(),
    onUnauthorized: async () => null,   // 无 refresh 端点，直接登出
    onLogout: logout,
  })
}

export async function login(credentials: LoginRequest): Promise<AuthResult> {
  const res = await authApi.login(credentials)
  if (!res.ok) return { ok: false, error: res.error }

  const { token, username, role } = res.data
  tokenStore.set(token)
  // displayName 首次登录时只有 username，用户列表拉取后不更新（仅展示用）
  sessionStore.set({ username, displayName: username, role })

  return { ok: true }
}

export function logout(): void {
  tokenStore.clear()
  sessionStore.clear()
  _onLogoutCallback?.()
}

/** 从 localStorage 恢复会话（token + user 都已持久化） */
export function tryRestoreSession(): boolean {
  const token = tokenStore.get()
  const { user } = sessionStore.get()
  // session.store 初始化时已自动从 localStorage 读取 user，这里只需确认 token 存在
  return !!(token && user)
}
