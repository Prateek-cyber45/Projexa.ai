/**
 * LogTable.jsx — Full feature log table with filters, search, sort, pagination.
 * Props: logs (array), onAnalyze(log)
 */
import { useState, useMemo } from 'react'

const SEV_COLOR = {
  critical: 'text-red-400',
  high:     'text-orange-400',
  medium:   'text-yellow-400',
  low:      'text-blue-400',
}
const SEV_BG = {
  critical: 'bg-red-950/50 border-red-900',
  high:     'bg-orange-950/50 border-orange-900',
  medium:   'bg-yellow-950/30 border-yellow-900',
  low:      'bg-gray-900 border-gray-800',
}

export default function LogTable({ logs = [], onAnalyze }) {
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')
  const [anomalyOnly, setAnomalyOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [sortDir, setSortDir] = useState('desc')
  const PER_PAGE = 20

  const filtered = useMemo(() => {
    let out = [...logs]
    if (search)       out = out.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
    if (sevFilter !== 'all') out = out.filter(l => l.severity === sevFilter)
    if (anomalyOnly)  out = out.filter(l => l.is_anomaly)
    out.sort((a, b) => {
      const ta = new Date(a.timestamp), tb = new Date(b.timestamp)
      return sortDir === 'desc' ? tb - ta : ta - tb
    })
    return out
  }, [logs, search, sevFilter, anomalyOnly, sortDir])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const severities = ['all', 'critical', 'high', 'medium', 'low']
  const SEV_BTN = {
    all:      'bg-gray-700 text-gray-200',
    critical: 'bg-red-900 text-red-300',
    high:     'bg-orange-900 text-orange-300',
    medium:   'bg-yellow-900 text-yellow-300',
    low:      'bg-blue-900 text-blue-300',
  }

  return (
    <div className="font-mono text-xs">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search logs…"
          className="bg-gray-800 border border-gray-700 text-green-300 px-3 py-1.5 rounded outline-none
                     focus:border-green-600 w-48 placeholder-gray-600"
        />
        <div className="flex gap-1">
          {severities.map(s => (
            <button key={s}
              onClick={() => { setSevFilter(s); setPage(1) }}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-opacity
                          ${sevFilter === s ? SEV_BTN[s] : 'bg-gray-800 text-gray-500 opacity-60 hover:opacity-100'}`}>
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
          <input type="checkbox" checked={anomalyOnly} onChange={e => { setAnomalyOnly(e.target.checked); setPage(1) }}
            className="accent-green-500" />
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Anomalies only</span>
        </label>
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="text-gray-500 hover:text-green-400 text-[10px] border border-gray-700 px-2 py-1 rounded transition-colors">
          TIME {sortDir === 'desc' ? '↓' : '↑'}
        </button>
        <span className="text-gray-600 text-[10px] ml-1">{filtered.length} events</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-green-600 text-[10px] uppercase tracking-wider">
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Severity</th>
              <th className="text-left px-3 py-2">Event Type</th>
              <th className="text-left px-3 py-2">Source → Dest</th>
              <th className="text-left px-3 py-2">Threat Label</th>
              <th className="text-left px-3 py-2">Anomaly %</th>
              <th className="text-left px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(log => {
              const s = log.severity || 'low'
              return (
                <tr key={log.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors cursor-pointer
                               ${log.is_anomaly ? 'border-l-2 border-l-red-500' : ''}`}>
                  <td className="px-3 py-1.5 text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`font-bold uppercase ${SEV_COLOR[s] || 'text-gray-400'}`}>{s}</span>
                  </td>
                  <td className="px-3 py-1.5 text-gray-300 max-w-[180px] truncate">{log.event_type}</td>
                  <td className="px-3 py-1.5 text-gray-500 whitespace-nowrap">
                    {log.source_ip} → {log.dest_ip}:{log.dest_port}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="text-purple-400">{log.threat_label || '—'}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    {log.anomaly_score != null && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-red-500"
                            style={{ width: `${(log.anomaly_score * 100).toFixed(0)}%` }} />
                        </div>
                        <span className="text-gray-400">{(log.anomaly_score * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <button onClick={() => onAnalyze?.(log)}
                      className="text-green-600 hover:text-green-300 font-bold transition-colors text-[10px] border
                                 border-green-900 hover:border-green-600 px-2 py-0.5 rounded">
                      ANALYZE
                    </button>
                  </td>
                </tr>
              )
            })}
            {paged.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-600">No events match the current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-3 justify-end">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="text-gray-500 hover:text-green-400 disabled:opacity-30 text-[10px] border border-gray-700 px-2 py-1 rounded">
            ← PREV
          </button>
          <span className="text-gray-500 text-[10px]">PAGE {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="text-gray-500 hover:text-green-400 disabled:opacity-30 text-[10px] border border-gray-700 px-2 py-1 rounded">
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}
