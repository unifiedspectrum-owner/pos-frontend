/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod/v4'

/* Tenant management module imports */
import { addonAssignments, assignPlanToTenantSchema, completePaymentSchema, STRIPE_PAYMENT_INTENT_ID_REGEX, type completeTenantSubscriptionPayment } from '../plan-assignment'

describe('Plan Assignment Schemas', () => {
  describe('addonAssignments Schema', () => {
    const validAddonData = {
      addon_id: 1,
      feature_level: 'basic' as const
    }

    describe('Valid Data', () => {
      it('validates correct addon assignment', () => {
        const result = addonAssignments.safeParse(validAddonData)
        expect(result.success).toBe(true)
      })

      it('validates with basic feature level', () => {
        const data = { addon_id: 5, feature_level: 'basic' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with premium feature level', () => {
        const data = { addon_id: 5, feature_level: 'premium' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with custom feature level', () => {
        const data = { addon_id: 5, feature_level: 'custom' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('applies default feature_level when not provided', () => {
        const result = addonAssignments.safeParse({ addon_id: 1 })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.feature_level).toBe('basic')
        }
      })
    })

    describe('addon_id Field', () => {
      it('requires positive integer', () => {
        const data = { addon_id: 5 }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects zero', () => {
        const data = { addon_id: 0 }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Addon ID must be positive')
        }
      })

      it('rejects negative numbers', () => {
        const data = { addon_id: -1 }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Addon ID must be positive')
        }
      })

      it('rejects decimal numbers', () => {
        const data = { addon_id: 1.5 }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Addon ID must be an integer')
        }
      })

      it('accepts large addon IDs', () => {
        const data = { addon_id: 999999 }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('feature_level Field', () => {
      it('accepts basic', () => {
        const data = { addon_id: 1, feature_level: 'basic' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts premium', () => {
        const data = { addon_id: 1, feature_level: 'premium' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts custom', () => {
        const data = { addon_id: 1, feature_level: 'custom' as const }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects invalid feature levels', () => {
        const data = { addon_id: 1, feature_level: 'invalid' }
        const result = addonAssignments.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('defaults to basic when omitted', () => {
        const result = addonAssignments.safeParse({ addon_id: 1 })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.feature_level).toBe('basic')
        }
      })
    })
  })

  describe('assignPlanToTenantSchema', () => {
    const validPlanData = {
      plan_id: 1,
      billing_cycle: 'monthly' as const,
      branches_count: 5,
      organization_addon_assignments: [],
      branch_addon_assignments: []
    }

    describe('Valid Data', () => {
      it('validates correct plan assignment', () => {
        const result = assignPlanToTenantSchema.safeParse(validPlanData)
        expect(result.success).toBe(true)
      })

      it('validates with organization addons', () => {
        const data = {
          ...validPlanData,
          organization_addon_assignments: [
            { addon_id: 1, feature_level: 'basic' as const },
            { addon_id: 2, feature_level: 'premium' as const }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with branch addons', () => {
        const data = {
          ...validPlanData,
          branch_addon_assignments: [
            {
              branch_id: 1,
              addon_assignments: [
                { addon_id: 1, feature_level: 'basic' as const }
              ]
            }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates with yearly billing cycle', () => {
        const data = { ...validPlanData, billing_cycle: 'yearly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('applies default values', () => {
        const minimalData = {
          plan_id: 1,
          billing_cycle: 'monthly' as const
        }
        const result = assignPlanToTenantSchema.safeParse(minimalData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.branches_count).toBe(1)
          expect(result.data.organization_addon_assignments).toEqual([])
          expect(result.data.branch_addon_assignments).toEqual([])
        }
      })
    })

    describe('plan_id Field', () => {
      it('requires positive integer', () => {
        const data = { ...validPlanData, plan_id: 5 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects zero', () => {
        const data = { ...validPlanData, plan_id: 0 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Plan ID must be positive')
        }
      })

      it('rejects negative numbers', () => {
        const data = { ...validPlanData, plan_id: -1 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Plan ID must be positive')
        }
      })

      it('rejects decimal numbers', () => {
        const data = { ...validPlanData, plan_id: 1.5 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Plan ID must be an integer')
        }
      })
    })

    describe('billing_cycle Field', () => {
      it('accepts monthly', () => {
        const data = { ...validPlanData, billing_cycle: 'monthly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts yearly', () => {
        const data = { ...validPlanData, billing_cycle: 'yearly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects invalid billing cycles', () => {
        const data = { ...validPlanData, billing_cycle: 'quarterly' }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('is required', () => {
        const data = { plan_id: 1, branches_count: 1 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    describe('branches_count Field', () => {
      it('requires positive integer', () => {
        const data = { ...validPlanData, branches_count: 10 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts 1 branch', () => {
        const data = { ...validPlanData, branches_count: 1 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('rejects zero branches', () => {
        const data = { ...validPlanData, branches_count: 0 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Branches must be positive')
        }
      })

      it('rejects negative numbers', () => {
        const data = { ...validPlanData, branches_count: -5 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('rejects decimal numbers', () => {
        const data = { ...validPlanData, branches_count: 2.5 }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Branches Count must be an integer')
        }
      })

      it('defaults to 1', () => {
        const data = { plan_id: 1, billing_cycle: 'monthly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.branches_count).toBe(1)
        }
      })
    })

    describe('organization_addon_assignments Field', () => {
      it('accepts empty array', () => {
        const data = { ...validPlanData, organization_addon_assignments: [] }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts multiple addon assignments', () => {
        const data = {
          ...validPlanData,
          organization_addon_assignments: [
            { addon_id: 1, feature_level: 'basic' as const },
            { addon_id: 2, feature_level: 'premium' as const },
            { addon_id: 3, feature_level: 'custom' as const }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates nested addon structure', () => {
        const data = {
          ...validPlanData,
          organization_addon_assignments: [
            { addon_id: 0 }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('defaults to empty array', () => {
        const data = { plan_id: 1, billing_cycle: 'monthly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.organization_addon_assignments).toEqual([])
        }
      })
    })

    describe('branch_addon_assignments Field', () => {
      it('accepts empty array', () => {
        const data = { ...validPlanData, branch_addon_assignments: [] }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('accepts multiple branch assignments', () => {
        const data = {
          ...validPlanData,
          branch_addon_assignments: [
            {
              branch_id: 1,
              addon_assignments: [
                { addon_id: 1, feature_level: 'basic' as const }
              ]
            },
            {
              branch_id: 2,
              addon_assignments: [
                { addon_id: 2, feature_level: 'premium' as const }
              ]
            }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('validates branch_id is positive', () => {
        const data = {
          ...validPlanData,
          branch_addon_assignments: [
            {
              branch_id: 0,
              addon_assignments: []
            }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('validates branch_id is required', () => {
        const data = {
          ...validPlanData,
          branch_addon_assignments: [
            {
              addon_assignments: []
            }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(false)
      })

      it('accepts empty addon_assignments for branch', () => {
        const data = {
          ...validPlanData,
          branch_addon_assignments: [
            {
              branch_id: 1,
              addon_assignments: []
            }
          ]
        }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('defaults to empty array', () => {
        const data = { plan_id: 1, billing_cycle: 'monthly' as const }
        const result = assignPlanToTenantSchema.safeParse(data)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.branch_addon_assignments).toEqual([])
        }
      })
    })
  })

  describe('STRIPE_PAYMENT_INTENT_ID_REGEX', () => {
    it('matches valid Stripe payment intent IDs', () => {
      const validIds = [
        'pi_1234567890abcdef',
        'pi_ABC123',
        'pi_test_123_456',
        'pi_UPPERCASELOWERCASE123_'
      ]

      validIds.forEach(id => {
        expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test(id)).toBe(true)
      })
    })

    it('rejects invalid Stripe payment intent IDs', () => {
      const invalidIds = [
        'pi',
        'pi_',
        'payment_intent_123',
        'pi-123-456',
        'pi 123456',
        '123456',
        'PI_123456',
        'pi_123@456'
      ]

      invalidIds.forEach(id => {
        expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test(id)).toBe(false)
      })
    })

    it('requires pi_ prefix', () => {
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('pi_123')).toBe(true)
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('payment_123')).toBe(false)
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('ch_123')).toBe(false)
    })

    it('allows alphanumeric and underscore characters', () => {
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('pi_abc123XYZ_')).toBe(true)
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('pi_abc-123')).toBe(false)
      expect(STRIPE_PAYMENT_INTENT_ID_REGEX.test('pi_abc.123')).toBe(false)
    })
  })

  describe('completePaymentSchema', () => {
    const validPaymentData = {
      tenant_id: 'tenant-123',
      payment_intent: 'pi_1234567890abcdef'
    }

    describe('Valid Data', () => {
      it('validates correct payment completion data', () => {
        const result = completePaymentSchema.safeParse(validPaymentData)
        expect(result.success).toBe(true)
      })

      it('validates with various tenant ID formats', () => {
        const tenantIds = ['tenant-123', 'TENANT_456', 'uuid-1234-5678']

        tenantIds.forEach(id => {
          const data = { ...validPaymentData, tenant_id: id }
          const result = completePaymentSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      it('validates with valid payment intent IDs', () => {
        const paymentIntents = [
          'pi_test123',
          'pi_prod_ABC_123',
          'pi_1234567890'
        ]

        paymentIntents.forEach(pi => {
          const data = { ...validPaymentData, payment_intent: pi }
          const result = completePaymentSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('tenant_id Field', () => {
      it('requires tenant_id', () => {
        const data = { ...validPaymentData, tenant_id: '' }
        const result = completePaymentSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Tenant ID is required')
        }
      })

      it('accepts various tenant ID formats', () => {
        const validIds = ['tenant-1', 't_123', 'TENANT_ABC', '12345']

        validIds.forEach(id => {
          const data = { ...validPaymentData, tenant_id: id }
          const result = completePaymentSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('payment_intent Field', () => {
      it('requires payment_intent', () => {
        const data = { ...validPaymentData, payment_intent: '' }
        const result = completePaymentSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Payment intent ID is required')
        }
      })

      it('requires pi_ prefix', () => {
        const data = { ...validPaymentData, payment_intent: 'invalid_123' }
        const result = completePaymentSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Payment intent ID must be a valid Stripe payment intent ID (starts with pi_)')
        }
      })

      it('rejects payment intent with special characters', () => {
        const invalidIntents = [
          'pi_123@456',
          'pi_123-456',
          'pi_123.456',
          'pi_123 456'
        ]

        invalidIntents.forEach(pi => {
          const data = { ...validPaymentData, payment_intent: pi }
          const result = completePaymentSchema.safeParse(data)
          expect(result.success).toBe(false)
        })
      })

      it('accepts underscores in payment intent', () => {
        const data = { ...validPaymentData, payment_intent: 'pi_test_123_abc' }
        const result = completePaymentSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('infers correct TypeScript type', () => {
        const data: completeTenantSubscriptionPayment = {
          tenant_id: 'tenant-123',
          payment_intent: 'pi_123'
        }
        expect(data).toBeDefined()
      })
    })
  })

  describe('Error Handling', () => {
    it('throws ZodError when using parse method with invalid data', () => {
      expect(() => {
        assignPlanToTenantSchema.parse({ plan_id: 0 })
      }).toThrow(ZodError)

      expect(() => {
        completePaymentSchema.parse({ tenant_id: '' })
      }).toThrow(ZodError)
    })

    it('returns multiple errors for complex invalid data', () => {
      const invalidData = {
        plan_id: -1,
        billing_cycle: 'invalid',
        branches_count: 0
      }

      const result = assignPlanToTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1)
      }
    })
  })

  describe('Complex Scenarios', () => {
    it('validates complete plan assignment with all features', () => {
      const complexData = {
        plan_id: 5,
        billing_cycle: 'yearly' as const,
        branches_count: 10,
        organization_addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const },
          { addon_id: 2, feature_level: 'premium' as const }
        ],
        branch_addon_assignments: [
          {
            branch_id: 1,
            addon_assignments: [
              { addon_id: 3, feature_level: 'custom' as const }
            ]
          },
          {
            branch_id: 2,
            addon_assignments: [
              { addon_id: 4, feature_level: 'basic' as const },
              { addon_id: 5, feature_level: 'premium' as const }
            ]
          }
        ]
      }

      const result = assignPlanToTenantSchema.safeParse(complexData)
      expect(result.success).toBe(true)
    })

    it('validates plan with only organization addons', () => {
      const data = {
        plan_id: 1,
        billing_cycle: 'monthly' as const,
        branches_count: 1,
        organization_addon_assignments: [
          { addon_id: 1 },
          { addon_id: 2 }
        ],
        branch_addon_assignments: []
      }

      const result = assignPlanToTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('validates plan with only branch addons', () => {
      const data = {
        plan_id: 1,
        billing_cycle: 'monthly' as const,
        branches_count: 3,
        organization_addon_assignments: [],
        branch_addon_assignments: [
          {
            branch_id: 1,
            addon_assignments: [{ addon_id: 1 }]
          },
          {
            branch_id: 2,
            addon_assignments: [{ addon_id: 2 }]
          }
        ]
      }

      const result = assignPlanToTenantSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})
