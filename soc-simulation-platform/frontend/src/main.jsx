/**
 * main.jsx — React application entry point.
 *
 * Wraps the app in:
 *   - React.StrictMode      (double-render checks in dev)
 *   - BrowserRouter         (client-side routing)
 *   - ErrorBoundary         (catches render errors, shows fallback UI)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

/* ── Simple Error Boundary (class component — required by React API) ──────── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[SOC Platform] Render error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#030712', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', gap: 16, padding: 24,
        }}>
          <div style={{ fontSize: 48 }}>⚠</div>
          <div style={{ fontSize: 14, fontWeight: 'bold' }}>SYSTEM ERROR</div>
          <div style={{ fontSize: 11, color: '#6b7280', maxWidth: 480, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{
              marginTop: 8, background: '#14532d', color: '#86efac', border: '1px solid #166534',
              padding: '8px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
              letterSpacing: '0.1em', fontFamily: 'inherit',
            }}>
            RESTART PLATFORM
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/* ── Mount ───────────────────────────────────────────────────────────────── */
const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found in index.html')

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
