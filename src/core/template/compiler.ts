/**
 * 模板编译器 - 集成 Alpine.js
 */

import Alpine from 'alpinejs'

// 启动 Alpine.js
Alpine.start()

/**
 * 在容器中渲染模板并初始化 Alpine 组件
 * @param container 目标容器元素
 * @param template 模板 HTML 字符串
 * @param data Alpine 组件数据（可选）
 */
export function renderTemplate(
  container: HTMLElement,
  template: string,
  data?: Record<string, unknown>
): void {
  // 清空容器
  container.innerHTML = template

  // 如果提供了数据，初始化 Alpine 组件
  if (data) {
    // Alpine 会自动扫描并初始化 x-data 等指令
    // 这里可以手动触发重新扫描（如果需要）
    setTimeout(() => {
      Alpine.initTree(container)
    }, 0)
  }
}

/**
 * 加载并渲染模板
 * @param container 目标容器元素
 * @param templatePath 模板路径
 * @param data Alpine 组件数据（可选）
 */
export async function loadAndRender(
  container: HTMLElement,
  templatePath: string,
  data?: Record<string, unknown>
): Promise<void> {
  const { loadTemplate } = await import('./loader')
  const template = await loadTemplate(templatePath)
  renderTemplate(container, template, data)
}

/**
 * 创建 Alpine 组件工厂
 * @param componentFn Alpine 组件函数
 * @returns 初始化的组件实例
 */
export function createComponent<T extends Record<string, unknown>>(
  componentFn: () => T
): T {
  return componentFn()
}

export { Alpine }
