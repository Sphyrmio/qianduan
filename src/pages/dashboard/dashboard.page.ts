import { loadAndRender, Alpine } from '@/core/template'
import { dashboardComponent } from '@/scripts/pages/dashboard'

/**
 * 注册 Alpine 组件
 */
Alpine.data('dashboardComponent', dashboardComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/dashboard.html')
}