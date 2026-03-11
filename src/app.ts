import './style.css'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import { initAuthService, tryRestoreSession } from '@/core/auth/auth.service'
import { initRouter, router } from '@/core/router/router'

/** 注册 Shoelace 基础组件 */
setBasePath('/node_modules/@shoelace-style/shoelace/dist')

export function bootstrap(): void {
  // 1. 注入 auth hooks（apiClient 需要 token 回调）
  initAuthService(() => {
    router.navigate('/login')
  })

  // 2. 同步从 localStorage 恢复上次会话（token + user 均已持久化）
  tryRestoreSession()

  // 3. 启动路由
  initRouter()
}
