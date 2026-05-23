# 用户管理前端：从零实现 + 浏览器验证手册

> 面向零基础，配合后端 `backend-server` 的 Swagger「用户管理」五个接口。  
> 假设页面上**还没有**用户 CRUD，按下面顺序写代码；仓库完整代码可作答案，课堂建议**先自己做再对照**。  
> **动手写接口前，请先读完第 0 章「基础必知」。**

---

## 0. 基础必知（技术栈、架构、TypeScript）

本章回答三个问题：**用什么技术？文件夹为什么这样分？TypeScript 要会哪几句？**

### 0.1 这个项目是什么？

这是一个 **后台管理类网页（Admin）**：左侧菜单、顶栏、中间内容区。  
用户管理只是其中一个菜单页（`#/users`），以后要接仓库、工单等，都按同一套写法扩展。

和后端的关系：

| 角色 | 技术 | 职责 |
|------|------|------|
| 后端 | Spring Boot + MySQL | 提供 REST API、鉴权、存数据 |
| 前端（本项目） | Vite + TypeScript + HTML | 展示界面、发 HTTP、处理登录态 |

前端**不连数据库**，只通过 HTTP 读写在后端 Swagger 里能看到的 JSON。

---

### 0.2 技术栈一览：用了什么、为什么不用别的？

| 技术 | 作用 | 为什么选它（课堂话术） |
|------|------|------------------------|
| **TypeScript (TS)** | 带类型的 JavaScript | 接口字段多，用 `interface` 对照 Swagger 少写错；编辑器有自动提示 |
| **Vite** | 开发服务器 + 打包 | 启动快、改代码浏览器马上热更新；内置代理解决跨域 |
| **原生 HTML** | 页面结构 | 不引入 Vue/React，零基础先看清「HTML + 请求」本质，降低框架学习成本 |
| **Alpine.js** | 页面里的「小状态」 | 用 `x-model`、`x-text` 绑定数据，比手写 `document.getElementById` 简洁；比 Vue 轻很多 |
| **Navigo** | 前端路由 | URL 形如 `#/users`，切换页面不刷新整站；配置集中在 `routes.ts` |
| **Shoelace** | UI 组件（按钮、对话框） | Web Components，登录按钮、确认框用现成组件，样式统一 |
| **UnoCSS** | 原子类 CSS | 如 `input-base` 快捷类；全局变量在 `style.css` |
| **fetch（经 apiClient 封装）** | 发 HTTP | 浏览器标准 API；统一加 token、统一处理 401 |

**为什么本课程不用 Vue / React？**

- 目标先是 **「会对接 REST + 会看 Network」**，不是先学框架生命周期。  
- 用户管理一个功能就涉及 4～5 个文件，拆得清楚，方便对照后端分层。  
- 以后若上 Vue/React，**model / api / 页面** 三层思路可以直接迁移。

---

### 0.3 项目目录架构（必背一张图）

```
frontend-web/src/
├── main.ts              # 入口：调用 bootstrap()
├── app.ts               # 启动：鉴权 hooks + 路由
├── style.css            # 全局样式
│
├── core/                # 【公共能力】全站共用，业务页不要复制粘贴这里面的逻辑
│   ├── http/apiClient.ts    # 所有 HTTP 都走这里（带 token）
│   ├── auth/                # 登录、token、session
│   ├── router/              # Navigo 路由、守卫、routes.ts
│   ├── rbac/                # 权限、菜单过滤
│   └── ui/                  # 布局 AppShell、ConfirmDialog 等
│
├── pages/               # 【页面模块】按业务分包，和 Swagger 资源对应
│   └── users/
│       ├── users.model.ts   # 类型（对齐 JSON）
│       ├── users.api.ts     # 5 个接口函数
│       └── list.page.ts     # 路由挂载入口（薄）
│
├── scripts/pages/       # 【页面逻辑】Alpine 组件（状态、调 api、校验）
│   └── users/list.ts
│
└── templates/pages/     # 【页面 HTML】模板（表格、表单、x-model）
    └── users/list.html
```

**记忆口诀：**

- `core` = 水电煤（路由、登录、请求）  
- `pages/users` = 用户业务的数据与接口  
- `scripts` = 用户页面怎么动  
- `templates` = 用户页面长什么样  

**和 Java 后端对照（帮助学过 Spring 的同学）：**

| 前端 | 后端 |
|------|------|
| `users.model.ts` | Entity / DTO 字段定义 |
| `users.api.ts` | Controller 里的 URL + 方法 |
| `list.ts` | Service + 一点 Controller 编排 |
| `list.html` | 以前的 JSP / 前端模板 |
| `apiClient` | RestTemplate / Feign 公共配置 |

