/**
 * Navbar.jsx — Top navigation bar shown on all protected pages.
 * Shows: logo, role badge, user info, nav links, logout.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth'

const ROLE_META = {
  soc_analyst:        { label: 'SOC ANALYST',        color: 'text-green-400  border-green-700  bg-green-950'  },
  incident_responder: { label: 'INCIDENT RESPONDER', color: 'text-blue-400   border-blue-700   bg-blue-950'   },
  threat_hunter:      { label: 'THREAT HUNTER',      color: 'text-purple-400 border-purple-700 bg-purple-950' },
  admin:              { label: 'ADMIN',               color: 'text-red-400    border-red-700    bg-red-950'    },
}

export default function Navbar() {
  const user = getUser()
  const location = useLocation()
  const navigate = useNavigate()
  const meta = ROLE_META[user?.role] || ROLE_META.soc_analyst
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="bg-gray-900 border-b border-green-900/50 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 group">
        <span className="text-2xl">🛡</span>
        <div>
          <div className="text-green-400 font-bold text-sm tracking-wider group-hover:text-green-300 transition-colors">
            SOC SIM PLATFORM
          </div>
          <div className="text-green-700 text-xs tracking-widest">SECURITY OPERATIONS CENTER</div>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1">
        <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
      </div>

      {/* Right side: role badge + user + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className={`text-xs font-bold px-2 py-1 rounded border font-mono ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-gray-400 text-xs font-mono hidden sm:block">
              {user.username?.toUpperCase()}
            </span>
          </>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="text-gray-500 hover:text-red-400 text-xs font-mono border border-gray-700 hover:border-red-700 px-3 py-1.5 rounded transition-all">
          LOGOUT
        </button>
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}
      className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
        active
          ? 'bg-green-900/50 text-green-300 border border-green-700'
          : 'text-gray-500 hover:text-green-400 hover:bg-gray-800'
      }`}>
      {children}
    </Link>
  )
}
