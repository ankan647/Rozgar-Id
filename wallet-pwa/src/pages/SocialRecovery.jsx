import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Shield, Key, Copy, CheckCircle, Smartphone } from 'lucide-react'
import api from '../utils/api'

export default function SocialRecovery() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('setup') // setup | restore
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({ contactName: '', contactPhone: '', phone: '', recoveryPhrase: '' })
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSetup = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/worker/recovery/setup', { contactPhone: form.contactPhone, contactName: form.contactName })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed')
    } finally { setLoading(false) }
  }

  const handleRestore = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/worker/recovery/restore', { phone: form.phone, recoveryPhrase: form.recoveryPhrase })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Recovery failed')
    } finally { setLoading(false) }
  }

  const copyPhrase = () => {
    navigator.clipboard.writeText(result?.recoveryPhrase || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 py-6 max-w-[480px] mx-auto min-h-screen bg-surface">
      <h1 className="text-xl font-bold text-brand-900 mb-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-brand-700" /></div>
        {t('wallet.recovery')}
      </h1>
      <p className="text-xs text-brand-500 mb-6 leading-relaxed">Protect your verifiable credentials. Set up a trusted contact to recover your data if you lose your device.</p>

      <div className="flex bg-brand-50 rounded-xl p-1 mb-6 border border-brand-100">
        <button onClick={() => { setTab('setup'); setError(''); setResult(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'setup' ? 'bg-white text-brand-700 shadow-sm border border-border' : 'text-brand-500 hover:text-brand-700'}`}>
          {t('wallet.recovery_setup')}
        </button>
        <button onClick={() => { setTab('restore'); setError(''); setResult(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'restore' ? 'bg-white text-brand-700 shadow-sm border border-border' : 'text-brand-500 hover:text-brand-700'}`}>
          {t('wallet.recovery_restore')}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 font-medium">{error}</div>}

      {/* Recovery phrase result */}
      {result?.recoveryPhrase && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">{t('wallet.recovery_phrase')}</h3>
          </div>
          <div className="bg-white rounded-xl p-4 mb-3 text-center border border-amber-100 shadow-sm">
            <code className="text-lg font-black text-amber-900 tracking-wider break-all">{result.recoveryPhrase}</code>
          </div>
          <p className="text-xs text-amber-700 mb-4 font-medium leading-relaxed">⚠️ {t('wallet.save_phrase')}</p>
          <button onClick={copyPhrase} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            {copied ? <><CheckCircle className="w-4 h-4" />Copied to clipboard!</> : <><Copy className="w-4 h-4" />Copy Phrase</>}
          </button>
        </motion.div>
      )}

      {result?.credentials && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mb-6 bg-emerald-50 border-emerald-200 text-center py-8">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 mb-2">Recovery Successful!</h3>
          <p className="text-sm text-emerald-700 font-medium">Restored {result.credentials.length} credentials to your device.</p>
        </motion.div>
      )}

      {!result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-white">
          {tab === 'setup' ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Trusted Contact Name</label>
                <input name="contactName" value={form.contactName} onChange={handleChange} placeholder={t('wallet.contact_name')} required className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Trusted Contact Phone</label>
                <input name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} placeholder={t('wallet.contact_phone')} required className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : t('wallet.recovery_setup')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRestore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Your Registered Phone</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder={t('wallet.phone')} required className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Recovery Phrase</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input name="recoveryPhrase" value={form.recoveryPhrase} onChange={handleChange} placeholder={t('wallet.recovery_phrase')} required className="input-field pl-10 font-mono" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : t('wallet.recovery_restore')}
              </button>
            </form>
          )}
        </motion.div>
      )}
    </div>
  )
}
