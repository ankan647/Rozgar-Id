import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import IssuerLogin from './pages/issuer/Login'
import IssuerDashboard from './pages/issuer/Dashboard'
import IssueCredential from './pages/issuer/IssueCredential'
import IssuerCredentials from './pages/issuer/Credentials'
import HiringDashboard from './pages/issuer/HiringDashboard'
import DIDViewer from './pages/issuer/DIDViewer'
import VerifierLogin from './pages/verifier/Login'
import VerifierDashboard from './pages/verifier/Dashboard'
import Verify from './pages/verifier/Verify'
import VerifierLogs from './pages/verifier/Logs'
import ActivityLogPage from './pages/ActivityLog'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-surface"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>
  if (!user) return <Navigate to={`/${role}/login`} replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Issuer Portal */}
      <Route path="/issuer/login" element={<IssuerLogin />} />
      <Route path="/issuer/dashboard" element={<ProtectedRoute role="issuer"><IssuerDashboard /></ProtectedRoute>} />
      <Route path="/issuer/issue" element={<ProtectedRoute role="issuer"><IssueCredential /></ProtectedRoute>} />
      <Route path="/issuer/credentials" element={<ProtectedRoute role="issuer"><IssuerCredentials /></ProtectedRoute>} />
      <Route path="/issuer/hiring-dashboard" element={<ProtectedRoute role="issuer"><HiringDashboard /></ProtectedRoute>} />
      <Route path="/issuer/did" element={<ProtectedRoute role="issuer"><DIDViewer /></ProtectedRoute>} />

      {/* Verifier Portal */}
      <Route path="/verifier/login" element={<VerifierLogin />} />
      <Route path="/verifier/dashboard" element={<ProtectedRoute role="verifier"><VerifierDashboard /></ProtectedRoute>} />
      <Route path="/verifier/verify" element={<ProtectedRoute role="verifier"><Verify /></ProtectedRoute>} />
      <Route path="/verifier/logs" element={<ProtectedRoute role="verifier"><VerifierLogs /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/activity" element={<ActivityLogPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
