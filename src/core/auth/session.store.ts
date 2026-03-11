/** Session Store：保存当前用户信息与权限列表，提供简单订阅 */

export interface SessionUser {
  id?: number
  username: string
  displayName: string
  role: string
}

export interface SessionState {
  user: SessionUser | null
  perms: string[]
  loaded: boolean
}

type Listener = (state: SessionState) => void

/** 根据后端 role 推导前端权限列表 */
function permsFromRole(role: string): string[] {
  if (role === 'ADMIN') return ['dashboard:view', 'user:list']
  return ['dashboard:view']
}

const SESSION_KEY = 'session_user'

let _state: SessionState = (() => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const user = JSON.parse(raw) as SessionUser
      return { user, perms: permsFromRole(user.role), loaded: true }
    }
  } catch { /* ignore */ }
  return { user: null, perms: [], loaded: false }
})()

const _listeners = new Set<Listener>()

function _notify() {
  _listeners.forEach((fn) => fn({ ..._state }))
}

export const sessionStore = {
  get(): SessionState {
    return { ..._state }
  },

  set(user: SessionUser): void {
    const perms = permsFromRole(user.role)
    _state = { user, perms, loaded: true }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    _notify()
  },

  clear(): void {
    _state = { user: null, perms: [], loaded: false }
    localStorage.removeItem(SESSION_KEY)
    _notify()
  },

  subscribe(fn: Listener): () => void {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  },

  isLoggedIn(): boolean {
    return _state.user !== null
  },
}
