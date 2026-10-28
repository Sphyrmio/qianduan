/**
 * 出库页 — 路由挂载入口
 *
 * routes.ts 里 path: '/outbound' 指向本文件。页面 HTML 在 src/templates/pages/outbound/list.html，
 * 页面逻辑在 src/scripts/pages/outbound/list.ts。
 */
import { loadAndRender, Alpine } from '@/core/template'
import { outboundPageComponent } from '@/scripts/pages/outbound/list'

Alpine.data('outboundPageComponent', outboundPageComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/outbound/list.html')
}
