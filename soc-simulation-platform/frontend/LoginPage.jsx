import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { saveToken, saveUser } from '../utils/auth'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      saveToken(data.access_token)
      saveUser({ username: form.username, role: data.role, id: data.user_id })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-green-400 text-5xl mb-3">🛡</div>
          <h1 className="text-2xl font-bold text-green-400">SOC Simulation Platform</h1>
          <p className="text-gray-500 text-sm mt-1">Security Operations Center Training</p>
        </div>

        <div className="bg-gray-900 border border-green-900 rounded-lg p-8">
          <h2 className="text-lg font-semibold text-green-300 mb-6">[ LOGIN ]</h2>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-950 border border-red-800 p-2 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest">Username</label>
              <input
                className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded focus:border-green-500 outline-none text-sm"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest">Password</label>
              <input
                type="password"
                className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded focus:border-green-500 outline-none text-sm"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-4 text-center">
            No account? <Link to="/register" className="text-green-500 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
