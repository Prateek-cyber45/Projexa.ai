import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { toast } from '../components/Toast'

const ROLES = [
  {
    value: 'soc_analyst',
    label: 'SOC Analyst',
    icon: '🖥',
    desc: 'First line of defence. Monitor, triage and escalate alerts in real-time.',
    skills: ['Alert monitoring', 'Threat triage', 'Escalation workflows'],
  },
  {
    value: 'incident_responder',
    label: 'Incident Responder',
    icon: '🚨',
    desc: 'Investigate, contain and remediate confirmed security incidents.',
    skills: ['Root cause analysis', 'Containment', 'Incident documentation'],
  },
  {
    value: 'threat_hunter',
    label: 'Threat Hunter',
    icon: '🔭',
    desc: 'Proactively hunt for hidden adversaries using anomaly analysis and MITRE ATT&CK.',
    skills: ['Anomaly detection', 'IoC identification', 'Hypothesis-driven hunting'],
  },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'soc_analyst' })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)  // 1: credentials, 2: role selection
  const navigate = useNavigate()

  const nextStep = (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/auth/register', {
        username: form.username, email: form.email, password: form.password, role: form.role,
      })
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛡</div>
          <h1 className="text-2xl font-black text-green-400 tracking-wider">NEW OPERATOR</h1>
          <p className="text-green-700 text-xs tracking-widest mt-1">CREATE YOUR ANALYST PROFILE</p>
        </div>

        <div className="bg-gray-900/90 backdrop-blur border border-green-900 rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(34,197,94,0.1)' }}>

          {/* Steps indicator */}
          <div className="flex border-b border-gray-800">
            {['CREDENTIALS', 'ROLE SELECTION'].map((s, i) => (
              <div key={s} className={`flex-1 text-center py-3 text-[10px] font-bold tracking-widest transition-colors
                                       ${step === i + 1 ? 'text-green-400 bg-green-950/20' : 'text-gray-600'}`}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          <div className="p-8">
            {step === 1 && (
              <form onSubmit={nextStep} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">Username</label>
                    <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                      required minLength={3}
                      className="w-full bg-gray-800 border border-gray-700 focus:border-green-600 text-green-300 px-3 py-2.5 rounded outline-none font-mono text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full bg-gray-800 border border-gray-700 focus:border-green-600 text-green-300 px-3 py-2.5 rounded outline-none font-mono text-sm transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required minLength={8}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-green-600 text-green-300 px-3 py-2.5 rounded outline-none font-mono text-sm transition-colors"
                    placeholder="Minimum 8 characters" />
                </div>
                <div>
                  <label className="text-green-700 text-[10px] uppercase tracking-widest font-bold block mb-1.5">Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    className={`w-full bg-gray-800 border focus:border-green-600 text-green-300 px-3 py-2.5 rounded outline-none font-mono text-sm transition-colors
                                ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-600' : 'border-gray-700'}`} />
                </div>
                <button type="submit"
                  className="w-full bg-green-700 hover:bg-green-600 text-black font-black py-3 rounded-lg transition-colors text-sm tracking-widest mt-2">
                  NEXT: SELECT ROLE →
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {ROLES.map(r => (
                    <label key={r.value}
                      className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        form.role === r.value
                          ? 'border-green-600 bg-green-900/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                      <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                        onChange={e => setForm({ ...form, role: e.target.value })} className="mt-1 accent-green-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{r.icon}</span>
                          <span className="text-green-300 font-bold text-sm">{r.label}</span>
                        </div>
                        <p className="text-gray-400 text-xs mb-2">{r.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {r.skills.map(s => (
                            <span key={s} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="border border-gray-700 hover:border-gray-500 text-gray-400 px-5 py-2.5 rounded-lg transition-colors text-sm">
                    ← BACK
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-black font-black py-2.5 rounded-lg transition-colors text-sm tracking-widest">
                    {loading ? 'CREATING...' : '▶ CREATE ACCOUNT'}
                  </button>
                </div>
              </div>
            )}

            <p className="text-gray-600 text-xs text-center font-mono mt-5">
              Already registered?{' '}
              <Link to="/login" className="text-green-500 hover:text-green-300 transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
