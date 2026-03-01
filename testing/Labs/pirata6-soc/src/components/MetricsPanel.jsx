import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Clock, Target, Shield, Cpu } from 'lucide-react'
import { useStore } from '../store'
import { useEffect, useRef, useState } from 'react'

const MetricTile = ({ icon: Icon, label, value, trend, invertTrend = false }) => {
  const prevValue = useRef(value)
  const [trendData, setTrendData] = useState({ direction: 'flat', diff: 0 })

  useEffect(() => {
    if (prevValue.current !== undefined && value !== undefined) {
      const diff = parseFloat(value) - parseFloat(prevValue.current)
      if (Math.abs(diff) > 0.1) {
        setTrendData({
          direction: diff > 0 ? 'up' : 'down',
          diff: Math.abs(diff).toFixed(1)
        })
      }
    }
    prevValue.current = value
  }, [value])

  const getTrendColor = () => {
    if (trendData.direction === 'flat') return 'var(--white-faint)'
    if (invertTrend) {
      return trendData.direction === 'up' ? 'var(--red)' : 'var(--green)'
    }
    return trendData.direction === 'up' ? 'var(--green)' : 'var(--red)'
  }

  const TrendIcon = trendData.direction === 'up' ? TrendingUp : 
                    trendData.direction === 'down' ? TrendingDown : Minus

  return (
    <motion.div 
      className="metric-tile"
      whileHover={{ scale: 1.02, borderColor: 'var(--blue-dim)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="metric-header">
        <Icon size={14} className="metric-icon" />
        <span className="metric-label">{label}</span>
      </div>
      <motion.div 
        className="metric-value"
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
      >
        {value ?? '—'}
      </motion.div>
      <div className="metric-trend" style={{ color: getTrendColor() }}>
        <TrendIcon size={12} />
        <span>
          {trendData.direction === 'flat' ? 'stable' : 
           `${trendData.direction === 'up' ? '+' : '-'}${trendData.diff}`}
        </span>
      </div>

      <style jsx>{`
        .metric-tile {
          background: var(--black-3);
          border: 1px solid var(--black-4);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
        }

        :global(.metric-icon) {
          color: var(--blue);
          opacity: 0.7;
        }

        .metric-label {
          font-size: 0.65rem;
          color: var(--white-faint);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-family: var(--mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--white);
          line-height: 1;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.68rem;
          margin-top: 0.4rem;
        }
      `}</style>
    </motion.div>
  )
}

export const MetricsPanel = () => {
  const { metrics } = useStore()

  return (
    <div className="card metrics-card">
      <div className="card-header">
        <div className="card-title">
          <Cpu size={16} />
          Performance
        </div>
      </div>

      <div className="card-body">
        <div className="metrics-grid">
          <MetricTile 
            icon={Clock}
            label="Decision Time"
            value={`${metrics.avgResponseTime ?? '—'}s`}
            invertTrend
          />
          <MetricTile 
            icon={Target}
            label="Accuracy"
            value={`${metrics.accuracy ?? '—'}%`}
          />
          <MetricTile 
            icon={Shield}
            label="Containment"
            value={`${metrics.behaviorScore ?? '—'}%`}
          />
          <MetricTile 
            icon={Cpu}
            label="Pattern Match"
            value={`${metrics.patternMatch ?? '—'}%`}
          />
        </div>
      </div>

      <style jsx>{`
        .metrics-card {
          background: var(--black-2);
          border: 1px solid var(--black-5);
          border-radius: 16px;
          overflow: hidden;
        }

        .card-header {
          padding: 1.2rem 1.4rem;
          border-bottom: 1px solid var(--black-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, var(--black-3) 0%, transparent 100%);
        }

        .card-title {
          font-family: var(--mono);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--white);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-title :global(svg) {
          color: var(--green);
        }

        .card-body {
          padding: 1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.7rem;
        }
      `}</style>
    </div>
  )
}
