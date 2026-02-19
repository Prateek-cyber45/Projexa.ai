import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { getUser, logout } from '../utils/auth'

const SCENARIOS = ['brute_force','sql_injection','ransomware','ddos','lateral_movement','data_exfiltration','phishing','zero_day']
const DIFFICULTIES = ['easy','medium','hard']

const STATUS_COLORS = { running: 'text-green-400', completed: 'text-blue-400', stopped: 'text-gray-500' }
const GRADE_COLORS = { A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }

export default function DashboardPage() {
  const user = getUser()
  const navigate = useNavigate()
  const [simulations, setSimulations] = useState([])
  const [scenario, setScenario] = useState('brute_force')
  const [difficulty, setDifficulty] = useState('medium')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const loadSims = async () => {
    try {
      const { data } = await api.get('/simulations')
      setSimulations(data)
    } catch {}
  }

  useEffect(() => { loadSims() }, [])

  const startSim = async () => {
    setStarting(true); setError('')
    try {
      const { data } = await api.post('/start-simulation', { scenario, difficulty })
      navigate(`/simulation/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start simulation')
    } finally { setStarting(false) }
  }

  const roleLabel = {
    soc_analyst: '[ SOC ANALYST ]',
    incident_responder: '[ INCIDENT RESPONDER ]',
    threat_hunter: '[ THREAT HUNTER ]',
  }[user?.role] || '[ OPERATOR ]'

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 border-b border-green-900 pb-4">
        <div>
          <h1 className="text-green-400 text-xl font-bold">🛡 SOC SIMULATION PLATFORM</h1>
          <p className="text-green-600 text-xs mt-1">{roleLabel} — {user?.username?.toUpperCase()}</p>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-red-400 text-sm transition-colors">
          [ LOGOUT ]
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Launch Panel */}
        <div className="bg-gray-900 border border-green-900 rounded-lg p-6">
          <h2 className="text-green-300 font-semibold mb-4 text-sm uppercase tracking-widest">Launch Simulation</h2>
          {error && <p className="text-red-400 text-xs mb-3 bg-red-950 p-2 rounded">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest">Attack Scenario</label>
              <select className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded text-sm outline-none focus:border-green-500"
                value={scenario} onChange={e => setScenario(e.target.value)}>
                {SCENARIOS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest">Difficulty</label>
              <div className="flex gap-2 mt-1">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 text-xs rounded border transition-colors font-bold ${difficulty === d ? 'border-green-500 bg-green-900 text-green-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startSim} disabled={starting}
              className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-3 rounded transition-colors disabled:opacity-50 text-sm">
              {starting ? '⏳ INITIALIZING...' : '▶ START SIMULATION'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 border border-green-900 rounded-lg p-6">
          <h2 className="text-green-300 font-semibold mb-4 text-sm uppercase tracking-widest">Operator Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Sessions', val: simulations.length },
              { label: 'Completed', val: simulations.filter(s=>s.status==='completed').length },
              { label: 'Running', val: simulations.filter(s=>s.status==='running').length },
              { label: 'Role', val: user?.role?.replace(/_/g,' ') || '-' },
            ].map(item => (
              <div key={item.label} className="bg-gray-800 border border-gray-700 p-3 rounded">
                <div className="text-gray-500 text-xs">{item.label}</div>
                <div className="text-green-300 font-bold text-lg mt-1">{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Guide */}
        <div className="bg-gray-900 border border-green-900 rounded-lg p-6">
          <h2 className="text-green-300 font-semibold mb-4 text-sm uppercase tracking-widest">Role Objectives</h2>
          <div className="space-y-2 text-xs text-gray-400">
            {user?.role === 'soc_analyst' && <>
              <p>✦ Monitor the live alert feed continuously</p>
              <p>✦ Classify each alert by severity and type</p>
              <p>✦ Escalate HIGH/CRITICAL events within 30 seconds</p>
              <p>✦ Document all actions in the decision log</p>
            </>}
            {user?.role === 'incident_responder' && <>
              <p>✦ Receive escalated alerts from SOC Analyst</p>
              <p>✦ Contain threats by isolating affected systems</p>
              <p>✦ Analyse root cause of each incident</p>
              <p>✦ Create an incident report after containment</p>
            </>}
            {user?.role === 'threat_hunter' && <>
              <p>✦ Proactively search for anomalies in log streams</p>
              <p>✦ Identify Indicators of Compromise (IoCs)</p>
              <p>✦ Map adversary techniques to MITRE ATT&CK</p>
              <p>✦ Generate threat intelligence report</p>
            </>}
          </div>
        </div>
      </div>

      {/* Simulation History */}
      <div className="mt-6 bg-gray-900 border border-green-900 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-green-300 font-semibold text-sm uppercase tracking-widest">Simulation History</h2>
          <button onClick={loadSims} className="text-green-600 text-xs hover:text-green-400">[REFRESH]</button>
        </div>
        {simulations.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No simulations yet. Launch your first scenario above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-green-600 border-b border-gray-800">
                  <th className="text-left py-2 px-3">SCENARIO</th>
                  <th className="text-left py-2 px-3">DIFFICULTY</th>
                  <th className="text-left py-2 px-3">STATUS</th>
                  <th className="text-left py-2 px-3">STARTED</th>
                  <th className="text-left py-2 px-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map(s => (
                  <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="py-2 px-3 text-green-300">{s.scenario.replace(/_/g,' ').toUpperCase()}</td>
                    <td className="py-2 px-3 text-gray-400">{s.difficulty.toUpperCase()}</td>
                    <td className={`py-2 px-3 font-bold ${STATUS_COLORS[s.status] || 'text-gray-400'}`}>{s.status.toUpperCase()}</td>
                    <td className="py-2 px-3 text-gray-500">{new Date(s.started_at).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        {s.status === 'running' && (
                          <button onClick={() => navigate(`/simulation/${s.id}`)}
                            className="text-green-500 hover:text-green-300">[VIEW]</button>
                        )}
                        {s.status === 'completed' && (
                          <button onClick={() => navigate(`/report/${s.id}`)}
                            className="text-blue-500 hover:text-blue-300">[REPORT]</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
