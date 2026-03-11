/** Token 存储：JWT 持久化到 localStorage */

const TOKEN_KEY = 'access_token'

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}
