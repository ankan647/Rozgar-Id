import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('rozgarid_user')
    const token = localStorage.getItem('rozgarid_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (userData, tokens) => {
    const { accessToken, refreshToken } = tokens
    localStorage.setItem('rozgarid_token', accessToken)
    localStorage.setItem('rozgarid_refresh', refreshToken)
    localStorage.setItem('rozgarid_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('rozgarid_token')
    localStorage.removeItem('rozgarid_refresh')
    localStorage.removeItem('rozgarid_user')
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
