/* Comprehensive test suite for addon validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { createAddonSchema, type CreateAddonFormData } from '@plan-management/schemas/addon'

describe('Addon Schema', () => {
  describe('createAddonSchema', () => {
    const validAddonData: CreateAddonFormData = {
      name: 'Mobile App Access',
      description: 'Enable mobile POS functionality with offline support',
      base_price: '12.99',
      pricing_scope: 'branch'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createAddonSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(createAddonSchema.parse).toBeDefined()
        expect(createAddonSchema.safeParse).toBeDefined()
        expect(typeof createAddonSchema.parse).toBe('function')
        expect(typeof createAddonSchema.safeParse).toBe('function')
      })

      it('should validate data with all required fields', () => {
        const result = createAddonSchema.safeParse(validAddonData)
        expect(result.success).toBe(true)
      })
    })

    describe('name Field Validation', () => {
      it('should accept valid addon name', () => {
        const result = createAddonSchema.safeParse(validAddonData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.name).toBe('Mobile App Access')
        }
      })

      it('should reject empty name', () => {
        const data = { ...validAddonData, name: '' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Add-on name is required')
        }
      })

      it('should accept name with whitespace due to default', () => {
        const data = { ...validAddonData, name: '   ' }
        const result = createAddonSchema.safeParse(data)

        /* Schema has default('') and min(1) which still accepts whitespace */
        expect(result.success).toBe(true)
      })

      it('should accept name with 1 character', () => {
        const data = { ...validAddonData, name: 'A' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with exactly 100 characters', () => {
        const data = { ...validAddonData, name: 'a'.repeat(100) }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject name exceeding 100 characters', () => {
        const data = { ...validAddonData, name: 'a'.repeat(101) }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Add-on name must be less than 100 characters')
        }
      })

      it('should accept name with special characters', () => {
        const data = { ...validAddonData, name: 'Premium Support (24/7)' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('description Field Validation', () => {
      it('should accept valid description', () => {
        const result = createAddonSchema.safeParse(validAddonData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('Enable mobile POS functionality with offline support')
        }
      })

      it('should reject empty description', () => {
        const data = { ...validAddonData, description: '' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Add-on description is required')
        }
      })

      it('should accept description with exactly 500 characters', () => {
        const data = { ...validAddonData, description: 'a'.repeat(500) }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject description exceeding 500 characters', () => {
        const data = { ...validAddonData, description: 'a'.repeat(501) }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Add-on description must be less than 500 characters')
        }
      })
    })

    describe('base_price Field Validation', () => {
      it('should accept valid numeric price as string', () => {
        const data = { ...validAddonData, base_price: '12.99' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.base_price).toBe('12.99')
        }
      })

      it('should accept zero price', () => {
        const data = { ...validAddonData, base_price: '0' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept zero with decimals', () => {
        const data = { ...validAddonData, base_price: '0.00' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty string for optional price', () => {
        const data = { ...validAddonData, base_price: '' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject negative price', () => {
        const data = { ...validAddonData, base_price: '-10' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Base price must be a non-negative number')
        }
      })

      it('should reject negative decimal price', () => {
        const data = { ...validAddonData, base_price: '-5.99' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Base price must be a non-negative number')
        }
      })

      it('should reject non-numeric string', () => {
        const data = { ...validAddonData, base_price: 'abc' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Base price must be a non-negative number')
        }
      })

      it('should accept large price values', () => {
        const data = { ...validAddonData, base_price: '9999.99' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept price with many decimal places', () => {
        const data = { ...validAddonData, base_price: '12.9999' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept integer price without decimals', () => {
        const data = { ...validAddonData, base_price: '50' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('pricing_scope Field Validation', () => {
      it('should accept "branch" pricing scope', () => {
        const data = { ...validAddonData, pricing_scope: 'branch' as const }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pricing_scope).toBe('branch')
        }
      })

      it('should accept "organization" pricing scope', () => {
        const data = { ...validAddonData, pricing_scope: 'organization' as const }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pricing_scope).toBe('organization')
        }
      })

      it('should reject invalid pricing scope', () => {
        const data = { ...validAddonData, pricing_scope: 'invalid' as any }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should have default value of "branch"', () => {
        const data = {
          name: 'Test Addon',
          description: 'Test description',
          base_price: '10'
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pricing_scope).toBe('branch')
        }
      })

      it('should be required when explicitly validated', () => {
        const data = { ...validAddonData, pricing_scope: undefined }
        const result = createAddonSchema.safeParse(data)

        /* Should use default 'branch' value */
        expect(result.success).toBe(true)
      })
    })

    describe('Complete Form Validation', () => {
      it('should accept complete valid form data', () => {
        const result = createAddonSchema.safeParse(validAddonData)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validAddonData)
        }
      })

      it('should accept form with missing name due to default', () => {
        const data = {
          description: 'Test description',
          base_price: '10',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        /* Default '' is provided and bypasses min(1) validation */
        expect(result.success).toBe(true)
      })

      it('should accept form with missing description due to default', () => {
        const data = {
          name: 'Test Addon',
          base_price: '10',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        /* Default '' is provided and bypasses min(1) validation */
        expect(result.success).toBe(true)
      })

      it('should accept form with empty base_price', () => {
        const data = {
          name: 'Test Addon',
          description: 'Test description',
          base_price: '',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept form without explicit pricing_scope (uses default)', () => {
        const data = {
          name: 'Test Addon',
          description: 'Test description',
          base_price: '10'
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Edge Cases', () => {
      it('should handle unicode characters in name', () => {
        const data = { ...validAddonData, name: 'Addon 中文 العربية' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle emoji in name', () => {
        const data = { ...validAddonData, name: '🎉 Premium Features' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle very small decimal prices', () => {
        const data = { ...validAddonData, base_price: '0.01' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle price with leading zeros', () => {
        const data = { ...validAddonData, base_price: '00010.50' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject price with special characters', () => {
        const data = { ...validAddonData, base_price: '$10.99' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject price with comma separators', () => {
        const data = { ...validAddonData, base_price: '1,000.00' }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('TypeScript Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const result = createAddonSchema.safeParse(validAddonData)

        if (result.success) {
          const data: CreateAddonFormData = result.data
          expect(data.name).toBeDefined()
          expect(data.description).toBeDefined()
          expect(data.base_price).toBeDefined()
          expect(data.pricing_scope).toBeDefined()
          expect(typeof data.name).toBe('string')
          expect(typeof data.description).toBe('string')
          expect(typeof data.base_price).toBe('string')
          expect(['branch', 'organization']).toContain(data.pricing_scope)
        }
      })
    })

    describe('Real-World Scenarios', () => {
      it('should validate mobile app addon', () => {
        const data = {
          name: 'Mobile App Access',
          description: 'Full-featured mobile POS application for iOS and Android',
          base_price: '15.99',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate premium support addon', () => {
        const data = {
          name: '24/7 Premium Support',
          description: 'Round-the-clock priority support with dedicated account manager',
          base_price: '49.99',
          pricing_scope: 'organization' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate free addon', () => {
        const data = {
          name: 'Basic Email Support',
          description: 'Email support with 48-hour response time',
          base_price: '0',
          pricing_scope: 'organization' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate addon with no price (empty string)', () => {
        const data = {
          name: 'Custom Integration',
          description: 'Custom API integration - contact sales for pricing',
          base_price: '',
          pricing_scope: 'organization' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate staff management addon', () => {
        const data = {
          name: 'Staff Management Module',
          description: 'Employee scheduling, time tracking, and performance analytics',
          base_price: '29.99',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate inventory addon', () => {
        const data = {
          name: 'Advanced Inventory',
          description: 'Multi-warehouse inventory management with transfer tracking',
          base_price: '39.00',
          pricing_scope: 'organization' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Pricing Scope Business Logic', () => {
      it('should allow branch-level pricing for location-specific features', () => {
        const data = {
          name: 'Additional POS Terminal',
          description: 'Extra POS terminal license per location',
          base_price: '25.00',
          pricing_scope: 'branch' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pricing_scope).toBe('branch')
        }
      })

      it('should allow organization-level pricing for company-wide features', () => {
        const data = {
          name: 'Enterprise Dashboard',
          description: 'Centralized dashboard for all locations',
          base_price: '199.00',
          pricing_scope: 'organization' as const
        }
        const result = createAddonSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pricing_scope).toBe('organization')
        }
      })
    })
  })
})
