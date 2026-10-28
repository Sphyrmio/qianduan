/**
 * 入库页 — 路由挂载入口
 *
 * routes.ts 里 path: '/inbound' 指向本文件。页面 HTML 在 src/templates/pages/inbound/list.html，
 * 页面逻辑在 src/scripts/pages/inbound/list.ts。
 */
import { loadAndRender, Alpine } from '@/core/template'
import { inboundPageComponent } from '@/scripts/pages/inbound/list'

Alpine.data('inboundPageComponent', inboundPageComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/inbound/list.html')
}
