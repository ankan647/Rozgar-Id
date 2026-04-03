import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

export default function IssuerDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/issuer/stats').then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <><Navbar portal="issuer" /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div></>

  const cards = [
    { label: t('issuer.stats_issued'), value: stats?.totalIssued || 0, icon: Award, color: 'text-brand-700 bg-brand-100' },
    { label: t('issuer.stats_active'), value: stats?.totalActive || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('issuer.stats_revoked'), value: stats?.totalRevoked || 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="issuer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-brand-900 mb-6">{t('nav.dashboard')}</motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center`}><Icon className="w-6 h-6" /></div>
                <div><div className="text-2xl font-bold text-brand-900">{c.value}</div><div className="text-sm text-brand-500">{c.label}</div></div>
              </motion.div>
            )
          })}
        </div>

        {/* Recent credentials */}
        <div className="card">
          <h2 className="font-semibold text-brand-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-700" />Recent Credentials</h2>
          {stats?.recentCredentials?.length ? (
            <div className="space-y-3">
              {stats.recentCredentials.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium text-sm text-brand-900">{c.skillName}</div>
                    <div className="text-xs text-brand-500">{c.workerId?.name || 'Worker'} • {c.credentialType}</div>
                  </div>
                  <span className={c.status === 'active' ? 'badge-active' : 'badge-revoked'}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-brand-400">No credentials issued yet.</p>}
        </div>
      </main>
    </div>
  )
}
