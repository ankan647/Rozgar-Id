import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Bell, Award, ShieldCheck, XCircle, Check } from 'lucide-react'
import api from '../utils/api'

const typeIcons = {
  credential_issued: { icon: Award, color: 'text-emerald-600 bg-emerald-50' },
  credential_verified: { icon: ShieldCheck, color: 'text-brand-700 bg-brand-100' },
  credential_revoked: { icon: XCircle, color: 'text-red-600 bg-red-50' },
}

export default function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/worker/notifications').then(r => { setNotifications(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read').catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="px-4 py-6 max-w-[480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-brand-900 flex items-center gap-2"><Bell className="w-5 h-5 text-brand-700" />{t('wallet.notifications')}</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:text-brand-800 transition-colors"><Check className="w-3.5 h-3.5" />Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-brand-300" />
          </div>
          <p className="text-brand-500 font-medium">{t('wallet.no_notifications')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const tc = typeIcons[notif.type] || { icon: Bell, color: 'text-brand-500 bg-brand-50' }
            const Icon = tc.icon
            return (
              <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors border ${notif.read ? 'bg-white border-border shadow-sm' : 'bg-brand-50/50 border-brand-100 shadow'}`}>
                <div className={`w-10 h-10 rounded-xl ${tc.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className={`text-sm font-bold truncate ${notif.read ? 'text-brand-800' : 'text-brand-900'}`}>{notif.title}</div>
                  <div className={`text-xs mt-0.5 leading-snug ${notif.read ? 'text-brand-500' : 'text-brand-700 font-medium'}`}>{notif.message}</div>
                  <div className="text-[10px] text-brand-400 mt-1.5 uppercase font-medium">{new Date(notif.createdAt).toLocaleString()}</div>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2 shadow-sm" />}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
