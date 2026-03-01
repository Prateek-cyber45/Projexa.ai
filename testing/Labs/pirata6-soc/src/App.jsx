import { useSSE } from './hooks/useSSE'
import { Nav } from './components/Nav'
import { StatusBar } from './components/StatusBar'
import { HoneypotGrid } from './components/HoneypotGrid'
import { Terminal } from './components/Terminal'
import { IncidentFeed } from './components/IncidentFeed'
import { ScorePanel } from './components/ScorePanel'
import { MetricsPanel } from './components/MetricsPanel'
import { MLInsights } from './components/MLInsights'
import { Modal } from './components/Modal'
import { ToastContainer } from './components/ToastContainer'
import { Footer } from './components/Footer'

function App() {
  // Initialize SSE connection
  useSSE()

  return (
    <div className="app">
      {/* Ambient glow orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Navigation */}
      <Nav />

      {/* Status Bar */}
      <StatusBar />

      {/* Main Dashboard */}
      <main className="dashboard">
        {/* Left Column - Honeypots */}
        <HoneypotGrid />

        {/* Center Column */}
        <div className="center-column">
          <Terminal />
          <IncidentFeed />
        </div>

        {/* Right Column - Scoring & Metrics */}
        <div className="right-column">
          <ScorePanel />
          <MetricsPanel />
          <MLInsights />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Toasts */}
      <Modal />
      <ToastContainer />

      <style jsx>{`
        .app {
          min-height: 100vh;
          position: relative;
        }

        .dashboard {
          max-width: 1600px;
          margin: 1.5rem auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 300px 1fr 360px;
          gap: 1.2rem;
        }

        .center-column {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (max-width: 1400px) {
          .dashboard {
            grid-template-columns: 280px 1fr 320px;
          }
        }

        @media (max-width: 1100px) {
          .dashboard {
            grid-template-columns: 1fr 1fr;
          }

          .center-column {
            grid-column: 1 / -1;
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr;
            padding: 0 1rem;
          }

          .center-column {
            order: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default App