---

### 0.4 TypeScript 速成（本仓库够用的语法）

TypeScript = JavaScript + **类型标注**。浏览器跑的是 JS，TS 在保存时由 Vite 编译成 JS。

#### （1）`interface` — 描述 JSON 长什么样

Swagger 里 `UserResponse` 有 `id`、`username`……就在代码里写：

```ts
export interface UserVO {
  id: number
  username: string
  displayName: string
  status: number   // 1 正常  0 禁用
}
```

**好处：** 写 `user.` 时 IDE 会提示有哪些字段，拼错 `displayname` 会报错。

#### （2）`type` — 联合类型、字面量

```ts
type DialogMode = 'create' | 'edit' | null   // 只能是这三种之一
```

#### （3）`import` / `export` — 模块拆分

```ts
// users.api.ts 导出
export const usersApi = { list() { ... } }

// list.ts 导入
import { usersApi } from '@/pages/users/users.api'
```

`@/` 表示 `src/` 目录（在 `vite.config.ts` 里配置的别名）。

#### （4）`async` / `await` — 等待接口返回

HTTP 是异步的，不要指望下一行立刻有数据：

```ts
async loadData() {
  const res = await usersApi.list({ current: 1, pageSize: 10 })
  if (!res.ok) {
    this.error = res.error.message
    return
  }
  this.data = res.data.records   // 成功才有 data
}
```

#### （5）`Promise<ApiResult<T>>` — 本项目统一的返回格式

`apiClient` 不直接抛异常，而是：

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError }
```

所以**每次调接口都要判断 `res.ok`**，和 Go 的 `(data, err)` 类似。

#### （6）泛型 `PageResponse<UserVO>`

```ts
interface PageResponse<T> {
  records: T[]
  total: number
}
```

`T` 换成 `UserVO`，表示「这一页里每条记录是用户」。

#### （7）可选字段 `?` 与展开 `...`

```ts
interface UserCreatePayload {
  username: string
  password: string
  email?: string    // 可以不传
}

// 有条件地带上筛选参数
usersApi.list({
  current: 1,
  pageSize: 10,
  ...(this.filters.username && { username: this.filters.username }),
})
```

---

### 0.5 Alpine.js：页面上数据怎么「联动」

在 HTML 根节点声明组件：

```html
<div x-data="userListComponent()" x-init="init()">
  <p x-text="error"></p>
  <input x-model="form.username">
  <button @click="loadData(1)">刷新</button>
</div>
```

| 指令 | 含义 |
|------|------|
| `x-data` | 绑定 `list.ts` 里 `return { ... }` 的对象 |
| `x-init` | 进入页面时执行 `init()` |
| `x-text` | 显示变量文本 |
| `x-model` | 输入框双向绑定 |
| `@click` | 点击调用方法 |
| `x-show` | 为 true 时显示（可多个并列元素） |
| `x-for` | 循环渲染表格行 |
| `template x-if` | 条件渲染，**模板内只能有一个根元素**（重要坑） |

组件在 `list.page.ts` 注册：

```ts
Alpine.data('userListComponent', userListComponent)
```

---

### 0.6 路由：从输入 URL 到显示用户页

1. 浏览器地址：`http://localhost:5173/#/users`（**hash 路由**，`#` 后面是路径）  
2. `routes.ts` 里配置 `path: '/users'` → 加载 `list.page.ts`  
3. `list.page.ts` 的 `mount()` 把 `templates/.../list.html` 插入 `#page-content`  
4. HTML 里 `x-init="init()"` 触发 `loadData()` → 调 `usersApi.list()`  

登录页、侧边栏在 `AppShell` 里，不随业务页销毁；只有中间 `#page-content` 换内容。

---

### 0.7 登录与 JWT：为什么列表接口能通？

1. 登录 `POST /auth/login` → 后端返回 `{ token, username, role }`  
2. `token.store` 把 token 存进 `localStorage`  
3. 之后每次 `apiClient` 请求自动加头：`Authorization: Bearer <token>`  
4. 用户管理接口要求 **ADMIN** 角色，所以要用 `admin` 账号登录  

开发时请求路径：

- 代码里写：`/users`  
- 实际发出：`http://localhost:5173/api/users`（Vite 代理）  
- 代理转发：`http://localhost:8080/users`（后端）

---

## 0.8 上课前先准备好（环境）

### 0.8.1 启动后端 + 前端

