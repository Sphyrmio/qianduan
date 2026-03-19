import { loadAndRender } from '@/core/template'

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/error/403.html')
}