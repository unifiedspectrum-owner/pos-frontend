/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/* Shared module imports */
import { validatePayload } from '@shared/utils/validation/payload'
import { PayloadValidationResponse } from '@shared/types'

describe('Payload Validation Utility', () => {
  describe('validatePayload', () => {
    describe('Valid Payloads', () => {
      it('should validate simple string schema', () => {
        const schema = z.string()
        const payload = 'test string'

        const result = validatePayload(payload, schema, 'text')

        expect(result.isValid).toBe(true)
        if (result.isValid) {
          expect(result.data).toBe('test string')
        }
      })

      it('should validate simple number schema', () => {
        const schema = z.number()
        const payload = 42

        const result = validatePayload(payload, schema, 'number')

        expect(result.isValid).toBe(true)
        if (result.isValid) {
          expect(result.data).toBe(42)
        }
      })

      it('should validate simple boolean schema', () => {
        const schema = z.boolean()
        const payload = true

        const result = validatePayload(payload, schema, 'flag')

        expect(result.isValid).toBe(true)
        if (result.isValid) {
          expect(result.data).toBe(true)
        }
      })

      it('should validate object schema', () => {
        const schema = z.object({
          name: z.string(),
          age: z.number()
        })
        const payload = { name: 'John', age: 30 }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(true)
        if (result.isValid) {
          expect(result.data).toEqual({ name: 'John', age: 30 })
        }
      })

      it('should validate nested object schema', () => {
        const schema = z.object({
          user: z.object({
            name: z.string(),
            email: z.string().email()
          }),
          status: z.string()
        })
        const payload = {
          user: { name: 'John', email: 'john@example.com' },
          status: 'active'
        }

        const result = validatePayload(payload, schema, 'profile')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data.user.name).toBe('John')
          expect(result.data.user.email).toBe('john@example.com')
        }
      })

      it('should validate array schema', () => {
        const schema = z.array(z.string())
        const payload = ['apple', 'banana', 'orange']

        const result = validatePayload(payload, schema, 'fruits')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data).toHaveLength(3)
          expect(result.data[0]).toBe('apple')
        }
      })

      it('should validate array of objects schema', () => {
        const schema = z.array(z.object({
          id: z.number(),
          name: z.string()
        }))
        const payload = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]

        const result = validatePayload(payload, schema, 'items')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data).toHaveLength(2)
          expect(result.data[0].id).toBe(1)
        }
      })

      it('should validate optional fields', () => {
        const schema = z.object({
          required: z.string(),
          optional: z.string().optional()
        })
        const payload = { required: 'value' }

        const result = validatePayload(payload, schema, 'data')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data.required).toBe('value')
          expect(result.data.optional).toBeUndefined()
        }
      })

      it('should validate with default values', () => {
        const schema = z.object({
          name: z.string(),
          active: z.boolean().default(true)
        })
        const payload = { name: 'Test' }

        const result = validatePayload(payload, schema, 'config')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data.active).toBe(true)
        }
      })
    })

    describe('Invalid Payloads', () => {
      it('should return errors for wrong type', () => {
        const schema = z.string()
        const payload = 123

        const result = validatePayload(payload, schema, 'text')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors).toBeDefined()
          expect(result.errors.length).toBeGreaterThan(0)
          expect(result.message).toContain('invalid')
        }
      })

      it('should return errors for missing required field', () => {
        const schema = z.object({
          name: z.string(),
          email: z.string()
        })
        const payload = { name: 'John' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors).toBeDefined()
          expect(result.errors.length).toBeGreaterThan(0)
          expect(result.errors[0].field).toBe('email')
        }
      })

      it('should return error message with resource name', () => {
        const schema = z.string()
        const payload = 123

        const result = validatePayload(payload, schema, 'username')

        expect(result.isValid).toBe(false)
        if (!result.isValid) {
          expect(result.message).toContain('username')
          expect(result.message).toContain('invalid')
        }
      })

      it('should format nested field errors correctly', () => {
        const schema = z.object({
          user: z.object({
            email: z.string().email()
          })
        })
        const payload = { user: { email: 'invalid-email' } }

        const result = validatePayload(payload, schema, 'profile')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('user.email')
        }
      })

      it('should return multiple errors for multiple invalid fields', () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
          email: z.string().email()
        })
        const payload = { name: 123, age: 'not a number', email: 'invalid' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors.length).toBeGreaterThan(1)
        }
      })

      it('should validate email format', () => {
        const schema = z.object({
          email: z.string().email()
        })
        const payload = { email: 'not-an-email' }

        const result = validatePayload(payload, schema, 'contact')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('email')
        }
      })

      it('should validate minimum length', () => {
        const schema = z.object({
          password: z.string().min(8)
        })
        const payload = { password: '123' }

        const result = validatePayload(payload, schema, 'credentials')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('password')
        }
      })

      it('should validate maximum length', () => {
        const schema = z.object({
          name: z.string().max(10)
        })
        const payload = { name: 'This is a very long name' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('name')
        }
      })

      it('should validate number range', () => {
        const schema = z.object({
          age: z.number().min(0).max(120)
        })
        const payload = { age: 150 }

        const result = validatePayload(payload, schema, 'person')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('age')
        }
      })

      it('should validate array length', () => {
        const schema = z.array(z.string()).min(2)
        const payload = ['single']

        const result = validatePayload(payload, schema, 'items')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors).toBeDefined()
        }
      })

      it('should validate regex pattern', () => {
        const schema = z.object({
          code: z.string().regex(/^[A-Z]{3}$/)
        })
        const payload = { code: 'abc' }

        const result = validatePayload(payload, schema, 'product')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('code')
        }
      })

      it('should validate enum values', () => {
        const schema = z.object({
          status: z.enum(['active', 'inactive', 'pending'])
        })
        const payload = { status: 'unknown' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('status')
        }
      })
    })

    describe('Edge Cases', () => {
      it('should handle null payload', () => {
        const schema = z.object({
          name: z.string()
        })
        const payload = null

        const result = validatePayload(payload, schema, 'data')

        expect(result.isValid).toBe(false)
      })

      it('should handle undefined payload', () => {
        const schema = z.object({
          name: z.string()
        })
        const payload = undefined

        const result = validatePayload(payload, schema, 'data')

        expect(result.isValid).toBe(false)
      })

      it('should handle empty object', () => {
        const schema = z.object({
          name: z.string()
        })
        const payload = {}

        const result = validatePayload(payload, schema, 'data')

        expect(result.isValid).toBe(false)
      })

      it('should handle empty array', () => {
        const schema = z.array(z.string()).min(1)
        const payload: string[] = []

        const result = validatePayload(payload, schema, 'items')

        expect(result.isValid).toBe(false)
      })

      it('should handle extra fields with strict schema', () => {
        const schema = z.object({
          name: z.string()
        }).strict()
        const payload = { name: 'John', extra: 'field' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
      })

      it('should allow extra fields with passthrough schema', () => {
        const schema = z.object({
          name: z.string()
        }).passthrough()
        const payload = { name: 'John', extra: 'field' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(true)
      })

      it('should handle deeply nested errors', () => {
        const schema = z.object({
          level1: z.object({
            level2: z.object({
              level3: z.string()
            })
          })
        })
        const payload = { level1: { level2: { level3: 123 } } }

        const result = validatePayload(payload, schema, 'nested')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toBe('level1.level2.level3')
        }
      })

      it('should handle array index in error path', () => {
        const schema = z.array(z.object({
          id: z.number()
        }))
        const payload = [{ id: 1 }, { id: 'invalid' }]

        const result = validatePayload(payload, schema, 'items')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0].field).toContain('1')
        }
      })
    })

    describe('Complex Schemas', () => {
      it('should validate union types', () => {
        const schema = z.union([z.string(), z.number()])
        const payload1 = 'text'
        const payload2 = 42

        const result1 = validatePayload(payload1, schema, 'value')
        const result2 = validatePayload(payload2, schema, 'value')

        expect(result1.isValid).toBe(true)
        expect(result2.isValid).toBe(true)
      })

      it('should validate discriminated unions', () => {
        const schema = z.discriminatedUnion('type', [
          z.object({ type: z.literal('email'), email: z.string().email() }),
          z.object({ type: z.literal('phone'), phone: z.string() })
        ])
        const payload = { type: 'email', email: 'test@example.com' }

        const result = validatePayload(payload, schema, 'contact')

        expect(result.isValid).toBe(true)
      })

      it('should validate tuple schema', () => {
        const schema = z.tuple([z.string(), z.number(), z.boolean()])
        const payload = ['text', 42, true]

        const result = validatePayload(payload, schema, 'tuple')

        expect(result.isValid).toBe(true)
      })

      it('should validate record schema', () => {
        const schema = z.record(z.string(), z.number())
        const payload = { key1: 1, key2: 2, key3: 3 }

        const result = validatePayload(payload, schema, 'scores')

        expect(result.isValid).toBe(true)
      })

      it('should validate transform schema', () => {
        const schema = z.string().transform(val => val.toUpperCase())
        const payload = 'lowercase'

        const result = validatePayload(payload, schema, 'text')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data).toBe('LOWERCASE')
        }
      })

      it('should validate refine schema', () => {
        const schema = z.object({
          password: z.string(),
          confirmPassword: z.string()
        }).refine(data => data.password === data.confirmPassword, {
          message: 'Passwords must match'
        })
        const payload = { password: 'test123', confirmPassword: 'test123' }

        const result = validatePayload(payload, schema, 'passwords')

        expect(result.isValid).toBe(true)
      })

      it('should fail refine validation', () => {
        const schema = z.object({
          password: z.string(),
          confirmPassword: z.string()
        }).refine(data => data.password === data.confirmPassword, {
          message: 'Passwords must match'
        })
        const payload = { password: 'test123', confirmPassword: 'different' }

        const result = validatePayload(payload, schema, 'passwords')

        expect(result.isValid).toBe(false)
      })
    })

    describe('Return Type Structure', () => {
      it('should return PayloadValidationResponse type', () => {
        const schema = z.string()
        const payload = 'test'

        const result: PayloadValidationResponse<string> = validatePayload(payload, schema, 'text')

        expect(result).toBeDefined()
        expect(typeof result.isValid).toBe('boolean')
      })

      it('should have correct success structure', () => {
        const schema = z.string()
        const payload = 'test'

        const result = validatePayload(payload, schema, 'text')

        expect(result.isValid).toBe(true)
        if (result.isValid && result.data) {
          expect(result.data).toBeDefined()
          expect('errors' in result).toBe(false)
          expect('message' in result).toBe(false)
        }
      })

      it('should have correct error structure', () => {
        const schema = z.string()
        const payload = 123

        const result = validatePayload(payload, schema, 'text')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors).toBeDefined()
          expect(result.message).toBeDefined()
          expect(Array.isArray(result.errors)).toBe(true)
          expect(typeof result.message).toBe('string')
          expect('data' in result).toBe(false)
        }
      })

      it('should have field and message in error objects', () => {
        const schema = z.object({
          email: z.string().email()
        })
        const payload = { email: 'invalid' }

        const result = validatePayload(payload, schema, 'user')

        expect(result.isValid).toBe(false)
        if (!result.isValid && result.errors) {
          expect(result.errors[0]).toHaveProperty('field')
          expect(result.errors[0]).toHaveProperty('message')
          expect(typeof result.errors[0].field).toBe('string')
          expect(typeof result.errors[0].message).toBe('string')
        }
      })
    })

    describe('Resource Name Interpolation', () => {
      it('should include resource name in error message', () => {
        const schema = z.string()
        const payload = 123

        const result = validatePayload(payload, schema, 'username')

        expect(result.isValid).toBe(false)
        if (!result.isValid) {
          expect(result.message).toContain('username')
        }
      })

      it('should work with different resource names', () => {
        const schema = z.string()
        const resources = ['user', 'profile', 'account', 'settings']

        resources.forEach(resource => {
          const result = validatePayload(123, schema, resource)
          if (!result.isValid) {
            expect(result.message).toContain(resource)
          }
        })
      })

      it('should preserve resource name case', () => {
        const schema = z.string()
        const payload = 123

        const result = validatePayload(payload, schema, 'UserProfile')

        expect(result.isValid).toBe(false)
        if (!result.isValid) {
          expect(result.message).toContain('UserProfile')
        }
      })
    })

    describe('Integration Tests', () => {
      it('should validate complete user registration payload', () => {
        const schema = z.object({
          username: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(8),
          age: z.number().min(18),
          terms: z.boolean().refine(val => val === true)
        })
        const payload = {
          username: 'john_doe',
          email: 'john@example.com',
          password: 'SecurePass123',
          age: 25,
          terms: true
        }

        const result = validatePayload(payload, schema, 'registration')

        expect(result.isValid).toBe(true)
      })

      it('should validate complex API payload', () => {
        const schema = z.object({
          user: z.object({
            name: z.string(),
            contact: z.object({
              email: z.string().email(),
              phone: z.string().optional()
            })
          }),
          items: z.array(z.object({
            id: z.number(),
            quantity: z.number().positive()
          })),
          metadata: z.record(z.string(), z.unknown())
        })
        const payload = {
          user: {
            name: 'John',
            contact: { email: 'john@example.com' }
          },
          items: [
            { id: 1, quantity: 5 },
            { id: 2, quantity: 3 }
          ],
          metadata: { orderDate: '2024-01-01', notes: 'Urgent' }
        }

        const result = validatePayload(payload, schema, 'order')

        expect(result.isValid).toBe(true)
      })
    })
  })
})
