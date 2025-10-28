/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { STEP_IDS, TENANT_CREATION_STEPS } from '../steps'

describe('Steps Constants', () => {
  describe('STEP_IDS', () => {
    it('has TENANT_INFO step', () => {
      expect(STEP_IDS.TENANT_INFO).toBe('tenant-info')
    })

    it('has PLAN_SELECTION step', () => {
      expect(STEP_IDS.PLAN_SELECTION).toBe('plan-selection')
    })

    it('has ADDON_SELECTION step', () => {
      expect(STEP_IDS.ADDON_SELECTION).toBe('addon-selection')
    })

    it('has PLAN_SUMMARY step', () => {
      expect(STEP_IDS.PLAN_SUMMARY).toBe('plan-summary')
    })

    it('has PAYMENT step', () => {
      expect(STEP_IDS.PAYMENT).toBe('payment')
    })

    it('has PAYMENT_FAILED step', () => {
      expect(STEP_IDS.PAYMENT_FAILED).toBe('payment-failed')
    })

    it('has SUCCESS step', () => {
      expect(STEP_IDS.SUCCESS).toBe('success')
    })

    it('has exactly 7 step identifiers', () => {
      const keys = Object.keys(STEP_IDS)
      expect(keys).toHaveLength(7)
    })

    it('all step IDs follow kebab-case convention', () => {
      Object.values(STEP_IDS).forEach(id => {
        expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })
  })

  describe('TENANT_CREATION_STEPS', () => {
    it('has 7 steps', () => {
      expect(TENANT_CREATION_STEPS).toHaveLength(7)
    })

    it('all steps have required properties', () => {
      TENANT_CREATION_STEPS.forEach(step => {
        expect(step).toHaveProperty('id')
        expect(step).toHaveProperty('label')
        expect(step).toHaveProperty('title')
        expect(step).toHaveProperty('description')
        expect(step).toHaveProperty('icon')
      })
    })

    describe('Tenant Info Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'tenant-info')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Create Your Account')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Create Your Account')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Enter your company and contact information')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Plan Selection Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'plan-selection')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Plan Selection')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Choose Your Plan')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Select a subscription plan for your account')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Addon Selection Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'addon-selection')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Add-on Selection')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Select Add-ons')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Choose additional features and services')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Plan Summary Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'plan-summary')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Summary')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Plan Summary')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Review your selected plan and addons')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Payment Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'payment')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Payment')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Payment Information')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Enter payment details to complete setup')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Payment Failed Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'payment-failed')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Payment Failed')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Payment Failed')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Payment processing encountered an error')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })

    describe('Success Step', () => {
      const step = TENANT_CREATION_STEPS.find(s => s.id === 'success')

      it('exists in steps array', () => {
        expect(step).toBeDefined()
      })

      it('has correct label', () => {
        expect(step?.label).toBe('Complete')
      })

      it('has correct title', () => {
        expect(step?.title).toBe('Account Setup Complete')
      })

      it('has correct description', () => {
        expect(step?.description).toBe('Your account has been successfully created')
      })

      it('has icon property', () => {
        expect(step?.icon).toBeDefined()
      })
    })
  })

  describe('Step Order and Flow', () => {
    it('steps are in logical order', () => {
      const stepOrder = TENANT_CREATION_STEPS.map(s => s.id)
      expect(stepOrder[0]).toBe('tenant-info')
      expect(stepOrder[1]).toBe('plan-selection')
      expect(stepOrder[2]).toBe('addon-selection')
      expect(stepOrder[3]).toBe('plan-summary')
      expect(stepOrder[4]).toBe('payment')
      expect(stepOrder[5]).toBe('payment-failed')
      expect(stepOrder[6]).toBe('success')
    })

    it('each step has unique id', () => {
      const ids = TENANT_CREATION_STEPS.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('each step has unique label', () => {
      const labels = TENANT_CREATION_STEPS.map(s => s.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })
  })

  describe('Step IDs Integration', () => {
    it('TENANT_CREATION_STEPS uses STEP_IDS constants', () => {
      const stepIds = TENANT_CREATION_STEPS.map(s => s.id)
      const constantIds = Object.values(STEP_IDS)

      stepIds.forEach(id => {
        expect(constantIds).toContain(id)
      })
    })

    it('all STEP_IDS are used in TENANT_CREATION_STEPS', () => {
      const stepIds = TENANT_CREATION_STEPS.map(s => s.id)
      const constantIds = Object.values(STEP_IDS)

      constantIds.forEach(id => {
        expect(stepIds).toContain(id)
      })
    })
  })

  describe('Step Properties Validation', () => {
    it('all labels are non-empty strings', () => {
      TENANT_CREATION_STEPS.forEach(step => {
        expect(step.label).toBeTruthy()
        expect(typeof step.label).toBe('string')
      })
    })

    it('all titles are non-empty strings', () => {
      TENANT_CREATION_STEPS.forEach(step => {
        expect(step.title).toBeTruthy()
        expect(typeof step.title).toBe('string')
      })
    })

    it('all descriptions are non-empty strings', () => {
      TENANT_CREATION_STEPS.forEach(step => {
        expect(step.description).toBeTruthy()
        expect(typeof step.description).toBe('string')
      })
    })

    it('all icons are functions', () => {
      TENANT_CREATION_STEPS.forEach(step => {
        expect(typeof step.icon).toBe('function')
      })
    })
  })
})
