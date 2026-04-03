import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Copy, CheckCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'

export default function DIDViewer() {
  const [did, setDid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/issuer/did').then(r => { setDid(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const copyDid = () => {
    navigator.clipboard.writeText(did?.did || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <><Navbar portal="issuer" /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div></>

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="issuer" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6 flex items-center gap-2"><Fingerprint className="w-6 h-6 text-brand-700" />My DID</h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-brand-900">{did?.name}</h2>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{did?.type}</span>
            </div>
            <button onClick={copyDid} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-brand-50 hover:border-brand-300 transition-all">
              {copied ? <><CheckCircle className="w-4 h-4 text-emerald-500" />Copied!</> : <><Copy className="w-4 h-4 text-brand-600" />Copy DID</>}
            </button>
          </div>

          <div className="bg-brand-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-brand-500 mb-1">Decentralized Identifier</div>
            <code className="text-sm text-brand-900 break-all">{did?.did}</code>
          </div>

          <div>
            <h3 className="font-medium text-brand-900 mb-2">DID Document</h3>
            <div className="bg-brand-950 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-brand-300 whitespace-pre-wrap">
                {JSON.stringify(did?.didDocument, null, 2)}
              </pre>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
