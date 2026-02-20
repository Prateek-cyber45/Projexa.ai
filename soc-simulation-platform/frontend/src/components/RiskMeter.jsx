/**
 * RiskMeter.jsx — Animated semi-circular risk gauge.
 * Props: value (0-100), label
 */
export default function RiskMeter({ value = 0, label = 'RISK LEVEL' }) {
  const clamped = Math.min(100, Math.max(0, value))

  // SVG arc math
  const R = 70, cx = 90, cy = 90
  const startAngle = 180
  const endAngle = startAngle + (clamped / 100) * 180
  const toRad = (deg) => (deg * Math.PI) / 180
  const x1 = cx + R * Math.cos(toRad(startAngle))
  const y1 = cy + R * Math.sin(toRad(startAngle))
  const x2 = cx + R * Math.cos(toRad(endAngle))
  const y2 = cy + R * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  const color = clamped < 30 ? '#22c55e' : clamped < 60 ? '#eab308' : clamped < 80 ? '#f97316' : '#ef4444'
  const bgColor = '#1f2937'

  const label2 = clamped < 30 ? 'LOW' : clamped < 60 ? 'MODERATE' : clamped < 80 ? 'HIGH' : 'CRITICAL'
  const labelColor = clamped < 30 ? 'text-green-400' : clamped < 60 ? 'text-yellow-400' : clamped < 80 ? 'text-orange-400' : 'text-red-400'

  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <svg width="180" height="110" viewBox="0 0 180 100">
        {/* Background arc */}
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke={bgColor} strokeWidth="14" strokeLinecap="round" />
        {/* Filled arc */}
        {clamped > 0 && (
          <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        )}
        {/* Value text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
          fontSize="24" fontWeight="bold" fontFamily="monospace">{clamped}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280"
          fontSize="9" fontFamily="monospace">/ 100</text>
      </svg>
      <span className={`text-sm font-bold font-mono -mt-2 ${labelColor}`}>{label2}</span>
    </div>
  )
}
