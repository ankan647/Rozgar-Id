import useOffline from '../hooks/useOffline'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OfflineIndicator() {
  const isOffline = useOffline()
  const { t } = useTranslation()

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
      isOffline ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
      {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
      {isOffline ? t('wallet.offline') : t('wallet.online')}
    </div>
  )
}
