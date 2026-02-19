import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './utils/auth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SimulationPage from './pages/SimulationPage'
import ReportPage from './pages/ReportPage'

const PrivateRoute = ({ children }) => getToken() ? children : <Navigate to="/login" replace />

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/simulation/:id" element={<PrivateRoute><SimulationPage /></PrivateRoute>} />
      <Route path="/report/:id" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
