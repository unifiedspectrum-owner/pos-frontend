/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { BACKEND_BASE_URL, LOADING_DELAY, LOADING_DELAY_ENABLED, COUNTRIES_CACHE_DURATION, CURRENCY_SYMBOL, PRIMARY_COLOR, SECONDARY_COLOR, BG_COLOR, WHITE_COLOR, DARK_COLOR, GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, WARNING_ORANGE_COLOR, ERROR_RED_COLOR } from '@shared/config/app-config'

describe('app-config', () => {
  describe('Backend Configuration', () => {
    it('should export BACKEND_BASE_URL constant', () => {
      expect(BACKEND_BASE_URL).toBeDefined()
      expect(typeof BACKEND_BASE_URL).toBe('string')
    })

    it('should have valid URL format for BACKEND_BASE_URL', () => {
      expect(BACKEND_BASE_URL).toMatch(/^https?:\/\//)
      expect(BACKEND_BASE_URL.length).toBeGreaterThan(0)
    })

    it('should not have trailing slash in BACKEND_BASE_URL', () => {
      expect(BACKEND_BASE_URL).not.toMatch(/\/$/)
    })

    it('should use valid protocol (http or https)', () => {
      const isValidProtocol = BACKEND_BASE_URL.startsWith('http://') || BACKEND_BASE_URL.startsWith('https://')
      expect(isValidProtocol).toBe(true)
    })
  })

  describe('Loading States Configuration', () => {
    it('should export LOADING_DELAY constant', () => {
      expect(LOADING_DELAY).toBeDefined()
      expect(typeof LOADING_DELAY).toBe('number')
    })

    it('should have LOADING_DELAY as a positive number', () => {
      expect(LOADING_DELAY).toBeGreaterThanOrEqual(0)
    })

    it('should export LOADING_DELAY_ENABLED constant', () => {
      expect(LOADING_DELAY_ENABLED).toBeDefined()
      expect(typeof LOADING_DELAY_ENABLED).toBe('boolean')
    })

    it('should have LOADING_DELAY in milliseconds (reasonable range)', () => {
      /* Loading delay should be between 0 and 10 seconds */
      expect(LOADING_DELAY).toBeGreaterThanOrEqual(0)
      expect(LOADING_DELAY).toBeLessThanOrEqual(10000)
    })

    it('should have LOADING_DELAY_ENABLED as boolean', () => {
      expect([true, false]).toContain(LOADING_DELAY_ENABLED)
    })
  })

  describe('Cache Configuration', () => {
    it('should export COUNTRIES_CACHE_DURATION constant', () => {
      expect(COUNTRIES_CACHE_DURATION).toBeDefined()
      expect(typeof COUNTRIES_CACHE_DURATION).toBe('number')
    })

    it('should have COUNTRIES_CACHE_DURATION as a positive number', () => {
      expect(COUNTRIES_CACHE_DURATION).toBeGreaterThan(0)
    })

    it('should have COUNTRIES_CACHE_DURATION in milliseconds', () => {
      /* 24 hours = 1000 * 60 * 60 * 24 = 86400000 milliseconds */
      expect(COUNTRIES_CACHE_DURATION).toBe(86400000)
    })

    it('should cache countries for at least 1 hour', () => {
      const oneHourInMs = 1000 * 60 * 60
      expect(COUNTRIES_CACHE_DURATION).toBeGreaterThanOrEqual(oneHourInMs)
    })

    it('should cache countries for no more than 7 days', () => {
      const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7
      expect(COUNTRIES_CACHE_DURATION).toBeLessThanOrEqual(sevenDaysInMs)
    })
  })

  describe('Currency and Formatting', () => {
    it('should export CURRENCY_SYMBOL constant', () => {
      expect(CURRENCY_SYMBOL).toBeDefined()
      expect(typeof CURRENCY_SYMBOL).toBe('string')
    })

    it('should have non-empty CURRENCY_SYMBOL', () => {
      expect(CURRENCY_SYMBOL.length).toBeGreaterThan(0)
    })

    it('should have valid currency symbol format', () => {
      /* Currency symbols are typically 1-3 characters */
      expect(CURRENCY_SYMBOL.length).toBeGreaterThanOrEqual(1)
      expect(CURRENCY_SYMBOL.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Primary Brand Colors', () => {
    it('should export PRIMARY_COLOR constant', () => {
      expect(PRIMARY_COLOR).toBeDefined()
      expect(typeof PRIMARY_COLOR).toBe('string')
    })

    it('should export SECONDARY_COLOR constant', () => {
      expect(SECONDARY_COLOR).toBeDefined()
      expect(typeof SECONDARY_COLOR).toBe('string')
    })

    it('should have PRIMARY_COLOR in hex format', () => {
      expect(PRIMARY_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should have SECONDARY_COLOR in hex format', () => {
      expect(SECONDARY_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should have different primary and secondary colors', () => {
      expect(PRIMARY_COLOR.toLowerCase()).not.toBe(SECONDARY_COLOR.toLowerCase())
    })

    it('should have valid hex color length', () => {
      expect(PRIMARY_COLOR.length).toBe(7)
      expect(SECONDARY_COLOR.length).toBe(7)
    })
  })

  describe('Base Colors', () => {
    it('should export BG_COLOR constant', () => {
      expect(BG_COLOR).toBeDefined()
      expect(typeof BG_COLOR).toBe('string')
    })

    it('should export WHITE_COLOR constant', () => {
      expect(WHITE_COLOR).toBeDefined()
      expect(typeof WHITE_COLOR).toBe('string')
    })

    it('should export DARK_COLOR constant', () => {
      expect(DARK_COLOR).toBeDefined()
      expect(typeof DARK_COLOR).toBe('string')
    })

    it('should export GRAY_COLOR constant', () => {
      expect(GRAY_COLOR).toBeDefined()
      expect(typeof GRAY_COLOR).toBe('string')
    })

    it('should have all base colors in hex format', () => {
      expect(BG_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(WHITE_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(DARK_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(GRAY_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should have WHITE_COLOR as pure white', () => {
      expect(WHITE_COLOR.toUpperCase()).toBe('#FFFFFF')
    })

    it('should have distinct base colors', () => {
      const colors = [BG_COLOR, WHITE_COLOR, DARK_COLOR, GRAY_COLOR]
      const uniqueColors = new Set(colors.map(c => c.toLowerCase()))
      expect(uniqueColors.size).toBe(colors.length)
    })
  })

  describe('Status Colors', () => {
    it('should export SUCCESS_GREEN_COLOR constant', () => {
      expect(SUCCESS_GREEN_COLOR).toBeDefined()
      expect(typeof SUCCESS_GREEN_COLOR).toBe('string')
    })

    it('should export SUCCESS_GREEN_COLOR2 constant', () => {
      expect(SUCCESS_GREEN_COLOR2).toBeDefined()
      expect(typeof SUCCESS_GREEN_COLOR2).toBe('string')
    })

    it('should export WARNING_ORANGE_COLOR constant', () => {
      expect(WARNING_ORANGE_COLOR).toBeDefined()
      expect(typeof WARNING_ORANGE_COLOR).toBe('string')
    })

    it('should export ERROR_RED_COLOR constant', () => {
      expect(ERROR_RED_COLOR).toBeDefined()
      expect(typeof ERROR_RED_COLOR).toBe('string')
    })

    it('should have all status colors in hex format', () => {
      expect(SUCCESS_GREEN_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(WARNING_ORANGE_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(ERROR_RED_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should have SUCCESS_GREEN_COLOR2 in hex or rgba format', () => {
      const isValidHex = /^#[0-9A-Fa-f]{6,8}$/.test(SUCCESS_GREEN_COLOR2)
      const isValidRgba = /^rgba?\(/.test(SUCCESS_GREEN_COLOR2)
      expect(isValidHex || isValidRgba).toBe(true)
    })

    it('should have distinct success color variants', () => {
      expect(SUCCESS_GREEN_COLOR.toLowerCase()).not.toBe(SUCCESS_GREEN_COLOR2.toLowerCase())
    })

    it('should have distinct status colors', () => {
      /* Warning and error should be different */
      expect(WARNING_ORANGE_COLOR.toLowerCase()).not.toBe(ERROR_RED_COLOR.toLowerCase())
    })
  })

  describe('Color Consistency', () => {
    it('should have all primary colors start with #', () => {
      const colors = [
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      colors.forEach(color => {
        expect(color).toMatch(/^#/)
      })
    })

    it('should have valid hex color format for all colors', () => {
      const colors = [
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })

    it('should not have uppercase letters inconsistently in hex colors', () => {
      const colors = [
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      colors.forEach(color => {
        /* Check that color is either all lowercase or all uppercase after # */
        const hexPart = color.substring(1)
        const isLowerCase = hexPart === hexPart.toLowerCase()
        const isUpperCase = hexPart === hexPart.toUpperCase()
        expect(isLowerCase || isUpperCase).toBe(true)
      })
    })
  })

  describe('Configuration Values', () => {
    it('should have reasonable loading delay value', () => {
      expect(LOADING_DELAY).toBe(2000)
    })

    it('should have loading delay disabled by default', () => {
      expect(LOADING_DELAY_ENABLED).toBe(false)
    })

    it('should have default currency symbol as dollar', () => {
      expect(CURRENCY_SYMBOL).toBe('$')
    })
  })

  describe('Type Safety', () => {
    it('should have all color constants as strings', () => {
      const colorConstants = [
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        SUCCESS_GREEN_COLOR2,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      colorConstants.forEach(color => {
        expect(typeof color).toBe('string')
      })
    })

    it('should have all numeric constants as numbers', () => {
      const numericConstants = [
        LOADING_DELAY,
        COUNTRIES_CACHE_DURATION
      ]

      numericConstants.forEach(num => {
        expect(typeof num).toBe('number')
        expect(Number.isFinite(num)).toBe(true)
      })
    })

    it('should have boolean constants as booleans', () => {
      expect(typeof LOADING_DELAY_ENABLED).toBe('boolean')
    })

    it('should not have null or undefined constants', () => {
      const allConstants = [
        BACKEND_BASE_URL,
        LOADING_DELAY,
        LOADING_DELAY_ENABLED,
        COUNTRIES_CACHE_DURATION,
        CURRENCY_SYMBOL,
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        SUCCESS_GREEN_COLOR2,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      allConstants.forEach(constant => {
        expect(constant).not.toBeNull()
        expect(constant).not.toBeUndefined()
      })
    })
  })

  describe('Immutability', () => {
    it('should export constants that can be imported', () => {
      /* If this test runs, it means the constants were successfully imported */
      expect(BACKEND_BASE_URL).toBeDefined()
      expect(PRIMARY_COLOR).toBeDefined()
      expect(LOADING_DELAY).toBeDefined()
    })

    it('should have non-empty string values', () => {
      const stringConstants = [
        BACKEND_BASE_URL,
        CURRENCY_SYMBOL,
        PRIMARY_COLOR,
        SECONDARY_COLOR,
        BG_COLOR,
        WHITE_COLOR,
        DARK_COLOR,
        GRAY_COLOR,
        SUCCESS_GREEN_COLOR,
        SUCCESS_GREEN_COLOR2,
        WARNING_ORANGE_COLOR,
        ERROR_RED_COLOR
      ]

      stringConstants.forEach(str => {
        expect(str.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Configuration Integration', () => {
    it('should have compatible cache duration with loading delay', () => {
      /* Cache duration should be much longer than loading delay */
      expect(COUNTRIES_CACHE_DURATION).toBeGreaterThan(LOADING_DELAY * 1000)
    })

    it('should have all required configuration constants exported', () => {
      const requiredConstants = [
        'BACKEND_BASE_URL',
        'LOADING_DELAY',
        'LOADING_DELAY_ENABLED',
        'COUNTRIES_CACHE_DURATION',
        'CURRENCY_SYMBOL',
        'PRIMARY_COLOR',
        'SECONDARY_COLOR',
        'BG_COLOR',
        'WHITE_COLOR',
        'DARK_COLOR',
        'GRAY_COLOR',
        'SUCCESS_GREEN_COLOR',
        'SUCCESS_GREEN_COLOR2',
        'WARNING_ORANGE_COLOR',
        'ERROR_RED_COLOR'
      ]

      /* Check that all constants are defined */
      expect(BACKEND_BASE_URL).toBeDefined()
      expect(LOADING_DELAY).toBeDefined()
      expect(LOADING_DELAY_ENABLED).toBeDefined()
      expect(COUNTRIES_CACHE_DURATION).toBeDefined()
      expect(CURRENCY_SYMBOL).toBeDefined()
      expect(PRIMARY_COLOR).toBeDefined()
      expect(SECONDARY_COLOR).toBeDefined()
      expect(BG_COLOR).toBeDefined()
      expect(WHITE_COLOR).toBeDefined()
      expect(DARK_COLOR).toBeDefined()
      expect(GRAY_COLOR).toBeDefined()
      expect(SUCCESS_GREEN_COLOR).toBeDefined()
      expect(SUCCESS_GREEN_COLOR2).toBeDefined()
      expect(WARNING_ORANGE_COLOR).toBeDefined()
      expect(ERROR_RED_COLOR).toBeDefined()
    })
  })
})
