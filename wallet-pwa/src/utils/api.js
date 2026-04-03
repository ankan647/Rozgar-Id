import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('rozgarid_wallet_refresh')
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh-token`, { refreshToken })
        localStorage.setItem('rozgarid_wallet_token', data.accessToken)
        localStorage.setItem('rozgarid_wallet_refresh', data.refreshToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (e) {
        localStorage.clear()
        window.location.href = '/wallet'
      }
    }
    return Promise.reject(error)
  }
)

export default api
