import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Award, Search, Key, RefreshCw } from 'lucide-react'
import OfflineIndicator from '../components/OfflineIndicator'
import api from '../utils/api'
import { getLocalCredentials, saveCredentials, clearLocalCredentials } from '../utils/indexedDB'

export default function WalletHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)

  const loadCredentials = async () => {
    try {
      const stored = await getLocalCredentials()
      setCredentials(stored)
    } finally {
      setLoading(false)
    }
  }

  const syncWithCloud = async () => {
    if (!navigator.onLine) return
    setSyncing(true)
    try {
      const { data } = await api.get('/worker/credentials')
      // Update local db
      await clearLocalCredentials()
      if (data?.length) await saveCredentials(data)
      setCredentials(data)
    } catch (err) {
      console.error('Sync failed:', err)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { loadCredentials() }, [])

  // Auto-sync on load if online
  useEffect(() => {
    if (navigator.onLine) syncWithCloud()
  }, [])

  const filtered = credentials.filter(c => 
    !search || 
    c.skillName?.toLowerCase().includes(search.toLowerCase()) ||
    c.credentialType?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="px-4 py-6 max-w-[480px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-brand-900 tracking-tight">{t('wallet.welcome')}</h1>
          <p className="text-brand-500 text-sm">{user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs bg-surface border-none text-brand-600 font-medium focus:ring-0 cursor-pointer">
            <option>Amoy Network</option>
          </select>
          <OfflineIndicator />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credentials..." className="input-field pl-10 h-11 text-sm bg-white" />
        </div>
        <button onClick={syncWithCloud} disabled={syncing || !navigator.onLine} className="p-3 bg-white rounded-xl border border-border text-brand-600 shadow-sm hover:bg-brand-50 disabled:opacity-50 transition-colors">
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-brand-500 font-medium mb-2">{t('wallet.no_credentials')}</p>
            <p className="text-xs text-brand-400">Credentials issued to your phone number will appear here automatically.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div key={c._id || c.credentialId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} onClick={() => navigate(`/credential/${c._id}`)}
                className="card group cursor-pointer hover:border-brand-300 relative overflow-hidden bg-white">
                {/* Status indicator line */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${c.status === 'active' ? 'bg-emerald-500' : c.status === 'revoked' ? 'bg-red-500' : 'bg-amber-500'}`} />
                
                <div className="flex justify-between items-start mb-3 pl-2">
                  <div>
                    <h3 className="font-bold text-brand-900 group-hover:text-brand-700 transition-colors">{c.skillName}</h3>
                    <p className="text-xs font-medium text-brand-500">{c.credentialType}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center flex-shrink-0 text-brand-700 font-bold shadow-inner">
                    {c.grade || 'C'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-brand-400 pl-2">
                  <span className="flex items-center gap-1.5 font-mono"><Key className="w-3.5 h-3.5" />...{c.credentialId?.slice(-6)}</span>
                  <span>{new Date(c.createdAt || c.issuanceDate).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
