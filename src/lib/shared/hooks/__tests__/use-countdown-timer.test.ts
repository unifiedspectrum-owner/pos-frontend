/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'

/* Shared module imports */
import { useCountdownTimer } from '@shared/hooks/use-countdown-timer'

describe('use-countdown-timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Timer initialization', () => {
    it('should not start timer when timer is 0', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(0, setTimer))

      vi.advanceTimersByTime(1000)

      expect(setTimer).not.toHaveBeenCalled()
    })

    it('should not start timer when timer is negative', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(-5, setTimer))

      vi.advanceTimersByTime(1000)

      expect(setTimer).not.toHaveBeenCalled()
    })

    it('should start timer when timer is positive', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(10, setTimer))

      vi.advanceTimersByTime(1000)

      expect(setTimer).toHaveBeenCalled()
    })
  })

  describe('Timer countdown behavior', () => {
    it('should decrement timer by 1 every second', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(10, setTimer))

      vi.advanceTimersByTime(1000)

      expect(setTimer).toHaveBeenCalledTimes(1)
      expect(setTimer).toHaveBeenCalledWith(expect.any(Function))

      /* Test the updater function */
      const updaterFn = setTimer.mock.calls[0][0] as (prev: number) => number
      expect(updaterFn(10)).toBe(9)
    })

    it('should continue counting down for multiple seconds', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(5, setTimer))

      vi.advanceTimersByTime(3000)

      expect(setTimer).toHaveBeenCalledTimes(3)
    })

    it('should use functional update to prevent stale closure', () => {
      const { result } = renderHook(() => {
        const [timer, setTimer] = useState(10)
        useCountdownTimer(timer, setTimer)
        return timer
      })

      expect(result.current).toBe(10)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current).toBe(9)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current).toBe(8)
    })
  })

  describe('Timer lifecycle', () => {
    it('should stop timer when component unmounts', () => {
      const setTimer = vi.fn()

      const { unmount } = renderHook(() => useCountdownTimer(10, setTimer))

      vi.advanceTimersByTime(1000)
      expect(setTimer).toHaveBeenCalledTimes(1)

      unmount()

      setTimer.mockClear()
      vi.advanceTimersByTime(1000)

      expect(setTimer).not.toHaveBeenCalled()
    })

    it('should restart timer when timer value changes', () => {
      const setTimer = vi.fn()

      const { rerender } = renderHook(
        ({ value }) => useCountdownTimer(value, setTimer),
        { initialProps: { value: 10 } }
      )

      vi.advanceTimersByTime(1000)
      expect(setTimer).toHaveBeenCalledTimes(1)

      setTimer.mockClear()

      /* Change timer value */
      rerender({ value: 5 })

      vi.advanceTimersByTime(1000)
      expect(setTimer).toHaveBeenCalledTimes(1)
    })

    it('should stop timer when timer reaches 0', () => {
      const { result } = renderHook(() => {
        const [timer, setTimer] = useState(2)
        useCountdownTimer(timer, setTimer)
        return timer
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current).toBe(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current).toBe(0)

      /* Timer should not go negative */
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current).toBe(0)
    })

    it('should restart timer when it becomes positive again', () => {
      const { result, rerender } = renderHook(
        ({ value }) => {
          const [timer, setTimer] = useState(value)
          useCountdownTimer(timer, setTimer)
          return { timer, setTimer }
        },
        { initialProps: { value: 0 } }
      )

      /* Timer should not be running */
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.timer).toBe(0)

      /* Set timer to positive value */
      act(() => {
        result.current.setTimer(5)
      })

      /* Rerender to trigger effect */
      rerender({ value: 5 })

      /* Timer should now be running */
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.timer).toBe(4)
    })
  })

  describe('Edge cases', () => {
    it('should handle setTimer function changes', () => {
      const setTimer1 = vi.fn()
      const setTimer2 = vi.fn()

      const { rerender } = renderHook(
        ({ setter }) => useCountdownTimer(10, setter),
        { initialProps: { setter: setTimer1 } }
      )

      vi.advanceTimersByTime(1000)
      expect(setTimer1).toHaveBeenCalled()
      expect(setTimer2).not.toHaveBeenCalled()

      setTimer1.mockClear()

      /* Change setter function */
      rerender({ setter: setTimer2 })

      vi.advanceTimersByTime(1000)
      expect(setTimer1).not.toHaveBeenCalled()
      expect(setTimer2).toHaveBeenCalled()
    })

    it('should handle rapid timer value changes', () => {
      const setTimer = vi.fn()

      const { rerender } = renderHook(
        ({ value }) => useCountdownTimer(value, setTimer),
        { initialProps: { value: 10 } }
      )

      rerender({ value: 8 })
      rerender({ value: 6 })
      rerender({ value: 4 })

      vi.advanceTimersByTime(1000)

      /* Should only respond to the latest value */
      expect(setTimer).toHaveBeenCalled()
    })

    it('should handle fractional timer values', () => {
      const setTimer = vi.fn()

      renderHook(() => useCountdownTimer(5.7, setTimer))

      vi.advanceTimersByTime(1000)

      expect(setTimer).toHaveBeenCalled()
      const updaterFn = setTimer.mock.calls[0][0] as (prev: number) => number
      expect(updaterFn(5.7)).toBe(4.7)
    })
  })

  describe('Integration scenarios', () => {
    it('should work with real countdown scenario', () => {
      const { result } = renderHook(() => {
        const [countdown, setCountdown] = useState(5)
        useCountdownTimer(countdown, setCountdown)
        return countdown
      })

      expect(result.current).toBe(5)

      for (let i = 4; i >= 0; i--) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })
        expect(result.current).toBe(i)
      }
    })

    it('should handle multiple simultaneous timers', () => {
      const setTimer1 = vi.fn()
      const setTimer2 = vi.fn()

      renderHook(() => useCountdownTimer(10, setTimer1))
      renderHook(() => useCountdownTimer(20, setTimer2))

      vi.advanceTimersByTime(1000)

      expect(setTimer1).toHaveBeenCalledTimes(1)
      expect(setTimer2).toHaveBeenCalledTimes(1)
    })
  })
})
