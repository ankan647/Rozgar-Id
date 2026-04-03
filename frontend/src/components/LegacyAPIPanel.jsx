import { motion } from 'framer-motion'
import { Code, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LegacyAPIPanel({ response }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  if (!response) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mt-4">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-brand-700" />
          <h3 className="font-semibold text-brand-900">{t('verifier.legacy_api')}</h3>
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">DigiLocker / ONDC</span>
        </div>
        <ExternalLink className={`w-4 h-4 text-brand-500 transition-transform ${expanded ? 'rotate-45' : ''}`} />
      </button>

      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4">
          <div className="bg-brand-950 rounded-xl p-4 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-emerald-400">GET</span>
              <span className="text-xs font-mono text-brand-400">/api/v1/digilocker/verify-credential</span>
            </div>
            <pre className="text-sm font-mono text-brand-300 whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
          <p className="text-xs text-brand-500 mt-2">
            This response is compatible with DigiLocker ABC and ONDC credential verification standards.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
