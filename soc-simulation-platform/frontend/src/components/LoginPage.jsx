import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { saveToken, saveUser } from '../utils/auth'
import { toast } from '../components/Toast'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      saveToken(data.access_token)
      saveUser({ username: form.username, role: data.role, id: data.user_id })
      toast.success('Access granted')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Animated background grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛡</div>
          <h1 className="text-2xl font-black text-green-400 tracking-wider">SOC SIMULATION</h1>
          <p className="text-green-700 text-xs tracking-widest mt-1">SECURITY OPERATIONS CENTER TRAINING</p>
        </div>

        <div className="bg-gray-900/90 backdrop-blur border border-green-900 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(34,197,94,0.1)' }}>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-xs font-mono font-bold tracking-widest">OPERATOR LOGIN</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">
                Username
              </label>
              <input
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
                className="w-full bg-gray-800 border border-gray-700 focus:border-green-600
                           text-green-300 placeholder-gray-700 px-3 py-2.5 rounded outline-none
                           font-mono text-sm transition-colors"
                placeholder="operator_id"
              />
            </div>
            <div>
              <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
                className="w-full bg-gray-800 border border-gray-700 focus:border-green-600
                           text-green-300 placeholder-gray-700 px-3 py-2.5 rounded outline-none
                           font-mono text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50
                         text-black font-black py-3 rounded-lg transition-colors text-sm tracking-widest mt-2">
              {loading ? 'AUTHENTICATING...' : '▶ ACCESS SYSTEM'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-gray-600 text-xs text-center font-mono">
              No account?{' '}
              <Link to="/register" className="text-green-500 hover:text-green-300 transition-colors">
                Register as Operator
              </Link>
            </p>
          </div>

          <div className="mt-4 bg-gray-800/50 rounded p-3">
            <p className="text-gray-600 text-[10px] font-mono text-center">
              Demo: <span className="text-green-700">admin</span> / <span className="text-green-700">admin1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
