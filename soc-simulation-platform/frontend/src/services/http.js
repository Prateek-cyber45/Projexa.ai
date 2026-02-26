/**
 * utils/api.js — Axios instance configured for the SOC Platform.
 *
 * IMPORTANT: Uses relative base URL ('')  so ALL requests go through
 * Vite's dev-server proxy (vite.config.js → server.proxy).
 * This means /auth/login hits Vite → proxied to http://localhost:8000/auth/login.
 *
 * In production (after `npm run build`), point VITE_API_URL to your backend.
 */
import axios from 'axios'

// In dev: empty string → relative URLs → Vite proxy handles CORS & forwarding.
// In prod: set VITE_API_URL=https://your-backend.com in .env
const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Attach JWT to every outbound request ─────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Global response handler ──────────────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      console.warn('[API] 403 Forbidden — insufficient role permissions')
    }

    if (status >= 500) {
      console.error('[API] Server error:', error.response?.data)
    }

    return Promise.reject(error)
  }
)

export default api
