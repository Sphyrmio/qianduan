/**
 * 货品页 — 路由挂载入口
 *
 * routes.ts 里 path: '/skus' 指向本文件。页面 HTML 在 src/templates/pages/skus/list.html，
 * 页面逻辑在 src/scripts/pages/skus/list.ts。
 */
import { loadAndRender, Alpine } from '@/core/template'
import { skuListComponent } from '@/scripts/pages/skus/list'

Alpine.data('skuListComponent', skuListComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/skus/list.html')
}
