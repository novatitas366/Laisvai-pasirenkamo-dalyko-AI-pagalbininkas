import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import useSessionTimeout from '../hooks/useSessionTimeout'

jest.useFakeTimers()

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => mockNavigate,
}))

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>

beforeEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
  localStorage.clear()
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.lt' }))
})

describe('useSessionTimeout', () => {
  test('grąžina showWarning=false pradinėje būsenoje', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })
    expect(result.current.showWarning).toBe(false)
  })

  test('po 9 minučių neaktyvumo parodo įspėjimą', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(9 * 60 * 1000)
    })

    expect(result.current.showWarning).toBe(true)
  })

  test('po 10 minučių neaktyvumo pašalina vartotoją ir nukreipia į /login', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(10 * 60 * 1000)
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('įspėjimo metu pelės judesys nepratęsia sesijos — po viso 10 min vis tiek atjungia', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(9 * 60 * 1000)
    })

    act(() => {
      window.dispatchEvent(new Event('mousemove'))
      jest.advanceTimersByTime(1 * 60 * 1000)
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('resetTimer atšaukia įspėjimą ir iš naujo paleidžia laikmatį', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(9 * 60 * 1000)
    })
    expect(result.current.showWarning).toBe(true)

    act(() => {
      result.current.resetTimer(true)
    })
    expect(result.current.showWarning).toBe(false)

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('vartotojo veikla (mousemove) atnaujina laikmatį', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
      window.dispatchEvent(new Event('mousemove'))
      jest.advanceTimersByTime(8 * 60 * 1000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('vartotojo veikla (keydown) atnaujina laikmatį', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
      window.dispatchEvent(new Event('keydown'))
      jest.advanceTimersByTime(8 * 60 * 1000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('vartotojo veikla (click) atnaujina laikmatį', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
      window.dispatchEvent(new Event('click'))
      jest.advanceTimersByTime(8 * 60 * 1000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('vartotojo veikla (scroll) atnaujina laikmatį', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
      window.dispatchEvent(new Event('scroll'))
      jest.advanceTimersByTime(8 * 60 * 1000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('vartotojo veikla (touchstart) atnaujina laikmatį', () => {
    renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      jest.advanceTimersByTime(8 * 60 * 1000)
      window.dispatchEvent(new Event('touchstart'))
      jest.advanceTimersByTime(8 * 60 * 1000)
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('logout išsiunčia beforeSessionTimeout įvykį', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })
    const listener = jest.fn()
    window.addEventListener('beforeSessionTimeout', listener)

    act(() => {
      result.current.logout()
    })

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener('beforeSessionTimeout', listener)
  })

  test('logout pašalina user ir token iš localStorage', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  test('logout nukreipia į /login', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('komponentui išmontuojant pašalinami event listeners ir laikmatiai', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useSessionTimeout(), { wrapper })

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

    removeSpy.mockRestore()
  })
})