```bash
# 终端 1：后端（Java 21）
cd backend-server
./mvnw spring-boot:run
# 看到 Started ProSkillApplication

# 终端 2：前端（Node 18+，推荐 pnpm）
cd frontend-web   # 或你 clone 的 warehouse-frontend
pnpm install
pnpm dev
# 浏览器打开 http://localhost:5173
```

### 0.8.2 理解请求怎么走（必讲）

```
浏览器页面 (#/users)
    │  Alpine 组件 list.ts 里调用 usersApi.xxx()
    ▼
users.api.ts（拼 URL、发 HTTP）
    ▼
apiClient.ts（自动加 Authorization: Bearer token）
    ▼
Vite 代理 /api → http://localhost:8080
    ▼
后端 UserController（Swagger 里那 5 个接口）
```

**vite.config.ts** 里已有：

```ts
proxy: {
  '/api': { target: 'http://localhost:8080', rewrite: (p) => p.replace(/^\/api/, '') },
}
```

所以前端写 `apiClient.get('/users')` 实际访问 `http://localhost:8080/users`。

### 0.8.3 先登录（拿 token）

1. 打开 http://localhost:5173 ，进入登录页  
2. 账号：**admin**，密码：**Admin@123**  
3. 登录成功后，`token` 存在 localStorage，`apiClient` 每次请求会自动带 `Bearer` 头  

可在浏览器 **F12 → Network** 里点开任意 `/api/users` 请求，看 Request Headers 是否有 `Authorization`。

### 0.8.4 对照 Swagger（后端）

打开 http://localhost:8080/swagger-ui/index.html ，分组 **用户管理**：

| # | 方法 | 路径 | 前端对应 |
|---|------|------|----------|
| 1 | GET | `/users` | `usersApi.list` |
| 2 | GET | `/users/{id}` | `usersApi.getById` |
| 3 | POST | `/users` | `usersApi.create` |
| 4 | PUT | `/users/{id}` | `usersApi.update` |
| 5 | DELETE | `/users/{id}` | `usersApi.remove`（页面文案叫「禁用」） |

**每做一个接口：先在 Swagger 点通 → 再写前端 → 再在网页上点通。**

---

## 1. 从零要做哪些文件？（从前到后）

| 顺序 | 文件 | 作用 |
|------|------|------|
| ① | `src/pages/users/users.model.ts` | TypeScript 类型：和后端 JSON 字段对齐 |
| ② | `src/pages/users/users.api.ts` | 封装 5 个 HTTP 调用 |
| ③ | `src/scripts/pages/users/list.ts` | Alpine 逻辑：加载、翻页、弹窗、提交 |
| ④ | `src/templates/pages/users/list.html` | 页面 HTML + Alpine 指令 |
| ⑤ | `src/pages/users/list.page.ts` | 路由挂载：注册组件、加载模板 |
| ⑥ | `src/core/router/routes.ts` | 已有 `/users` 路由时可跳过 |

**分层口诀（对应后端）：**

| 后端 | 前端 |
|------|------|
| CreateUserRequest | `UserCreatePayload` |
| UserResponse | `UserVO` |
| UserController | `usersApi` + 页面事件 |
| 返回 JSON | `users.model.ts` 里 interface |

---

## 2. 第一步：数据模型 `users.model.ts`

### 2.1 在 Swagger 里看什么

打开 **GET /users** 的 200 响应 schema → `UserPageResponse` → `records` 里每一项是 `UserResponse`。

记下字段（**没有 password**）：

- id, username, displayName, role, email, phone, status, createdAt, updatedAt

### 2.2 要写的代码

```ts
/** 一条用户记录，对应后端 UserResponse */
export interface UserVO {
  id: number
  username: string
  displayName: string
  email: string
  phone: string
  role: string
  status: number   // 1 正常  0 禁用
  createdAt: string
  updatedAt: string
}

/** 分页结构，和 GET /users 响应一致 */
export interface PageResponse<T> {
  current: number
  pageSize: number
  total: number
  records: T[]
}
```

再为 **POST / PUT** 准备请求体类型（对照 Swagger 的 `CreateUserRequest`、`UpdateUserRequest`）。

### 2.3 验证

此步无页面效果；保存后 `pnpm dev` 不报错即可。

---

## 3. 接口一：分页列表 `GET /users`

### 3.1 Swagger 先点通

1. 后端 Swagger → **GET /users** → Try it out  
2. current=1, pageSize=10 → Execute  
3. 记住 JSON 里 `records`、`total` 长什么样  

