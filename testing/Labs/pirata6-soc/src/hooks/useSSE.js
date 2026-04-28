import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store'

export const useSSE = () => {
  const esRef = useRef(null)
  const reconnectTimeout = useRef(null)
  
  const {
    setConnected,
    setMetrics,
    setHoneypots,
    setIncidents,
    addLog,
    addIncident,
    updateIncident,
    addBlockedIP,
    addToast,
    incrementEventCount
  } = useStore()

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
    }

    const es = new EventSource('/api/stream')

    es.addEventListener('connected', () => {
      setConnected(true)
      addToast({
        type: 'success',
        title: 'Connected',
        message: 'Real-time SSE stream established'
      })
    })

    es.addEventListener('state', (e) => {
      const data = JSON.parse(e.data)
      setHoneypots(data.honeypots)
      setMetrics(data.metrics)
      setIncidents(data.incidents)
      data.logs.forEach(log => addLog(log))
    })

    es.addEventListener('log', (e) => {
      const data = JSON.parse(e.data)
      addLog(data)
      incrementEventCount()
    })

    es.addEventListener('incident', (e) => {
      const data = JSON.parse(e.data)
      addIncident(data)
      incrementEventCount()
      
      if (data.severity === 'critical') {
        addToast({
          type: 'error',
          title: 'CRITICAL INCIDENT',
          message: `${data.type.replace(/_/g, ' ')} · ${data.sourceIp}`
        })
      } else {
        addToast({
          type: 'warning',
          title: 'New Incident',
          message: `${data.type.replace(/_/g, ' ')} · ${data.confidence}% confidence`
        })
      }
    })

    es.addEventListener('incident_update', (e) => {
      const data = JSON.parse(e.data)
      updateIncident(data)
      
      if (data.status === 'contained') {
        addToast({
          type: 'success',
          title: 'Threat Contained',
          message: `Incident ${data.id} auto-contained`
        })
      }
    })

    es.addEventListener('metrics', (e) => {
      const data = JSON.parse(e.data)
      setMetrics(data)
    })

    es.addEventListener('honeypot_update', (e) => {
      const data = JSON.parse(e.data)
      useStore.getState().updateHoneypot(data)
    })

    es.addEventListener('ip_blocked', (e) => {
      const data = JSON.parse(e.data)
      addBlockedIP(data.ip)
    })

    es.addEventListener('scan_complete', (e) => {
      const data = JSON.parse(e.data)
      addToast({
        type: 'info',
        title: 'Scan Complete',
        message: `${data.vulnsFound} vulns · risk ${data.riskScore}/100`
      })
    })

    es.onerror = () => {
      setConnected(false)
      es.close()
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      
      reconnectTimeout.current = setTimeout(() => {
        connect()
      }, 3000)
    }

    esRef.current = es
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (esRef.current) {
        esRef.current.close()
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
    }
  }, [connect])
}
