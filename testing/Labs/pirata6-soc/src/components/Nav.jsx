import { motion } from 'framer-motion'
import { Shield, Activity, Database, BarChart3, BookOpen, User } from 'lucide-react'
import { useStore } from '../store'

const NavLink = ({ active, children, icon: Icon }) => (
  <motion.a
    href="#"
    className={`nav-link ${active ? 'active' : ''}`}
    whileHover={{ y: -1 }}
    whileTap={{ y: 0 }}
  >
    {Icon && <Icon size={14} />}
    {children}
  </motion.a>
)

export const Nav = () => {
  const { connected, eventCount, setSelectedIncident, incidents } = useStore()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <motion.a 
          href="/" 
          className="logo"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className="logo-hex"
            animate={{ 
              boxShadow: connected 
                ? ['0 0 0 0 rgba(10,132,255,0.6)', '0 0 20px 8px rgba(10,132,255,0.2)', '0 0 0 0 rgba(10,132,255,0.6)']
                : '0 0 0 0 rgba(10,132,255,0)'
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield size={16} strokeWidth={2.5} />
          </motion.div>
          <span className="logo-text">
            pirata6 <span className="badge">labs</span>
          </span>
        </motion.a>

        <div className="nav-links">
          <NavLink active icon={Activity}>SOC Sim</NavLink>
          <NavLink icon={Shield}>Incidents</NavLink>
          <NavLink icon={Database}>Honeypots</NavLink>
          <NavLink icon={BarChart3}>Analytics</NavLink>
          <NavLink icon={BookOpen}>Academy</NavLink>
        </div>

        <div className="nav-right">
          <div className="conn-status">
            <motion.div 
              className={`conn-dot ${connected ? 'online' : 'offline'}`}
              animate={connected ? {
                boxShadow: [
                  '0 0 0 0 rgba(48,209,88,0.5)',
                  '0 0 0 6px rgba(48,209,88,0)',
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>{connected ? `Live · ${eventCount} events` : 'Reconnecting…'}</span>
          </div>
          
          <div className="sep" />
          
          <motion.button 
            className="pill-btn ghost"
            whileHover={{ scale: 1.05, borderColor: 'var(--blue)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => incidents[0] && setSelectedIncident(incidents[0])}
          >
            View Incidents
          </motion.button>
          
          <motion.button 
            className="pill-btn solid"
            whileHover={{ scale: 1.05, backgroundColor: '#2d9aff' }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={14} />
            Profile
          </motion.button>
        </div>
      </div>

      <style jsx>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--black-5);
          padding: 0.85rem 2rem;
        }

        .nav-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3rem;
        }

        .logo {
          font-family: var(--mono);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--white);
          text-decoration: none;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .logo-hex {
          width: 32px;
          height: 32px;
          background: var(--blue);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
        }

        .logo-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          background: var(--blue);
          color: #000;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        :global(.nav-link) {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--white-dim);
          text-decoration: none;
          letter-spacing: 0.01em;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }

        :global(.nav-link:hover) {
          color: var(--white);
          background: rgba(255, 255, 255, 0.05);
        }

        :global(.nav-link.active) {
          color: var(--white);
          background: rgba(10, 132, 255, 0.1);
        }

        :global(.nav-link.active::after) {
          content: '';
          position: absolute;
          bottom: -0.85rem;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 2px;
          background: var(--blue);
          box-shadow: 0 0 10px var(--blue);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .conn-status {
          font-family: var(--mono);
          font-size: 0.68rem;
          color: var(--white-faint);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .conn-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--red);
          flex-shrink: 0;
        }

        .conn-dot.online {
          background: var(--green);
        }

        .sep {
          width: 1px;
          height: 1.2rem;
          background: var(--black-5);
        }

        .pill-btn {
          font-family: var(--mono);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        .pill-btn.ghost {
          background: transparent;
          border: 1px solid var(--black-5);
          color: var(--white-dim);
        }

        .pill-btn.solid {
          background: var(--blue);
          color: #000;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}
