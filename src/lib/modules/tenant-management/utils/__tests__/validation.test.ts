/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan module imports */
import { Plan } from '@plan-management/types'

/* Tenant module imports */
import { validatePlanSelection, validateBranchCount, type ValidationResult } from '../validation'

describe('Validation Utilities', () => {
  const mockPlan: Plan = {
    id: 1,
    name: 'Test Plan',
    description: 'Test plan',
    features: [],
    is_featured: false,
    is_active: true,
    is_custom: false,
    display_order: 1,
    monthly_price: 100,
    included_branches_count: null,
    annual_discount_percentage: 20,
    add_ons: []
  }

  describe('validatePlanSelection', () => {
    describe('Valid Cases', () => {
      it('returns valid when plan is selected', () => {
        const result = validatePlanSelection(mockPlan)
        expect(result.isValid).toBe(true)
        expect(result.message).toBeUndefined()
      })

      it('validates plan with all required fields', () => {
        const result = validatePlanSelection(mockPlan)
        expect(result).toEqual({ isValid: true })
      })

      it('validates different plan objects', () => {
        const anotherPlan: Plan = {
          ...mockPlan,
          id: 2,
          name: 'Another Plan',
          monthly_price: 200
        }
        const result = validatePlanSelection(anotherPlan)
        expect(result.isValid).toBe(true)
      })
    })

    describe('Invalid Cases', () => {
      it('returns invalid when plan is null', () => {
        const result = validatePlanSelection(null)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('Please select a plan to continue')
      })

      it('provides error message for null plan', () => {
        const result = validatePlanSelection(null)
        expect(result.message).toBeDefined()
        expect(typeof result.message).toBe('string')
      })
    })

    describe('Return Type', () => {
      it('returns ValidationResult type', () => {
        const result: ValidationResult = validatePlanSelection(mockPlan)
        expect(result).toHaveProperty('isValid')
      })

      it('has isValid boolean property', () => {
        const result = validatePlanSelection(mockPlan)
        expect(typeof result.isValid).toBe('boolean')
      })

      it('has optional message string property', () => {
        const invalidResult = validatePlanSelection(null)
        expect(typeof invalidResult.message).toBe('string')

        const validResult = validatePlanSelection(mockPlan)
        expect(validResult.message).toBeUndefined()
      })
    })
  })

  describe('validateBranchCount', () => {
    describe('Valid Cases', () => {
      it('validates minimum branch count of 1', () => {
        const result = validateBranchCount(1)
        expect(result.isValid).toBe(true)
        expect(result.message).toBeUndefined()
      })

      it('validates branch count within limits', () => {
        const result = validateBranchCount(5, 10)
        expect(result.isValid).toBe(true)
      })

      it('validates branch count at maximum limit', () => {
        const result = validateBranchCount(10, 10)
        expect(result.isValid).toBe(true)
      })

      it('validates large branch counts without max limit', () => {
        const result = validateBranchCount(1000)
        expect(result.isValid).toBe(true)
      })

      it('validates when max is null', () => {
        const result = validateBranchCount(50, null)
        expect(result.isValid).toBe(true)
      })

      it('validates when max is undefined', () => {
        const result = validateBranchCount(50, undefined)
        expect(result.isValid).toBe(true)
      })

      it('validates various valid branch counts', () => {
        const validCounts = [1, 5, 10, 50, 100]
        validCounts.forEach(count => {
          const result = validateBranchCount(count)
          expect(result.isValid).toBe(true)
        })
      })
    })

    describe('Invalid Cases - Minimum Validation', () => {
      it('rejects branch count of 0', () => {
        const result = validateBranchCount(0)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('Branch count must be at least 1')
      })

      it('rejects negative branch count', () => {
        const result = validateBranchCount(-1)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('Branch count must be at least 1')
      })

      it('rejects large negative numbers', () => {
        const result = validateBranchCount(-100)
        expect(result.isValid).toBe(false)
      })
    })

    describe('Invalid Cases - Maximum Validation', () => {
      it('rejects branch count exceeding max', () => {
        const result = validateBranchCount(11, 10)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('Branch count cannot exceed 10')
      })

      it('rejects branch count far exceeding max', () => {
        const result = validateBranchCount(100, 10)
        expect(result.isValid).toBe(false)
        expect(result.message).toBe('Branch count cannot exceed 10')
      })

      it('includes max value in error message', () => {
        const result = validateBranchCount(50, 25)
        expect(result.message).toContain('25')
      })

      it('rejects when count is 1 over max', () => {
        const result = validateBranchCount(101, 100)
        expect(result.isValid).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('handles max of 1', () => {
        const validResult = validateBranchCount(1, 1)
        expect(validResult.isValid).toBe(true)

        const invalidResult = validateBranchCount(2, 1)
        expect(invalidResult.isValid).toBe(false)
      })

      it('handles very large max values', () => {
        const result = validateBranchCount(1000, 10000)
        expect(result.isValid).toBe(true)
      })

      it('handles decimal branch counts (treated as numbers)', () => {
        const result = validateBranchCount(5.5, 10)
        expect(result.isValid).toBe(true)
      })

      it('handles max of 0 (falsy value, validation passes)', () => {
        const result = validateBranchCount(1, 0)
        /* Implementation checks `if (maxBranches && ...)`, so 0 is falsy and check is skipped */
        expect(result.isValid).toBe(true)
      })

      it('prioritizes minimum check over maximum check', () => {
        const result = validateBranchCount(0, 10)
        expect(result.message).toBe('Branch count must be at least 1')
      })
    })

    describe('Return Type', () => {
      it('returns ValidationResult type', () => {
        const result: ValidationResult = validateBranchCount(5)
        expect(result).toHaveProperty('isValid')
      })

      it('has isValid boolean property', () => {
        const result = validateBranchCount(5)
        expect(typeof result.isValid).toBe('boolean')
      })

      it('has optional message string property', () => {
        const invalidResult = validateBranchCount(0)
        expect(typeof invalidResult.message).toBe('string')

        const validResult = validateBranchCount(5)
        expect(validResult.message).toBeUndefined()
      })

      it('message is undefined for valid cases', () => {
        const result = validateBranchCount(5, 10)
        expect(result.message).toBeUndefined()
      })

      it('message is defined for invalid cases', () => {
        const result = validateBranchCount(0)
        expect(result.message).toBeDefined()
      })
    })

    describe('Boundary Testing', () => {
      it('validates exactly at minimum', () => {
        const result = validateBranchCount(1)
        expect(result.isValid).toBe(true)
      })

      it('invalidates just below minimum', () => {
        const result = validateBranchCount(0)
        expect(result.isValid).toBe(false)
      })

      it('validates exactly at maximum', () => {
        const result = validateBranchCount(100, 100)
        expect(result.isValid).toBe(true)
      })

      it('invalidates just above maximum', () => {
        const result = validateBranchCount(101, 100)
        expect(result.isValid).toBe(false)
      })
    })

    describe('Optional Maximum Parameter', () => {
      it('works without max parameter', () => {
        const result = validateBranchCount(50)
        expect(result.isValid).toBe(true)
      })

      it('accepts undefined for max', () => {
        const result = validateBranchCount(50, undefined)
        expect(result.isValid).toBe(true)
      })

      it('accepts null for max', () => {
        const result = validateBranchCount(50, null)
        expect(result.isValid).toBe(true)
      })

      it('treats 0 as falsy, so validation passes', () => {
        const result = validateBranchCount(1, 0)
        /* Implementation checks `if (maxBranches && ...)`, so 0 is falsy and check is skipped */
        expect(result.isValid).toBe(true)
        expect(result.message).toBeUndefined()
      })
    })
  })

  describe('ValidationResult Interface', () => {
    it('has consistent structure across validations', () => {
      const planResult = validatePlanSelection(mockPlan)
      const branchResult = validateBranchCount(5)

      expect(planResult).toHaveProperty('isValid')
      expect(branchResult).toHaveProperty('isValid')
    })

    it('error messages are descriptive', () => {
      const planResult = validatePlanSelection(null)
      const branchResult1 = validateBranchCount(0)
      const branchResult2 = validateBranchCount(11, 10)

      expect(planResult.message?.length).toBeGreaterThan(0)
      expect(branchResult1.message?.length).toBeGreaterThan(0)
      expect(branchResult2.message?.length).toBeGreaterThan(0)
    })

    it('valid results have no message', () => {
      const planResult = validatePlanSelection(mockPlan)
      const branchResult = validateBranchCount(5)

      expect(planResult.message).toBeUndefined()
      expect(branchResult.message).toBeUndefined()
    })
  })

  describe('Multiple Validations', () => {
    it('can chain validations', () => {
      const planValid = validatePlanSelection(mockPlan)
      const branchValid = validateBranchCount(5, 10)

      const allValid = planValid.isValid && branchValid.isValid
      expect(allValid).toBe(true)
    })

    it('detects any validation failure', () => {
      const planValid = validatePlanSelection(mockPlan)
      const branchInvalid = validateBranchCount(0)

      const allValid = planValid.isValid && branchInvalid.isValid
      expect(allValid).toBe(false)
    })

    it('collects error messages from failed validations', () => {
      const results = [
        validatePlanSelection(null),
        validateBranchCount(0),
        validateBranchCount(11, 10)
      ]

      const errors = results
        .filter(r => !r.isValid)
        .map(r => r.message)

      expect(errors).toHaveLength(3)
      expect(errors.every(msg => msg && msg.length > 0)).toBe(true)
    })
  })

  describe('Real-world Scenarios', () => {
    it('validates typical subscription setup', () => {
      const planResult = validatePlanSelection(mockPlan)
      const branchResult = validateBranchCount(3, 100)

      expect(planResult.isValid).toBe(true)
      expect(branchResult.isValid).toBe(true)
    })

    it('catches missing plan selection', () => {
      const planResult = validatePlanSelection(null)
      const branchResult = validateBranchCount(5)

      expect(planResult.isValid).toBe(false)
      expect(branchResult.isValid).toBe(true)
    })

    it('catches invalid branch configuration', () => {
      const planResult = validatePlanSelection(mockPlan)
      const branchResult = validateBranchCount(150, 100)

      expect(planResult.isValid).toBe(true)
      expect(branchResult.isValid).toBe(false)
    })

    it('validates enterprise setup with many branches', () => {
      const result = validateBranchCount(500, 1000)
      expect(result.isValid).toBe(true)
    })

    it('validates small business setup', () => {
      const planResult = validatePlanSelection(mockPlan)
      const branchResult = validateBranchCount(1, 10)

      expect(planResult.isValid).toBe(true)
      expect(branchResult.isValid).toBe(true)
    })
  })
})
