/**
 * StatCard.jsx — Metric card with trend indicator and icon.
 * Props: title, value, sub, icon, color, trend (+5%), pulse
 */
export default function StatCard({ title, value, sub, icon, color = 'green', trend, pulse }) {
  const colorMap = {
    green:  'border-green-800  bg-green-950/30  text-green-400',
    red:    'border-red-800    bg-red-950/30    text-red-400',
    yellow: 'border-yellow-800 bg-yellow-950/30 text-yellow-400',
    blue:   'border-blue-800   bg-blue-950/30   text-blue-400',
    purple: 'border-purple-800 bg-purple-950/30 text-purple-400',
    gray:   'border-gray-700   bg-gray-800/30   text-gray-400',
  }
  const cls = colorMap[color] || colorMap.green

  return (
    <div className={`relative border rounded-lg p-4 font-mono ${cls} ${pulse ? 'animate-pulse-slow' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 text-xs uppercase tracking-widest">{title}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value ?? '—'}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {sub && <span className="text-gray-500 text-xs">{sub}</span>}
          {trend && (
            <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
