/**
 * 模板加载器 - 负责加载和缓存 HTML 模板
 */

const templateCache = new Map<string, string>()

/**
 * 加载 HTML 模板（带缓存）
 * @param path 模板路径（相对于 /templates/）
 * @returns 模板内容
 */
export async function loadTemplate(path: string): Promise<string> {
  // 检查缓存
  if (templateCache.has(path)) {
    return templateCache.get(path)!
  }

  // 确保路径以 /templates/ 开头
  const normalizedPath = path.startsWith('/templates/') 
    ? path 
    : `/templates/${path}`

  try {
    const res = await fetch(normalizedPath)
    if (!res.ok) {
      throw new Error(`Failed to load template: ${normalizedPath} (${res.status})`)
    }
    const content = await res.text()
    
    // 缓存模板
    templateCache.set(path, content)
    return content
  } catch (error) {
    console.error(`[TemplateLoader] Error loading template ${path}:`, error)
    throw error
  }
}

/**
 * 清除模板缓存（用于开发模式热重载）
 */
export function clearTemplateCache(path?: string): void {
  if (path) {
    templateCache.delete(path)
  } else {
    templateCache.clear()
  }
}

/**
 * 预加载多个模板
 */
export async function preloadTemplates(paths: string[]): Promise<void> {
  await Promise.all(paths.map(loadTemplate))
}
