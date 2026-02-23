/**
 * vite.config.js
 *
 * Dev server runs on :3000 and proxies every backend API path to :8000.
 * This eliminates CORS issues during development — the browser only
 * ever talks to localhost:3000, and Vite forwards API calls server-side.
 *
 * To run:
 *   Backend  →  uvicorn backend.main:app --reload --port 8000
 *   Frontend →  npm run dev   (this file, port 3000)
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:8000'

// All path prefixes that should be forwarded to FastAPI
const API_PATHS = [
  '/auth',
  '/start-simulation',
  '/stop-simulation',
  '/simulations',
  '/get-logs',
  '/analyze-threat',
  '/submit-decision',
  '/get-score',
  '/get-report',
  '/health',
]

const proxy = Object.fromEntries(
  API_PATHS.map((path) => [
    path,
    {
      target: BACKEND,
      changeOrigin: true,
      secure: false,
      // Log proxy activity in dev for debugging
      configure: (proxy) => {
        proxy.on('error',    (err) => console.error('[proxy error]', err.message))
        proxy.on('proxyReq', (_, req) => console.log('[→ API]', req.method, req.url))
      },
    },
  ])
)

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: true,           // Bind to 0.0.0.0 — needed for Docker / WSL2 / Codespaces
    open: false,
    strictPort: true,     // Fail loudly if port 3000 is taken
    proxy,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Make @ an alias for ./src
  resolve: {
    alias: { '@': '/src' },
  },
})
