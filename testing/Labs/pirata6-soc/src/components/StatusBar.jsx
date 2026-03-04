import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Shield, Database, Clock, Users } from 'lucide-react'
import { useStore } from '../store'

const StatChip = ({ icon: Icon, label, value, color }) => (
  <div className="stat-chip">
    <Icon size={14} className="stat-icon" style={{ color: `var(--${color})` }} />
    <span className="label">{label}</span>
    <motion.span 
      className="value"
      style={{ color: `var(--${color})` }}
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {value}
    </motion.span>
  </div>
)

export const StatusBar = () => {
  const { metrics, incidents, eventCount } = useStore()
  const activeIncidents = incidents.filter(i => i.status === 'active')

  return (
    <div className="status-bar">
      <div className="status-inner">
        <div className="status-items">
          <StatChip 
            icon={AlertTriangle} 
            label="Active Incidents" 
            value={metrics.activeIncidents ?? '—'} 
            color="red" 
          />
          <div className="sep" />
          <StatChip 
            icon={Shield} 
            label="Threats Blocked" 
            value={metrics.threatsBlocked ?? '—'} 
            color="green" 
          />
          <div className="sep" />
          <StatChip 
            icon={Database} 
            label="Total Captures" 
            value={metrics.totalCaptures?.toLocaleString() ?? '—'} 
            color="blue" 
          />
          <div className="sep" />
          <StatChip 
            icon={Clock} 
            label="Avg Response" 
            value={`${metrics.avgResponseTime ?? '—'}s`} 
            color="white" 
          />
          <div className="sep" />
          <StatChip 
            icon={Users} 
            label="Events" 
            value={eventCount} 
            color="orange" 
          />
        </div>

        <AnimatePresence>
          {activeIncidents.length > 0 && (
            <motion.div 
              className="incident-flash"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <motion.div 
                className="flash-dot"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span>{activeIncidents.length} ACTIVE INCIDENT{activeIncidents.length > 1 ? 'S' : ''}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .status-bar {
          background: linear-gradient(180deg, var(--black-1) 0%, var(--black-2) 100%);
          border-bottom: 1px solid var(--black-4);
          padding: 0.6rem 2rem;
          position: relative;
          z-index: 10;
        }

        .status-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .status-items {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .stat-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--mono);
          font-size: 0.72rem;
        }

        .stat-chip .label {
          color: var(--white-faint);
          font-weight: 400;
        }

        .stat-chip .value {
          font-weight: 700;
          min-width: 28px;
        }

        :global(.stat-icon) {
          opacity: 0.7;
        }

        .sep {
          width: 1px;
          height: 1rem;
          background: var(--black-5);
        }

        .incident-flash {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--mono);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--red);
          background: rgba(255, 59, 48, 0.1);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 59, 48, 0.2);
        }

        .flash-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--red);
        }

        @media (max-width: 768px) {
          .status-items {
            overflow-x: auto;
            padding-bottom: 0.3rem;
          }
        }
      `}</style>
    </div>
  )
}
