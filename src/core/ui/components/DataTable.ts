export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (row: T, col: Column<T>) => string
}

export interface DataTableOptions<T> {
  columns: Column<T>[]
  data: T[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
  empty?: string
  onPageChange?: (page: number) => void
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  onRowAction?: (action: string, row: T) => void
}

let _sortKey = ''
let _sortDir: 'asc' | 'desc' = 'asc'

export function renderDataTable<T>(
  container: HTMLElement,
  opts: DataTableOptions<T>,
): void {
  const {
    columns,
    data,
    total,
    page,
    pageSize,
    loading = false,
    empty = '暂无数据',
    onPageChange,
    onSort,
    onRowAction,
  } = opts

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const headerHtml = columns
    .map((col) => {
      const sortIcon =
        col.sortable
          ? _sortKey === col.key
            ? _sortDir === 'asc'
              ? ' ↑'
              : ' ↓'
            : ' ↕'
          : ''
      return `<th class="${col.sortable ? 'sortable' : ''}" data-sort="${col.sortable ? col.key : ''}" style="${col.width ? `width:${col.width}` : ''}">${col.label}${sortIcon}</th>`
    })
    .join('')

  const bodyHtml = loading
    ? `<tr><td colspan="${columns.length}" class="table-loading">加载中…</td></tr>`
    : data.length === 0
      ? `<tr><td colspan="${columns.length}" class="table-empty">${empty}</td></tr>`
      : data
          .map(
            (row) =>
              `<tr>
                ${columns.map((col) => `<td>${col.render ? col.render(row, col) : String((row as Record<string, unknown>)[col.key] ?? '')}</td>`).join('')}
              </tr>`,
          )
          .join('')

  const paginationHtml = `
    <div class="pagination">
      <span>共 ${total} 条，第 ${page}/${totalPages} 页</span>
      <div class="pagination-btns">
        <button class="btn btn-ghost btn-sm" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
        <button class="btn btn-ghost btn-sm" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
      </div>
    </div>
  `

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>${bodyHtml}</tbody>
      </table>
      ${paginationHtml}
    </div>
  `

  // sort
  container.querySelectorAll('[data-sort]').forEach((th) => {
    const key = th.getAttribute('data-sort')
    if (!key) return
    th.addEventListener('click', () => {
      if (_sortKey === key) {
        _sortDir = _sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        _sortKey = key
        _sortDir = 'asc'
      }
      onSort?.(key, _sortDir)
    })
  })

  // pagination
  container.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.getAttribute('data-page') ?? '1')
      if (p >= 1 && p <= totalPages) onPageChange?.(p)
    })
  })

  // row actions
  container.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const action = (e.currentTarget as HTMLElement).getAttribute('data-action') ?? ''
      const rowIdx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-row-idx') ?? '0')
      onRowAction?.(action, data[rowIdx])
    })
  })
}
