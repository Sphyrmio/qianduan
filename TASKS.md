# Alpine.js 重构任务清单

## 🎯 目标
- 将 HTML 从 TS 字符串变量中分离出来，使用独立的 `.html` 模板文件
- 用 Alpine.js 替代手写的事件监听和状态管理
- 保持零框架依赖（仅 Alpine.js + Shoelace）
- 保留现有路由 (Navigo) 和 HTTP 客户端

---

## 📦 第一阶段：基础设施 ✅

### 1.1 安装 Alpine.js
- [x] `pnpm add alpinejs`
- [x] 安装类型定义 `pnpm add -D @types/alpinejs`

### 1.2 创建模板加载器
- [x] 创建 `src/core/template/loader.ts`
  - 实现 `loadTemplate(path: string): Promise<string>`
  - 支持模板缓存（避免重复 fetch）
- [x] 创建 `src/core/template/compiler.ts`
  - 集成 Alpine.js 数据绑定
  - 支持自定义指令扩展

### 1.3 目录结构重组 ✅
```
src/
├── templates/           # 新增：HTML 模板目录
│   ├── layouts/
│   │   └── app.html
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   └── users/
│   │       └── list.html
│   └── components/
│       ├── DataTable.html
│       └── ConfirmDialog.html
├── scripts/            # 新增：Alpine 组件逻辑
│   ├── components/
│   │   ├── DataTable.ts
│   │   └── ConfirmDialog.ts
│   └── pages/
│       ├── login.ts
│       └── users/list.ts
├── core/
│   ├── template/       # 新增：模板引擎
│   │   ├── loader.ts
│   │   └── compiler.ts
│   └── ...
└── styles/
```

### 1.4 Vite 配置调整 ✅
- [x] 修改 `vite.config.ts`
  - 配置 `copyPlugin` 将 `templates/` 复制到 `dist/`
  - 或改用 `import ?raw` 方式导入模板

---

## 📦 第二阶段：核心组件重构

### 2.1 DataTable 组件 ✅
**当前:** `src/core/ui/components/DataTable.ts` (HTML 在 TS 字符串中)

**重构后:**
- [x] 创建 `src/templates/components/DataTable.html`
  ```html
  <div x-data="dataTable($props)" class="table-wrap">
    <table>
      <thead>
        <tr>
          <template x-for="col in columns" :key="col.key">
            <th :class="{ sortable: col.sortable }" @click="handleSort(col.key)">
              <span x-text="col.label"></span>
              <span x-show="col.sortable" x-text="getSortIcon(col.key)"></span>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <template x-if="loading">
          <tr><td :colspan="columns.length">加载中…</td></tr>
        </template>
        <template x-if="!loading && data.length === 0">
          <tr><td :colspan="columns.length" x-text="empty"></td></tr>
        </template>
        <template x-if="!loading && data.length > 0">
          <template x-for="(row, idx) in data" :key="idx">
            <tr>
              <template x-for="col in columns" :key="col.key">
                <td x-html="renderCell(row, col)"></td>
              </template>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
    <!-- 分页 -->
  </div>
  ```

- [x] 创建 `src/scripts/components/DataTable.ts`
  ```typescript
  export function dataTableComponent() {
    return {
      columns: [],
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      loading: false,
      sortKey: '',
      sortDir: 'asc' as 'asc' | 'desc',
      
      handleSort(key: string) { /* ... */ },
      getSortIcon(key: string) { /* ... */ },
      renderCell(row: any, col: any) { /* ... */ },
      goToPage(page: number) { /* ... */ }
    }
  }
  ```

### 2.2 ConfirmDialog 组件 ✅
- [x] 创建 `src/templates/components/ConfirmDialog.html`
- [x] 创建 `src/scripts/components/ConfirmDialog.ts`
- [x] 用 Alpine `x-show` 和 `x-transition` 处理显示/隐藏动画

### 2.3 AppShell 布局 ✅
- [x] 创建 `src/templates/layouts/app.html`
- [x] 集成侧边栏菜单（从 `src/core/rbac/menu.ts` 获取）
- [x] 用 Alpine 管理展开/折叠状态

---

## 📦 第三阶段：页面重构

### 3.1 登录页 (`/login`)
**当前:** `src/pages/login/login.page.ts`

