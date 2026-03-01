import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useStore } from '../store'

const ToastItem = ({ toast }) => {
  const removeToast = useStore(s => s.removeToast)

  const icons = {
    success: <CheckCircle size={16} />,
    error:   <AlertCircle size={16} />,
    info:    <Info size={16} />,
  }

  const colors = {
    success: 'var(--green)',
    error:   'var(--red)',
    info:    'var(--blue)',
  }

  return (
    <motion.div 
      className="toast"
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="toast-icon" style={{ color: colors[toast.type] }}>
        {icons[toast.type]}
      </div>
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
        <motion.div 
          className="toast-progress"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
          style={{ background: colors[toast.type] }}
        />
      </div>
      <button className="toast-close" onClick={() => removeToast(toast.id)}>
        <X size={14} />
      </button>

      <style jsx>{`
        .toast {
          background: var(--black-2);
          border: 1px solid var(--black-4);
          border-radius: 8px;
          padding: 0.9rem;
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          min-width: 300px;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
          position: relative;
        }

        .toast-message {
          font-size: 0.8rem;
          color: var(--white-dim);
          line-height: 1.4;
        }

        .toast-progress {
          position: absolute;
          bottom: -0.9rem;
          left: -0.8rem;
          right: -0.8rem;
          height: 3px;
        }

        .toast-close {
          background: none;
          border: none;
          color: var(--white-faint);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 3px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: var(--black-4);
          color: var(--white-dim);
        }
      `}</style>
    </motion.div>
  )
}

export const ToastContainer = () => {
  const toasts = useStore(s => s.toasts)

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 5rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          pointer-events: none;
        }

        .toast-container > :global(*) {
          pointer-events: all;
        }
      `}</style>
    </div>
  )
}
