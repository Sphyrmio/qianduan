import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

/**
 * 简单插件：在开发模式下提供 /templates 访问，在构建时复制到 dist
 */
function templateLoaderPlugin() {
  return {
    name: 'template-loader',
    // 开发模式：通过中间件提供 templates 目录
    configureServer(server: any) {
      server.middlewares.use('/templates', (req: any, res: any, next: any) => {
        const filePath = path.join(process.cwd(), 'src', 'templates', req.url)
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'text/html')
          res.end(fs.readFileSync(filePath, 'utf-8'))
        } else {
          next()
        }
      })
    },
    // 构建模式：复制 templates 到 dist
    buildEnd() {
      const srcTemplates = path.join(process.cwd(), 'src', 'templates')
      const distTemplates = path.join(process.cwd(), 'dist', 'templates')
      if (fs.existsSync(srcTemplates)) {
        fs.mkdirSync(distTemplates, { recursive: true })
        const copyDir = (src: string, dest: string) => {
          const entries = fs.readdirSync(src, { withFileTypes: true })
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name)
            const destPath = path.join(dest, entry.name)
            if (entry.isDirectory()) {
              fs.mkdirSync(destPath, { recursive: true })
              copyDir(srcPath, destPath)
            } else {
              fs.copyFileSync(srcPath, destPath)
            }
          }
        }
        copyDir(srcTemplates, distTemplates)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    UnoCSS(),
    templateLoaderPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})
