import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, Filter, XCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

export default function IssuerCredentials() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(null)
  const [filter, setFilter] = useState({ status: '', credentialType: '' })
  const [search, setSearch] = useState('')
  const [revokeModal, setRevokeModal] = useState(null)
  const [reason, setReason] = useState('')

  const fetchCredentials = () => {
    const params = new URLSearchParams()
    if (filter.status) params.set('status', filter.status)
    if (filter.credentialType) params.set('credentialType', filter.credentialType)
    api.get(`/issuer/credentials?${params}`).then(r => { setCredentials(r.data.credentials); setLoading(false) })
  }

  useEffect(() => { fetchCredentials() }, [filter])

  const handleRevoke = async () => {
    if (!revokeModal) return
    setRevoking(revokeModal.credentialId)
    try {
      await api.post(`/issuer/credentials/revoke/${revokeModal.credentialId}`, { reason })
      setRevokeModal(null); setReason(''); fetchCredentials()
    } catch (err) {
      alert(err.response?.data?.error || 'Revocation failed')
    } finally { setRevoking(null) }
  }

  const filtered = credentials.filter(c =>
    !search || c.skillName?.toLowerCase().includes(search.toLowerCase()) || c.workerId?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="issuer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6">{t('nav.credentials')}</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="input-field pl-10" />
          </div>
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Worker</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Skill</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Grade</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">{t('common.status')}</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">{t('common.date')}</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-brand-400">{t('common.loading')}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-brand-400">No credentials found</td></tr>
                ) : filtered.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-900">{c.workerId?.name || '—'}</td>
                    <td className="px-4 py-3 text-brand-600">{c.skillName}</td>
                    <td className="px-4 py-3 text-brand-500 text-xs">{c.credentialType}</td>
                    <td className="px-4 py-3"><span className="font-bold text-brand-700">{c.grade}</span></td>
                    <td className="px-4 py-3"><span className={c.status === 'active' ? 'badge-active' : c.status === 'revoked' ? 'badge-revoked' : 'badge-expired'}>{c.status}</span></td>
                    <td className="px-4 py-3 text-brand-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {c.status === 'active' && (
                        <button onClick={() => setRevokeModal(c)} className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />{t('issuer.revoke')}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revoke Modal */}
        {revokeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-glass-lg">
              <h3 className="font-bold text-lg text-brand-900 mb-2">Revoke Credential</h3>
              <p className="text-sm text-brand-500 mb-4">This will revoke <strong>{revokeModal.skillName}</strong> on the Polygon blockchain.</p>
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder={t('issuer.revoke_reason')} className="input-field mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setRevokeModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-brand-600 hover:bg-brand-50 transition-colors">{t('common.cancel')}</button>
                <button onClick={handleRevoke} disabled={!!revoking} className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">
                  {revoking ? t('issuer.revoking') : t('issuer.revoke')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
