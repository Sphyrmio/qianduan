import { usersApi } from './users.api'
import { ROLE_LABELS, STATUS_LABELS, type UserVO } from './users.model'
import { renderDataTable, type Column } from '@/core/ui/components/DataTable'

const PAGE_SIZE = 10
let _currentPage = 1

const columns: Column<UserVO>[] = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'username', label: '用户名' },
  { key: 'displayName', label: '姓名/昵称' },
  {
    key: 'role',
    label: '角色',
    render: (row) =>
      `<span class="badge badge-blue">${ROLE_LABELS[row.role] ?? row.role}</span>`,
  },
  { key: 'email', label: '邮箱' },
  { key: 'phone', label: '手机号' },
  {
    key: 'status',
    label: '状态',
    render: (row) => {
      const label = STATUS_LABELS[row.status] ?? String(row.status)
      const cls = row.status === 1 ? 'badge-green' : 'badge-gray'
      return `<span class="badge ${cls}">${label}</span>`
    },
  },
  {
    key: 'createdAt',
    label: '创建时间',
    render: (row) => row.createdAt?.slice(0, 10) ?? '-',
  },
]

async function loadData(container: HTMLElement, page: number): Promise<void> {
  _currentPage = page
  const tableEl = container.querySelector<HTMLElement>('#table-container')!

  renderDataTable(tableEl, {
    columns,
    data: [],
    total: 0,
    page,
    pageSize: PAGE_SIZE,
    loading: true,
  })

  const res = await usersApi.list({ current: page, pageSize: PAGE_SIZE })

  if (!res.ok) {
    tableEl.innerHTML = `
      <div class="card state-box">
        <p style="color:var(--clr-danger)">${res.error.message}</p>
      </div>
    `
    return
  }

  const { records, total, current } = res.data

  renderDataTable(tableEl, {
    columns,
    data: records,
    total,
    page: current,
    pageSize: PAGE_SIZE,
    empty: '暂无用户数据',
    onPageChange: (p) => loadData(container, p),
  })
}

export function mount(container: HTMLElement): void {
  container.innerHTML = `
    <div>
      <div class="page-header">
        <h2 class="page-title">用户列表</h2>
        <button id="refresh-btn" class="btn btn-ghost btn-sm">刷新</button>
      </div>
      <div id="table-container"></div>
    </div>
  `

  container.querySelector('#refresh-btn')?.addEventListener('click', () => {
    loadData(container, _currentPage)
  })

  loadData(container, 1)
}
