import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { QrCode, Upload, ShieldCheck, XCircle, AlertTriangle, FileText, CheckCircle, Key } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import LegacyAPIPanel from '../../components/LegacyAPIPanel'

export default function Verify() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('scan') // scan | upload
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [legacyMode, setLegacyMode] = useState(false)
  const [jwtInput, setJwtInput] = useState('')
  
  const scannerRef = useRef(null)
  const html5QrCode = useRef(null)

  const legacyModeRef = useRef(legacyMode)
  useEffect(() => { legacyModeRef.current = legacyMode }, [legacyMode])
  const scanLock = useRef(false)

  const switchMode = async (newMode) => {
    if (mode === newMode) return
    if (html5QrCode.current?.isScanning) {
      try {
        await html5QrCode.current.stop()
        html5QrCode.current.clear()
      } catch (e) {
        console.error('Failed to stop scanner', e)
      }
    }
    scanLock.current = false // Reset lock when switching mode
    setMode(newMode)
  }

  useEffect(() => {
    if (mode === 'scan') {
      scanLock.current = false // reset lock on mount
      // Small timeout to ensure DOM is fully rendered before mounting scanner
      setTimeout(() => {
        if (!document.getElementById("qr-reader")) return;
        html5QrCode.current = new Html5Qrcode("qr-reader")
        html5QrCode.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleVerify(decodedText)
        ).catch(err => console.error("Scanner error", err))
      }, 100)
    }
    return () => {
      // Component unmount cleanup
      if (html5QrCode.current?.isScanning) {
        html5QrCode.current.stop().catch(e => {})
      }
    }
  }, [mode])

  const handleVerify = async (dataStr) => {
    if (scanLock.current) return
    scanLock.current = true // Synchronously lock to prevent 10fps loop execution!
    
    setLoading(true); setError(null); setResult(null)
    
    if (html5QrCode.current?.isScanning) {
      try {
        await html5QrCode.current.stop()
        html5QrCode.current.clear()
      } catch (e) {}
    }
    try {
      if (mode === 'scan') {
        setMode('manual') // Force stop scanner UI 
      }
      
      let proofJwt = dataStr
      let legacyId = null
      let legacyNonce = null

      try {
        const p = JSON.parse(dataStr)
        if (p.credentialId) {
          legacyId = p.credentialId
          legacyNonce = p.nonce
        } else if (p.proofJwt) {
          proofJwt = p.proofJwt
        }
      } catch (e) {
        // If it fails to parse as JSON, assume it's a raw JWT string (the new way)
      }

      const endpoint = legacyModeRef.current || legacyId ? '/v1/digilocker/verify-credential' : '/verifier/verify'
      const payload = legacyModeRef.current || legacyId ? { credentialId: legacyId, presentationNonce: legacyNonce } : { proofJwt }
      
      const { data } = await api.post(endpoint, payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid QR Code or verification failed')
    } finally { 
      setLoading(false)
      // Allow re-submission for manual forms
      if (mode !== 'scan') scanLock.current = false
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => handleVerify(e.target.result)
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar portal="verifier" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-6">{t('nav.verify')}</h1>

        {!result && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            {/* Mode Toggle */}
            <div className="flex bg-brand-50 rounded-xl p-1 mb-6">
              <button onClick={() => switchMode('scan')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'scan' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}>
                <span className="flex items-center justify-center gap-1.5"><QrCode className="w-4 h-4" />{t('verifier.scan_qr')}</span>
              </button>
              <button onClick={() => switchMode('upload')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'upload' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}>
                <span className="flex items-center justify-center gap-1.5"><Upload className="w-4 h-4" />{t('verifier.upload_vp')}</span>
              </button>
              <button onClick={() => switchMode('manual')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'manual' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}>
                <span className="flex items-center justify-center gap-1.5"><Key className="w-4 h-4" />Manual</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <input type="checkbox" id="legacyMode" checked={legacyMode} onChange={e => setLegacyMode(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-500" />
              <label htmlFor="legacyMode" className="text-sm text-brand-700 font-medium">Use DigiLocker/ONDC Legacy API Route</label>
            </div>

            {/* Scanner / Upload Area */}
            <div className="bg-brand-50 rounded-2xl p-6 text-center border-2 border-dashed border-brand-200">
              {loading ? (
                <div className="py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" /><p className="mt-4 text-brand-600 font-medium">{t('verifier.verifying')}</p></div>
              ) : mode === 'scan' ? (
                <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-none shadow-sm" />
              ) : mode === 'upload' ? (
                <div className="py-12">
                  <FileText className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                  <p className="text-brand-600 text-sm mb-4">Upload a Verifiable Presentation JSON file provided by the worker.</p>
                  <label className="btn-primary inline-flex cursor-pointer text-sm py-2">
                    <Upload className="w-4 h-4 mr-2" />{t('verifier.upload')} VP
                    <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              ) : (
                <div className="py-4 text-left">
                  <label className="block text-sm font-bold text-brand-700 mb-2">Paste JWT manually</label>
                  <textarea 
                    value={jwtInput} 
                    onChange={e => setJwtInput(e.target.value)} 
                    className="input-field min-h-[120px] font-mono text-sm w-full mb-4 p-3 border border-brand-200" 
                    placeholder="ey..."
                  />
                  <button onClick={() => handleVerify(jwtInput)} className="btn-primary w-full shadow-sm py-3">Verify JWT</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card border-red-200 bg-red-50 text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={() => { setError(null); setMode('scan') }} className="btn-primary bg-red-600 hover:bg-red-700 shadow-none">Try Again</button>
          </motion.div>
        )}

        {/* Success / Result State */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className={`card text-center py-8 border-2 ${result.result === 'verified' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              {result.result === 'verified' ? <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" /> : <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />}
              <h2 className={`text-2xl font-bold mb-2 ${result.result === 'verified' ? 'text-emerald-900' : 'text-amber-900'}`}>{result.result === 'verified' ? 'Credential Verified!' : 'Verification Warning'}</h2>
              <p className={result.result === 'verified' ? 'text-emerald-700' : 'text-amber-700'}>
                {result.result === 'verified' ? 'Blockchain cryptographic signature is valid and active.' : 'Cryptographic signature is valid, but the credential status requires attention.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${result.result === 'verified' ? 'bg-emerald-100 text-emerald-800' : result.result === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                  Status: {result.result?.toUpperCase() || 'UNKNOWN'}
                </span>
                {result.verificationTimeMs && (
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${result.result === 'verified' ? 'bg-emerald-100 text-emerald-800' : result.result === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                    Time: {result.verificationTimeMs}ms
                  </span>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-brand-900 mb-4 border-b border-border pb-2">Credential Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-xs text-brand-500">Worker DID</div><div className="text-sm font-mono text-brand-900 break-all">{result.credentialSubject?.id || result.legacyAPIResponse?.holder_did || '—'}</div></div>
                <div><div className="text-xs text-brand-500">Skill Name</div><div className="text-sm font-medium text-brand-900">{result.credentialSubject?.skillName || result.legacyAPIResponse?.shared_attributes?.skillName || '—'}</div></div>
                <div><div className="text-xs text-brand-500">Credential Type</div><div className="text-sm text-brand-900">{result.credentialSubject?.credentialType || result.legacyAPIResponse?.credential_type || '—'}</div></div>
                <div><div className="text-xs text-brand-500">Grade</div><div className="text-sm font-bold text-brand-700">{result.credentialSubject?.grade || result.legacyAPIResponse?.shared_attributes?.grade || '—'}</div></div>
                <div><div className="text-xs text-brand-500">Issuer DID</div><div className="text-sm font-mono text-brand-900 break-all">{result.legacyAPIResponse?.issuer_did || '—'}</div></div>
                <div><div className="text-xs text-brand-500">Issuance Date</div><div className="text-sm text-brand-900">{result.credentialSubject?.issuedAt ? new Date(result.credentialSubject.issuedAt).toLocaleDateString() : '—'}</div></div>
              </div>
            </div>

            <LegacyAPIPanel response={result} />

            <div className="text-center pt-4">
              <button onClick={() => { setResult(null); setMode('scan') }} className="btn-secondary">Scan Another Credential</button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
