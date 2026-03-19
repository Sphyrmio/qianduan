import { loadAndRender } from '@/core/template'

export function mount(container: HTMLElement): void {
  loadAndRender(container, 'pages/error/404.html')
}