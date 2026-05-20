import { loadAndRender, Alpine } from '@/core/template'
import { userListComponent } from '@/scripts/pages/users/list'

/**
 * 注册 Alpine 组件
 */
Alpine.data('userListComponent', userListComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/users/list.html')
}