### 3.2 写 `users.api.ts` — `list`

```ts
export const usersApi = {
  list(query: UsersListQuery): Promise<ApiResult<PageResponse<UserVO>>> {
    const params = new URLSearchParams({
      current: String(query.current),
      pageSize: String(query.pageSize),
    })
    if (query.username) params.append('username', query.username)
    // role、status 同理
    return apiClient.get(`/users?${params}`)
  },
}
```

**要点：**

- 路径是 `/users`，不是 `/api/users`（`apiClient` 的 base 已是 `/api`）  
- 返回类型用 `PageResponse<UserVO>`，和 Swagger 一致  

### 3.3 写 `list.ts` — `loadData`

```ts
async loadData(page = 1) {
  this.loading = true
  const res = await usersApi.list({ current: page, pageSize: 10 })
  if (!res.ok) {
    this.error = res.error.message
    return
  }
  this.data = res.data.records
  this.total = res.data.total
  this.loading = false
}
```

在 `init()` 里调用 `this.loadData(1)`。

### 3.4 写 `list.html` — 表格

```html
<div x-data="userListComponent()" x-init="init()">
  <table>
    <template x-for="row in data" :key="row.id">
      <tr>
        <td x-text="row.username"></td>
        <td x-text="row.displayName"></td>
        <!-- ... -->
      </tr>
    </template>
  </table>
</div>
```

### 3.5 写 `list.page.ts`

```ts
Alpine.data('userListComponent', userListComponent)
export function mount(container: HTMLElement) {
  loadAndRender(container, 'pages/users/list.html')
}
```

### 3.6 浏览器验证

1. 登录 admin  
2. 打开 **#/users**  
3. 应看到表格有数据；F12 Network 有 `GET /api/users?current=1&pageSize=10` 状态 200  

### 3.7 常见失败

| 现象 | 原因 |
|------|------|
| 401 | 未登录或 token 过期，重新登录 |
| 403 | 当前账号不是 ADMIN |
| 空白页 | 没注册 `Alpine.data('userListComponent', ...)` |
| CORS/连不上 | 后端没启动或 vite 代理配错 |

---

## 4. 接口二：用户详情 `GET /users/{id}`

### 4.1 Swagger

**GET /users/{id}**，id 填 `1` → 响应是：

```json
{
  "user": { "id": 1, "username": "admin", ... },
  "message": "查询成功"
}
```

注意：用户对象在 **`user`** 字段里，不是根上直接平铺。

### 4.2 写 `users.api.ts` — `getById`

```ts
async getById(id: number): Promise<ApiResult<UserVO>> {
  const res = await apiClient.get<{ user: UserVO; message: string }>(`/users/${id}`)
  if (!res.ok) return res
  return { ok: true, data: res.data.user }  // 拆出 user
}
```

### 4.3 写 `list.ts` — 编辑前拉详情

```ts
async openEdit(row: UserVO) {
  const res = await usersApi.getById(row.id)
  if (!res.ok) { alert(res.error.message); return }
  this.dialogMode = 'edit'
  this.form = { ...从 res.data 填表... }
}
```

### 4.4 验证

点某一行的「编辑」，弹窗里数据与 Swagger 详情一致。

---

## 5. 接口三：创建用户 `POST /users`（重点）

### 5.1 Swagger

**POST /users**，body 示例：

```json
{
  "username": "student01",
  "password": "Password@123",
  "displayName": "学生01",
  "role": "OPERATOR",
  "email": "s@example.com",
  "phone": "13800138001"
}
```

**password 必填**（6～100 位）。成功响应：

```json
{
  "userId": 5,
  "user": { ... },
  "message": "创建成功"
}
```

### 5.2 写 `users.model.ts` — `UserCreatePayload`

字段与 Swagger `CreateUserRequest` 一致。

### 5.3 写 `users.api.ts` — `create`

```ts
async create(data: UserCreatePayload): Promise<ApiResult<UserVO>> {
  const res = await apiClient.post<{ userId: number; user: UserVO; message: string }>(
    '/users',
    data,
  )
  if (!res.ok) return res
  return { ok: true, data: res.data.user }
}
```

### 5.4 写弹窗表单（创建）

**必填：用户名、密码、角色**（与后端校验一致）。

表单 HTML 见 `templates/pages/users/list.html` 里 `dialogMode === 'create'` 区块。

### 5.5 ⚠️ 重要坑：Alpine `template x-if` 只能有一个根元素

错误写法（页面上**只会显示用户名，密码框消失**）：

