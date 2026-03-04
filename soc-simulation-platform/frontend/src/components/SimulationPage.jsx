/**
 * SimulationPage.jsx — Live simulation cockpit.
 * Features: real-time log stream (auto-poll), top stats bar, tabbed views
 * (Alert Feed | Log Table | Network Map), AI analysis panel, decision modal,
 * MITRE ATT&CK mapping, risk meter, threat distribution chart.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../utils/api'
import { toast } from '../components/Toast'
import Navbar from '../components/Navbar'
import AlertPanel from '../components/AlertPanel'
import LogTable from '../components/LogTable'
import RiskMeter from '../components/RiskMeter'
import DecisionModal from '../components/DecisionModal'
import MitrePanel from '../components/MitrePanel'

const THREAT_COLORS = {
  brute_force: '#f97316', sql_injection: '#eab308', ransomware: '#ef4444',
  ddos: '#ef4444', lateral_movement: '#a855f7', data_exfil: '#3b82f6',
  phishing: '#22c55e', zero_day: '#ff0040', benign: '#6b7280',
}

export default function SimulationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('feed')  // feed | table
  const [selectedLog, setSelectedLog] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [decisionsCount, setDecisionsCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [autoScroll, setAutoScroll] = useState(true)
  const [paused, setPaused] = useState(false)

  const startTime = useRef(Date.now())
  const logEndRef = useRef(null)
  const pollRef = useRef(null)

  /* ── Stats derived from logs ─────────────────────────────────────────── */
  const stats = {
    total:     logs.length,
    anomalies: logs.filter(l => l.is_anomaly).length,
    critical:  logs.filter(l => l.severity === 'critical').length,
    high:      logs.filter(l => l.severity === 'high').length,
  }
  const riskScore = Math.min(100, Math.round(
    (stats.critical * 10) + (stats.high * 5) + (stats.anomalies * 2)
  ))

  /* Threat distribution for mini bar chart */
  const threatDist = Object.entries(
    logs.reduce((acc, l) => {
      if (l.threat_label && l.threat_label !== 'benign') {
        acc[l.threat_label] = (acc[l.threat_label] || 0) + 1
      }
      return acc
    }, {})
  ).map(([name, count]) => ({ name: name.replace(/_/g,' '), count, color: THREAT_COLORS[name] || '#6b7280' }))
    .sort((a, b) => b.count - a.count).slice(0, 6)

  /* ── Fetch logs ──────────────────────────────────────────────────────── */
  const fetchLogs = useCallback(async () => {
    if (paused) return
    try {
      const { data } = await api.get('/get-logs', { params: { simulation_id: id, limit: 200 } })
      setLogs(data)
    } catch {}
  }, [id, paused])

  useEffect(() => {
    fetchLogs()
    pollRef.current = setInterval(fetchLogs, 3500)
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { clearInterval(pollRef.current); clearInterval(timer) }
  }, [fetchLogs])

  useEffect(() => {
    if (autoScroll && activeTab === 'feed') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll, activeTab])

  /* ── Analyze log ─────────────────────────────────────────────────────── */
  const analyzeLog = async (log) => {
    setSelectedLog(log)
    setAnalysis(null)
    setAnalysing(true)
    try {
      const { data } = await api.post('/analyze-threat', {
        simulation_id: id, log_id: log.id,
        event_type: log.event_type, raw_payload: log.raw_payload,
        source_ip: log.source_ip, dest_port: log.dest_port,
        protocol: log.protocol, severity: log.severity || 'medium',
      })
      setAnalysis(data)
      setShowModal(true)
    } catch { toast.error('Analysis failed') }
    finally { setAnalysing(false) }
  }

  /* ── Submit decision ─────────────────────────────────────────────────── */
  const submitDecision = async ({ label, action, notes, timeTaken }) => {
    if (!selectedLog) return
    try {
      const { data } = await api.post('/submit-decision', {
        simulation_id: id,
        log_id: selectedLog.id,
        analyst_label: label,
        correct_label: selectedLog.threat_label || 'brute_force',
        time_taken_sec: timeTaken,
        notes,
      })
      setDecisionsCount(c => c + 1)
      if (data.correct) {
        setCorrectCount(c => c + 1)
        toast.success(`✓ Correct classification! (${timeTaken}s)`)
      } else {
        toast.warn(`✗ Incorrect — actual: ${selectedLog.threat_label}`)
      }
      setShowModal(false)
      setSelectedLog(null)
    } catch { toast.error('Failed to submit decision') }
  }

  /* ── Stop simulation ─────────────────────────────────────────────────── */
  const stopSimulation = async () => {
    setStopping(true)
    try {
      await api.post('/stop-simulation', { simulation_id: id })
      toast.success('Simulation ended — computing your score...')
      setTimeout(() => navigate(`/report/${id}`), 1000)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to stop')
      setStopping(false)
    }
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const accuracy = decisionsCount > 0 ? ((correctCount / decisionsCount) * 100).toFixed(0) : '—'

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      {/* ── Top Status Bar ──────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-b border-green-900/50 px-6 py-2">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          {/* Live badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-bold">LIVE SIMULATION</span>
            <span className="text-gray-600">— {fmt(elapsed)}</span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          {/* Stats */}
          {[
            { label: 'EVENTS',    val: stats.total,     color: 'text-green-400' },
            { label: 'ANOMALIES', val: stats.anomalies, color: 'text-orange-400' },
            { label: 'CRITICAL',  val: stats.critical,  color: 'text-red-400' },
            { label: 'HIGH',      val: stats.high,      color: 'text-yellow-400' },
            { label: 'DECISIONS', val: decisionsCount,  color: 'text-blue-400' },
            { label: 'ACCURACY',  val: `${accuracy}%`,  color: accuracy >= 70 ? 'text-green-400' : 'text-red-400' },
          ].map(s => (
            <span key={s.label} className="text-gray-500">
              {s.label}: <span className={`font-bold ${s.color}`}>{s.val}</span>
            </span>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPaused(p => !p)}
              className={`text-[10px] border px-2 py-1 rounded transition-colors
                         ${paused ? 'border-yellow-700 text-yellow-400' : 'border-gray-700 text-gray-500 hover:text-yellow-400 hover:border-yellow-700'}`}>
              {paused ? '▶ RESUME' : '⏸ PAUSE'} FEED
            </button>
            <button onClick={() => setAutoScroll(a => !a)}
              className={`text-[10px] border px-2 py-1 rounded transition-colors
                         ${autoScroll ? 'border-green-700 text-green-400' : 'border-gray-700 text-gray-500'}`}>
              AUTO-SCROLL {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button onClick={stopSimulation} disabled={stopping}
              className="bg-red-900 hover:bg-red-800 border border-red-700 text-red-200 px-4 py-1.5
                         rounded text-xs font-bold transition-colors disabled:opacity-50">
              {stopping ? 'STOPPING...' : '■ STOP & SCORE'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Log area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-1 px-4 pt-3 pb-0 bg-gray-950 border-b border-gray-800">
            {[['feed','📡 ALERT FEED'], ['table','📋 LOG TABLE']].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-t transition-colors border-b-2
                            ${activeTab === tab
                              ? 'text-green-300 border-green-500 bg-gray-900'
                              : 'text-gray-600 border-transparent hover:text-gray-400'}`}>
                {label}
              </button>
            ))}
            <span className="ml-auto text-gray-700 text-[10px] self-end pb-2 font-mono pr-2">
              Click any event → AI analysis + decision
            </span>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'feed' && (
              <>
                <AlertPanel logs={logs} maxHeight="100%" onSelect={analyzeLog} />
                <div ref={logEndRef} />
              </>
            )}
            {activeTab === 'table' && (
              <LogTable logs={logs} onAnalyze={analyzeLog} />
            )}
          </div>
        </div>

        {/* Right: Analysis sidebar */}
        <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
          {/* Risk Meter */}
          <div className="p-4 border-b border-gray-800 flex flex-col items-center">
            <RiskMeter value={riskScore} label="THREAT LEVEL" />
          </div>

          {/* Threat distribution chart */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Threat Distribution</p>
            {threatDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={threatDist} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#d1fae5', fontSize: 10 }} />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                    {threatDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-700 text-[10px] text-center py-4">No threats classified yet</p>
            )}
          </div>

          {/* Analysis result (when not in modal) */}
          <div className="flex-1 overflow-y-auto p-4">
            {analysing && (
              <div className="flex flex-col items-center gap-2 py-8 text-green-600 text-xs animate-pulse">
                <span className="text-2xl">🤖</span>
                <span>Running ML analysis...</span>
              </div>
            )}
            {!analysing && !selectedLog && (
              <div className="text-center py-8 text-gray-600 text-xs">
                <span className="text-3xl block mb-2">📡</span>
                <p>Select a log entry from<br />the feed to analyse it</p>
              </div>
            )}
            {!analysing && selectedLog && analysis && !showModal && (
              <div className="space-y-3 text-xs font-mono">
                <div className="bg-gray-800 border border-gray-700 rounded p-3">
                  <p className="text-green-500 font-bold mb-2">LAST ANALYSIS</p>
                  <div className="space-y-1 text-gray-300">
                    <div><span className="text-gray-500">Event: </span>{selectedLog.event_type}</div>
                    <div><span className="text-gray-500">Label: </span>
                      <span className="text-yellow-300 font-bold">{analysis.threat_label}</span>
                    </div>
                    <div><span className="text-gray-500">Anomaly: </span>
                      <span className={analysis.is_anomaly ? 'text-red-400' : 'text-green-400'}>
                        {(analysis.anomaly_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <MitrePanel threatLabel={analysis.threat_label} />
                <button onClick={() => setShowModal(true)}
                  className="w-full border border-green-800 text-green-500 hover:bg-green-900/20 py-2 rounded text-[10px] font-bold transition-colors">
                  ▶ OPEN DECISION FORM
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showModal && selectedLog && (
        <DecisionModal
          log={selectedLog}
          analysis={analysis}
          onSubmit={submitDecision}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
