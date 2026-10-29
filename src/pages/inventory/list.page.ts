/**
 * 库存页 — 路由挂载入口
 *
 * routes.ts 里 path: '/inventory' 指向本文件。页面 HTML 在 src/templates/pages/inventory/list.html，
 * 页面逻辑在 src/scripts/pages/inventory/list.ts。
 */
import { loadAndRender, Alpine } from '@/core/template'
import { inventoryPageComponent } from '@/scripts/pages/inventory/list'

Alpine.data('inventoryPageComponent', inventoryPageComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/inventory/list.html')
}
