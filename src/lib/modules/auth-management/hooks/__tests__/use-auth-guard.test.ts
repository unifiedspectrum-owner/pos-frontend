/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Shared module imports */
import { ADMIN_PAGE_ROUTES } from '@shared/constants'

/* Auth module imports */
import { useAuthGuard } from '@auth-management/hooks/use-auth-guard'
import { AUTH_PAGE_ROUTES, AUTH_STORAGE_KEYS } from '@auth-management/constants'

/* Mock next navigation */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('useAuthGuard Hook', () => {
  /* Mock console methods */
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockConsoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
    /* Set up console mocks */
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with default state values', async () => {
      const { result } = renderHook(() => useAuthGuard())

      /* Initial check completes immediately in test environment */
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useAuthGuard())

      expect(typeof result.current.requireAuth).toBe('function')
      expect(typeof result.current.requireGuest).toBe('function')
    })

    it('should complete initial auth check', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })
  })

  describe('Authentication Status Check', () => {
    it('should detect authenticated user with valid token and logged_in flag', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should detect unauthenticated user with missing token', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should detect unauthenticated user with missing logged_in flag', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should detect unauthenticated user with logged_in=false', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'false')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should detect unauthenticated user with empty token', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, '')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })
    })

    it('should log authentication status check', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[useAuthGuard] Authentication status checked:',
          expect.objectContaining({
            hasToken: true,
            loggedIn: true,
            authenticated: true
          })
        )
      })
    })

    it('should handle localStorage errors gracefully', async () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[useAuthGuard] Error checking auth status:',
          expect.any(Error)
        )
      })

      localStorage.getItem = originalGetItem
    })
  })

  describe('requireAuth Function', () => {
    it('should not redirect when user is authenticated', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.requireAuth()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should redirect to login when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      act(() => {
        result.current.requireAuth()
      })

      expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[useAuthGuard] User not authenticated, redirecting to login'
      )
    })

    it('should redirect to login when token is missing', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      act(() => {
        result.current.requireAuth()
      })

      expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
    })

    it('should redirect to login when logged_in flag is false', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'false')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      act(() => {
        result.current.requireAuth()
      })

      expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
    })

    it('should check auth status before redirecting', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isCheckingAuth).toBe(false)
      })

      /* Add auth tokens after initial check */
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      act(() => {
        result.current.requireAuth()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('requireGuest Function', () => {
    it('should not redirect when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      act(() => {
        result.current.requireGuest()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should redirect to dashboard when user is authenticated', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.requireGuest()
      })

      expect(mockPush).toHaveBeenCalledWith(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[useAuthGuard] User already authenticated, redirecting to dashboard'
      )
    })

    it('should redirect to dashboard when both token and flag are present', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.requireGuest()
      })

      expect(mockPush).toHaveBeenCalledWith(ADMIN_PAGE_ROUTES.DASHBOARD.HOME)
    })

    it('should check auth status before redirecting', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      /* Clear auth tokens */
      localStorage.clear()

      act(() => {
        result.current.requireGuest()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Event Listeners', () => {
    it('should listen for authStateChanged event', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      /* Simulate authentication */
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      /* Dispatch auth state change event */
      act(() => {
        window.dispatchEvent(new Event('authStateChanged'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[useAuthGuard] Auth state change detected'
        )
      })
    })

    it('should listen for storage event on ACCESS_TOKEN change', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      /* Simulate storage change for access token */
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'new-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const storageEvent = new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        newValue: 'new-token',
        oldValue: null
      })

      act(() => {
        window.dispatchEvent(storageEvent)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[useAuthGuard] Storage change detected:',
          AUTH_STORAGE_KEYS.ACCESS_TOKEN
        )
      })
    })

    it('should listen for storage event on LOGGED_IN change', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      /* Simulate storage change for logged_in flag */
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const storageEvent = new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.LOGGED_IN,
        newValue: 'true',
        oldValue: 'false'
      })

      act(() => {
        window.dispatchEvent(storageEvent)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[useAuthGuard] Storage change detected:',
          AUTH_STORAGE_KEYS.LOGGED_IN
        )
      })
    })

    it('should ignore storage events for other keys', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isCheckingAuth).toBe(false)
      })

      const initialAuthState = result.current.isAuthenticated
      mockConsoleLog.mockClear()

      /* Simulate storage change for unrelated key */
      const storageEvent = new StorageEvent('storage', {
        key: 'some_other_key',
        newValue: 'value',
        oldValue: null
      })

      act(() => {
        window.dispatchEvent(storageEvent)
      })

      /* Wait a bit to ensure no changes */
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(result.current.isAuthenticated).toBe(initialAuthState)
      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        '[useAuthGuard] Storage change detected:',
        expect.any(String)
      )
    })

    it('should handle logout via authStateChanged event', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      /* Simulate logout */
      localStorage.clear()

      act(() => {
        window.dispatchEvent(new Event('authStateChanged'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('should cleanup event listeners on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(removeEventListenerSpy).not.toHaveBeenCalled()
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('authStateChanged', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    })
  })

  describe('State Synchronization', () => {
    it('should update state immediately on auth state change', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      /* Add auth data */
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      act(() => {
        window.dispatchEvent(new Event('authStateChanged'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      /* Remove auth data */
      localStorage.clear()

      act(() => {
        window.dispatchEvent(new Event('authStateChanged'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('should handle rapid auth state changes', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isCheckingAuth).toBe(false)
      })

      /* Rapidly change auth state multiple times */
      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token')
          localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')
        } else {
          localStorage.clear()
        }

        act(() => {
          window.dispatchEvent(new Event('authStateChanged'))
        })
      }

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('Cross-Tab Synchronization', () => {
    it('should sync authentication across tabs via storage event', async () => {
      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      /* Simulate another tab logging in */
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token-from-tab')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const storageEvent = new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        newValue: 'token-from-tab',
        oldValue: null
      })

      act(() => {
        window.dispatchEvent(storageEvent)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('should sync logout across tabs via storage event', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      /* Simulate another tab logging out */
      localStorage.clear()

      const storageEvent = new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        newValue: null,
        oldValue: 'mock-token'
      })

      act(() => {
        window.dispatchEvent(storageEvent)
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle errors during auth check gracefully', async () => {
      const originalGetItem = localStorage.getItem
      let callCount = 0

      localStorage.getItem = vi.fn(() => {
        callCount++
        if (callCount === 1) {
          throw new Error('Storage access denied')
        }
        return originalGetItem.call(localStorage, AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      })

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isCheckingAuth).toBe(false)
      })

      localStorage.getItem = originalGetItem
    })

    it('should set isCheckingAuth to false even when error occurs', async () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result.current.isCheckingAuth).toBe(false)
      })

      localStorage.getItem = originalGetItem
    })
  })

  describe('Multiple Hook Instances', () => {
    it('should maintain independent state across multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useAuthGuard())
      const { result: result2 } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result1.current.isCheckingAuth).toBe(false)
        expect(result2.current.isCheckingAuth).toBe(false)
      })

      expect(result1.current.isAuthenticated).toBe(result2.current.isAuthenticated)
    })

    it('should sync all instances when auth state changes', async () => {
      const { result: result1 } = renderHook(() => useAuthGuard())
      const { result: result2 } = renderHook(() => useAuthGuard())

      await waitFor(() => {
        expect(result1.current.isAuthenticated).toBe(false)
        expect(result2.current.isAuthenticated).toBe(false)
      })

      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'mock-token')
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

      act(() => {
        window.dispatchEvent(new Event('authStateChanged'))
      })

      await waitFor(() => {
        expect(result1.current.isAuthenticated).toBe(true)
        expect(result2.current.isAuthenticated).toBe(true)
      })
    })
  })
})
