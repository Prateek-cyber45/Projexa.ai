import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp } from 'lucide-react'
import { useStore } from '../store'

const AnimatedNumber = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return
    
    const start = prevValue.current
    const end = value
    const range = end - start
    const startTime = Date.now()
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      
      setDisplayValue(Math.round(start + range * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue}</span>
}

export const ScorePanel = () => {
  const metrics = useStore(s => s.metrics)

  const getThreatColor = (level) => {
    if (level >= 80) return 'var(--red)'
    if (level >= 50) return 'var(--orange)'
    return 'var(--green)'
  }

  return (
    <div className="score-panel">
      <div className="panel-header">
        <Brain size={16} />
        <h2>AI Scoring</h2>
        <TrendingUp size={14} className="trend-icon" />
      </div>

      <div className="score-grid">
        <div className="score-card knowledge">
          <div className="score-label">Knowledge</div>
          <div className="score-value">
            <AnimatedNumber value={metrics.knowledgeScore} />
          </div>
          <div className="score-bar">
            <motion.div 
              className="score-fill"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.knowledgeScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="score-card behavior">
          <div className="score-label">Behavior</div>
          <div className="score-value">
            <AnimatedNumber value={metrics.behaviorScore} />
          </div>
          <div className="score-bar">
            <motion.div 
              className="score-fill"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.behaviorScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="threat-gauge">
        <div className="gauge-header">
          <span className="gauge-label">Threat Level</span>
          <span className="gauge-value" style={{ color: getThreatColor(metrics.threatLevel) }}>
            <AnimatedNumber value={metrics.threatLevel} />%
          </span>
        </div>

        <div className="gauge-bar">
          <motion.div 
            className="gauge-fill"
            style={{ background: getThreatColor(metrics.threatLevel) }}
            initial={{ width: 0 }}
            animate={{ width: `${metrics.threatLevel}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <div className="gauge-markers">
            <span style={{ left: '33%' }} />
            <span style={{ left: '66%' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .score-panel {
          background: var(--black-1);
          border: 1px solid var(--black-4);
          border-radius: 12px;
          padding: 1.2rem;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.2rem;
          color: var(--purple);
        }

        .panel-header h2 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          flex: 1;
        }

        .trend-icon {
          color: var(--green);
        }

        .score-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          margin-bottom: 1.2rem;
        }

        .score-card {
          background: var(--black-2);
          border: 1px solid var(--black-4);
          border-radius: 8px;
          padding: 0.9rem;
        }

        .score-label {
          font-size: 0.68rem;
          color: var(--white-faint);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .score-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--white-dim);
          margin-bottom: 0.5rem;
          font-family: var(--mono);
        }

        .score-card.knowledge .score-value {
          color: var(--blue);
        }

        .score-card.behavior .score-value {
          color: var(--purple);
        }

        .score-bar {
          height: 6px;
          background: var(--black-4);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .score-fill {
          height: 100%;
          background: var(--blue);
          border-radius: 3px;
        }

        .score-card.behavior .score-fill {
          background: var(--purple);
        }

        .threat-gauge {
          background: var(--black-2);
          border: 1px solid var(--black-4);
          border-radius: 8px;
          padding: 1rem;
        }

        .gauge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.7rem;
        }

        .gauge-label {
          font-size: 0.7rem;
          color: var(--white-faint);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .gauge-value {
          font-size: 1.4rem;
          font-weight: 700;
          font-family: var(--mono);
        }

        .gauge-bar {
          height: 12px;
          background: var(--black-4);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .gauge-fill {
          height: 100%;
          border-radius: 6px;
          box-shadow: 0 0 10px currentColor;
        }

        .gauge-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .gauge-markers span {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--black-1);
        }
      `}</style>
    </div>
  )
}
