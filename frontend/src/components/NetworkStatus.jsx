import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function NetworkStatus() {
  const [status, setStatus] = useState('connected') // connected | offline | syncing

  useEffect(() => {
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'connected' : 'offline')
    }
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    updateStatus()
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  const config = {
    connected: { icon: Wifi, text: 'Polygon Amoy', color: 'text-emerald-600 bg-emerald-50', dot: 'bg-emerald-500' },
    offline: { icon: WifiOff, text: 'Offline', color: 'text-red-600 bg-red-50', dot: 'bg-red-500' },
    syncing: { icon: RefreshCw, text: 'Syncing...', color: 'text-brand-600 bg-brand-50', dot: 'bg-brand-500' },
  }

  const c = config[status]
  const Icon = c.icon

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'syncing' ? 'animate-pulse' : ''}`} />
      <Icon className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{c.text}</span>
    </div>
  )
}
