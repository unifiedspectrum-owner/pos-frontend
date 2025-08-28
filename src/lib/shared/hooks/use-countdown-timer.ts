/* React hooks */
import { useEffect } from 'react'

/* Custom hook for countdown timer with automatic decrement */
export const useCountdownTimer = (
  timer: number, 
  setTimer: (value: number | ((prev: number) => number)) => void
) => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    /* Start interval only if timer is greater than 0 */
    if (timer > 0) {
      intervalId = setInterval(() => setTimer(prev => prev - 1), 1000)
    }
    
    /* Cleanup interval on unmount or timer change */
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [timer, setTimer])
}

