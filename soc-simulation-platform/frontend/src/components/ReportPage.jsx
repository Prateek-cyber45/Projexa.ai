/**
 * ReportPage.jsx — Full performance report with charts, recommendations, MITRE summary.
 * Features: score gauge, radar chart, bar breakdown, pressure timeline,
 *           recommendation cards, exportable summary.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import ScoreGauge from '../components/ScoreGauge'
import MitrePanel from '../components/MitrePanel'

const GRADE_COLORS = {
  'A+': { text: 'text-green-300', border: 'border-green-500',  bg: 'bg-green-950/40',  glow: '#22c55e' },
  'A':  { text: 'text-green-300', border: 'border-green-500',  bg: 'bg-green-950/40',  glow: '#22c55e' },
  'A-': { text: 'text-green-400', border: 'border-green-600',  bg: 'bg-green-950/30',  glow: '#4ade80' },
  'B+': { text: 'text-blue-300',  border: 'border-blue-500',   bg: 'bg-blue-950/40',   glow: '#3b82f6' },
  'B':  { text: 'text-blue-300',  border: 'border-blue-500',   bg: 'bg-blue-950/40',   glow: '#3b82f6' },
  'B-': { text: 'text-blue-400',  border: 'border-blue-600',   bg: 'bg-blue-950/30',   glow: '#60a5fa' },
  'C+': { text: 'text-yellow-300',border: 'border-yellow-500', bg: 'bg-yellow-950/30', glow: '#eab308' },
  'C':  { text: 'text-yellow-300',border: 'border-yellow-500', bg: 'bg-yellow-950/30', glow: '#eab308' },
  'C-': { text: 'text-yellow-400',border: 'border-yellow-600', bg: 'bg-yellow-950/20', glow: '#facc15' },
  'D':  { text: 'text-orange-300',border: 'border-orange-600', bg: 'bg-orange-950/30', glow: '#f97316' },
  'F':  { text: 'text-red-300',   border: 'border-red-600',    bg: 'bg-red-950/30',    glow: '#ef4444' },
}

const REC_ICONS = {
  detection:  '🔍',
  response:   '⚡',
  accuracy:   '🎯',
  pressure:   '🧠',
  default:    '📋',
}

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')  // overview | technical | pressure | recommendations

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, sRes] = await Promise.all([
          api.get('/get-report', { params: { simulation_id: id } }),
          api.get('/get-score',  { params: { simulation_id: id } }),
        ])
        setReport(rRes.data)
        setScore(sRes.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Report not available yet. Did the simulation finish?')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-green-400 font-mono text-sm animate-pulse">COMPILING REPORT...</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">⚠</span>
        <p className="text-red-400 font-mono text-sm">{error}</p>
        <button onClick={() => navigate('/dashboard')}
          className="text-green-500 hover:underline text-sm font-mono">← Back to Dashboard</button>
      </div>
    </div>
  )

  const gcls = GRADE_COLORS[score?.grade] || GRADE_COLORS['F']

  /* ── Chart data ──────────────────────────────────────────────────────── */
  const radarData = report ? [
    { subject: 'Detection',     A: report.technical_breakdown.detection_accuracy },
    { subject: 'Response Spd',  A: Math.max(0, 100 - (report.technical_breakdown.response_speed_sec / 30) * 100) },
    { subject: 'Dec. Accuracy', A: report.pressure_breakdown.decision_accuracy },
    { subject: 'Tech Score',    A: report.technical_breakdown.technical_score },
    { subject: 'Pressure',      A: report.pressure_breakdown.pressure_score },
    { subject: 'Final',         A: score?.final_score || 0 },
  ] : []

  const barData = score ? [
    { name: 'Technical', score: score.technical_score, fill: '#22c55e' },
    { name: 'Pressure',  score: score.pressure_score,  fill: '#3b82f6' },
    { name: 'Final',     score: score.final_score,     fill: '#a855f7' },
  ] : []

  const techBreakdownBars = report ? [
    { name: 'Detection',       val: report.technical_breakdown.detection_accuracy,  fill: '#22c55e' },
    { name: 'FP Rate',         val: report.technical_breakdown.false_positive_rate, fill: '#ef4444' },
    { name: 'Classification',  val: report.technical_breakdown.classification_accuracy ?? 0, fill: '#3b82f6' },
    { name: 'Technical Score', val: report.technical_breakdown.technical_score,     fill: '#a855f7' },
  ] : []

  const pressureBars = report ? [
    { name: 'Dec. Accuracy',  val: report.pressure_breakdown.decision_accuracy,  fill: '#22c55e' },
    { name: 'Priority',       val: report.pressure_breakdown.priority_accuracy ?? 0, fill: '#eab308' },
    { name: 'Stress Perf.',   val: Math.min(100, (report.pressure_breakdown.stress_performance ?? 0)), fill: '#f97316' },
    { name: 'Pressure Score', val: report.pressure_breakdown.pressure_score,     fill: '#3b82f6' },
  ] : []

  const TABS = [
    { id: 'overview',        label: '📊 OVERVIEW' },
    { id: 'technical',       label: '🔧 TECHNICAL' },
    { id: 'pressure',        label: '🧠 PRESSURE' },
    { id: 'recommendations', label: '💡 IMPROVE' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 font-mono">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back + title */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="text-green-700 hover:text-green-400 text-xs transition-colors">← BACK TO DASHBOARD</button>
          <span className="text-gray-600 text-[10px]">REPORT ID: {id?.slice(0, 8).toUpperCase()}</span>
        </div>

        {/* ── Hero grade card ────────────────────────────────────────── */}
        <div className={`border-2 rounded-2xl p-6 md:p-8 text-center ${gcls.border} ${gcls.bg}`}
          style={{ boxShadow: `0 0 40px ${gcls.glow}30` }}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ScoreGauge score={score?.final_score || 0} grade={score?.grade || 'F'} size="lg" />
            <div className="text-left">
              <p className={`text-5xl font-black ${gcls.text}`}>{score?.grade}</p>
              <p className="text-gray-400 text-sm mt-1">{score?.final_score?.toFixed(1)} / 100 points</p>
              <p className="text-gray-300 text-sm mt-3 max-w-sm leading-relaxed">{score?.feedback}</p>
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span>⏱ Avg decision: <span className="text-gray-300">{score?.avg_decision_time_sec?.toFixed(1)}s</span></span>
                <span>🎯 Decisions: <span className="text-gray-300">{report?.pressure_breakdown?.decisions_made || 0}</span></span>
                <span>⚡ Stress ×<span className="text-gray-300">{score?.stress_factor?.toFixed(2)}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Score breakdowns row ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Technical Score', val: score?.technical_score, color: 'text-green-400', border: 'border-green-800' },
            { label: 'Pressure Score',  val: score?.pressure_score,  color: 'text-blue-400',  border: 'border-blue-800' },
            { label: 'Final Score',     val: score?.final_score,     color: 'text-purple-400', border: 'border-purple-800' },
          ].map(item => (
            <div key={item.label} className={`bg-gray-900 border rounded-xl p-4 text-center ${item.border}`}>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">{item.label}</p>
              <p className={`text-4xl font-black mt-1 ${item.color}`}>{item.val?.toFixed(1)}</p>
              <div className="mt-2 bg-gray-800 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${item.val || 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabbed detail section ──────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-800">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3 text-xs font-bold transition-colors border-b-2
                            ${activeTab === t.id
                              ? 'text-green-300 border-green-500 bg-gray-800/50'
                              : 'text-gray-600 border-transparent hover:text-gray-400'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar */}
                <div>
                  <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-3">Skill Radar</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1f2937" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 8 }} domain={[0, 100]} />
                      <Radar name="Score" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25}
                        strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {/* Score bar */}
                <div>
                  <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-3">Score Breakdown</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 11 }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#9ca3af', fontSize: 10, formatter: v => v.toFixed(1) }}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TECHNICAL */}
            {activeTab === 'technical' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {report && Object.entries({
                    'Detection Rate':     `${report.technical_breakdown.detection_accuracy?.toFixed(1)}%`,
                    'False Positive':     `${report.technical_breakdown.false_positive_rate?.toFixed(1)}%`,
                    'Response Speed':     `${report.technical_breakdown.response_speed_sec?.toFixed(1)}s`,
                    'Correct Escalations': report.technical_breakdown.correctly_handled ?? 0,
                  }).map(([label, val]) => (
                    <div key={label} className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="text-green-300 font-black text-xl mt-1">{val}</p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={techBreakdownBars}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 11 }} />
                    <Bar dataKey="val" radius={[4,4,0,0]}
                      label={{ position: 'top', fill: '#9ca3af', fontSize: 9, formatter: v => `${v.toFixed(0)}%` }}>
                      {techBreakdownBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* PRESSURE */}
            {activeTab === 'pressure' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {report && Object.entries({
                    'Avg Decision Time':  `${report.pressure_breakdown.avg_response_time_sec?.toFixed(1)}s`,
                    'Decision Accuracy':  `${report.pressure_breakdown.decision_accuracy?.toFixed(1)}%`,
                    'Stress Factor':      `×${score?.stress_factor?.toFixed(2)}`,
                    'Decisions Made':     report.pressure_breakdown.decisions_made ?? 0,
                  }).map(([label, val]) => (
                    <div key={label} className="bg-gray-800 border border-blue-900/50 rounded-lg p-3 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="text-blue-300 font-black text-xl mt-1">{val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Pressure Metrics</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pressureBars}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 11 }} />
                      <Bar dataKey="val" radius={[4,4,0,0]}
                        label={{ position: 'top', fill: '#9ca3af', fontSize: 9, formatter: v => `${v.toFixed(0)}%` }}>
                        {pressureBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs">
                  <p className="text-gray-400 leading-relaxed">
                    <span className="text-blue-400 font-bold">Stress Factor</span> multiplies your pressure score based on the number of CRITICAL events generated.
                    A higher factor means you were under more pressure, and your score is adjusted accordingly.
                    Factor ×{score?.stress_factor?.toFixed(2)} applied this session.
                  </p>
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS */}
            {activeTab === 'recommendations' && (
              <div className="space-y-3">
                {report?.recommendations?.map((rec, i) => {
                  const icon = rec.toLowerCase().includes('detect') ? REC_ICONS.detection
                             : rec.toLowerCase().includes('response') || rec.toLowerCase().includes('time') ? REC_ICONS.response
                             : rec.toLowerCase().includes('accuracy') || rec.toLowerCase().includes('classif') ? REC_ICONS.accuracy
                             : rec.toLowerCase().includes('stress') || rec.toLowerCase().includes('pressure') ? REC_ICONS.pressure
                             : REC_ICONS.default
                  const isGood = rec.toLowerCase().includes('excellent') || rec.toLowerCase().includes('outstanding')
                  return (
                    <div key={i} className={`flex gap-3 p-4 rounded-lg border ${isGood ? 'border-green-800 bg-green-950/20' : 'border-gray-700 bg-gray-800/50'}`}>
                      <span className="text-xl shrink-0">{icon}</span>
                      <p className={`text-sm leading-relaxed ${isGood ? 'text-green-300' : 'text-gray-300'}`}>{rec}</p>
                    </div>
                  )
                })}

                {/* Cert recommendations based on grade */}
                <div className="mt-6 border-t border-gray-800 pt-4">
                  <h4 className="text-gray-400 text-[10px] uppercase tracking-widest mb-3">Suggested Certifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {[
                      { cert: 'CompTIA Security+', level: 'Beginner', color: 'border-green-800' },
                      { cert: 'GIAC GCIH',         level: 'Intermediate', color: 'border-blue-800' },
                      { cert: 'CHFI / CEH',        level: 'Advanced', color: 'border-purple-800' },
                    ].map(c => (
                      <div key={c.cert} className={`border rounded p-3 ${c.color} bg-gray-800/50`}>
                        <p className="text-gray-200 font-bold">{c.cert}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{c.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')}
            className="bg-green-700 hover:bg-green-600 text-black font-bold px-8 py-2.5 rounded transition-colors text-sm">
            ▶ NEW SIMULATION
          </button>
          <button onClick={() => window.print()}
            className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 px-8 py-2.5 rounded transition-colors text-sm">
            🖨 PRINT REPORT
          </button>
        </div>
      </main>
    </div>
  )
}
