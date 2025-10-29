/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/* Shared module imports */
import {
  minutesToSeconds,
  secondsToMinutes,
  formatTimer,
  formatDate,
  formatDateTime,
  getCurrentUnixTimestamp,
  getCurrentTimestampMs,
  getCurrentISOString,
  addMinutesToCurrentTime,
  addHoursToCurrentTime,
  addDaysToCurrentTime,
  addMinutesToCurrentDate,
  addHoursToCurrentDate,
  addDaysToCurrentDate,
  isUnixTimestampExpired,
  isISODateExpired,
  isJWTTokenExpired,
  unixToISOString,
  isoStringToUnix
} from '@shared/utils/formatting/time'

describe('Time Formatting Utilities', () => {
  describe('minutesToSeconds', () => {
    it('should convert 0 minutes to 0 seconds', () => {
      expect(minutesToSeconds(0)).toBe(0)
    })

    it('should convert 1 minute to 60 seconds', () => {
      expect(minutesToSeconds(1)).toBe(60)
    })

    it('should convert 5 minutes to 300 seconds', () => {
      expect(minutesToSeconds(5)).toBe(300)
    })

    it('should convert 30 minutes to 1800 seconds', () => {
      expect(minutesToSeconds(30)).toBe(1800)
    })

    it('should convert 60 minutes to 3600 seconds', () => {
      expect(minutesToSeconds(60)).toBe(3600)
    })

    it('should handle fractional minutes', () => {
      expect(minutesToSeconds(1.5)).toBe(90)
    })

    it('should handle negative minutes', () => {
      expect(minutesToSeconds(-5)).toBe(-300)
    })
  })

  describe('secondsToMinutes', () => {
    it('should convert 0 seconds to 0 minutes', () => {
      expect(secondsToMinutes(0)).toBe(0)
    })

    it('should convert 60 seconds to 1 minute', () => {
      expect(secondsToMinutes(60)).toBe(1)
    })

    it('should convert 300 seconds to 5 minutes', () => {
      expect(secondsToMinutes(300)).toBe(5)
    })

    it('should convert 3600 seconds to 60 minutes', () => {
      expect(secondsToMinutes(3600)).toBe(60)
    })

    it('should floor fractional results', () => {
      expect(secondsToMinutes(90)).toBe(1)
      expect(secondsToMinutes(119)).toBe(1)
      expect(secondsToMinutes(120)).toBe(2)
    })

    it('should handle partial minutes', () => {
      expect(secondsToMinutes(65)).toBe(1)
      expect(secondsToMinutes(125)).toBe(2)
    })
  })

  describe('formatTimer', () => {
    it('should format 0 seconds as 0:00', () => {
      expect(formatTimer(0)).toBe('0:00')
    })

    it('should format 30 seconds as 0:30', () => {
      expect(formatTimer(30)).toBe('0:30')
    })

    it('should format 60 seconds as 1:00', () => {
      expect(formatTimer(60)).toBe('1:00')
    })

    it('should format 90 seconds as 1:30', () => {
      expect(formatTimer(90)).toBe('1:30')
    })

    it('should format 125 seconds as 2:05', () => {
      expect(formatTimer(125)).toBe('2:05')
    })

    it('should format 600 seconds as 10:00', () => {
      expect(formatTimer(600)).toBe('10:00')
    })

    it('should format 3599 seconds as 59:59', () => {
      expect(formatTimer(3599)).toBe('59:59')
    })

    it('should format 3600 seconds as 60:00', () => {
      expect(formatTimer(3600)).toBe('60:00')
    })

    it('should pad single digit seconds with zero', () => {
      expect(formatTimer(65)).toBe('1:05')
      expect(formatTimer(305)).toBe('5:05')
    })

    it('should handle large values', () => {
      expect(formatTimer(7200)).toBe('120:00')
    })
  })

  describe('formatDate', () => {
    it('should format date in DD-MM-YYYY format', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('15-01-2024')
    })

    it('should format date with time component', () => {
      const result = formatDate('2024-01-15T10:30:00')
      expect(result).toBe('15-01-2024')
    })

    it('should pad single digit day', () => {
      const result = formatDate('2024-01-05')
      expect(result).toBe('05-01-2024')
    })

    it('should pad single digit month', () => {
      const result = formatDate('2024-03-15')
      expect(result).toBe('15-03-2024')
    })

    it('should return null for empty string', () => {
      const result = formatDate('')
      expect(result).toBeNull()
    })

    it('should return null for null input', () => {
      const result = formatDate(null as unknown as string)
      expect(result).toBeNull()
    })

    it('should return null for undefined input', () => {
      const result = formatDate(undefined as unknown as string)
      expect(result).toBeNull()
    })

    it('should handle ISO 8601 format', () => {
      const result = formatDate('2024-12-25T00:00:00Z')
      expect(result).toBe('25-12-2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time with AM', () => {
      const result = formatDateTime('2024-01-15T09:30:00')
      expect(result).toMatch(/15-01-2024 \d{2}:30 [AP]M/)
    })

    it('should format date and time with PM', () => {
      const result = formatDateTime('2024-01-15T15:45:00')
      expect(result).toMatch(/15-01-2024 \d{2}:45 PM/)
    })

    it('should convert 00:00 to 12:00 AM', () => {
      const result = formatDateTime('2024-01-15T00:00:00')
      expect(result).toContain('12:00 AM')
    })

    it('should convert 12:00 to 12:00 PM', () => {
      const result = formatDateTime('2024-01-15T12:00:00')
      expect(result).toContain('12:00 PM')
    })

    it('should pad minutes with zero', () => {
      const result = formatDateTime('2024-01-15T14:05:00')
      expect(result).toContain(':05 ')
    })

    it('should pad hours with zero', () => {
      const result = formatDateTime('2024-01-15T09:30:00')
      expect(result).toMatch(/\d{2}:\d{2} AM/)
    })

    it('should return null for empty string', () => {
      const result = formatDateTime('')
      expect(result).toBeNull()
    })

    it('should return null for null input', () => {
      const result = formatDateTime(null as unknown as string)
      expect(result).toBeNull()
    })

    it('should handle ISO 8601 format', () => {
      const result = formatDateTime('2024-12-25T18:30:00Z')
      expect(result).toBeDefined()
    })
  })

  describe('getCurrentUnixTimestamp', () => {
    it('should return a number', () => {
      const result = getCurrentUnixTimestamp()
      expect(typeof result).toBe('number')
    })

    it('should return timestamp in seconds', () => {
      const result = getCurrentUnixTimestamp()
      /* Unix timestamp should be 10 digits for dates after 2001 and before 2286 */
      expect(result.toString().length).toBeGreaterThanOrEqual(10)
    })

    it('should be approximately current time', () => {
      const result = getCurrentUnixTimestamp()
      const expected = Math.floor(Date.now() / 1000)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should return increasing values', () => {
      const time1 = getCurrentUnixTimestamp()
      /* Wait a tiny bit */
      const time2 = getCurrentUnixTimestamp()
      expect(time2).toBeGreaterThanOrEqual(time1)
    })
  })

  describe('getCurrentTimestampMs', () => {
    it('should return a number', () => {
      const result = getCurrentTimestampMs()
      expect(typeof result).toBe('number')
    })

    it('should return timestamp in milliseconds', () => {
      const result = getCurrentTimestampMs()
      /* Millisecond timestamp should be 13 digits */
      expect(result.toString().length).toBeGreaterThanOrEqual(13)
    })

    it('should be 1000x Unix timestamp', () => {
      const unix = getCurrentUnixTimestamp()
      const ms = getCurrentTimestampMs()
      expect(Math.abs(ms - unix * 1000)).toBeLessThan(1000)
    })
  })

  describe('getCurrentISOString', () => {
    it('should return a string', () => {
      const result = getCurrentISOString()
      expect(typeof result).toBe('string')
    })

    it('should return ISO 8601 format', () => {
      const result = getCurrentISOString()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should be parseable by Date constructor', () => {
      const result = getCurrentISOString()
      const date = new Date(result)
      expect(date.toISOString()).toBe(result)
    })
  })

  describe('addMinutesToCurrentTime', () => {
    it('should add 5 minutes', () => {
      const result = addMinutesToCurrentTime(5)
      const expected = getCurrentUnixTimestamp() + (5 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 30 minutes', () => {
      const result = addMinutesToCurrentTime(30)
      const expected = getCurrentUnixTimestamp() + (30 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 0 minutes', () => {
      const result = addMinutesToCurrentTime(0)
      const expected = getCurrentUnixTimestamp()
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should handle negative minutes', () => {
      const result = addMinutesToCurrentTime(-10)
      const expected = getCurrentUnixTimestamp() - (10 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })
  })

  describe('addHoursToCurrentTime', () => {
    it('should add 1 hour', () => {
      const result = addHoursToCurrentTime(1)
      const expected = getCurrentUnixTimestamp() + (1 * 60 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 24 hours', () => {
      const result = addHoursToCurrentTime(24)
      const expected = getCurrentUnixTimestamp() + (24 * 60 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 0 hours', () => {
      const result = addHoursToCurrentTime(0)
      const expected = getCurrentUnixTimestamp()
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })
  })

  describe('addDaysToCurrentTime', () => {
    it('should add 1 day', () => {
      const result = addDaysToCurrentTime(1)
      const expected = getCurrentUnixTimestamp() + (1 * 24 * 60 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 7 days', () => {
      const result = addDaysToCurrentTime(7)
      const expected = getCurrentUnixTimestamp() + (7 * 24 * 60 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should add 30 days', () => {
      const result = addDaysToCurrentTime(30)
      const expected = getCurrentUnixTimestamp() + (30 * 24 * 60 * 60)
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })
  })

  describe('addMinutesToCurrentDate', () => {
    it('should add minutes to current date', () => {
      const result = addMinutesToCurrentDate(10)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return future date', () => {
      const result = addMinutesToCurrentDate(5)
      const resultDate = new Date(result)
      const now = new Date()
      expect(resultDate.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('addHoursToCurrentDate', () => {
    it('should add hours to current date', () => {
      const result = addHoursToCurrentDate(2)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return future date', () => {
      const result = addHoursToCurrentDate(1)
      const resultDate = new Date(result)
      const now = new Date()
      expect(resultDate.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('addDaysToCurrentDate', () => {
    it('should add days to current date', () => {
      const result = addDaysToCurrentDate(5)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return future date', () => {
      const result = addDaysToCurrentDate(1)
      const resultDate = new Date(result)
      const now = new Date()
      expect(resultDate.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('isUnixTimestampExpired', () => {
    it('should return true for past timestamp', () => {
      const pastTime = getCurrentUnixTimestamp() - 3600
      expect(isUnixTimestampExpired(pastTime)).toBe(true)
    })

    it('should return false for future timestamp', () => {
      const futureTime = getCurrentUnixTimestamp() + 3600
      expect(isUnixTimestampExpired(futureTime)).toBe(false)
    })

    it('should return false for current timestamp', () => {
      const currentTime = getCurrentUnixTimestamp()
      expect(isUnixTimestampExpired(currentTime)).toBe(false)
    })

    it('should return true for timestamp 1 second ago', () => {
      const pastTime = getCurrentUnixTimestamp() - 1
      expect(isUnixTimestampExpired(pastTime)).toBe(true)
    })
  })

  describe('isISODateExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString()
      expect(isISODateExpired(pastDate)).toBe(true)
    })

    it('should return false for future date', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      expect(isISODateExpired(futureDate)).toBe(false)
    })

    it('should return false for current date', () => {
      const currentDate = new Date().toISOString()
      expect(isISODateExpired(currentDate)).toBe(false)
    })
  })

  describe('isJWTTokenExpired', () => {
    it('should return true for past exp', () => {
      const pastExp = getCurrentUnixTimestamp() - 3600
      expect(isJWTTokenExpired(pastExp)).toBe(true)
    })

    it('should return false for future exp', () => {
      const futureExp = getCurrentUnixTimestamp() + 3600
      expect(isJWTTokenExpired(futureExp)).toBe(false)
    })

    it('should return false for undefined exp', () => {
      expect(isJWTTokenExpired(undefined)).toBe(false)
    })

    it('should return false for null exp', () => {
      expect(isJWTTokenExpired(null as unknown as number)).toBe(false)
    })
  })

  describe('unixToISOString', () => {
    it('should convert Unix timestamp to ISO string', () => {
      const unix = 1704067200 /* 2024-01-01 00:00:00 UTC */
      const result = unixToISOString(unix)
      expect(result).toContain('2024-01-01')
    })

    it('should return valid ISO format', () => {
      const unix = getCurrentUnixTimestamp()
      const result = unixToISOString(unix)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should handle 0 timestamp', () => {
      const result = unixToISOString(0)
      expect(result).toBe('1970-01-01T00:00:00.000Z')
    })
  })

  describe('isoStringToUnix', () => {
    it('should convert ISO string to Unix timestamp', () => {
      const iso = '2024-01-01T00:00:00.000Z'
      const result = isoStringToUnix(iso)
      expect(result).toBe(1704067200)
    })

    it('should handle current date', () => {
      const iso = new Date().toISOString()
      const result = isoStringToUnix(iso)
      const expected = getCurrentUnixTimestamp()
      expect(Math.abs(result - expected)).toBeLessThan(2)
    })

    it('should round trip with unixToISOString', () => {
      const original = getCurrentUnixTimestamp()
      const iso = unixToISOString(original)
      const result = isoStringToUnix(iso)
      expect(result).toBe(original)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete time workflow', () => {
      /* Get current time */
      const now = getCurrentUnixTimestamp()
      expect(now).toBeGreaterThan(0)

      /* Add time */
      const future = addMinutesToCurrentTime(30)
      expect(future).toBeGreaterThan(now)

      /* Check if expired */
      expect(isUnixTimestampExpired(now)).toBe(false)
      expect(isUnixTimestampExpired(now - 3600)).toBe(true)

      /* Convert formats */
      const iso = unixToISOString(now)
      const backToUnix = isoStringToUnix(iso)
      expect(backToUnix).toBe(now)
    })

    it('should format timer from seconds', () => {
      const seconds = 125
      const formatted = formatTimer(seconds)
      expect(formatted).toBe('2:05')

      const minutes = secondsToMinutes(seconds)
      expect(minutes).toBe(2)
    })
  })
})
