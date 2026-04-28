import { motion } from 'framer-motion'
import { useStore } from '../store'

export const Footer = () => {
  const { connected, eventCount } = useStore()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">
          © 2025 pirata6 Labs · <a href="#">privacy</a> · <a href="#">terms</a>
        </div>
        <div className="footer-status">
          <motion.div 
            className={`status-dot ${connected ? 'online' : 'offline'}`}
            animate={connected ? {
              boxShadow: [
                '0 0 0 0 rgba(48,209,88,0.5)',
                '0 0 0 5px rgba(48,209,88,0)',
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>
            {connected 
              ? `SSE live · ${eventCount} events received` 
              : 'Disconnected'
            }
          </span>
        </div>
      </div>

      <style jsx>{`
        .footer {
          max-width: 1600px;
          margin: 2rem auto 1.5rem;
          padding: 1.2rem 2rem;
          border-top: 1px solid var(--black-4);
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-copy {
          font-size: 0.72rem;
          color: var(--white-faint);
          font-family: var(--mono);
        }

        .footer-copy a {
          color: var(--blue);
          text-decoration: none;
        }

        .footer-copy a:hover {
          text-decoration: underline;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--mono);
          font-size: 0.68rem;
          color: var(--white-faint);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--red);
        }

        .status-dot.online {
          background: var(--green);
        }
      `}</style>
    </footer>
  )
}
