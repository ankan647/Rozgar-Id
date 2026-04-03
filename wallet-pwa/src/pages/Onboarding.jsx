import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { LogIn, UserPlus } from 'lucide-react'

export default function Onboarding() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [tab, setTab] = useState('login') // login | register
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', password: '', homeState: '', currentState: '', skills: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const endpoint = tab === 'login' ? '/auth/worker/login' : '/auth/worker/register'
      const payload = tab === 'login' ? { phone: form.phone, password: form.password } : {
        ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
      const { data } = await api.post(endpoint, payload)
      login(data.worker, { accessToken: data.accessToken, refreshToken: data.refreshToken })
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-900/20 rounded-full blur-3xl" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shrink-0 flex items-center justify-center mx-auto mb-4 shadow-glass-lg rotate-3 pointer-events-none">
            <span className="text-4xl font-black text-brand-700 -rotate-3">R</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Rozgar<span className="text-brand-200">ID</span> Wallet</h1>
          <p className="text-brand-100 text-sm font-medium">{t('wallet.onboarding_desc')}</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-glass-lg border border-white/50">
          <div className="flex bg-brand-50 rounded-xl p-1 mb-6">
            <button onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-600'}`}>
              {t('auth.login')}
            </button>
            <button onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-600'}`}>
              {t('auth.register')}
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <input name="name" value={form.name} onChange={handleChange} placeholder={t('auth.name')} required className="input-field" autoComplete="name" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="homeState" value={form.homeState} onChange={handleChange} placeholder="Home State" required className="input-field" />
                  <input name="currentState" value={form.currentState} onChange={handleChange} placeholder="Current City" required className="input-field" />
                </div>
                <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="input-field text-sm" />
              </>
            )}
            
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder={t('wallet.phone')} required className="input-field" autoComplete="tel" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={t('auth.password')} required className="input-field" />
            
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : tab === 'login' ? <><LogIn className="w-5 h-5" />{t('auth.login')}</> : <><UserPlus className="w-5 h-5" />{t('auth.register')}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
