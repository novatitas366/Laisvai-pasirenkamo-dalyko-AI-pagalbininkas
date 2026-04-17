import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TIMEOUT_MS = 10 * 60 * 1000   // 10 minučių
const WARNING_MS = 60 * 1000         // įspėjimas likus 1 minutei

export default function useSessionTimeout() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const showWarningRef = useRef(false)
  const [showWarning, setShowWarning] = useState(false)

  const logout = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearTimeout(warningRef.current)
    showWarningRef.current = false
    window.dispatchEvent(new Event('beforeSessionTimeout'))
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setShowWarning(false)
    navigate('/login?sessionExpired=true')
  }, [navigate])

  /** Kol rodomas įspėjimas, neaktyvumo įvykiai nepratęsia sesijos — kitaip pelės judesys iškart atšauktų automatinį atsijungimą. Tęsti tik su force (mygtukas „Tęsti"). */
  const resetTimer = useCallback((force = false) => {
    if (showWarningRef.current && !force) {
      return
    }

    clearTimeout(timeoutRef.current)
    clearTimeout(warningRef.current)
    showWarningRef.current = false
    setShowWarning(false)

    warningRef.current = setTimeout(() => {
      showWarningRef.current = true
      setShowWarning(true)
    }, TIMEOUT_MS - WARNING_MS)

    timeoutRef.current = setTimeout(() => {
      logout()
    }, TIMEOUT_MS)
  }, [logout])

  const resetTimerRef = useRef(resetTimer)
  resetTimerRef.current = resetTimer

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const onActivity = () => resetTimerRef.current()
    events.forEach((e) => window.addEventListener(e, onActivity))
    resetTimerRef.current()

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearTimeout(timeoutRef.current)
      clearTimeout(warningRef.current)
    }
  }, [])

  return { showWarning, resetTimer, logout }
}
