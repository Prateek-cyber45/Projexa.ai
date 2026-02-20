/**
 * DashboardPage.jsx — Main operator hub.
 * Features: scenario launcher, live stats, simulation history, role objectives,
 *           score leaderboard (personal), scenario difficulty selector with info.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../utils/api'
import { getUser } from '../utils/auth'
import { toast } from '../components/Toast'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'

/* ── Constants ─────────────────────────────────────────────────────────────── */
const SCENARIOS = [
  { id: 'brute_force',        label: 'Brute Force',          icon: '🔑', desc: 'SSH/RDP credential attacks' },
  { id: 'sql_injection',      label: 'SQL Injection',         icon: '💉', desc: 'Database exploitation' },
  { id: 'ransomware',         label: 'Ransomware',           icon: '🔒', desc: 'File encryption + C2 beacons' },
  { id: 'ddos',               label: 'DDoS Attack',          icon: '🌊', desc: 'Volumetric flood attacks' },
  { id: 'lateral_movement',   label: 'Lateral Movement',     icon: '↔',  desc: 'Network traversal / PtH' },
  { id: 'data_exfiltration',  label: 'Data Exfiltration',    icon: '📤', desc: 'DNS tunnelling / exfil' },
  { id: 'phishing',           label: 'Phishing',             icon: '🎣', desc: 'Social engineering + macros' },
  { id: 'zero_day',           label: 'Zero-Day',             icon: '💀', desc: 'Unknown exploit patterns' },
]
const DIFFICULTIES = [
  { id: 'easy',   label: 'EASY',   color: 'border-green-700  text-green-400',  desc: 'Mostly low/medium severity. Good for beginners.' },
  { id: 'medium', label: 'MEDIUM', color: 'border-yellow-700 text-yellow-400', desc: 'Mixed severity. Realistic SOC workload.' },
  { id: 'hard',   label: 'HARD',   color: 'border-red-700    text-red-400',    desc: 'High critical volume. Maximum pressure.' },
]
const STATUS_COLORS = {
  running:   { text: 'text-green-400',  bg: 'bg-green-900',  label: '● RUNNING' },
  completed: { text: 'text-blue-400',   bg: 'bg-blue-900',   label: '✓ DONE' },
  stopped:   { text: 'text-gray-500',   bg: 'bg-gray-800',   label: '■ STOPPED' },
}
const GRADE_COLOR = { A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }
const PIE_COLORS  = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#84cc16']

