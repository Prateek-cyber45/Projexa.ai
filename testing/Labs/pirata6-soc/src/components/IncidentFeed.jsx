import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock } from 'lucide-react'
import { useStore } from '../store'

const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: { bg: 'rgba(255,59,48,0.15)', text: 'var(--red)', border: 'var(--red)' },
    warning:  { bg: 'rgba(255,214,10,0.15)', text: 'var(--orange)', border: 'var(--orange)' },
    info:     { bg: 'rgba(10,132,255,0.15)', text: 'var(--blue)', border: 'var(--blue)' },
  }
  const c = colors[severity] || colors.info

  return (
    <span className="severity-badge" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {severity}
      <style jsx>{`
        .severity-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid;
        }
      `}</style>
    </span>
  )
}

const StatusPill = ({ status }) => {
  const colors = {
    active:    { bg: 'rgba(255,214,10,0.15)', text: 'var(--orange)' },
    contained: { bg: 'rgba(48,209,88,0.15)', text: 'var(--green)' },
    isolated:  { bg: 'rgba(10,132,255,0.15)', text: 'var(--blue)' },
  }
  const c = colors[status] || colors.active

  return (
    <span className="status-pill" style={{ background: c.bg, color: c.text }}>
      {status}
      <style jsx>{`
        .status-pill {
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          font-family: var(--mono);
        }
      `}</style>
    </span>
  )
}

const IncidentRow = ({ incident }) => {
  const setSelectedIncident = useStore(s => s.setSelectedIncident)

  return (
    <motion.div 
      className={`incident-row ${incident.severity}`}
      onClick={() => setSelectedIncident(incident)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="incident-header">
        <SeverityBadge severity={incident.severity} />
        <StatusPill status={incident.status} />
      </div>

      <div className="incident-type">
        {incident.type.replace(/_/g, ' ')}
      </div>

      <div className="incident-pattern">
        {incident.pattern}
      </div>

      <div className="incident-meta">
        <div className="meta-item">
          <Clock size={11} />
          <span>{incident.ts}</span>
        </div>
        <div className="meta-item">
          <span className="confidence-bar">
            <motion.span 
              className="confidence-fill"
              initial={{ width: 0 }}
              animate={{ width: `${incident.confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </span>
          <span>{incident.confidence}%</span>
        </div>
      </div>

      <div className="incident-source">
        {incident.sourceIp} → {incident.target}
      </div>

      <style jsx>{`
        .incident-row {
          background: var(--black-2);
          border: 1px solid var(--black-4);
          border-left: 3px solid var(--blue);
          border-radius: 6px;
          padding: 0.8rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .incident-row.critical {
          border-left-color: var(--red);
        }

        .incident-row.warning {
          border-left-color: var(--orange);
        }

        .incident-row::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--blue), transparent);
          opacity: 0.3;
        }

        .incident-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        .incident-type {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--white-dim);
          text-transform: capitalize;
          margin-bottom: 0.3rem;
        }

        .incident-pattern {
          font-size: 0.68rem;
          color: var(--white-faint);
          font-family: var(--mono);
          margin-bottom: 0.6rem;
        }

        .incident-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          color: var(--white-faint);
          font-family: var(--mono);
        }

        .confidence-bar {
          width: 40px;
          height: 4px;
          background: var(--black-4);
          border-radius: 2px;
          overflow: hidden;
          display: inline-block;
          position: relative;
        }

        .confidence-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--blue);
        }

        .incident-source {
          font-size: 0.65rem;
          color: var(--white-faint);
          font-family: var(--mono);
        }
      `}</style>
    </motion.div>
  )
}

export const IncidentFeed = () => {
  const incidents = useStore(s => s.incidents)

  return (
    <div className="incident-feed">
      <div className="panel-header">
        <AlertTriangle size={16} />
        <h2>Active Incidents</h2>
        <span className="badge">{incidents.filter(i => i.status === 'active').length}</span>
      </div>

      <div className="incident-list">
        <AnimatePresence initial={false}>
          {incidents.slice(0, 20).map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .incident-feed {
          background: var(--black-1);
          border: 1px solid var(--black-4);
          border-radius: 12px;
          padding: 1.2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          max-height: 600px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
          color: var(--orange);
        }

        .panel-header h2 {
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

        .incident-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
      `}</style>
    </div>
  )
}
