/* React hooks */
import { useState, useEffect, useCallback, useRef } from 'react'

/* Shared module imports */
import { AUTH_STORAGE_KEYS, SESSION_TIMEOUT, SESSION_WARNING_THRESHOLD, INACTIVITY_THRESHOLD, INACTIVITY_DIALOG_COUNTDOWN, USER_ACTIVITY_EVENTS } from '@auth-management/constants'
import { formatTimer, getCurrentUnixTimestamp, addMinutesToCurrentTime, minutesToSeconds } from '@shared/utils/formatting'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { useCountdownTimer } from './use-countdown-timer'

/* Auth module imports */
import { useAuthOperations } from '@auth-management/hooks'

/* Hook interface */
interface UseSessionTimerReturn {
  remainingTime: number
  formattedTime: string
  isExpired: boolean
  showWarningDialog: boolean
  isInactivityWarning: boolean
  inactivityCountdown: number
  showExpiredDialog: boolean
  expiredCountdown: number
  resetTimer: () => void
  extendSession: () => Promise<void>
  resumeSession: () => void
  dismissWarning: () => void
  handleExpiredLogin: () => void
}

/* Warning threshold in seconds (convert from minutes) */
const warningThresholdInSeconds = minutesToSeconds(SESSION_WARNING_THRESHOLD)

/* Inactivity timeout in seconds (convert from minutes) */
const inactivityThresholdInSeconds = minutesToSeconds(INACTIVITY_THRESHOLD)

/* Inactivity dialog countdown duration in seconds (convert from minutes) */
const inactivityDialogCountdownInSeconds = minutesToSeconds(INACTIVITY_DIALOG_COUNTDOWN)

