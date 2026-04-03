import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

export default function VerifierLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/verifier/logs').then(r => { setLogs(r.data.logs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="verifier" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6">{t('nav.logs')}</h1>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">{t('common.date')}</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Credential ID</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Worker</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">{t('common.status')}</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-700">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-brand-400">{t('common.loading')}</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-brand-400">No verification logs found.</td></tr>
                ) : logs.map((log, i) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-brand-50/50 transition-colors">
                    <td className="px-4 py-3 text-brand-600 whitespace-nowrap">{new Date(log.createdAt || log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-500 break-all">{log.credentialId?.credentialType?.[1] || log.credentialId?.credentialType || '—'} - {log.credentialId?.skillName || '—'}</td>
                    <td className="px-4 py-3 font-medium text-brand-900">{log.workerId?.name || log.workerDid?.slice(0, 16) + '...' || '—'}</td>
                    <td className="px-4 py-3"><span className={log.result === 'verified' ? 'badge-active' : 'badge-revoked'}>{log.result?.toUpperCase() || 'UNKNOWN'}</span></td>
                    <td className="px-4 py-3 text-brand-500">{log.verificationTimeMs}ms</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
