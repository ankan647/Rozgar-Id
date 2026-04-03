import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, Users, Award } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

const COLORS = ['#3B6FA0', '#4A80B0', '#7B9CC4', '#A7D8F0', '#2A5278', '#336290', '#BDE3F5', '#D9F0E5', '#EAF7F1']

export default function HiringDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [vStats, setVStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/issuer/stats'),
      api.get('/credential/stats/global'),
    ]).then(([s, vs]) => {
      setStats(s.data)
      setVStats(vs.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <><Navbar portal="issuer" /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div></>

  const skillData = stats?.skillBreakdown?.map(s => ({ name: s._id || 'Unknown', value: s.count })) || []

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="issuer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-700" />{t('nav.hiring')}
        </h1>

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, label: 'Total Credentials', value: stats?.totalIssued || 0, color: 'text-brand-700 bg-brand-100' },
            { icon: Users, label: 'Active Workers', value: stats?.totalActive || 0, color: 'text-emerald-600 bg-emerald-50' },
            { icon: Clock, label: 'Avg Verification Time', value: '~2s', color: 'text-brand-600 bg-brand-50' },
            { icon: TrendingUp, label: 'Total Verifications', value: vStats?.totalVerifications || 0, color: 'text-brand-500 bg-brand-200' },
          ].map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold text-brand-900">{c.value}</div><div className="text-xs text-brand-500">{c.label}</div></div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Breakdown Pie */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h2 className="font-semibold text-brand-900 mb-4">Skill Breakdown</h2>
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={skillData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {skillData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-brand-400 text-center py-12">No data yet</p>}
          </motion.div>

          {/* Bar chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <h2 className="font-semibold text-brand-900 mb-4">Credentials by Type</h2>
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6E4EC" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B6FA0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-brand-400 text-center py-12">No data yet</p>}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
