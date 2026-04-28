import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const SEV_COLORS = { low: 'text-blue-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400' }
const SEV_BG = { low: 'bg-blue-950 border-blue-800', medium: 'bg-yellow-950 border-yellow-800', high: 'bg-orange-950 border-orange-800', critical: 'bg-red-950 border-red-800 animate-pulse' }

const THREAT_LABELS = ['brute_force','sql_injection','ransomware','ddos','lateral_movement','data_exfil','phishing','zero_day','benign']

export default function SimulationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [decision, setDecision] = useState({ label: 'brute_force', time: Date.now() })
  const [analysis, setAnalysis] = useState(null)
  const [stopping, setStopping] = useState(false)
  const [stats, setStats] = useState({ total: 0, anomalies: 0, critical: 0 })
  const [elapsed, setElapsed] = useState(0)
  const logEndRef = useRef(null)
  const startTime = useRef(Date.now())

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/get-logs', { params: { simulation_id: id, limit: 100 } })
      setLogs(data)
      setStats({
        total: data.length,
        anomalies: data.filter(l => l.is_anomaly).length,
        critical: data.filter(l => l.severity === 'critical').length,
      })
    } catch {}
  }, [id])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 4000)
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000)
    return () => { clearInterval(interval); clearInterval(timer) }
  }, [fetchLogs])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  const analyzeLog = async (log) => {
    setSelectedLog(log)
    setDecision({ label: log.threat_label || 'brute_force', time: Date.now() })
    setAnalysis(null)
    try {
      const { data } = await api.post('/analyze-threat', {
        simulation_id: id,
        log_id: log.id,
        event_type: log.event_type,
        raw_payload: log.raw_payload,
        source_ip: log.source_ip,
        dest_port: log.dest_port,
        protocol: log.protocol,
        severity: log.severity || 'medium',
      })
      setAnalysis(data)
    } catch {}
  }

  const submitDecision = async () => {
    if (!selectedLog) return
    const timeTaken = (Date.now() - decision.time) / 1000
    try {
      await api.post('/submit-decision', {
        simulation_id: id,
        log_id: selectedLog.id,
        analyst_label: decision.label,
        correct_label: selectedLog.threat_label || 'brute_force',
        time_taken_sec: timeTaken,
      })
      alert(`Decision submitted! Time: ${timeTaken.toFixed(1)}s`)
      setSelectedLog(null)
    } catch {}
  }

  const stopSimulation = async () => {
    setStopping(true)
    try {
      await api.post('/stop-simulation', { simulation_id: id })
      navigate(`/report/${id}`)
    } catch { setStopping(false) }
  }

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-green-900 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-green-400 font-bold">🛡 LIVE SIMULATION</span>
          <span className="text-green-600 text-xs bg-green-950 px-2 py-1 rounded border border-green-800">
            ● ACTIVE — {formatTime(elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span className="text-gray-400">EVENTS: <span className="text-green-300 font-bold">{stats.total}</span></span>
          <span className="text-gray-400">ANOMALIES: <span className="text-orange-400 font-bold">{stats.anomalies}</span></span>
          <span className="text-gray-400">CRITICAL: <span className="text-red-400 font-bold">{stats.critical}</span></span>
          <button onClick={stopSimulation} disabled={stopping}
            className="bg-red-900 hover:bg-red-800 border border-red-700 text-red-200 px-4 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50">
            {stopping ? 'STOPPING...' : '■ STOP & SCORE'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Log Feed */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
          <div className="mb-2 text-green-600 text-xs">LIVE ATTACK LOG STREAM — CLICK ENTRY TO ANALYSE</div>
          {logs.map((log) => (
            <div key={log.id}
              onClick={() => analyzeLog(log)}
              className={`mb-1 p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${SEV_BG[log.severity] || 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-bold uppercase ${SEV_COLORS[log.severity] || 'text-gray-400'}`}>[{log.severity}]</span>
                <span className="text-gray-300">{log.event_type}</span>
                {log.is_anomaly && <span className="text-red-400 font-bold ml-auto">⚠ ANOMALY</span>}
              </div>
              <div className="text-gray-400 truncate">{log.raw_payload}</div>
              <div className="flex gap-3 mt-0.5 text-gray-600">
                <span>{log.source_ip} → {log.dest_ip}:{log.dest_port}</span>
                <span>{log.protocol}</span>
                {log.threat_label && <span className="text-purple-400">{log.threat_label}</span>}
              </div>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Analysis Panel */}
        <div className="w-80 bg-gray-900 border-l border-green-900 p-4 overflow-y-auto">
          <h3 className="text-green-300 text-xs font-bold uppercase tracking-widest mb-4">THREAT ANALYSIS</h3>

          {!selectedLog && (
            <p className="text-gray-600 text-xs text-center mt-8">Click a log entry to analyse it</p>
          )}

          {selectedLog && (
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs">
                <div className="text-green-500 font-bold mb-2">SELECTED EVENT</div>
                <div className="text-gray-300 space-y-1">
                  <div><span className="text-gray-500">TYPE:</span> {selectedLog.event_type}</div>
                  <div><span className="text-gray-500">SRC:</span> {selectedLog.source_ip}</div>
                  <div><span className="text-gray-500">PORT:</span> {selectedLog.dest_port}</div>
                  <div><span className="text-gray-500">SEVERITY:</span> <span className={SEV_COLORS[selectedLog.severity]}>{selectedLog.severity?.toUpperCase()}</span></div>
                </div>
              </div>

              {analysis && (
                <div className="bg-gray-800 border border-purple-900 rounded p-3 text-xs">
                  <div className="text-purple-400 font-bold mb-2">AI ANALYSIS</div>
                  <div className="space-y-1 text-gray-300">
                    <div><span className="text-gray-500">LABEL:</span> <span className="text-yellow-300 font-bold">{analysis.threat_label}</span></div>
                    <div><span className="text-gray-500">ANOMALY SCORE:</span> {(analysis.anomaly_score * 100).toFixed(1)}%</div>
                    <div><span className="text-gray-500">IS ANOMALY:</span> <span className={analysis.is_anomaly ? 'text-red-400' : 'text-green-400'}>{analysis.is_anomaly ? 'YES' : 'NO'}</span></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-green-500 text-xs mb-1">RECOMMENDATION:</div>
                    <p className="text-gray-400">{analysis.recommendation}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-800 border border-green-900 rounded p-3 text-xs">
                <div className="text-green-500 font-bold mb-2">YOUR DECISION</div>
                <select className="w-full bg-gray-700 border border-gray-600 text-green-300 p-2 rounded text-xs outline-none mb-3"
                  value={decision.label} onChange={e => setDecision({...decision, label: e.target.value})}>
                  {THREAT_LABELS.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').toUpperCase()}</option>)}
                </select>
                <button onClick={submitDecision}
                  className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2 rounded text-xs transition-colors">
                  SUBMIT DECISION
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
