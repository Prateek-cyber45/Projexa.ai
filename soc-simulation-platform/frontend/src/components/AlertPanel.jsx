/**
 * AlertPanel.jsx — Live scrolling alert feed (sidebar or full width).
 * Props: logs (array), maxHeight, onSelect(log)
 */
const SEV_STYLES = {
  critical: { bar: 'bg-red-500',    row: 'border-red-900   bg-red-950/40',  badge: 'bg-red-900  text-red-300',    dot: 'bg-red-500'    },
  high:     { bar: 'bg-orange-500', row: 'border-orange-900 bg-orange-950/20', badge: 'bg-orange-900 text-orange-300', dot: 'bg-orange-500' },
  medium:   { bar: 'bg-yellow-500', row: 'border-yellow-900 bg-yellow-950/10', badge: 'bg-yellow-900 text-yellow-300', dot: 'bg-yellow-500' },
  low:      { bar: 'bg-blue-500',   row: 'border-gray-800  bg-gray-900/50', badge: 'bg-gray-800  text-blue-300',   dot: 'bg-blue-500'   },
}

export default function AlertPanel({ logs = [], maxHeight = '400px', onSelect }) {
  return (
    <div className="overflow-y-auto font-mono text-xs" style={{ maxHeight }}>
      {logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <span className="text-3xl mb-2">📡</span>
          <p>Waiting for events...</p>
        </div>
      )}
      {logs.map((log) => {
        const sev = log.severity || 'low'
        const s = SEV_STYLES[sev] || SEV_STYLES.low
        return (
          <div key={log.id}
            onClick={() => onSelect?.(log)}
            className={`flex items-stretch mb-1 border rounded cursor-pointer
                        hover:brightness-125 transition-all ${s.row}`}>
            {/* Left severity bar */}
            <div className={`w-1 rounded-l shrink-0 ${s.bar}`} />
            <div className="px-3 py-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${s.badge}`}>{sev}</span>
                <span className="text-gray-200 font-semibold truncate">{log.event_type}</span>
                {log.is_anomaly && (
                  <span className="ml-auto flex items-center gap-1 text-red-400 font-bold">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />
                    ANOMALY
                  </span>
                )}
              </div>
              <div className="text-gray-400 truncate">{log.raw_payload}</div>
              <div className="flex gap-3 mt-0.5 text-gray-600">
                <span>{log.source_ip}</span>
                <span>→</span>
                <span>{log.dest_ip}:{log.dest_port}</span>
                <span className="text-gray-700">{log.protocol}</span>
                {log.threat_label && log.threat_label !== 'benign' && (
                  <span className="text-purple-400 ml-auto">{log.threat_label}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
