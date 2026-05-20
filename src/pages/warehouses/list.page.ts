import { loadAndRender, Alpine } from '@/core/template'
import { warehouseListComponent } from '@/scripts/pages/warehouses/list'
import './list.page.css'

/**
 * 注册 Alpine 组件
 */
Alpine.data('warehouseListComponent', warehouseListComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/warehouses/list.html')
}
