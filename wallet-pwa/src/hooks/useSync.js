import { useEffect, useCallback } from 'react'
import { getPendingSync, removePendingItem } from '../utils/indexedDB'
import api from '../utils/api'

/**
 * useSync — syncs pending offline verifications to backend when online.
 * Reads pending items from IndexedDB, POSTs to /api/v1/verifier/verify,
 * removes synced items, and triggers on connectivity change.
 */
export default function useSync() {
  const syncPending = useCallback(async () => {
    if (!navigator.onLine) return

    try {
      const pending = await getPendingSync()
      if (!pending.length) return

      console.log(`🔄 Syncing ${pending.length} pending items...`)

      for (const item of pending) {
        try {
          await api.post('/verifier/verify', {
            proofJwt: item.proofJwt,
            offlineVerification: true,
          })
          await removePendingItem(item.id)
          console.log(`✅ Synced item ${item.id}`)
        } catch (err) {
          console.warn(`❌ Failed to sync item ${item.id}:`, err.message)
          // Keep in queue for next sync attempt
        }
      }
    } catch (err) {
      console.error('Sync error:', err)
    }
  }, [])

  useEffect(() => {
    // Sync on mount and when coming back online
    syncPending()
    window.addEventListener('online', syncPending)
    return () => window.removeEventListener('online', syncPending)
  }, [syncPending])

  return { syncPending }
}
