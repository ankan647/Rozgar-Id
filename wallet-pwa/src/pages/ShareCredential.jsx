import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ChevronLeft, Share2, Check, Download, Info, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getLocalCredential } from '../utils/indexedDB'
import api from '../utils/api'

const ALL_FIELDS = [
  { id: 'name', label: 'Name' },
  { id: 'skillName', label: 'Skill Name' },
  { id: 'grade', label: 'Grade' },
  { id: 'credentialType', label: 'Credential Type' },
  { id: 'issuerName', label: 'Issuer Name' },
  { id: 'issuedAt', label: 'Issued At' },
  { id: 'additionalNotes', label: 'Additional Notes' }
]

export default function ShareCredential() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [cred, setCred] = useState(null)
  
  // By default all true
  const [selectedFields, setSelectedFields] = useState(
    ALL_FIELDS.reduce((acc, f) => ({ ...acc, [f.id]: true }), {})
  )
  
  const [loading, setLoading] = useState(false)
  const [proofData, setProofData] = useState(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    getLocalCredential(id).then(c => {
      setCred(c)
    }).catch(() => navigate('/home'))
  }, [id, navigate])

  // Timer for QR code expiry
  useEffect(() => {
    if (!proofData?.expiresAt) return
    const interval = setInterval(() => {
      const ms = new Date(proofData.expiresAt).getTime() - Date.now()
      if (ms <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const m = Math.floor(ms / 60000)
        const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
        setTimeLeft(`${m}:${s}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [proofData])

  const toggleField = (fieldId) => {
    setSelectedFields(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const activeFields = Object.keys(selectedFields).filter(k => selectedFields[k])
      // Use cred._id to match backend expectations
      const { data } = await api.post('/worker/credentials/generate-proof', {
        credentialId: cred._id,
        selectedFields: activeFields
      })
      setProofData(data)
    } catch (err) {
      console.error('Error generating proof:', err)
      alert(err.response?.data?.error || 'Failed to generate proof')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyJWT = () => {
    if (proofData?.proofJwt) {
      navigator.clipboard.writeText(proofData.proofJwt)
      alert('JWT copied to clipboard!')
    }
  }

  if (!cred) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>

  return (
    <div className="pb-8 bg-surface min-h-screen relative">
      <div className="bg-white sticky top-0 z-10 border-b border-border px-4 py-4 flex items-center text-brand-900 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-brand-50 transition-colors mr-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold">{t('wallet.share')}</span>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-white mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-brand-900 leading-none mb-1">Selective Disclosure</h3>
              <p className="text-xs text-brand-500">Select the fields you want to share with the verifier.</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {ALL_FIELDS.map((f) => (
              <div key={f.id} onClick={() => toggleField(f.id)} 
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  selectedFields[f.id] ? 'border-brand-500 bg-brand-50' : 'border-border bg-white text-slate-400'
                }`}>
                <div className={`text-sm font-bold ${selectedFields[f.id] ? 'text-brand-900' : 'text-slate-500'}`}>
                  {f.label}
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  selectedFields[f.id] ? 'bg-brand-600 border-brand-600' : 'border-slate-300'
                }`}>
                  {selectedFields[f.id] && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate QR Code'}
          </button>
        </motion.div>

        {/* QR Code Presentation */}
        {proofData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center bg-white relative">
            <p className="text-sm font-bold text-brand-900 mb-6">Show this QR to the verifier</p>
            
            <div className="inline-block p-4 bg-white rounded-2xl border border-border shadow-sm mb-4">
              <QRCodeSVG value={proofData.qrData} size={220} level="H" includeMargin={true} />
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-brand-600 font-medium mb-6">
              <span>QR expires in: <span className="font-bold font-mono">{timeLeft}</span></span>
            </div>

            <button onClick={handleCopyJWT} className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> Copy JWT
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
