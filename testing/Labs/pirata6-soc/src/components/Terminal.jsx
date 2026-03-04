import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react'
import { useStore } from '../store'

const LogEntry = ({ log }) => {
  const levelColors = {
    critical: 'var(--red)',
    warning:  'var(--orange)',
    info:     'var(--blue)',
  }

  return (
    <motion.div 
      className="log-entry"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <span className="log-ts">{log.ts}</span>
      <span className="log-level" style={{ color: levelColors[log.level] }}>
        [{log.level.toUpperCase()}]
      </span>
      <span className="log-msg">{log.message}</span>

      <style jsx>{`
        .log-entry {
          font-family: var(--mono);
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
          border-left: 2px solid var(--black-4);
          margin-bottom: 0.3rem;
          background: var(--black-2);
          border-radius: 4px;
          display: flex;
          gap: 0.6rem;
          align-items: baseline;
        }

        .log-ts {
          color: var(--white-faint);
          min-width: 60px;
        }

        .log-level {
          font-weight: 600;
          min-width: 80px;
        }

        .log-msg {
          color: var(--white-dim);
          flex: 1;
          word-break: break-word;
        }
      `}</style>
    </motion.div>
  )
}

const ActionButton = ({ onClick, label, variant = 'default' }) => {
  const colors = {
    default: { bg: 'var(--black-4)', hover: 'var(--black-5)', text: 'var(--white-dim)' },
    primary: { bg: 'var(--blue)', hover: '#0a5eba', text: 'white' },
    danger:  { bg: 'var(--red)', hover: '#cc0000', text: 'white' },
  }
  const c = colors[variant]

  return (
    <motion.button
      className="action-btn"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ background: c.bg, color: c.text }}
    >
      {label}
      <style jsx>{`
        .action-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--mono);
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: ${c.hover} !important;
        }
      `}</style>
    </motion.button>
  )
}

export const Terminal = () => {
  const logs = useStore(s => s.logs)
  const incidents = useStore(s => s.incidents)
  const setSelectedIncident = useStore(s => s.setSelectedIncident)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const activeIncidents = incidents.filter(i => i.status === 'active')

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-title">
          <TerminalIcon size={16} />
          <h2>Live Logs</h2>
          <span className="badge">{logs.length}</span>
        </div>
        {activeIncidents.length > 0 && (
          <div className="terminal-actions">
            {activeIncidents.slice(0, 2).map(inc => (
              <ActionButton 
                key={inc.id}
                label={`${inc.type} · ${inc.severity}`}
                variant={inc.severity === 'critical' ? 'danger' : 'primary'}
                onClick={() => setSelectedIncident(inc)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="terminal-body" ref={scrollRef}>
        <div className="terminal-prompt">
          <ChevronRight size={14} />
          <span>pirata6@soc:~$ tail -f /var/log/threats.log</span>
        </div>

        <AnimatePresence initial={false}>
          {logs.slice(0, 100).map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .terminal {
          background: var(--black-1);
          border: 1px solid var(--black-4);
          border-radius: 12px;
          padding: 1.2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          max-height: 500px;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .terminal-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--blue);
        }

        .terminal-title h2 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .badge {
          background: var(--black-4);
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          font-size: 0.65rem;
          font-family: var(--mono);
        }

        .terminal-actions {
          display: flex;
          gap: 0.5rem;
        }

        .terminal-body {
          flex: 1;
          overflow-y: auto;
          background: var(--black-2);
          border: 1px solid var(--black-3);
          border-radius: 8px;
          padding: 0.8rem;
        }

        .terminal-prompt {
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.8rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--black-4);
        }
      `}</style>
    </div>
  )
}
