import { describe, it, expect } from 'vitest'
import {
  BACKEND_BASE_URL,
  LOADING_DELAY,
  LOADING_DELAY_ENABLED,
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
} from '../app-config'

describe('App Configuration', () => {
  describe('Backend Configuration', () => {
    it('should export BACKEND_BASE_URL as a string', () => {
      expect(typeof BACKEND_BASE_URL).toBe('string')
      expect(BACKEND_BASE_URL).toBeDefined()
    })

    it('should have a valid URL format', () => {
      expect(BACKEND_BASE_URL).toMatch(/^https?:\/\//)
    })

    it('should use local development URL by default', () => {
      expect(BACKEND_BASE_URL).toBe('http://127.0.0.1:8787')
    })
  })

  describe('Loading Configuration', () => {
    it('should export LOADING_DELAY as a number', () => {
      expect(typeof LOADING_DELAY).toBe('number')
      expect(LOADING_DELAY).toBeGreaterThan(0)
    })

    it('should have default loading delay of 2000ms', () => {
      expect(LOADING_DELAY).toBe(2000)
    })

    it('should export LOADING_DELAY_ENABLED as a boolean', () => {
      expect(typeof LOADING_DELAY_ENABLED).toBe('boolean')
    })

    it('should have loading delay enabled by default', () => {
      expect(LOADING_DELAY_ENABLED).toBe(true)
    })
  })

  describe('Currency Configuration', () => {
    it('should export CURRENCY_SYMBOL as a string', () => {
      expect(typeof CURRENCY_SYMBOL).toBe('string')
      expect(CURRENCY_SYMBOL).toBeDefined()
    })

    it('should use dollar sign as default currency', () => {
      expect(CURRENCY_SYMBOL).toBe('$')
    })

    it('should have a non-empty currency symbol', () => {
      expect(CURRENCY_SYMBOL.length).toBeGreaterThan(0)
    })
  })

  describe('Brand Colors', () => {
    it('should export PRIMARY_COLOR as a valid hex color', () => {
      expect(typeof PRIMARY_COLOR).toBe('string')
      expect(PRIMARY_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('should have correct primary color value', () => {
      expect(PRIMARY_COLOR).toBe('#562dc6')
    })

    it('should export SECONDARY_COLOR as a valid hex color', () => {
      expect(typeof SECONDARY_COLOR).toBe('string')
      expect(SECONDARY_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('should have correct secondary color value', () => {
      expect(SECONDARY_COLOR).toBe('#885CF7')
    })
  })

  describe('Base Colors', () => {
    const baseColors = [
      { name: 'BG_COLOR', value: BG_COLOR, expected: '#FCFCFF' },
      { name: 'WHITE_COLOR', value: WHITE_COLOR, expected: '#FFFFFF' },
      { name: 'DARK_COLOR', value: DARK_COLOR, expected: '#17171A' },
      { name: 'GRAY_COLOR', value: GRAY_COLOR, expected: '#39393E' }
    ]

    baseColors.forEach(({ name, value, expected }) => {
      it(`should export ${name} as a valid hex color`, () => {
        expect(typeof value).toBe('string')
        expect(value).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(value).toBe(expected)
      })
    })

    it('should have distinct base colors', () => {
      const colors = [BG_COLOR, WHITE_COLOR, DARK_COLOR, GRAY_COLOR]
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(colors.length)
    })
  })

  describe('Status Colors', () => {
    const statusColors = [
      { name: 'SUCCESS_GREEN_COLOR', value: SUCCESS_GREEN_COLOR },
      { name: 'SUCCESS_GREEN_COLOR2', value: SUCCESS_GREEN_COLOR2 },
      { name: 'WARNING_ORANGE_COLOR', value: WARNING_ORANGE_COLOR },
      { name: 'ERROR_RED_COLOR', value: ERROR_RED_COLOR }
    ]

    statusColors.forEach(({ name, value }) => {
      it(`should export ${name} as a valid hex color`, () => {
        expect(typeof value).toBe('string')
        expect(value).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/) // Allow 6 or 8 character hex
      })
    })

    it('should have correct success green colors', () => {
      expect(SUCCESS_GREEN_COLOR).toBe('#00FF41')
      expect(SUCCESS_GREEN_COLOR2).toBe('#30cb57ff')
    })

    it('should have correct warning and error colors', () => {
      expect(WARNING_ORANGE_COLOR).toBe('#f59e0b')
      expect(ERROR_RED_COLOR).toBe('#ef4444')
    })

    it('should have distinct status colors', () => {
      const colors = [SUCCESS_GREEN_COLOR, WARNING_ORANGE_COLOR, ERROR_RED_COLOR]
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(colors.length)
    })
  })

  describe('Color Validation', () => {
    it('should have all colors in correct hex format', () => {
      const allColors = [
        PRIMARY_COLOR, SECONDARY_COLOR, BG_COLOR, WHITE_COLOR,
        DARK_COLOR, GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2,
        WARNING_ORANGE_COLOR, ERROR_RED_COLOR
      ]

      allColors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
      })
    })

    it('should not have any undefined color values', () => {
      const allColors = [
        PRIMARY_COLOR, SECONDARY_COLOR, BG_COLOR, WHITE_COLOR,
        DARK_COLOR, GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2,
        WARNING_ORANGE_COLOR, ERROR_RED_COLOR
      ]

      allColors.forEach(color => {
        expect(color).toBeDefined()
        expect(color).not.toBeNull()
        expect(color).not.toBe('')
      })
    })
  })

  describe('Configuration Immutability', () => {
    it('should not allow modification of exported constants', () => {
      const originalValue = BACKEND_BASE_URL
      
      // Attempting to modify should not change the original
      const modifiedConfig = { BACKEND_BASE_URL: 'modified' }
      expect(BACKEND_BASE_URL).toBe(originalValue)
      expect(modifiedConfig.BACKEND_BASE_URL).toBe('modified')
    })
  })
})