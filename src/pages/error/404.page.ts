import { loadAndRender } from '@/core/template'
import './404.page.css'

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/error/404.html')
}
