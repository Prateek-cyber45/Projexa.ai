/**
 * DecisionModal.jsx — Analyst decision form shown after selecting a log.
 * Props: log, analysis, onSubmit(decision), onClose
 */
import { useState, useEffect } from 'react'
import MitrePanel from './MitrePanel'

const THREAT_LABELS = [
  'brute_force','sql_injection','ransomware','ddos',
  'lateral_movement','data_exfil','phishing','zero_day','benign',
]
const ACTIONS = [
  { val: 'escalate',    label: '⬆ ESCALATE',    color: 'bg-red-900 border-red-700 text-red-300' },
  { val: 'investigate', label: '🔍 INVESTIGATE', color: 'bg-yellow-900 border-yellow-700 text-yellow-300' },
  { val: 'dismiss',     label: '✓ DISMISS',      color: 'bg-gray-700 border-gray-600 text-gray-300' },
  { val: 'block_ip',    label: '🛡 BLOCK IP',    color: 'bg-orange-900 border-orange-700 text-orange-300' },
]

export default function DecisionModal({ log, analysis, onSubmit, onClose }) {
  const [label, setLabel] = useState(log?.threat_label || 'brute_force')
  const [action, setAction] = useState('investigate')
  const [notes, setNotes] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  if (!log) return null

  const sev = log.severity || 'low'
  const SEV_COLOR = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-blue-400' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-green-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-green-300 font-bold text-sm">THREAT ANALYSIS — DECISION REQUIRED</h2>
            <p className="text-gray-500 text-xs mt-0.5">Timer: <span className="text-yellow-400 font-bold">{elapsed}s</span> — faster decisions score higher</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400 text-lg transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Event summary */}
          <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-bold uppercase text-sm ${SEV_COLOR[sev]}`}>[{sev.toUpperCase()}]</span>
              <span className="text-gray-200 font-semibold">{log.event_type}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-gray-400">
              <span><span className="text-gray-600">SRC:</span> {log.source_ip}:{log.source_port}</span>
              <span><span className="text-gray-600">DST:</span> {log.dest_ip}:{log.dest_port}</span>
              <span><span className="text-gray-600">PROTOCOL:</span> {log.protocol}</span>
              <span><span className="text-gray-600">TIME:</span> {new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-gray-500 bg-gray-900 rounded p-2 mt-1 leading-relaxed break-all">
              {log.raw_payload}
            </div>
          </div>

          {/* AI Analysis result */}
          {analysis && (
            <div className="bg-purple-950/30 border border-purple-800 rounded p-3 text-xs">
              <p className="text-purple-400 font-bold mb-2">🤖 AI ANALYSIS RESULT</p>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div><span className="text-gray-500">Label: </span><span className="text-yellow-300 font-bold">{analysis.threat_label}</span></div>
                <div><span className="text-gray-500">Confidence: </span><span className="text-green-400">{((analysis.confidence || analysis.anomaly_score || 0.5) * 100).toFixed(1)}%</span></div>
                <div><span className="text-gray-500">Anomaly Score: </span>
                  <span className={analysis.is_anomaly ? 'text-red-400' : 'text-green-400'}>
                    {(analysis.anomaly_score * 100).toFixed(1)}% {analysis.is_anomaly ? '⚠' : '✓'}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-900">
                <span className="text-gray-500">Recommendation: </span>
                <span className="text-gray-300">{analysis.recommendation}</span>
              </div>
            </div>
          )}

          {/* MITRE ATT&CK */}
          <MitrePanel threatLabel={analysis?.threat_label || log.threat_label} />

          {/* Decision form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-green-600 text-[10px] uppercase tracking-widest block mb-1.5">Your Classification</label>
              <select value={label} onChange={e => setLabel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded text-xs outline-none focus:border-green-600">
                {THREAT_LABELS.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-green-600 text-[10px] uppercase tracking-widest block mb-1.5">Recommended Action</label>
              <div className="grid grid-cols-2 gap-1">
                {ACTIONS.map(a => (
                  <button key={a.val} onClick={() => setAction(a.val)}
                    className={`border rounded px-2 py-1.5 text-[10px] font-bold transition-opacity
                                ${action === a.val ? a.color : 'bg-gray-800 border-gray-700 text-gray-500 opacity-50 hover:opacity-80'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-green-600 text-[10px] uppercase tracking-widest block mb-1.5">Analyst Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Document your reasoning..."
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 p-2 rounded text-xs outline-none focus:border-green-600 resize-none placeholder-gray-700" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => onSubmit({ label, action, notes, timeTaken: elapsed })}
              className="flex-1 bg-green-700 hover:bg-green-600 text-black font-bold py-2.5 rounded transition-colors text-sm">
              ▶ SUBMIT DECISION
            </button>
            <button onClick={onClose}
              className="px-5 border border-gray-700 hover:border-gray-500 text-gray-400 rounded transition-colors text-xs">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
