import { loadAndRender } from '@/core/template'
import './403.page.css'

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/error/403.html')
}
