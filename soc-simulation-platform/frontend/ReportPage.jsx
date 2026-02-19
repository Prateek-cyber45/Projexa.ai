import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import api from '../utils/api'

const GRADE_COLORS = { A:'text-green-400', B:'text-blue-400', C:'text-yellow-400', D:'text-orange-400', F:'text-red-400' }
const GRADE_BG = { A:'bg-green-950 border-green-700', B:'bg-blue-950 border-blue-700', C:'bg-yellow-950 border-yellow-700', D:'bg-orange-950 border-orange-700', F:'bg-red-950 border-red-700' }

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, sRes] = await Promise.all([
          api.get('/get-report', { params: { simulation_id: id } }),
          api.get('/get-score', { params: { simulation_id: id } }),
        ])
        setReport(rRes.data)
        setScore(sRes.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Report not available yet.')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-green-400">LOADING REPORT...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="text-green-500 hover:underline text-sm">← Back to Dashboard</button>
    </div>
  )

  const radarData = report ? [
    { subject: 'Detection', value: report.technical_breakdown.detection_accuracy },
    { subject: 'Response Speed', value: Math.max(0, 100 - report.technical_breakdown.response_speed_sec) },
    { subject: 'Accuracy', value: report.pressure_breakdown.decision_accuracy },
    { subject: 'Pressure', value: report.pressure_breakdown.pressure_score },
    { subject: 'Technical', value: report.technical_breakdown.technical_score },
  ] : []

  const barData = score ? [
    { name: 'Technical', score: score.technical_score, fill: '#22c55e' },
    { name: 'Pressure', score: score.pressure_score, fill: '#3b82f6' },
    { name: 'Final', score: score.final_score, fill: '#a855f7' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-green-900 pb-4">
          <div>
            <h1 className="text-green-400 text-xl font-bold">🛡 PERFORMANCE REPORT</h1>
            <p className="text-gray-500 text-xs mt-1">Simulation ID: {id}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-green-600 hover:text-green-400 text-sm">← DASHBOARD</button>
        </div>

        {/* Grade Card */}
        {score && (
          <div className={`border rounded-xl p-6 mb-6 text-center ${GRADE_BG[score.grade] || 'bg-gray-900 border-gray-700'}`}>
            <div className={`text-8xl font-bold mb-2 ${GRADE_COLORS[score.grade] || 'text-gray-400'}`}>{score.grade}</div>
            <div className="text-gray-300 text-2xl font-bold">{score.final_score.toFixed(1)} / 100</div>
            <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">{score.feedback}</p>
          </div>
        )}

        {/* Score Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-green-900 rounded-lg p-4">
            <h3 className="text-green-300 text-xs font-bold uppercase tracking-widest mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[0,100]} stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5' }} />
                <Bar dataKey="score" radius={[4,4,0,0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-green-900 rounded-lg p-4">
            <h3 className="text-green-300 text-xs font-bold uppercase tracking-widest mb-4">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {report && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 border border-green-900 rounded-lg p-6">
              <h3 className="text-green-300 text-xs font-bold uppercase tracking-widest mb-4">Technical Performance</h3>
              <div className="space-y-3">
                {Object.entries(report.technical_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{key.replace(/_/g,' ').toUpperCase()}</span>
                    <span className="text-green-300 font-bold text-sm">
                      {typeof val === 'number' ? val.toFixed(1) : val}
                      {key.includes('rate') || key.includes('accuracy') || key.includes('score') ? '%' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-blue-900 rounded-lg p-6">
              <h3 className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Decision Under Pressure</h3>
              <div className="space-y-3">
                {Object.entries(report.pressure_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{key.replace(/_/g,' ').toUpperCase()}</span>
                    <span className="text-blue-300 font-bold text-sm">
                      {typeof val === 'number' ? val.toFixed(2) : val}
                      {key.includes('accuracy') || key.includes('score') ? '%' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report?.recommendations?.length > 0 && (
          <div className="bg-gray-900 border border-yellow-900 rounded-lg p-6">
            <h3 className="text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4">⚡ IMPROVEMENT RECOMMENDATIONS</h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 mt-0.5">▸</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
