import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/start-simulation': 'http://localhost:8000',
      '/stop-simulation': 'http://localhost:8000',
      '/get-logs': 'http://localhost:8000',
      '/analyze-threat': 'http://localhost:8000',
      '/submit-decision': 'http://localhost:8000',
      '/get-score': 'http://localhost:8000',
      '/get-report': 'http://localhost:8000',
      '/simulations': 'http://localhost:8000',
    },
  },
})
