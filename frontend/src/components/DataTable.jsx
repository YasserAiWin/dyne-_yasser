// Generic responsive table.
// columns: [{ key, header, render?, align?, className? }]
// On mobile it falls back to a stacked card layout per row.
export default function DataTable({ columns, data, keyField = 'id', emptyText = 'لا توجد بيانات' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </div>
        <p className="text-sm text-ink-400">{emptyText}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-ink-500 ${
                    col.align === 'center' ? 'text-center' : 'text-right'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => (
              <tr key={row[keyField]} className="table-row-hover">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 text-sm text-ink-700 ${
                      col.align === 'center' ? 'text-center' : 'text-right'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div key={row[keyField]} className="rounded-xl border border-slate-100 p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-ink-400">{col.header}</span>
                <span className="text-sm font-medium text-ink-700">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
