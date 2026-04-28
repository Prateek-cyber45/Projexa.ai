/**
 * services/api.js — Named API helper functions.
 *
 * Thin wrappers around the Axios instance in utils/api.js.
 * Pages import from here instead of hardcoding URL strings.
 *
 * All paths match the FastAPI routes registered in backend/main.py.
 */
import api from '../utils/api'

/* ── Authentication ──────────────────────────────────────────────────────── */
export const authAPI = {
  register: (data)       => api.post('/auth/register', data),
  login:    (data)       => api.post('/auth/login', data),
  getMe:    ()           => api.get('/auth/me'),
}

/* ── Simulations ─────────────────────────────────────────────────────────── */
export const simulationAPI = {
  start:    (payload)    => api.post('/start-simulation', payload),
  stop:     (simId)      => api.post('/stop-simulation', { simulation_id: simId }),
  list:     ()           => api.get('/simulations'),
  getById:  (simId)      => api.get(`/simulations/${simId}`),
}

/* ── Logs ────────────────────────────────────────────────────────────────── */
export const logsAPI = {
  getLogs: (simId, params = {}) =>
    api.get('/get-logs', { params: { simulation_id: simId, ...params } }),
  analyze: (payload) => api.post('/analyze-threat', payload),
}

/* ── Scoring ─────────────────────────────────────────────────────────────── */
export const scoringAPI = {
  submitDecision: (payload) => api.post('/submit-decision', payload),
  getScore:  (simId)        => api.get('/get-score',  { params: { simulation_id: simId } }),
  getReport: (simId)        => api.get('/get-report', { params: { simulation_id: simId } }),
}

export default api
