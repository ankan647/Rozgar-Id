import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react'

export default function VerifierLogin() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', type: 'employer', state: '', city: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const endpoint = tab === 'login' ? '/auth/verifier/login' : '/auth/verifier/register'
      const payload = tab === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await api.post(endpoint, payload)
      login({ ...data.verifier, role: 'verifier' }, { accessToken: data.accessToken, refreshToken: data.refreshToken })
      navigate('/verifier/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-brand-50 to-brand-100 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-900">{t('home.verifier_portal')}</h1>
          <p className="text-brand-600 text-sm mt-1">{t('home.verifier_desc')}</p>
        </div>

        <div className="card">
          <div className="flex bg-brand-50 rounded-xl p-1 mb-6">
            {['login', 'register'].map((t2) => (
              <button key={t2} onClick={() => { setTab(t2); setError('') }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t2 ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}>
                {t2 === 'login' ? <span className="flex items-center justify-center gap-1"><LogIn className="w-4 h-4" />{t('auth.login')}</span> : <span className="flex items-center justify-center gap-1"><UserPlus className="w-4 h-4" />{t('auth.register')}</span>}
              </button>
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <input name="name" value={form.name} onChange={handleChange} placeholder={t('auth.name')} required className="input-field" />
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option value="employer">Employer</option>
                  <option value="bank">Bank</option>
                  <option value="welfare_office">Welfare Office</option>
                  <option value="contractor">Contractor</option>
                </select>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder={t('auth.phone')} className="input-field" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="state" value={form.state} onChange={handleChange} placeholder={t('auth.state')} className="input-field" />
                  <input name="city" value={form.city} onChange={handleChange} placeholder={t('auth.city')} className="input-field" />
                </div>
              </>
            )}
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('auth.email')} required className="input-field" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={t('auth.password')} required minLength={6} className="input-field" />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '...' : tab === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
