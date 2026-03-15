import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TIMEOUT_MS = 10 * 60 * 1000   // 10 minučių
const WARNING_MS = 60 * 1000         // įspėjimas likus 1 minutei

export default function useSessionTimeout() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const [showWarning, setShowWarning] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    setShowWarning(false)
    navigate('/login')
  }, [navigate])

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearTimeout(warningRef.current)
    setShowWarning(false)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
    }, TIMEOUT_MS - WARNING_MS)

    timeoutRef.current = setTimeout(() => {
      logout()
    }, TIMEOUT_MS)
  }, [logout])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      clearTimeout(timeoutRef.current)
      clearTimeout(warningRef.current)
    }
  }, [resetTimer])

  return { showWarning, resetTimer, logout }
}
