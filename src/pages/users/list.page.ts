/**
 * 用户列表页 — 路由挂载入口（教学用）
 *
 * 【本文件干什么】
 * 1. 把 userListComponent 注册到 Alpine（名字要和 list.html 里 x-data 一致）
 * 2. mount 时把 templates/pages/users/list.html 塞进 #page-content
 *
 * 【路由在哪配】src/core/router/routes.ts 里 path: '/users' 指向本文件
 *
 * 【注意】改页面 HTML 请改 src/templates/pages/users/list.html，
 *         不是 src/pages/users/list.page.html（后者是旧占位，可忽略）
 */
import { loadAndRender, Alpine } from '@/core/template'
import { userListComponent } from '@/scripts/pages/users/list'

Alpine.data('userListComponent', userListComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/users/list.html')
}
