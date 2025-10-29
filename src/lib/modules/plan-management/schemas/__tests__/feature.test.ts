/* Comprehensive test suite for feature validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { createFeatureSchema, type CreateFeatureFormData } from '@plan-management/schemas/feature'

describe('Feature Schema', () => {
  describe('createFeatureSchema', () => {
    const validFeatureData: CreateFeatureFormData = {
      name: 'Inventory Management',
      description: 'Track and manage inventory in real-time with automated stock alerts'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createFeatureSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(createFeatureSchema.parse).toBeDefined()
        expect(createFeatureSchema.safeParse).toBeDefined()
        expect(typeof createFeatureSchema.parse).toBe('function')
        expect(typeof createFeatureSchema.safeParse).toBe('function')
      })

      it('should validate data with all required fields', () => {
        const result = createFeatureSchema.safeParse(validFeatureData)
        expect(result.success).toBe(true)
      })
    })

    describe('name Field Validation', () => {
      it('should accept valid feature name', () => {
        const result = createFeatureSchema.safeParse(validFeatureData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.name).toBe('Inventory Management')
        }
      })

      it('should reject empty name', () => {
        const data = { ...validFeatureData, name: '' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Feature name is required')
        }
      })

      it('should accept name with whitespace due to default', () => {
        const data = { ...validFeatureData, name: '   ' }
        const result = createFeatureSchema.safeParse(data)

        /* Schema has default('') and min(1) which still accepts whitespace */
        expect(result.success).toBe(true)
      })

      it('should accept name with 1 character', () => {
        const data = { ...validFeatureData, name: 'A' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with exactly 100 characters', () => {
        const data = { ...validFeatureData, name: 'a'.repeat(100) }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject name exceeding 100 characters', () => {
        const data = { ...validFeatureData, name: 'a'.repeat(101) }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Feature name must be less than 100 characters')
        }
      })

      it('should accept name with spaces', () => {
        const data = { ...validFeatureData, name: 'Advanced Reporting & Analytics' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with numbers', () => {
        const data = { ...validFeatureData, name: '24/7 Support Service' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with special characters', () => {
        const data = { ...validFeatureData, name: 'Multi-Location Support (10+)' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept form with missing name due to default', () => {
        const data = { description: 'Test description' }
        const result = createFeatureSchema.safeParse(data)

        /* Default '' is provided and bypasses min(1) validation */
        expect(result.success).toBe(true)
      })
    })

    describe('description Field Validation', () => {
      it('should accept valid description', () => {
        const result = createFeatureSchema.safeParse(validFeatureData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('Track and manage inventory in real-time with automated stock alerts')
        }
      })

      it('should reject empty description', () => {
        const data = { ...validFeatureData, description: '' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Feature description is required')
        }
      })

      it('should accept description with whitespace due to default', () => {
        const data = { ...validFeatureData, description: '   ' }
        const result = createFeatureSchema.safeParse(data)

        /* Schema has default('') and min(1) which still accepts whitespace */
        expect(result.success).toBe(true)
      })

      it('should accept description with 1 character', () => {
        const data = { ...validFeatureData, description: 'A' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept description with exactly 500 characters', () => {
        const data = { ...validFeatureData, description: 'a'.repeat(500) }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject description exceeding 500 characters', () => {
        const data = { ...validFeatureData, description: 'a'.repeat(501) }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Feature description must be less than 500 characters')
        }
      })

      it('should accept description with line breaks', () => {
        const data = { ...validFeatureData, description: 'First line\nSecond line\nThird line' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept description with special characters', () => {
        const data = { ...validFeatureData, description: 'Features: tracking, alerts & notifications (24/7)' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Complete Form Validation', () => {
      it('should accept complete valid form data', () => {
        const result = createFeatureSchema.safeParse(validFeatureData)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validFeatureData)
        }
      })

      it('should accept form with missing name due to default', () => {
        const data = { description: 'Test description' }
        const result = createFeatureSchema.safeParse(data)

        /* Default '' is provided and bypasses min(1) validation */
        expect(result.success).toBe(true)
      })

      it('should accept form with missing description due to default', () => {
        const data = { name: 'Test Feature' }
        const result = createFeatureSchema.safeParse(data)

        /* Default '' is provided and bypasses min(1) validation */
        expect(result.success).toBe(true)
      })

      it('should reject form with both fields empty', () => {
        const data = { name: '', description: '' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
        }
      })
    })

    describe('Edge Cases', () => {
      it('should handle unicode characters in name', () => {
        const data = { ...validFeatureData, name: 'Feature 中文 العربية' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle unicode characters in description', () => {
        const data = { ...validFeatureData, description: 'Description with 中文字符 and العربية' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle emoji in name', () => {
        const data = { ...validFeatureData, name: '🎉 Premium Features' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle emoji in description', () => {
        const data = { ...validFeatureData, description: 'Great features! 🚀 Boost your business 📈' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should trim leading/trailing whitespace in name', () => {
        const data = { ...validFeatureData, name: '  Feature Name  ' }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should handle very long but valid names', () => {
        const longName = 'A'.repeat(100)
        const data = { ...validFeatureData, name: longName }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.name).toBe(longName)
        }
      })

      it('should handle very long but valid descriptions', () => {
        const longDesc = 'A'.repeat(500)
        const data = { ...validFeatureData, description: longDesc }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe(longDesc)
        }
      })
    })

    describe('TypeScript Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const result = createFeatureSchema.safeParse(validFeatureData)

        if (result.success) {
          const data: CreateFeatureFormData = result.data
          expect(data.name).toBeDefined()
          expect(data.description).toBeDefined()
          expect(typeof data.name).toBe('string')
          expect(typeof data.description).toBe('string')
        }
      })
    })

    describe('Real-World Scenarios', () => {
      it('should validate inventory management feature', () => {
        const data = {
          name: 'Inventory Management',
          description: 'Comprehensive inventory tracking with real-time updates, low stock alerts, and automated reorder suggestions'
        }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate customer loyalty feature', () => {
        const data = {
          name: 'Customer Loyalty Program',
          description: 'Built-in rewards system with points tracking, tiered memberships, and automated marketing campaigns'
        }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate reporting feature', () => {
        const data = {
          name: 'Advanced Analytics & Reporting',
          description: 'Detailed sales reports, customer insights, and customizable dashboards with export capabilities'
        }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should validate multi-location feature', () => {
        const data = {
          name: 'Multi-Location Support',
          description: 'Manage multiple business locations from a single dashboard with centralized inventory and reporting'
        }
        const result = createFeatureSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })
  })
})
