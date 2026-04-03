import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ActivityLog from '../components/ActivityLog'
import api from '../utils/api'

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from a combined activity endpoint
    // For now, we'll construct it from what's available
    const token = localStorage.getItem('rozgarid_token')
    const role = JSON.parse(localStorage.getItem('rozgarid_user') || '{}')?.role

    if (!token || !role) {
      setLoading(false)
      return
    }

    if (role === 'issuer') {
      api.get('/issuer/stats').then(r => {
        const mapped = r.data.recentCredentials?.map(c => ({
          type: c.status === 'active' ? 'credential_issued' : 'credential_revoked',
          title: c.status === 'active' ? 'Issued Credential' : 'Revoked Credential',
          message: `${c.skillName} for ${c.workerId?.name || 'Worker'}`,
          portal: 'Issuer',
          timestamp: c.createdAt
        })) || []
        setActivities(mapped)
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      api.get('/verifier/logs').then(r => {
        const mapped = (r.data.logs || []).map(l => ({
          type: l.verified ? 'credential_verified' : 'credential_revoked',
          title: l.verified ? 'Verified Successfully' : 'Verification Failed',
          message: `Checked credential for ${l.workerId?.name || 'Worker'}`,
          portal: 'Verifier',
          timestamp: l.timestamp
        }))
        setActivities(mapped)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal={JSON.parse(localStorage.getItem('rozgarid_user') || '{}')?.role || 'issuer'} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6">Activity Log</h1>
        
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ActivityLog activities={activities} />
          </motion.div>
        )}
      </main>
    </div>
  )
}