const ROLE_GUIDE = {
  soc_analyst: {
    title: 'SOC ANALYST OBJECTIVES',
    color: 'border-green-800',
    steps: [
      '1. Launch a simulation scenario below',
      '2. Monitor the live alert feed for anomalies',
      '3. Click any log entry → run AI analysis',
      '4. Classify the threat type and submit your decision',
      '5. Escalate CRITICAL/HIGH alerts within 30 seconds',
      '6. Stop the simulation to receive your performance score',
    ],
  },
  incident_responder: {
    title: 'INCIDENT RESPONDER OBJECTIVES',
    color: 'border-blue-800',
    steps: [
      '1. Receive escalated alerts from SOC Analyst',
      '2. Investigate root cause using log correlation',
      '3. Contain threats — select "BLOCK IP" or "ISOLATE"',
      '4. Document all response actions in the notes field',
      '5. Verify threat is neutralised before dismissing',
      '6. Generate incident report from the scoring page',
    ],
  },
  threat_hunter: {
    title: 'THREAT HUNTER OBJECTIVES',
    color: 'border-purple-800',
    steps: [
      '1. Start a lateral_movement or zero_day simulation',
      '2. Proactively search logs for anomaly patterns',
      '3. Correlate source IPs across multiple log entries',
      '4. Identify IoCs and map them to MITRE ATT&CK',
      '5. Use "Anomalies only" filter for focused hunting',
      '6. Submit hypotheses as decisions with detailed notes',
    ],
  },
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const user = getUser()
  const navigate = useNavigate()

  const [simulations, setSimulations] = useState([])
  const [scenario, setScenario] = useState('brute_force')
  const [difficulty, setDifficulty] = useState('medium')
  const [starting, setStarting] = useState(false)
  const [loadingSims, setLoadingSims] = useState(true)
  const [scores, setScores] = useState({})   // { simId: score }

  const loadSims = async () => {
    setLoadingSims(true)
    try {
      const { data } = await api.get('/simulations')
      setSimulations(data)
      // Fetch scores for completed simulations
      const completed = data.filter(s => s.status === 'completed')
      const scoreResults = await Promise.allSettled(
        completed.map(s => api.get('/get-score', { params: { simulation_id: s.id } }))
      )
      const scoreMap = {}
      completed.forEach((s, i) => {
        if (scoreResults[i].status === 'fulfilled') scoreMap[s.id] = scoreResults[i].value.data
      })
      setScores(scoreMap)
    } catch { toast.error('Failed to load simulations') }
    finally { setLoadingSims(false) }
  }

  useEffect(() => { loadSims() }, [])

  const startSim = async () => {
    setStarting(true)
    try {
      const { data } = await api.post('/start-simulation', { scenario, difficulty })
      toast.success(`Simulation started: ${scenario.replace(/_/g,' ')}`)
      navigate(`/simulation/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start simulation')
    } finally { setStarting(false) }
  }

  /* ── Derived stats ─────────────────────────────────────────────────────── */
  const totalSims  = simulations.length
  const completed  = simulations.filter(s => s.status === 'completed').length
  const running    = simulations.filter(s => s.status === 'running').length
  const scoreList  = Object.values(scores)
  const bestScore  = scoreList.length ? Math.max(...scoreList.map(s => s.final_score)) : null
  const avgScore   = scoreList.length ? scoreList.reduce((a, b) => a + b.final_score, 0) / scoreList.length : null

  /* ── Chart data ────────────────────────────────────────────────────────── */
  const scenarioCounts = SCENARIOS.map(s => ({
    name: s.label.replace(' ', '\n'),
    count: simulations.filter(sim => sim.scenario === s.id).length,
  })).filter(s => s.count > 0)

  const gradeDist = ['A', 'B', 'C', 'D', 'F'].map(g => ({
    name: `Grade ${g}`,
    value: scoreList.filter(s => s.grade === g || s.grade?.startsWith(g)).length,
  })).filter(s => s.value > 0)

  const guide = ROLE_GUIDE[user?.role] || ROLE_GUIDE.soc_analyst
  const selectedScenario = SCENARIOS.find(s => s.id === scenario)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Sessions"  value={totalSims}                       icon="🖥"  color="green" />
          <StatCard title="Completed"       value={completed}                       icon="✓"   color="blue"  />
          <StatCard title="Active Now"      value={running}  pulse={running > 0}   icon="●"   color={running > 0 ? 'green' : 'gray'} />
          <StatCard title="Best Score"      value={bestScore?.toFixed(1) ?? '—'}   icon="🏆"  color="yellow" />
          <StatCard title="Avg Score"       value={avgScore?.toFixed(1) ?? '—'}    icon="📊"  color="purple" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Launch Panel ──────────────────────────────────────────── */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-gray-900 border border-green-900 rounded-xl p-5">
              <h2 className="text-green-300 font-bold text-xs uppercase tracking-widest mb-4">
                ▶ LAUNCH SIMULATION
              </h2>

              {/* Scenario picker */}
              <div className="mb-4">
                <label className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">Attack Scenario</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SCENARIOS.map(s => (
                    <button key={s.id} onClick={() => setScenario(s.id)}
                      className={`text-left p-2 rounded border transition-all text-xs ${
                        scenario === s.id
                          ? 'border-green-600 bg-green-900/30 text-green-300'
                          : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                      }`}>
                      <span className="mr-1">{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
                {selectedScenario && (
                  <p className="text-gray-600 text-[10px] mt-2 pl-1">{selectedScenario.desc}</p>
                )}
              </div>

              {/* Difficulty picker */}
              <div className="mb-5">
                <label className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">Difficulty</label>
                <div className="space-y-1">
                  {DIFFICULTIES.map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className={`w-full text-left p-2 rounded border transition-all text-xs ${
                        difficulty === d.id
                          ? `border-current font-bold ${d.color} bg-gray-800`
                          : 'border-gray-700 text-gray-500 hover:border-gray-600'
                      }`}>
                      <span className="font-bold mr-2">{d.label}</span>
                      <span className="text-gray-600 text-[10px] font-normal">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startSim} disabled={starting}
                className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50
                           text-black font-bold py-3 rounded transition-colors text-sm tracking-wider">
                {starting ? '⏳ INITIALIZING...' : '▶ DEPLOY SIMULATION'}
              </button>
            </div>

            {/* Role guide */}
            <div className={`bg-gray-900 border rounded-xl p-4 ${guide.color}`}>
              <h3 className="text-gray-300 font-bold text-[10px] uppercase tracking-widest mb-3">{guide.title}</h3>
              <ol className="space-y-1.5">
                {guide.steps.map((step, i) => (
                  <li key={i} className="text-gray-500 text-xs">{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Charts ──────────────────────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenarios chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-3">Sessions by Scenario</h3>
                {scenarioCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={scenarioCounts} margin={{ left: -20 }}>
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} interval={0} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 11 }} />
                      <Bar dataKey="count" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-700 text-xs">No data yet</div>
                )}
              </div>

              {/* Grade distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-3">Grade Distribution</h3>
                {gradeDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                        dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false} fontSize={9}>
                        {gradeDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-700 text-xs">
                    Complete a simulation to see grades
                  </div>
                )}
              </div>
            </div>

            {/* Simulation History Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest">Session History</h3>
                <button onClick={loadSims}
                  className="text-green-700 hover:text-green-400 text-[10px] border border-green-900 hover:border-green-700 px-2 py-1 rounded transition-colors">
                  ↺ REFRESH
                </button>
              </div>

              {loadingSims ? (
                <div className="text-gray-600 text-xs text-center py-8 animate-pulse">Loading sessions...</div>
              ) : simulations.length === 0 ? (
                <div className="text-gray-700 text-xs text-center py-8">
                  <p className="text-3xl mb-2">🖥</p>
                  <p>No simulations yet. Deploy your first scenario above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-green-700 border-b border-gray-800">
                        {['SCENARIO', 'DIFFICULTY', 'STATUS', 'STARTED', 'SCORE', 'GRADE', 'ACTIONS'].map(h => (
                          <th key={h} className="text-left py-2 px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {simulations.map(s => {
                        const st = STATUS_COLORS[s.status] || STATUS_COLORS.stopped
                        const sc = scores[s.id]
                        return (
                          <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                            <td className="py-2 px-2 text-green-300 font-semibold">
                              {SCENARIOS.find(sc => sc.id === s.scenario)?.icon} {s.scenario.replace(/_/g,' ').toUpperCase()}
                            </td>
                            <td className="py-2 px-2 text-gray-500">{s.difficulty.toUpperCase()}</td>
                            <td className="py-2 px-2">
                              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>
                                {st.label}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-gray-600">
                              {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2 px-2 font-bold text-green-300">
                              {sc ? sc.final_score.toFixed(1) : '—'}
                            </td>
                            <td className="py-2 px-2 font-bold">
                              {sc ? <span className={GRADE_COLOR[sc.grade?.[0]] || 'text-gray-400'}>{sc.grade}</span> : '—'}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex gap-2">
                                {s.status === 'running' && (
                                  <button onClick={() => navigate(`/simulation/${s.id}`)}
                                    className="text-green-500 hover:text-green-300 text-[10px] border border-green-900 hover:border-green-600 px-2 py-0.5 rounded transition-colors">
                                    RESUME
                                  </button>
                                )}
                                {s.status === 'completed' && (
                                  <button onClick={() => navigate(`/report/${s.id}`)}
                                    className="text-blue-500 hover:text-blue-300 text-[10px] border border-blue-900 hover:border-blue-600 px-2 py-0.5 rounded transition-colors">
                                    REPORT
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
