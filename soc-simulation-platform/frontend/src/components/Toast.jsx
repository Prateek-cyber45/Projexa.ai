/**
 * Toast.jsx — Global notification system
 * Usage: import { toast } from './components/Toast'
 *        toast.success("Saved!")  toast.error("Failed!")  toast.warn("...")  toast.info("...")
 */
import { useState, useEffect, useCallback } from 'react'

let _addToast = null

export const toast = {
  success: (msg) => _addToast?.({ msg, type: 'success' }),
  error:   (msg) => _addToast?.({ msg, type: 'error' }),
  warn:    (msg) => _addToast?.({ msg, type: 'warn' }),
  info:    (msg) => _addToast?.({ msg, type: 'info' }),
}

const STYLES = {
  success: 'border-green-500 bg-green-950 text-green-300',
  error:   'border-red-500   bg-red-950   text-red-300',
  warn:    'border-yellow-500 bg-yellow-950 text-yellow-300',
  info:    'border-blue-500  bg-blue-950  text-blue-300',
}
const ICONS = { success: '✓', error: '✗', warn: '⚠', info: 'ℹ' }

let _id = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const add = useCallback(({ msg, type }) => {
    const id = ++_id
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  useEffect(() => { _addToast = add; return () => { _addToast = null } }, [add])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded border text-sm font-mono shadow-lg
                      pointer-events-auto animate-fade-in ${STYLES[t.type]}`}>
          <span className="font-bold text-base">{ICONS[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
