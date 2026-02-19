import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

const ROLES = [
  { value: 'soc_analyst', label: 'SOC Analyst', desc: 'Monitor alerts, triage events' },
  { value: 'incident_responder', label: 'Incident Responder', desc: 'Investigate and contain threats' },
  { value: 'threat_hunter', label: 'Threat Hunter', desc: 'Proactively hunt for hidden threats' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'soc_analyst' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-green-400 text-5xl mb-3">🛡</div>
          <h1 className="text-2xl font-bold text-green-400">SOC Simulation Platform</h1>
          <p className="text-gray-500 text-sm mt-1">Create your analyst profile</p>
        </div>

        <div className="bg-gray-900 border border-green-900 rounded-lg p-8">
          <h2 className="text-lg font-semibold text-green-300 mb-6">[ NEW OPERATOR ]</h2>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-950 border border-red-800 p-2 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-green-600 text-xs uppercase tracking-widest">Username</label>
                <input className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded focus:border-green-500 outline-none text-sm"
                  value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
              </div>
              <div>
                <label className="text-green-600 text-xs uppercase tracking-widest">Email</label>
                <input type="email" className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded focus:border-green-500 outline-none text-sm"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest">Password</label>
              <input type="password" className="mt-1 w-full bg-gray-800 border border-gray-700 text-green-300 p-2 rounded focus:border-green-500 outline-none text-sm"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div>
              <label className="text-green-600 text-xs uppercase tracking-widest mb-2 block">Select Role</label>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <label key={r.value} className={`flex items-start p-3 rounded border cursor-pointer transition-colors ${form.role === r.value ? 'border-green-500 bg-green-950' : 'border-gray-700 hover:border-gray-600'}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                      onChange={e => setForm({...form, role: e.target.value})} className="mr-3 mt-0.5" />
                    <div>
                      <div className="text-green-300 text-sm font-semibold">{r.label}</div>
                      <div className="text-gray-500 text-xs">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2 rounded transition-colors disabled:opacity-50">
              {loading ? 'REGISTERING...' : 'CREATE OPERATOR ACCOUNT'}
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-4 text-center">
            Already have access? <Link to="/login" className="text-green-500 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
