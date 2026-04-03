import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Building2, ShieldCheck, Wallet, Globe, ArrowRight, Sparkles } from 'lucide-react'
import StoryMode from '../components/StoryMode'
import ImpactCounter from '../components/ImpactCounter'

export default function Home() {
  const { t, i18n } = useTranslation()

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('rozgarid_lang', next)
  }

  const portals = [
    { to: '/issuer/login', icon: Building2, title: t('home.issuer_portal'), desc: t('home.issuer_desc'), gradient: 'from-brand-700 to-brand-800' },
    { to: '/verifier/login', icon: ShieldCheck, title: t('home.verifier_portal'), desc: t('home.verifier_desc'), gradient: 'from-brand-600 to-brand-700' },
    { to: '/wallet', icon: Wallet, title: t('home.worker_wallet'), desc: t('home.worker_desc'), gradient: 'from-brand-500 to-brand-600', external: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-white to-brand-50">
      {/* Top bar — Glassmorphism */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white font-bold shadow-brand">R</div>
            <span className="text-xl font-bold text-brand-900">RozgarID</span>
          </div>
          <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-brand-700 hover:bg-brand-50 transition-colors">
            <Globe className="w-4 h-4" />{t('nav.language')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl translate-y-1/2" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Built on Polygon Amoy Testnet
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-900 mb-6 leading-tight">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-brand-600 max-w-2xl mx-auto mb-12">
            {t('home.hero_subtitle')}
          </p>

          {/* Portal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {portals.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}>
                  <Link to={p.to} className="card group block text-left hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 shadow-brand group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-brand-900 mb-1 flex items-center gap-1">
                      {p.title}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </h3>
                    <p className="text-sm text-brand-600">{p.desc}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Story Mode */}
      <StoryMode />

      {/* Impact Counter */}
      <ImpactCounter />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-brand-500 border-t border-border bg-white/50">
        RozgarID &copy; 2026 — Empowering India's Migrant Workforce with Self Sovereign Identity
      </footer>
    </div>
  )
}
