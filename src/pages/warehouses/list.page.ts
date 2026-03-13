import { warehousesApi } from './warehouses.api'
import { TYPE_LABELS, STATUS_LABELS, type WarehouseVO } from './warehouses.model'
import { renderDataTable, type Column } from '@/core/ui/components/DataTable'
import { confirm } from '@/core/ui/components/ConfirmDialog'

const PAGE_SIZE = 10
let _currentPage = 1
let _currentFilters: { code?: string; name?: string; type?: string; status?: string } = {}

const columns: Column<WarehouseVO>[] = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'code', label: '仓库编码', width: '100px' },
  { key: 'name', label: '仓库名称' },
  {
    key: 'type',
    label: '类型',
    width: '100px',
    render: (row) => `<span class="badge badge-blue">${TYPE_LABELS[row.type] ?? row.type}</span>`,
  },
  { key: 'address', label: '地址', width: '150px' },
  { key: 'manager', label: '负责人', width: '80px' },
  { key: 'phone', label: '电话', width: '100px' },
  {
    key: 'status',
    label: '状态',
    width: '70px',
    render: (row) => {
      const label = STATUS_LABELS[row.status] ?? String(row.status)
      const cls = row.status === 'ENABLED' ? 'badge-green' : 'badge-gray'
      return `<span class="badge ${cls}">${label}</span>`
    },
  },
  {
    key: 'actions',
    label: '操作',
    width: '120px',
    render: (row) => `
      <button class="btn btn-ghost btn-sm action-edit" data-id="${row.id}">✏️ 编辑</button>
      <button class="btn btn-ghost btn-sm action-delete" data-id="${row.id}" style="color:var(--clr-danger)">🗑️ 删除</button>
    `,
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

  const res = await warehousesApi.list({
    current: page,
    pageSize: PAGE_SIZE,
    ..._currentFilters,
  })

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
    empty: '暂无仓库数据',
    onPageChange: (p) => loadData(container, p),
  })

  // 绑定操作按钮事件
  tableEl.querySelectorAll('.action-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id') ?? '0')
      openEditDialog(container, id)
    })
  })

  tableEl.querySelectorAll('.action-delete').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id') ?? '0')
      const row = res.data.records.find((r) => r.id === id)
      if (row && (await confirmDelete(row.name))) {
        await handleDelete(container, id)
      }
    })
  })
}

async function confirmDelete(name: string): Promise<boolean> {
  return confirm({
    title: '确认删除',
    message: `确定要删除仓库"${name}"吗？此操作不可恢复。`,
    confirmLabel: '删除',
    cancelLabel: '取消',
    danger: true,
  })
}

async function handleDelete(container: HTMLElement, id: number): Promise<void> {
  const res = await warehousesApi.delete(id)
  if (res.ok) {
    // 刷新列表
    loadData(container, _currentPage)
  } else {
    alert(`删除失败：${res.error.message}`)
  }
}

