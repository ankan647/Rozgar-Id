import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Globe, Fingerprint, Shield, LogOut, ChevronRight, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import OfflineIndicator from '../components/OfflineIndicator'
import api from '../utils/api'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/worker/profile').then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('rozgarid_wallet_lang', next)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const menuItems = [
    { icon: User, label: t('wallet.profile'), value: profile?.name || user?.name, onClick: null, color: 'text-brand-500 bg-brand-50' },
    { icon: Fingerprint, label: t('wallet.did'), value: user?.did?.slice(0, 15) + '...', onClick: null, color: 'text-brand-600 bg-brand-100' },
    { icon: Globe, label: t('wallet.language'), value: i18n.language === 'en' ? 'English' : 'हिंदी', onClick: toggleLang, color: 'text-emerald-500 bg-emerald-50' },
    { icon: Shield, label: t('wallet.recovery'), value: '', onClick: () => navigate('/recovery'), color: 'text-amber-500 bg-amber-50' },
  ]

  return (
    <div className="px-4 py-8 max-w-[480px] mx-auto min-h-screen bg-surface">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-brand-900 tracking-tight">{t('wallet.settings')}</h1>
        <OfflineIndicator />
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-[2rem] p-6 text-white shadow-brand mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold mb-0.5">{profile?.name || user?.name || 'Worker Profile'}</div>
            <div className="text-sm text-brand-200 font-medium">{profile?.phone || user?.phone}</div>
            <div className="text-xs text-brand-300 mt-1 uppercase tracking-wider font-bold">
              {profile?.homeState && `${profile.homeState} → ${profile.currentState || '?'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <Award className="w-6 h-6 text-brand-400 mb-2" />
          <div className="text-2xl font-black text-brand-900">{profile?.skills?.length || 0}</div>
          <div className="text-xs text-brand-500 font-medium">Verified Skills</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <Shield className="w-6 h-6 text-emerald-400 mb-2" />
          <div className="text-2xl font-black text-brand-900">Active</div>
          <div className="text-xs text-brand-500 font-medium">Account Status</div>
        </div>
      </div>

      {/* Menu */}
      <h3 className="font-bold text-brand-900 px-1 mb-3 text-sm uppercase tracking-wide">Preferences</h3>
      <div className="card p-0 divide-y divide-border mb-8 bg-white overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon
          return (
            <button key={i} onClick={item.onClick} disabled={!item.onClick}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-brand-50/50 transition-colors disabled:opacity-70 group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-brand-900 group-hover:text-brand-700 transition-colors">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm font-medium text-brand-500">{item.value}</span>}
                {item.onClick && <ChevronRight className="w-5 h-5 text-brand-300 group-hover:text-brand-500 transition-colors" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-600 bg-red-50 font-bold hover:bg-red-100 transition-colors border border-red-100 shadow-sm">
        <LogOut className="w-5 h-5" />{t('wallet.logout')}
      </button>

      <div className="text-center mt-8">
        <p className="text-xs font-medium text-brand-300">RozgarID Wallet v1.0.0</p>
      </div>
    </div>
  )
}
