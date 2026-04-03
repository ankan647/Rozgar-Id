import { Clock, Award, ShieldCheck, XCircle, UserPlus, Eye } from 'lucide-react'

const iconMap = {
  credential_issued: { icon: Award, color: 'text-emerald-600 bg-emerald-50' },
  credential_verified: { icon: ShieldCheck, color: 'text-brand-700 bg-brand-100' },
  credential_revoked: { icon: XCircle, color: 'text-red-600 bg-red-50' },
  login: { icon: UserPlus, color: 'text-brand-600 bg-brand-50' },
  default: { icon: Eye, color: 'text-brand-500 bg-brand-50' },
}

export default function ActivityLog({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="card text-center py-8 text-brand-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    )
  }

  return (
    <div className="card p-0 divide-y divide-border">
      {activities.map((act, i) => {
        const { icon: Icon, color } = iconMap[act.type] || iconMap.default
        return (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-brand-50/30 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-900 truncate">{act.title}</p>
              <p className="text-xs text-brand-500 truncate">{act.message}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                {act.portal}
              </span>
              <span className="text-xs text-brand-400 mt-0.5">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