```html
<template x-if="dialogMode === 'create'">
  <div>用户名</div>
  <div>密码</div>   <!-- 第二个 div 会被 Alpine 忽略！ -->
</template>
```

正确写法（二选一）：

```html
<!-- 方案 A：外面包一层 div -->
<template x-if="dialogMode === 'create'">
  <div>
    <div>用户名</div>
    <div>密码</div>
  </div>
</template>

<!-- 方案 B：用 x-show（本项目采用） -->
<div x-show="dialogMode === 'create'">
  <div>用户名</div>
  <div>密码</div>
</div>
```

### 5.6 写 `submitForm` 创建分支

```ts
const res = await usersApi.create({
  username: this.form.username.trim(),
  password: this.form.password,
  displayName: this.form.displayName.trim() || username,
  role: this.form.role,
  email: this.form.email || undefined,
  phone: this.form.phone || undefined,
})
```

### 5.7 验证

1. 点「新增用户」→ 能看到**密码**输入框  
2. 填表保存 → Network 有 `POST /api/users` 200  
3. 列表出现新用户；Swagger **GET /users** 也能查到  

---

## 6. 接口四：更新用户 `PUT /users/{id}`

### 6.1 Swagger

**PUT /users/{id}**，body 对应 `UpdateUserRequest`：

- displayName、role 必填  
- email、phone、status、password 可选（password 不传则不修改）  

响应：`{ "user": {...}, "message": "更新成功" }`

### 6.2 写 `users.api.ts` — `update`

```ts
async update(id: number, data: UserUpdatePayload): Promise<ApiResult<UserVO>> {
  const res = await apiClient.put<{ user: UserVO; message: string }>(`/users/${id}`, data)
  if (!res.ok) return res
  return { ok: true, data: res.data.user }
}
```

### 6.3 编辑表单

- 用户名只读（改账号不走这个接口）  
- 可改显示名、角色、邮箱、手机、状态  
- 新密码留空 = 不改密码  

### 6.4 验证

改显示名 → 保存 → 表格与 Swagger 详情一致。

---

## 7. 接口五：禁用用户 `DELETE /users/{id}`

### 7.1 Swagger

**DELETE /users/{id}** → `{ "userId": 5, "message": "禁用成功" }`  

后端是**软删除**：`status` 变为 `0`，行还在库里。

### 7.2 写 `users.api.ts` — `remove`

```ts
async remove(id: number): Promise<ApiResult<void>> {
  const res = await apiClient.delete(`/users/${id}`)
  if (!res.ok) return res
  return { ok: true, data: undefined }
}
```

### 7.3 确认框（必用能弹窗的 confirm）

使用 `@/core/ui/components/ConfirmDialog`（内部 `sl-dialog`）。

**不要用**未挂到 DOM 的 Alpine 假 confirm，否则点了「禁用」没反应。

```ts
import { confirm } from '@/core/ui/components/ConfirmDialog'

async handleDisable(row: UserVO) {
  const ok = await confirm({ title: '确认禁用', message: '...', danger: true })
  if (!ok) return
  const res = await usersApi.remove(row.id)
  if (res.ok) this.refresh()
}
```

### 7.4 验证

1. 点「禁用」→ 弹出确认框  
2. 确认后该行状态变「禁用」  
3. 该用户无法再登录（后端登录会拒绝 status=0）  

---

## 8. 搜索筛选（GET /users 的 query 参数）

Swagger 上还有：`username`、`role`、`status`。

在 `list.ts` 的 `filters` 里绑定输入框，调用：

```ts
usersApi.list({
  current: 1,
  pageSize: 10,
  username: this.filters.username,
  role: this.filters.role,
  status: Number(this.filters.status), // 选「全部」时不传
})
```

---

## 9. 自检清单（下课前）

- [ ] 五个接口在 Swagger 均能 200（用 admin token）  
- [ ] 前端 `#/users` 列表能加载  
- [ ] 能新增用户且表单有**密码**  
- [ ] 能编辑、能禁用，禁用后状态变灰  
- [ ] F12 里失败请求能看懂 400/401/403 的 `message`  
- [ ] 知道 `users.api.ts` 与 `list.ts` 的分工  

---

## 10. 与后端教案对照

| 后端文档 | 前端文档 |
|----------|----------|
| `backend-server/docs/用户管理CRUD全流程.md` | 本文 |
| `backend-server/docs/用户管理CRUD上课教案.md` | `用户管理前端上课教案.md` |

建议：**先上后端 Swagger + 五接口，再上本前端对接**（约 2+2 学时）。
