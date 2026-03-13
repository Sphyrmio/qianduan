# Frontend Web

eu-sc-pro-skills-training-2 项目的前端 Web 应用。

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **构建工具** | Vite | 7.3.1 | 快速构建，支持 HMR |
| **语言** | TypeScript | 5.9.3 | 类型安全的 JavaScript 超集 |
| **UI 组件库** | Shoelace | 2.20.1 | Web Components 组件库，提供按钮、表单、对话框等 |
| **CSS 引擎** | UnoCSS | 66.6.2 | 原子化 CSS，按需生成，兼容 Tailwind 语法 |
| **路由** | Navigo | 8.11.1 | 轻量级客户端路由，支持 hash/history 模式 |
| **代码检查** | ESLint | 10.x | 代码质量检查 |
| **代码格式化** | Prettier | 3.x | 代码格式化 |
| **集成** | eslint-config-prettier | - | ESLint 与 Prettier 集成 |

## 项目结构

```
frontend-web/
├── src/
│   ├── main.ts           # 应用入口点
│   ├── app.ts            # 应用初始化
│   ├── counter.ts        # 示例组件
│   ├── style.css         # 全局样式
│   ├── typescript.svg    # 静态资源
│   ├── core/             # 核心模块（工具函数、常量等）
│   └── pages/            # 页面组件
├── public/               # 静态资源目录
├── index.html            # HTML 入口
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
├── uno.config.ts         # UnoCSS 配置
└── vite.config.ts        # Vite 配置
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 使用示例

### Shoelace 组件
```typescript
import '@shoelace-style/shoelace/dist/components/button/button.js';

// 在 HTML 中使用
// <sl-button variant="primary">点击我</sl-button>
```

### UnoCSS 原子类
```typescript
// 直接在 class 中使用原子类
// <div class="flex items-center justify-center p-4">内容</div>
```

### Navigo 路由
```typescript
import Navigo from 'navigo';

const router = new Navigo('/');

router.on('/home', () => {
  // 处理首页路由
});

router.resolve();
```

## 注意事项

- Shoelace 组件需要单独导入才能使用
- UnoCSS 需要在 `uno.config.ts` 中配置主题和预设
- TypeScript 配置在 `tsconfig.json` 中管理
