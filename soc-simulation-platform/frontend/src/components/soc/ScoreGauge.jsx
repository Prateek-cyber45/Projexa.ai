/**
 * ScoreGauge.jsx — Animated circular score display with grade.
 * Props: score (0-100), grade (A/B/C/D/F), size ('sm' | 'md' | 'lg')
 */
const GRADE_COLOR = {
  'A+': '#22c55e', A: '#22c55e', 'A-': '#4ade80',
  'B+': '#3b82f6', B: '#3b82f6', 'B-': '#60a5fa',
  'C+': '#eab308', C: '#eab308', 'C-': '#facc15',
  D: '#f97316', F: '#ef4444',
}

export default function ScoreGauge({ score = 0, grade = 'F', size = 'md' }) {
  const dims = { sm: 100, md: 140, lg: 180 }[size] || 140
  const r = dims * 0.38
  const cx = dims / 2, cy = dims / 2
  const circumference = 2 * Math.PI * r
  const filled = ((Math.min(100, Math.max(0, score)) / 100) * circumference)
  const color = GRADE_COLOR[grade] || '#ef4444'

  const fSize = { sm: '20px', md: '30px', lg: '40px' }[size]
  const gSize = { sm: '12px', md: '16px', lg: '20px' }[size]

  return (
    <svg width={dims} height={dims} viewBox={`0 0 ${dims} ${dims}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={dims * 0.08} />
      {/* Progress */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={dims * 0.08}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 0.8s ease' }}
      />
      {/* Score text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
        fontSize={fSize} fontWeight="bold" fontFamily="monospace">{score.toFixed(0)}</text>
      <text x={cx} y={cy + parseInt(gSize) + 4} textAnchor="middle" fill={color}
        fontSize={gSize} fontWeight="bold" fontFamily="monospace"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}>{grade}</text>
    </svg>
  )
}