function openEditDialog(container: HTMLElement, id?: number): void {
  const isEdit = !!id
  const title = isEdit ? '编辑仓库' : '新增仓库'
  
  // 创建弹窗
  const overlay = document.createElement('div')
  overlay.className = 'dialog-overlay'
  overlay.innerHTML = `
    <div class="dialog" style="max-width:500px">
      <div class="dialog-header">
        <h3>${title}</h3>
        <button class="btn btn-ghost btn-sm dialog-close">✕</button>
      </div>
      <div class="dialog-body">
        <form id="warehouse-form" class="form">
          <div class="form-group">
            <label class="form-label">仓库编码 <span style="color:var(--clr-danger)">*</span></label>
            <input type="text" name="code" class="form-input" ${isEdit ? 'disabled' : ''} required placeholder="请输入仓库编码">
          </div>
          <div class="form-group">
            <label class="form-label">仓库名称 <span style="color:var(--clr-danger)">*</span></label>
            <input type="text" name="name" class="form-input" required placeholder="请输入仓库名称">
          </div>
          <div class="form-group">
            <label class="form-label">仓库类型 <span style="color:var(--clr-danger)">*</span></label>
            <select name="type" class="form-input" required>
              <option value="">请选择类型</option>
              <option value="RAW_MATERIAL">原料仓</option>
              <option value="FINISHED_GOODS">成品仓</option>
              <option value="TRANSFER">中转仓</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">仓库地址</label>
            <input type="text" name="address" class="form-input" placeholder="请输入仓库地址">
          </div>
          <div class="form-group">
            <label class="form-label">负责人</label>
            <input type="text" name="manager" class="form-input" placeholder="请输入负责人姓名">
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input type="text" name="phone" class="form-input" placeholder="请输入联系电话">
          </div>
          <div class="form-group">
            <label class="form-label">库容量</label>
            <input type="number" name="capacity" class="form-input" placeholder="请输入库容量">
          </div>
          ${isEdit ? `
          <div class="form-group">
            <label class="form-label">状态</label>
            <select name="status" class="form-input">
              <option value="ENABLED">启用</option>
              <option value="DISABLED">停用</option>
            </select>
          </div>
          ` : ''}
        </form>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-ghost dialog-cancel">取消</button>
        <button class="btn btn-primary dialog-confirm">确定</button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  // 回显数据（编辑模式）
  if (isEdit && id) {
    warehousesApi.getById(id).then((res) => {
      if (res.ok) {
        const data = res.data
        const form = overlay.querySelector('#warehouse-form') as HTMLFormElement
        ;(form.elements.namedItem('code') as HTMLInputElement).value = data.code
        ;(form.elements.namedItem('name') as HTMLInputElement).value = data.name
        ;(form.elements.namedItem('type') as HTMLSelectElement).value = data.type
        ;(form.elements.namedItem('address') as HTMLInputElement).value = data.address || ''
        ;(form.elements.namedItem('manager') as HTMLInputElement).value = data.manager || ''
        ;(form.elements.namedItem('phone') as HTMLInputElement).value = data.phone || ''
        ;(form.elements.namedItem('capacity') as HTMLInputElement).value = String(data.capacity || '')
        if (isEdit) {
          ;(form.elements.namedItem('status') as HTMLSelectElement).value = data.status || 'ENABLED'
        }
      }
    })
  }

  // 关闭事件
  const closeDialog = () => {
    overlay.remove()
  }

  overlay.querySelector('.dialog-close')?.addEventListener('click', closeDialog)
  overlay.querySelector('.dialog-cancel')?.addEventListener('click', closeDialog)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog()
  })

  // 提交事件
  overlay.querySelector('.dialog-confirm')?.addEventListener('click', async () => {
    const form = overlay.querySelector('#warehouse-form') as HTMLFormElement
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formData = new FormData(form)
    const payload: any = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
    }

    const address = formData.get('address') as string
    if (address) payload.address = address

    const manager = formData.get('manager') as string
    if (manager) payload.manager = manager

    const phone = formData.get('phone') as string
    if (phone) payload.phone = phone

    const capacity = formData.get('capacity') as string
    if (capacity) payload.capacity = parseInt(capacity)

    if (isEdit) {
      payload.status = formData.get('status') as string
      const updateRes = await warehousesApi.update(id!, payload)
      if (updateRes.ok) {
        closeDialog()
        loadData(container, _currentPage)
      } else {
        alert(`更新失败：${updateRes.error.message}`)
      }
    } else {
      const createRes = await warehousesApi.create(payload)
      if (createRes.ok) {
        closeDialog()
        loadData(container, 1)
      } else {
        alert(`创建失败：${createRes.error.message}`)
      }
    }
  })
}

function openCreateDialog(container: HTMLElement): void {
  openEditDialog(container)
}

export function mount(container: HTMLElement): void {
  container.innerHTML = `
    <div>
      <div class="page-header">
        <h2 class="page-title">🏭 仓库管理</h2>
        <div class="page-actions">
          <button id="create-btn" class="btn btn-primary btn-sm">➕ 新增仓库</button>
          <button id="refresh-btn" class="btn btn-ghost btn-sm">🔄 刷新</button>
        </div>
      </div>
      
      <div class="card search-box" style="margin-bottom:1rem">
        <div class="search-form">
          <input type="text" id="search-code" class="form-input" placeholder="仓库编码/名称" style="width:200px">
          <select id="search-type" class="form-input" style="width:120px">
            <option value="">全部类型</option>
            <option value="RAW_MATERIAL">原料仓</option>
            <option value="FINISHED_GOODS">成品仓</option>
            <option value="TRANSFER">中转仓</option>
          </select>
          <select id="search-status" class="form-input" style="width:100px">
            <option value="">全部状态</option>
            <option value="ENABLED">启用</option>
            <option value="DISABLED">停用</option>
          </select>
          <button id="search-btn" class="btn btn-primary btn-sm">🔍 搜索</button>
          <button id="reset-btn" class="btn btn-ghost btn-sm">重置</button>
        </div>
      </div>
      
      <div id="table-container"></div>
    </div>
  `

  // 绑定事件
  container.querySelector('#create-btn')?.addEventListener('click', () => {
    openCreateDialog(container)
  })

  container.querySelector('#refresh-btn')?.addEventListener('click', () => {
    loadData(container, _currentPage)
  })

  container.querySelector('#search-btn')?.addEventListener('click', () => {
    const code = (container.querySelector('#search-code') as HTMLInputElement).value
    const type = (container.querySelector('#search-type') as HTMLSelectElement).value
    const status = (container.querySelector('#search-status') as HTMLSelectElement).value
    
    _currentFilters = {
      code: code || undefined,
      name: code || undefined, // 搜索框同时搜索编码和名称
      type: type || undefined,
      status: status || undefined,
    }
    loadData(container, 1)
  })

  container.querySelector('#reset-btn')?.addEventListener('click', () => {
    ;(container.querySelector('#search-code') as HTMLInputElement).value = ''
    ;(container.querySelector('#search-type') as HTMLSelectElement).value = ''
    ;(container.querySelector('#search-status') as HTMLSelectElement).value = ''
    _currentFilters = {}
    loadData(container, 1)
  })

  // 初始加载
  loadData(container, 1)
}