**重构后:**
- [x] 创建 `src/templates/pages/login.html`
  ```html
  <div x-data="loginPage()" class="login-container">
    <div class="login-header">
      <h1>工单管理系统</h1>
      <p>请登录您的账号</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label>用户名</label>
        <sl-input x-model="username" name="username" placeholder="请输入用户名"></sl-input>
        <p class="form-error" x-show="errors.username" x-text="errors.username"></p>
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <sl-input x-model="password" type="password" name="password" placeholder="请输入密码"></sl-input>
        <p class="form-error" x-show="errors.password" x-text="errors.password"></p>
      </div>
      
      <p class="form-error" x-show="errors.login" x-text="errors.login"></p>
      
      <sl-button type="submit" variant="primary" :loading="submitting">登录</sl-button>
    </form>
  </div>
  ```

- [x] 创建 `src/scripts/pages/login.ts`
  ```typescript
  export function loginPageComponent() {
    return {
      username: '',
      password: '',
      errors: {} as Record<string, string>,
      submitting: false,
      
      async handleSubmit() {
        // 调用现有 auth.service
      }
    }
  }
  ```

- [x] 修改 `src/pages/login/login.page.ts` 为加载器（只负责加载模板和初始化 Alpine）

### 3.2 用户列表页 (`/users`)
- [x] 创建 `src/templates/pages/users/list.html`
- [x] 创建 `src/scripts/pages/users/list.ts`
- [x] 集成 DataTable 组件
- [x] 处理搜索、筛选、分页

### 3.3 仓库列表页 (`/warehouses`)
- [x] 创建 `src/templates/pages/warehouses/list.html`
- [x] 创建 `src/scripts/pages/warehouses/list.ts`

### 3.4 仪表盘页 (`/dashboard`)
- [ ] 创建 `src/templates/pages/dashboard.html`
- [ ] 创建 `src/scripts/pages/dashboard.ts`

### 3.5 错误页 (404/403)
- [ ] 创建 `src/templates/pages/error/404.html`
- [ ] 创建 `src/templates/pages/error/403.html`

---

## 📦 第四阶段：路由集成

### 4.1 路由加载器改造
**当前:** `src/core/router/router.ts`

**重构:**
- [ ] 修改路由守卫，支持异步加载模板
- [ ] 每个路由定义增加 `template` 路径
- [ ] 页面切换时自动清理 Alpine 组件状态

### 4.2 路由配置示例
```typescript
// src/core/router/routes.ts
export const routes = [
  {
    path: '/login',
    template: '/templates/pages/login.html',
    script: () => import('@/scripts/pages/login')
  },
  {
    path: '/users',
    template: '/templates/pages/users/list.html',
    script: () => import('@/scripts/pages/users/list'),
    guard: 'auth'
  }
  // ...
]
```

---

## 📦 第五阶段：状态管理

### 5.1 全局状态
- [ ] 创建 `src/core/state/store.ts`
  - 用 Alpine `Alpine.store()` 管理全局状态
  - 用户信息、权限、主题等

### 5.2 认证状态
- [ ] 将 `src/core/auth/session.store.ts` 和 `token.store.ts` 迁移到 Alpine store
- [ ] 在模板中用 `$store.auth.user` 访问

---

## 📦 第六阶段：测试与优化

### 6.1 功能验证
- [ ] 登录流程
- [ ] 路由跳转
- [ ] DataTable 排序/分页
- [ ] 权限控制（RBAC）
- [ ] 表单验证

### 6.2 性能优化
- [ ] 模板预加载/缓存策略
- [ ] 按需加载 Alpine 组件
- [ ] 生产构建体积检查

### 6.3 清理
- [ ] 删除旧的 TS 内联 HTML 代码
- [ ] 更新文档
- [ ] 代码审查

---

## 📋 验收标准

| 项目 | 标准 |
|------|------|
| HTML 分离 | 所有页面 HTML 在独立 `.html` 文件中 |
| Alpine 使用 | 状态和事件用 Alpine 管理，无手写 addEventListener |
| 功能完整 | 所有现有功能正常工作 |
| 构建体积 | 不超过当前 20% |
| 类型安全 | TS 类型定义完整 |

---

## 🚀 快速开始

```bash
# 1. 安装 Alpine.js
pnpm add alpinejs
pnpm add -D @types/alpinejs

# 2. 创建目录结构
mkdir -p src/templates/{layouts,pages,components}
mkdir -p src/scripts/{components,pages}
mkdir -p src/core/template

# 3. 从登录页开始重构（最小改动）
```

---

## 📝 注意事项

1. **Shoelace 组件**：保持使用，Alpine 与 Shoelace 兼容良好
2. **Navigo 路由**：保留，不引入新路由库
3. **HTTP 客户端**：保留现有 `apiClient.ts`
4. **渐进式重构**：按页面逐个迁移，保证可随时回滚
5. **类型安全**：为 Alpine 组件编写 TS 类型定义

---

*创建时间：2026-03-19*
