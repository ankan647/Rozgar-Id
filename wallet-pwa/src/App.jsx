import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Onboarding from './pages/Onboarding'
import WalletHome from './pages/WalletHome'
import CredentialDetail from './pages/CredentialDetail'
import ShareCredential from './pages/ShareCredential'
import SocialRecovery from './pages/SocialRecovery'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-surface pb-20">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Onboarding />} />
        <Route path="/home" element={<ProtectedRoute><WalletHome /></ProtectedRoute>} />
        <Route path="/credential/:id" element={<ProtectedRoute><CredentialDetail /></ProtectedRoute>} />
        <Route path="/share/:id" element={<ProtectedRoute><ShareCredential /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/recovery" element={<ProtectedRoute><SocialRecovery /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <BottomNav />}
    </div>
  )
}
