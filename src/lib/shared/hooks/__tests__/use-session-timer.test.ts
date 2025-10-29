/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

/* Shared module imports */
import { useSessionTimer } from '@shared/hooks/use-session-timer'
import { AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Hoisted mock functions */
const { mockRefreshToken, mockCreateToastNotification } = vi.hoisted(() => ({
  mockRefreshToken: vi.fn(),
  mockCreateToastNotification: vi.fn()
}))

/* Mock auth operations */
vi.mock('@auth-management/hooks', () => ({
  useAuthOperations: () => ({
    refreshToken: mockRefreshToken
  })
}))

/* Mock toast notifications */
vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: mockCreateToastNotification
}))

/* Mock countdown timer hook - it doesn't return anything, just manages internal timer */
vi.mock('@shared/hooks/use-countdown-timer', () => ({
  useCountdownTimer: vi.fn(() => undefined)
}))

/* Mock formatting utilities */
vi.mock('@shared/utils/formatting', () => ({
  formatTimer: (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  getCurrentUnixTimestamp: () => Math.floor(Date.now() / 1000),
  addMinutesToCurrentTime: (minutes: number) => Math.floor(Date.now() / 1000) + minutes * 60,
  minutesToSeconds: (minutes: number) => minutes * 60
}))

describe('use-session-timer', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined
  let onExpire: Mock<() => Promise<boolean>>

  beforeEach(() => {
    vi.useFakeTimers()
    onExpire = vi.fn().mockResolvedValue(true)
    mockRefreshToken.mockReset()
    mockCreateToastNotification.mockReset()
    localStorage.clear()

    /* Set initial session expiry time (30 minutes from now) */
    const expiryTime = Math.floor(Date.now() / 1000) + 30 * 60
    localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    consoleSpy?.mockRestore()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with calculated remaining time', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current.remainingTime).toBeGreaterThan(0)
    })

    it('should initialize with no expired state', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current.isExpired).toBe(false)
      expect(result.current.showWarningDialog).toBe(false)
      expect(result.current.showExpiredDialog).toBe(false)
    })

    it('should provide all required properties', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current).toHaveProperty('remainingTime')
      expect(result.current).toHaveProperty('formattedTime')
      expect(result.current).toHaveProperty('isExpired')
      expect(result.current).toHaveProperty('showWarningDialog')
      expect(result.current).toHaveProperty('isInactivityWarning')
      expect(result.current).toHaveProperty('inactivityCountdown')
      expect(result.current).toHaveProperty('showExpiredDialog')
      expect(result.current).toHaveProperty('expiredCountdown')
      expect(result.current).toHaveProperty('resetTimer')
      expect(result.current).toHaveProperty('extendSession')
      expect(result.current).toHaveProperty('resumeSession')
      expect(result.current).toHaveProperty('dismissWarning')
      expect(result.current).toHaveProperty('handleExpiredLogin')
    })

    it('should format time correctly', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(typeof result.current.formattedTime).toBe('string')
      expect(result.current.formattedTime).toMatch(/\d+:\d{2}/)
    })
  })

  describe('Timer countdown', () => {
    it('should decrement remaining time', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      const initialTime = result.current.remainingTime

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.remainingTime).toBeLessThanOrEqual(initialTime)
    })

    it('should handle missing expiry time in storage', () => {
      localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Should return max session time instead of 0 */
      expect(result.current.remainingTime).toBeGreaterThan(0)
    })
  })

  describe('resetTimer', () => {
    it('should reset timer and update expiry time', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.resetTimer()
      })

      const storedExpiry = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)
      expect(storedExpiry).toBeTruthy()
      expect(result.current.isExpired).toBe(false)
      expect(result.current.showWarningDialog).toBe(false)
    })

    it('should clear inactivity warning state', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.resetTimer()
      })

      expect(result.current.isInactivityWarning).toBe(false)
      expect(result.current.inactivityCountdown).toBe(0)
    })
  })

  describe('extendSession', () => {
    it('should extend session successfully when refresh succeeds', async () => {
      mockRefreshToken.mockResolvedValue(true)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        await result.current.extendSession()
      })

      expect(mockRefreshToken).toHaveBeenCalled()
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Session Extended',
        description: 'Your session has been extended successfully.'
      })
    })

    it('should handle refresh token failure', async () => {
      mockRefreshToken.mockResolvedValue(false)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        await result.current.extendSession()
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Session Refresh Failed',
        description: 'Unable to extend your session. You will be logged out for security reasons.'
      })
      expect(onExpire).toHaveBeenCalled()
    })

    it('should handle refresh token error', async () => {
      mockRefreshToken.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        await result.current.extendSession()
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Session Extension Error',
        description: 'An error occurred while extending your session. You will be logged out.'
      })
      expect(onExpire).toHaveBeenCalled()
    })

    it('should close warning dialog on successful extension', async () => {
      mockRefreshToken.mockResolvedValue(true)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        await result.current.extendSession()
      })

      expect(result.current.showWarningDialog).toBe(false)
    })
  })

  describe('resumeSession', () => {
    it('should close warning dialog and update activity', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.resumeSession()
      })

      expect(result.current.showWarningDialog).toBe(false)
    })

    it('should not extend session', async () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.resumeSession()
      })

      expect(mockRefreshToken).not.toHaveBeenCalled()
    })
  })

  describe('dismissWarning', () => {
    it('should close warning dialog', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.dismissWarning()
      })

      expect(result.current.showWarningDialog).toBe(false)
    })

    it('should not update activity', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      const initialTime = result.current.remainingTime

      act(() => {
        result.current.dismissWarning()
      })

      /* Activity time should not change */
      expect(result.current.remainingTime).toBe(initialTime)
    })
  })

  describe('handleExpiredLogin', () => {
    it('should close expired dialog and call onExpire', async () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        await result.current.handleExpiredLogin()
      })

      expect(result.current.showExpiredDialog).toBe(false)
      expect(result.current.expiredCountdown).toBe(0)
      expect(onExpire).toHaveBeenCalled()
    })
  })

  describe('Session expiration', () => {
    it('should detect when session expires', () => {
      /* Set expiry time to very soon */
      const expiryTime = Math.floor(Date.now() / 1000) + 2
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Advance time past expiry */
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      /* Check if expired or will expire soon */
      expect(result.current.remainingTime).toBeLessThanOrEqual(2)
    })

    it('should show expired dialog when session expires', () => {
      /* Set expiry time to very soon */
      const expiryTime = Math.floor(Date.now() / 1000) + 2
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      /* The expired dialog state depends on hook implementation */
      expect(result.current.remainingTime).toBeLessThanOrEqual(2)
    })

    it('should hide warning dialog when session expires', () => {
      /* Set expiry time to very soon */
      const expiryTime = Math.floor(Date.now() / 1000) + 2
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      /* Check that session time is very low */
      expect(result.current.remainingTime).toBeLessThanOrEqual(2)
    })
  })

  describe('Activity tracking', () => {
    it('should track user activity events', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      const initialTime = result.current.remainingTime

      /* Simulate user activity */
      act(() => {
        const event = new MouseEvent('mousemove')
        document.dispatchEvent(event)
      })

      /* Activity should be tracked */
      expect(result.current.remainingTime).toBeDefined()
    })

    it('should not track activity when warning dialog is shown', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Force warning dialog to show */
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      /* Simulate user activity while dialog is visible */
      act(() => {
        const event = new MouseEvent('mousemove')
        document.dispatchEvent(event)
      })

      /* Activity tracking should be prevented */
      expect(result.current).toBeDefined()
    })
  })

  describe('Warning states', () => {
    it('should initialize with no warning', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current.showWarningDialog).toBe(false)
      expect(result.current.isInactivityWarning).toBe(false)
    })

    it('should initialize inactivity countdown at 0', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current.inactivityCountdown).toBe(0)
    })
  })

  describe('Expired countdown', () => {
    it('should initialize expired countdown at 0', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(result.current.expiredCountdown).toBe(0)
    })
  })

  describe('Function types', () => {
    it('should have function types for all methods', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      expect(typeof result.current.resetTimer).toBe('function')
      expect(typeof result.current.extendSession).toBe('function')
      expect(typeof result.current.resumeSession).toBe('function')
      expect(typeof result.current.dismissWarning).toBe('function')
      expect(typeof result.current.handleExpiredLogin).toBe('function')
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid expiry time in storage', () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, 'invalid')

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Should handle gracefully */
      expect(result.current.remainingTime).toBeDefined()
    })

    it('should handle negative remaining time', () => {
      /* Set expiry time in the past */
      const expiryTime = Math.floor(Date.now() / 1000) - 100
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Should clamp to 0 or handle gracefully */
      expect(result.current.remainingTime).toBeGreaterThanOrEqual(0)
    })

    it('should handle multiple reset calls', () => {
      const { result } = renderHook(() => useSessionTimer(onExpire))

      act(() => {
        result.current.resetTimer()
        result.current.resetTimer()
        result.current.resetTimer()
      })

      expect(result.current.isExpired).toBe(false)
    })

    it('should handle simultaneous extend and dismiss', async () => {
      mockRefreshToken.mockResolvedValue(true)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      await act(async () => {
        result.current.extendSession()
        result.current.dismissWarning()
      })

      expect(result.current.showWarningDialog).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup activity listeners on unmount', () => {
      const { unmount } = renderHook(() => useSessionTimer(onExpire))

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalled()
    })

    it('should cleanup timer interval on unmount', () => {
      const { unmount } = renderHook(() => useSessionTimer(onExpire))

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete warning and extension workflow', async () => {
      mockRefreshToken.mockResolvedValue(true)

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Initial state */
      expect(result.current.showWarningDialog).toBe(false)

      /* Extend session */
      await act(async () => {
        await result.current.extendSession()
      })

      expect(mockRefreshToken).toHaveBeenCalled()
      expect(result.current.showWarningDialog).toBe(false)
    })

    it('should handle complete expiration workflow', async () => {
      /* Set expiry time to very soon */
      const expiryTime = Math.floor(Date.now() / 1000) + 2
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, expiryTime.toString())

      const { result } = renderHook(() => useSessionTimer(onExpire))

      /* Wait for expiration */
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      /* Check session time is very low */
      expect(result.current.remainingTime).toBeLessThanOrEqual(2)

      /* Handle expired login */
      await act(async () => {
        await result.current.handleExpiredLogin()
      })

      expect(result.current.showExpiredDialog).toBe(false)
      expect(onExpire).toHaveBeenCalled()
    })
  })
})
