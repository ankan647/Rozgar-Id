import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('rozgarid_wallet_user')
    const token = localStorage.getItem('rozgarid_wallet_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (userData, tokens) => {
    localStorage.setItem('rozgarid_wallet_token', tokens.accessToken)
    localStorage.setItem('rozgarid_wallet_refresh', tokens.refreshToken)
    localStorage.setItem('rozgarid_wallet_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('rozgarid_wallet_token')
    localStorage.removeItem('rozgarid_wallet_refresh')
    localStorage.removeItem('rozgarid_wallet_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
