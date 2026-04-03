import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ChevronLeft, Share2, CheckCircle, MapPin, Key, XCircle, AlertTriangle } from 'lucide-react'
import { getLocalCredential } from '../utils/indexedDB'

export default function CredentialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [cred, setCred] = useState(null)
  
  useEffect(() => {
    getLocalCredential(id).then(c => setCred(c)).catch(() => navigate('/home'))
  }, [id, navigate])

  if (!cred) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-border px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 rounded-xl text-brand-700 hover:bg-brand-50 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-brand-900">{t('wallet.credential_details')}</span>
        <button onClick={() => navigate(`/share/${cred._id}`)} className="p-2 -mr-2 rounded-xl text-brand-700 hover:bg-brand-50 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto">
        {/* Verification Status Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
          className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
            cred.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
            cred.status === 'revoked' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'
          }`}>
          {cred.status === 'active' ? <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" /> : 
           cred.status === 'revoked' ? <XCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" /> : 
           <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />}
          <div>
            <div className="font-bold mb-0.5">
              {cred.status === 'active' ? 'Verified Credential' : cred.status === 'revoked' ? 'Revoked Credential' : 'Needs Attention'}
            </div>
            <div className={`text-xs leading-relaxed ${cred.status === 'active' ? 'text-emerald-700' : cred.status === 'revoked' ? 'text-red-700' : 'text-amber-700'}`}>
              {cred.status === 'active' ? 'This credential is cryptographic valid on the Polygon Amoy blockchain.' : 'This credential has been revoked by the issuer and is no longer valid.'}
            </div>
          </div>
        </motion.div>

        {/* Beautiful Card Presentation */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
          <div className="bg-gradient-to-br from-brand-700 to-brand-950 rounded-[2rem] p-6 text-white shadow-brand overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 opacity-80">
                <span className="text-[10px] font-bold tracking-widest uppercase">RozgarID</span>
                <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">R</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-1">{cred.skillName}</h2>
              <p className="text-brand-300 text-sm font-medium mb-8">{cred.credentialType?.replace(/([A-Z])/g, ' $1').trim()}</p>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-brand-300 uppercase tracking-wider mb-1">Grade</div>
                  <div className="text-3xl font-black">{cred.grade || 'C'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-brand-300 uppercase tracking-wider mb-1">Issued</div>
                  <div className="font-medium text-sm">{new Date(cred.createdAt || cred.issuanceDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="font-bold text-brand-900 px-1 border-b border-border pb-2 text-sm uppercase tracking-wide">Blockchain Details</h3>
          
          <div className="card p-0 divide-y divide-border">
            <div className="p-4 flex gap-4 bg-white/50">
              <Key className="w-5 h-5 text-brand-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-brand-500 font-medium mb-1">Credential ID</div>
                <div className="text-sm font-mono text-brand-900 break-all">{cred.credentialId}</div>
              </div>
            </div>
            
            <div className="p-4 flex gap-4 bg-white/50">
              <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-brand-500 font-medium mb-1">Issuer DID</div>
                <div className="text-sm font-mono text-brand-900 break-all">{cred.issuerDid || cred.issuer}</div>
              </div>
            </div>
            
            {(cred.ipfsHash || cred.ipfsCid) && (
              <div className="p-4 flex gap-4 bg-white/50">
                <Share2 className="w-5 h-5 text-brand-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-brand-500 font-medium mb-1">IPFS Storage</div>
                  <div className="text-sm font-mono text-brand-900 break-all">{cred.ipfsHash || cred.ipfsCid}</div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => navigate(`/share/${cred._id}`)} className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-4">
            <Share2 className="w-5 h-5" />
            {t('wallet.share_credential')}
          </button>
        </div>
      </div>
    </div>
  )
}
