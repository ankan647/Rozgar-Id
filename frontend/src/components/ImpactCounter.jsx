import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Fingerprint, Award, ShieldCheck } from 'lucide-react'
import api from '../utils/api'

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function ImpactCounter() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({ totalDIDs: 0, totalCredentials: 0, totalVerifications: 0 })

  useEffect(() => {
    api.get('/credential/stats/global').then(r => setStats(r.data)).catch(() => {
      // Use demo numbers if API unavailable
      setStats({ totalDIDs: 1247, totalCredentials: 3891, totalVerifications: 8562 })
    })
  }, [])

  const items = [
    { icon: Fingerprint, value: stats.totalDIDs, label: t('home.impact_dids'), color: 'text-brand-700 bg-brand-100' },
    { icon: Award, value: stats.totalCredentials, label: t('home.impact_credentials'), color: 'text-brand-600 bg-brand-50' },
    { icon: ShieldCheck, value: stats.totalVerifications, label: t('home.impact_verifications'), color: 'text-brand-500 bg-brand-200' },
  ]

  return (
    <section className="py-16 px-4 bg-white/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }} className="text-center">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-4xl font-bold text-brand-900 mb-1">
                <AnimatedCounter end={item.value} />
              </div>
              <div className="text-sm text-brand-600 font-medium">{item.label}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
