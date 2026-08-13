import axios from 'axios'

export const TOKEN_KEY = 'orgdash_token'
export const USER_KEY = 'orgdash_user'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
