import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { loadAndRender, Alpine } from '@/core/template'
import { loginPageComponent } from '@/scripts/pages/login'

/**
 * 注册 Alpine 组件
 */
Alpine.data('loginPageComponent', loginPageComponent)

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/login.html')
}
