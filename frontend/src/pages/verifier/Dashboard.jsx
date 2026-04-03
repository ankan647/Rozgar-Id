import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

export default function VerifierDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/verifier/stats').then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <><Navbar portal="verifier" /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div></>

  const cards = [
    { label: 'Total Verifications', value: stats?.total || 0, icon: ShieldCheck, color: 'text-brand-700 bg-brand-100' },
    { label: 'Verified', value: stats?.verified || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Revoked', value: stats?.revoked || 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Invalid', value: stats?.invalid || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="verifier" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-brand-900 mb-6">{t('nav.dashboard')}</motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Avg verification time */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl text-brand-600 bg-brand-50 flex items-center justify-center"><Clock className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold text-brand-900">{stats?.avgVerificationTimeMs ? `${Math.round(stats.avgVerificationTimeMs)}ms` : '—'}</div>
            <div className="text-sm text-brand-500">Average Verification Time</div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
