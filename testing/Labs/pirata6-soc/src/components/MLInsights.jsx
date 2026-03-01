import { motion } from 'framer-motion'
import { Bot, Sparkles, Zap, ChevronRight, Lightbulb } from 'lucide-react'
import { useStore } from '../store'
import { useState } from 'react'

const Tag = ({ children }) => (
  <span className="tag">
    {children}
    <style jsx>{`
      .tag {
        font-family: var(--mono);
        font-size: 0.62rem;
        background: rgba(10, 132, 255, 0.08);
        color: #7ab8ff;
        border: 1px solid rgba(10, 132, 255, 0.2);
        padding: 0.25rem 0.7rem;
        border-radius: 4px;
        letter-spacing: 0.02em;
      }
    `}</style>
  </span>
)

const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
    />
    <motion.div 
      className="toggle-track"
      animate={{ background: checked ? 'var(--blue)' : 'var(--black-5)' }}
    />
    <motion.div 
      className="toggle-thumb"
      animate={{ 
        x: checked ? 16 : 0,
        background: checked ? '#fff' : 'var(--white-dim)'
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
    <style jsx>{`
      .toggle {
        position: relative;
        width: 36px;
        height: 20px;
        cursor: pointer;
        display: block;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
      }

      :global(.toggle-track) {
        position: absolute;
        inset: 0;
        border-radius: 10px;
      }

      :global(.toggle-thumb) {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
    `}</style>
  </label>
)

const RecommendationItem = ({ children, delay }) => (
  <motion.div 
    className="rec-item"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <ChevronRight size={14} className="rec-icon" />
    <span>{children}</span>
    <style jsx>{`
      .rec-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--black-4);
        font-size: 0.8rem;
        color: var(--white-dim);
        line-height: 1.4;
      }

      .rec-item:last-child {
        border-bottom: none;
      }

      :global(.rec-icon) {
        color: var(--blue);
        flex-shrink: 0;
        margin-top: 2px;
      }
    `}</style>
  </motion.div>
)

export const MLInsights = () => {
  const { autoResponse, setAutoResponse, addToast } = useStore()
  const [tags] = useState(['methodical', 'fast containment', 'ransomware specialist'])

  const handleToggle = async (enabled) => {
    try {
      await fetch('/api/autoresponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      setAutoResponse(enabled)
      addToast({
        type: enabled ? 'success' : 'warning',
        title: 'Auto-response',
        message: enabled ? 'Enabled' : 'Disabled'
      })
    } catch (e) {
      addToast({ type: 'error', title: 'Toggle failed', message: e.message })
    }
  }

  return (
    <>
      {/* ML Analysis Card */}
      <div className="card ml-card">
        <div className="card-header">
          <div className="card-title">
            <Bot size={16} />
            ML Analysis
          </div>
        </div>

        <div className="card-body">
          <div className="ml-inner">
            <div className="ml-header">
              <motion.div 
                className="ml-dot"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="ml-label">Pattern Recognition</span>
            </div>

            <p className="ml-profile">
              Decisions match a <strong>threat hunter</strong> profile — 
              methodical approach with high pattern confidence.
            </p>

            <div className="tag-row">
              {tags.map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Tag>{tag}</Tag>
                </motion.div>
              ))}
            </div>

            <div className="ml-toggle-row">
              <div className="ml-toggle-label">
                <Zap size={14} />
                <span>auto-response</span>
              </div>
              <Toggle checked={autoResponse} onChange={handleToggle} />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="card rec-card">
        <div className="card-header">
          <div className="card-title">
            <Lightbulb size={16} />
            Recommendations
          </div>
        </div>

        <div className="card-body">
          <RecommendationItem delay={0}>
            faster isolation improves score
          </RecommendationItem>
          <RecommendationItem delay={0.1}>
            forensics work: exceptional
          </RecommendationItem>
          <RecommendationItem delay={0.2}>
            you excel at ransomware patterns
          </RecommendationItem>
          <RecommendationItem delay={0.3}>
            consider blocking entire ASNs
          </RecommendationItem>
        </div>
      </div>

      <style jsx>{`
        .card {
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

        .ml-card .card-title :global(svg) {
          color: var(--purple);
        }

        .rec-card .card-title :global(svg) {
          color: var(--orange);
        }

        .card-body {
          padding: 1rem 1.2rem;
        }

        .ml-inner {
          background: linear-gradient(135deg, rgba(10, 132, 255, 0.05), rgba(191, 90, 242, 0.05));
          border: 1px solid rgba(10, 132, 255, 0.15);
          border-radius: 12px;
          padding: 1.2rem;
        }

        .ml-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
        }

        .ml-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--blue);
        }

        .ml-label {
          font-family: var(--mono);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--white-dim);
          text-transform: uppercase;
        }

        .ml-profile {
          font-size: 0.85rem;
          color: var(--white-dim);
          line-height: 1.5;
          margin-bottom: 0.8rem;
        }

        .ml-profile strong {
          color: var(--white);
        }

        .tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .ml-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(10, 132, 255, 0.1);
        }

        .ml-toggle-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--white-dim);
        }

        .ml-toggle-label :global(svg) {
          color: var(--blue);
        }
      `}</style>
    </>
  )
}
