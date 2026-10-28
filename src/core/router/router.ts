import Navigo from 'navigo'
import { routes, type RouteConfig } from './routes'
import { runGuard } from './guard'
import { renderAppShell, renderLoginShell, renderBlank } from '@/core/ui/layout/AppShell'

const router = new Navigo('/', { hash: true })

let _currentUnmount: (() => void) | undefined

function renderPage(cfg: RouteConfig, _params: Record<string, string>) {
  cfg.page().then((mod) => {
    const container = document.getElementById('page-content')
    if (!container) return

    // 卸载旧页面
    _currentUnmount?.()
    _currentUnmount = undefined
    container.innerHTML = ''

    mod.mount(container)
    if (mod.unmount) {
      _currentUnmount = mod.unmount
    }

    // 更新页面标题
    if (cfg.meta.title) {
      document.title = `${cfg.meta.title} - 仓库管理系统`
    }

    // 更新侧边栏活跃项
    document.querySelectorAll('.sidebar-link').forEach((el) => {
      const href = el.getAttribute('data-href') ?? ''
      const currentHash = '#' + (location.hash.split('#')[1] ?? '/')
      el.classList.toggle('active', currentHash.startsWith(href) && href !== '#/')
      if (href === '#/') {
        el.classList.toggle('active', currentHash === '#/')
      }
    })
  }).catch(console.error)
}

export function initRouter(): void {
  routes.forEach((cfg) => {
    router.on(cfg.path, (match) => {
      const params = (match?.data ?? {}) as Record<string, string>
      const targetPath = location.hash.replace('#', '') || '/'

      const guard = runGuard({ meta: cfg.meta, targetPath })
      if (guard.action === 'redirect') {
        router.navigate(guard.to)
        return
      }

      // 确保正确的布局
      switch (cfg.meta.layout) {
        case 'app':
          renderAppShell()
          break
        case 'login':
          renderLoginShell()
          break
        default:
          renderBlank()
          break
      }

      renderPage(cfg, params)
    })
  })

  router.notFound(() => {
    router.navigate('/404')
  })

  router.resolve()
}

export { router }
