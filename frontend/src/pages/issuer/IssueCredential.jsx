import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Send, Eye } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

const CREDENTIAL_TYPES = [
  'WeldingCertification', 'CarpentryCertification', 'ElectricalCertification',
  'PlumbingCertification', 'MasonryCertification', 'DrivingLicense',
  'TailoringCertification', 'WorkExperience', 'WelfareEntitlement',
]

export default function IssueCredential() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ workerPhone: '', credentialType: 'WeldingCertification', skillName: '', grade: 'A', expiryDate: '', additionalNotes: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/issuer/credentials/issue', form)
      setResult(data)
      console.log('📝 W3C VC JSON:', JSON.stringify(data.credential.vcJson, null, 2))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue credential')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="issuer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6">{t('issuer.issue_title')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
            {result && (
              <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-4">
                ✅ Credential issued! ID: <code className="text-xs">{result.credential.credentialId}</code>
                {result.credential.ipfsHash && <div className="mt-1">IPFS: <code className="text-xs">{result.credential.ipfsHash}</code></div>}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.worker_phone')}</label>
                <input name="workerPhone" value={form.workerPhone} onChange={handleChange} placeholder="9876543210" required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.credential_type')}</label>
                <select name="credentialType" value={form.credentialType} onChange={handleChange} className="input-field">
                  {CREDENTIAL_TYPES.map(ct => <option key={ct} value={ct}>{ct.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.skill_name')}</label>
                <input name="skillName" value={form.skillName} onChange={handleChange} placeholder="e.g., Arc Welding" required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.grade')}</label>
                  <select name="grade" value={form.grade} onChange={handleChange} className="input-field">
                    {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.expiry_date')}</label>
                  <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">{t('issuer.notes')}</label>
                <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} rows={3} className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />{loading ? t('issuer.issuing') : t('issuer.issue_btn')}
              </button>
            </form>
          </motion.div>

          {/* Live Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold text-brand-900 mb-3 flex items-center gap-2"><Eye className="w-5 h-5 text-brand-700" />{t('issuer.preview')}</h2>
              <div className="bg-gradient-to-br from-brand-700 to-brand-950 rounded-2xl p-6 text-white shadow-glass-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-medium opacity-75">ROZGARID CREDENTIAL</div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg backdrop-blur-sm">R</div>
                </div>
                <div className="text-2xl font-bold mb-1">{form.skillName || 'Skill Name'}</div>
                <div className="text-brand-300 text-sm mb-6">{form.credentialType.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-brand-300 text-xs">Grade</div><div className="font-bold text-lg">{form.grade}</div></div>
                  <div><div className="text-brand-300 text-xs">Expires</div><div className="font-medium">{form.expiryDate || 'Not set'}</div></div>
                </div>
                {form.additionalNotes && <div className="mt-4 pt-4 border-t border-white/20 text-sm text-brand-200">{form.additionalNotes}</div>}
                <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-brand-300">
                  <span>Polygon Amoy Testnet</span>
                  <span>W3C Verifiable Credential</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
