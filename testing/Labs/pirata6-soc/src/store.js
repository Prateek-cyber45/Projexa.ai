import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Connection
  connected: false,
  eventCount: 0,
  
  // Data
  metrics: {},
  honeypots: [],
  incidents: [],
  logs: [],
  blockedIPs: [],
  toasts: [],
  
  // UI State
  selectedIncident: null,
  modalOpen: false,
  autoResponse: true,
  
  // Actions
  setConnected: (connected) => set({ connected }),
  
  incrementEventCount: () => set((state) => ({ 
    eventCount: state.eventCount + 1 
  })),
  
  setMetrics: (metrics) => set({ metrics }),
  
  setHoneypots: (honeypots) => set({ honeypots }),
  
  updateHoneypot: (updated) => set((state) => ({
    honeypots: state.honeypots.map(h => 
      h.id === updated.id ? updated : h
    )
  })),
  
  setIncidents: (incidents) => set({ incidents }),
  
  addIncident: (incident) => set((state) => ({
    incidents: [incident, ...state.incidents].slice(0, 50)
  })),
  
  updateIncident: (updated) => set((state) => ({
    incidents: state.incidents.map(i => 
      i.id === updated.id ? updated : i
    )
  })),
  
  addLog: (log) => set((state) => ({
    logs: [log, ...state.logs].slice(0, 100)
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  addBlockedIP: (ip) => set((state) => ({
    blockedIPs: state.blockedIPs.includes(ip) 
      ? state.blockedIPs 
      : [...state.blockedIPs, ip]
  })),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toastWithId = { ...toast, id }
    
    set((state) => ({
      toasts: [toastWithId, ...state.toasts]
    }))
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }, 4000)
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  setSelectedIncident: (incident) => set({ 
    selectedIncident: incident,
    modalOpen: true 
  }),
  
  closeModal: () => set({ 
    modalOpen: false,
    selectedIncident: null 
  }),
  
  setAutoResponse: (enabled) => set({ autoResponse: enabled })
}))
