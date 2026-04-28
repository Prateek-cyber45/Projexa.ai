import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'

const ModalField = ({ label, value, mono = false }) => (
  <div className="modal-field">
    <div className="field-label">{label}</div>
    <div className={`field-value ${mono ? 'mono' : ''}`}>{value}</div>
    <style jsx>{`
      .modal-field {
        margin-bottom: 0.8rem;
      }
      .field-label {
        font-size: 0.65rem;
        color: var(--white-faint);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.3rem;
        font-weight: 600;
      }
      .field-value {
        font-size: 0.8rem;
        color: var(--white-dim);
      }
      .field-value.mono {
        font-family: var(--mono);
        background: var(--black-3);
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        border: 1px solid var(--black-4);
      }
    `}</style>
  </div>
)

export const Modal = () => {
  const { modalOpen, selectedIncident, setSelectedIncident, updateIncident } = useStore()

  if (!modalOpen || !selectedIncident) return null

  const handleAction = async (action, note = '') => {
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      })
      const data = await res.json()
      if (data.ok) {
        updateIncident(data.incident)
        setSelectedIncident(null)
      }
    } catch (err) {
      console.error('Action failed:', err)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedIncident(null)}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">
              <AlertTriangle size={18} />
              <h3>Incident Details</h3>
            </div>
            <button className="modal-close" onClick={() => setSelectedIncident(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <ModalField label="Incident ID" value={selectedIncident.id} mono />
            <ModalField label="Type" value={selectedIncident.type.replace(/_/g, ' ')} />
            <ModalField label="Pattern" value={selectedIncident.pattern} />
            <ModalField label="Severity" value={selectedIncident.severity.toUpperCase()} />
            <ModalField label="Status" value={selectedIncident.status.toUpperCase()} />
            <ModalField label="Source IP" value={selectedIncident.sourceIp} mono />
            <ModalField label="Target" value={selectedIncident.target} mono />
            <ModalField label="Honeypot" value={selectedIncident.honeypot} mono />
            <ModalField label="Time to Detect" value={selectedIncident.ttd} />
            <ModalField label="Confidence" value={`${selectedIncident.confidence}%`} />

            {selectedIncident.actions?.length > 0 && (
              <div className="actions-log">
                <div className="field-label">Actions Taken</div>
                {selectedIncident.actions.map((act, i) => (
                  <div key={i} className="action-entry">
                    <span className="action-ts">{act.ts}</span>
                    <span className="action-type">{act.action}</span>
                    {act.note && <span className="action-note">{act.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <motion.button 
              className="btn btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('isolate', 'Manual isolation triggered')}
            >
              <Shield size={14} />
              Isolate
            </motion.button>
            <motion.button 
              className="btn btn-warning"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('contain', 'Manual containment')}
            >
              Contain
            </motion.button>
            <motion.button 
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIncident(null)}
            >
              Close
            </motion.button>
          </div>

          <style jsx>{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.85);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              backdrop-filter: blur(4px);
            }

            .modal-content {
              background: var(--black-1);
              border: 1px solid var(--black-4);
              border-radius: 12px;
              width: 90%;
              max-width: 600px;
              max-height: 90vh;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1.2rem 1.5rem;
              border-bottom: 1px solid var(--black-4);
            }

            .modal-title {
              display: flex;
              align-items: center;
              gap: 0.6rem;
              color: var(--orange);
            }

            .modal-title h3 {
              font-size: 1rem;
              font-weight: 600;
              margin: 0;
            }

            .modal-close {
              background: none;
              border: none;
              color: var(--white-faint);
              cursor: pointer;
              padding: 0.3rem;
              border-radius: 4px;
              transition: all 0.2s;
            }

            .modal-close:hover {
              background: var(--black-4);
              color: var(--white-dim);
            }

            .modal-body {
              padding: 1.5rem;
              max-height: 60vh;
              overflow-y: auto;
            }

            .actions-log {
              margin-top: 1rem;
              padding-top: 1rem;
              border-top: 1px solid var(--black-4);
            }

            .action-entry {
              font-family: var(--mono);
              font-size: 0.7rem;
              padding: 0.4rem 0.6rem;
              background: var(--black-2);
              border-radius: 4px;
              margin-bottom: 0.3rem;
              display: flex;
              gap: 0.6rem;
            }

            .action-ts {
              color: var(--white-faint);
            }

            .action-type {
              color: var(--blue);
              font-weight: 600;
            }

            .action-note {
              color: var(--white-dim);
            }

            .modal-footer {
              padding: 1rem 1.5rem;
              border-top: 1px solid var(--black-4);
              display: flex;
              gap: 0.6rem;
              justify-content: flex-end;
            }

            .btn {
              padding: 0.6rem 1.2rem;
              border: none;
              border-radius: 6px;
              font-size: 0.8rem;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.4rem;
              transition: all 0.2s;
            }

            .btn-danger {
              background: var(--red);
              color: white;
            }

            .btn-warning {
              background: var(--orange);
              color: white;
            }

            .btn-secondary {
              background: var(--black-4);
              color: var(--white-dim);
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
