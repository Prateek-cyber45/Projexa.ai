import { motion } from 'framer-motion'
import { Server, Activity } from 'lucide-react'
import { useStore } from '../store'

const Toggle = ({ active, onToggle }) => (
  <motion.button
    className={`toggle ${active ? 'active' : ''}`}
    onClick={onToggle}
    whileTap={{ scale: 0.9 }}
  >
    <motion.div 
      className="toggle-thumb"
      animate={{ x: active ? 16 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
    <style jsx>{`
      .toggle {
        position: relative;
        width: 36px;
        height: 20px;
        background: var(--black-4);
        border: 1px solid var(--black-5);
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .toggle.active {
        background: var(--blue);
        border-color: var(--blue);
      }
      .toggle-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
      }
    `}</style>
  </motion.button>
)

const StatusPill = ({ status }) => {
  const colors = {
    active:  { bg: 'rgba(48,209,88,0.15)', text: 'var(--green)', border: 'var(--green)' },
    monitor: { bg: 'rgba(10,132,255,0.15)', text: 'var(--blue)',  border: 'var(--blue)' },
    alert:   { bg: 'rgba(255,214,10,0.15)', text: 'var(--orange)', border: 'var(--orange)' },
    idle:    { bg: 'rgba(142,142,147,0.15)', text: 'var(--white-faint)', border: 'var(--black-5)' },
  }
  const c = colors[status] || colors.idle

  return (
    <span className="status-pill" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {status}
      <style jsx>{`
        .status-pill {
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

const HoneypotItem = ({ pot }) => {
  const updateHoneypot = useStore(s => s.updateHoneypot)

  const handleToggle = async () => {
    try {
      await fetch(`/api/honeypots/${pot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !pot.active }),
      })
    } catch (err) {
      console.error('Failed to toggle honeypot:', err)
    }
  }

  return (
    <motion.div 
      className="honeypot-item"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="honeypot-header">
        <div className="honeypot-icon">
          <Server size={16} />
          {pot.active && (
            <motion.div 
              className="pulse-ring"
              animate={{
                scale: [1, 1.8],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
        </div>
        <div className="honeypot-title">
          <div className="honeypot-id">{pot.id}</div>
          <div className="honeypot-ip">{pot.ip}</div>
        </div>
        <Toggle active={pot.active} onToggle={handleToggle} />
      </div>

      <div className="honeypot-stats">
        <StatusPill status={pot.status} />
        <div className="stat-group">
          <div className="stat-item">
            <Activity size={12} />
            <span>{pot.hits}</span>
          </div>
          <div className="stat-item payload">
            <span className="payload-dot" />
            <span>{pot.payloads}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .honeypot-item {
          background: var(--black-2);
          border: 1px solid var(--black-4);
          border-radius: 8px;
          padding: 0.9rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .honeypot-header {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 0.7rem;
        }

        .honeypot-icon {
          position: relative;
          color: var(--blue);
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          border: 2px solid var(--blue);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .honeypot-title {
          flex: 1;
        }

        .honeypot-id {
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--mono);
          color: var(--white-dim);
        }

        .honeypot-ip {
          font-size: 0.65rem;
          color: var(--white-faint);
          font-family: var(--mono);
          margin-top: 0.1rem;
        }

        .honeypot-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.6rem;
        }

        .stat-group {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: var(--white-dim);
          font-family: var(--mono);
        }

        .stat-item.payload {
          color: var(--orange);
        }

        .payload-dot {
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
        }
      `}</style>
    </motion.div>
  )
}

export const HoneypotGrid = () => {
  const honeypots = useStore(s => s.honeypots)

  return (
    <div className="honeypot-grid">
      <div className="panel-header">
        <Server size={16} />
        <h2>Honeypots</h2>
        <span className="badge">{honeypots.length}</span>
      </div>

      <div className="honeypot-list">
        {honeypots.map((pot) => (
          <HoneypotItem key={pot.id} pot={pot} />
        ))}
      </div>

      <style jsx>{`
        .honeypot-grid {
          background: var(--black-1);
          border: 1px solid var(--black-4);
          border-radius: 12px;
          padding: 1.2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
          color: var(--blue);
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

        .honeypot-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          overflow-y: auto;
          flex: 1;
        }
      `}</style>
    </div>
  )
}