/* Custom hook for managing session timer */
export const useSessionTimer = (onExpire: () => Promise<boolean>): UseSessionTimerReturn => {
  /* Session timer states */
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  /* Warning dialog states */
  const [showWarningDialog, setShowWarningDialog] = useState<boolean>(false)
  const [isInactivityWarning, setIsInactivityWarning] = useState<boolean>(false)
  const [inactivityCountdown, setInactivityCountdown] = useState<number>(0)

  /* Expired dialog states */
  const [showExpiredDialog, setShowExpiredDialog] = useState<boolean>(false)
  const [expiredCountdown, setExpiredCountdown] = useState<number>(0)

  /* Activity tracking state */
  const [lastActivityTime, setLastActivityTime] = useState<number>(getCurrentUnixTimestamp())

  /* Track warning dismissed state */
  const warningDismissedRef = useRef<boolean>(false)

  /* Auth operations for token refresh */
  const { refreshToken } = useAuthOperations()

  /* Use countdown timer hook for inactivity countdown */
  useCountdownTimer(inactivityCountdown, setInactivityCountdown)

  /* Use countdown timer hook for expired dialog countdown */
  useCountdownTimer(expiredCountdown, setExpiredCountdown)

  /* Calculate remaining time based on stored expiry */
  const calculateRemainingTime = useCallback((): number => {
    const expiryTimeStr = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)

    if (!expiryTimeStr) {
      /* If no expiry time is set, return max session time to prevent false expiry */
      return minutesToSeconds(SESSION_TIMEOUT)
    }

    const expiryTime = parseInt(expiryTimeStr, 10)
    const currentTime = getCurrentUnixTimestamp()
    const remaining = Math.max(0, expiryTime - currentTime)

    return remaining
  }, [])

  /* Update last activity time */
  const updateActivity = useCallback(() => {
    setLastActivityTime(getCurrentUnixTimestamp())
    /* Don't update dialog states here - let the interval logic handle warning display */
  }, [])

  /* Reset timer by setting new expiry time */
  const resetTimer = useCallback(() => {
    const newExpiryTime = addMinutesToCurrentTime(SESSION_TIMEOUT)
    localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, newExpiryTime.toString())
    setRemainingTime(minutesToSeconds(SESSION_TIMEOUT))
    setIsExpired(false)
    setShowWarningDialog(false)
    setIsInactivityWarning(false)
    setInactivityCountdown(0)
    updateActivity()
    warningDismissedRef.current = false
  }, [updateActivity])

  /* Extend session and close warning dialog */
  const extendSession = useCallback(async () => {
    try {
      /* Call refresh token API to extend session */
      const success = await refreshToken()

      if (success) {
        /* Session extended successfully by refreshToken API */
        setShowWarningDialog(false)
        updateActivity()
        warningDismissedRef.current = false

        /* Show success notification */
        createToastNotification({
          type: 'success',
          title: 'Session Extended',
          description: 'Your session has been extended successfully.'
        })
      } else {
        /* Refresh token API failed - logout user */
        console.error('[useSessionTimer] Refresh token failed, logging out user')
        setShowWarningDialog(false)

        /* Show error notification */
        createToastNotification({
          type: 'error',
          title: 'Session Refresh Failed',
          description: 'Unable to extend your session. You will be logged out for security reasons.'
        })

        /* Logout user */
        await onExpire()
      }
    } catch (error) {
      console.error('[useSessionTimer] Error extending session:', error)
      setShowWarningDialog(false)

      /* Show error notification */
      createToastNotification({
        type: 'error',
        title: 'Session Extension Error',
        description: 'An error occurred while extending your session. You will be logged out.'
      })

      /* Logout user */
      await onExpire()
    }
  }, [refreshToken, updateActivity, onExpire])

  /* Resume session without extending (for inactivity warning) */
  const resumeSession = useCallback(() => {
    setShowWarningDialog(false)
    warningDismissedRef.current = true
    updateActivity()
  }, [updateActivity])

  /* Dismiss warning without extending or updating activity */
  const dismissWarning = useCallback(() => {
    setShowWarningDialog(false)
    warningDismissedRef.current = true
  }, [])

  /* Handle login action from expired dialog */
  const handleExpiredLogin = useCallback(async() => {
    setShowExpiredDialog(false)
    setExpiredCountdown(0)
    await onExpire()
  }, [onExpire])

  /* Track user activity */
  useEffect(() => {
    /* Activity event handler */
    const handleActivity = () => {
      /* Don't track activity when warning dialog is shown */
      if (showWarningDialog) {
        return
      }
      updateActivity()
    }

    /* Register activity listeners */
    USER_ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    /* Cleanup listeners on unmount */
    return () => {
      USER_ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity, { passive: true } as EventListenerOptions)
      })
    }
  }, [updateActivity, showWarningDialog])

  /* Initialize and update timer */
  useEffect(() => {
    /* Calculate initial remaining time */
    const initialRemaining = calculateRemainingTime()
    setRemainingTime(initialRemaining)

    /* Set up interval to update timer every second */
    const intervalId = setInterval(() => {
      const remaining = calculateRemainingTime()
      setRemainingTime(remaining)

      /* Calculate inactivity duration */
      const currentTime = getCurrentUnixTimestamp()
      const inactivityDuration = currentTime - lastActivityTime

      /* Show warning dialog based on inactivity OR low remaining time */
      if (remaining > 0 && !showWarningDialog) {
        /* Option 1: User has been inactive for too long */
        const isInactive = inactivityDuration >= inactivityThresholdInSeconds

        /* Option 2: Session time is running out */
        const isLowTime = remaining <= warningThresholdInSeconds

        /* Show warning if either condition is met */
        if (isInactive) {
          setShowWarningDialog(true)
          setIsInactivityWarning(true)
          setInactivityCountdown(inactivityDialogCountdownInSeconds)
        } else if (isLowTime && !warningDismissedRef.current) {
          /* Only show low time warning if user hasn't dismissed it */
          setShowWarningDialog(true)
          setIsInactivityWarning(false)
        }
      }

      /* Check if session has expired */
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true)
        setShowWarningDialog(false)
        setShowExpiredDialog(true)
        setExpiredCountdown(60)
        clearInterval(intervalId)
      }
    }, 1000)

    /* Cleanup interval on unmount */
    return () => {
      clearInterval(intervalId)
    }
  }, [calculateRemainingTime, onExpire, isExpired, showWarningDialog, lastActivityTime])

  /* Handle auto logout when inactivity countdown reaches 0 */
  useEffect(() => {
    if (showWarningDialog && isInactivityWarning && inactivityCountdown === 0) {
      setShowWarningDialog(false)
      createToastNotification({
        type: 'warning',
        title: 'Session Ended',
        description: 'You have been logged out due to inactivity.'
      })
      onExpire()
    }
  }, [showWarningDialog, isInactivityWarning, inactivityCountdown, onExpire])

  /* Handle auto logout when expired countdown reaches 0 */
  useEffect(() => {
    if (showExpiredDialog && expiredCountdown === 0) {
      setShowExpiredDialog(false)
      onExpire()
    }
  }, [showExpiredDialog, expiredCountdown, onExpire])

  return {
    remainingTime,
    formattedTime: formatTimer(remainingTime),
    isExpired,
    showWarningDialog,
    isInactivityWarning,
    inactivityCountdown,
    showExpiredDialog,
    expiredCountdown,
    resetTimer,
    extendSession,
    resumeSession,
    dismissWarning,
    handleExpiredLogin
  }
}
