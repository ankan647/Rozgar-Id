import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import NetworkStatus from './NetworkStatus'
import { Menu, X, Globe, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ portal = 'issuer' }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = portal === 'issuer'
    ? [
        { to: '/issuer/dashboard', label: t('nav.dashboard') },
        { to: '/issuer/issue', label: t('nav.issue') },
        { to: '/issuer/credentials', label: t('nav.credentials') },
        { to: '/issuer/hiring-dashboard', label: t('nav.hiring') },
        { to: '/issuer/did', label: t('nav.did') },
      ]
    : [
        { to: '/verifier/dashboard', label: t('nav.dashboard') },
        { to: '/verifier/verify', label: t('nav.verify') },
        { to: '/verifier/logs', label: t('nav.logs') },
      ]

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('rozgarid_lang', next)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white font-bold text-sm shadow-brand">R</div>
            <span className="font-bold text-lg text-brand-900">RozgarID</span>
            <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              {portal === 'issuer' ? t('home.issuer_portal') : t('home.verifier_portal')}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.to ? 'text-brand-700 bg-brand-50 shadow-sm' : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <NetworkStatus />
            <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors">
              <Globe className="w-4 h-4" />
              {t('nav.language')}
            </button>
            {user && (
              <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-brand-700">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-white/90 backdrop-blur-xl px-4 py-2">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700'}`}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
