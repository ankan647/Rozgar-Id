import { NavLink } from 'react-router-dom'
import { Home, Share2, Bell, Settings } from 'lucide-react'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/share/select', icon: Share2, label: 'Share' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-border z-50 max-w-[480px] mx-auto shadow-glass">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-300 ${isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-400 hover:text-brand-600'}`}>
            <Icon className={`w-5 h-5 ${location.pathname === to ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
