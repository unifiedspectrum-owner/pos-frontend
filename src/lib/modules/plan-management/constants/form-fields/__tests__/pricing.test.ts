/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaDollarSign, FaPercent, FaCreditCard } from 'react-icons/fa'
import { MdDevices } from 'react-icons/md'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Plan management module imports */
import { PRICING_INFO_QUESTIONS } from '@plan-management/constants/form-fields/pricing'

describe('Pricing Info Form Fields Constants', () => {
  describe('PRICING_INFO_QUESTIONS', () => {
    it('should be defined', () => {
      expect(PRICING_INFO_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(PRICING_INFO_QUESTIONS)).toBe(true)
    })

    it('should have 9 form fields', () => {
      expect(PRICING_INFO_QUESTIONS).toHaveLength(9)
    })

    it('should have unique IDs', () => {
      const ids = PRICING_INFO_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = PRICING_INFO_QUESTIONS.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(9)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = PRICING_INFO_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field).toHaveProperty('id')
          expect(field).toHaveProperty('type')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('schema_key')
          expect(field).toHaveProperty('placeholder')
          expect(field).toHaveProperty('left_icon')
          expect(field).toHaveProperty('is_required')
          expect(field).toHaveProperty('is_active')
          expect(field).toHaveProperty('display_order')
          expect(field).toHaveProperty('grid')
        })
      })

      it('should have valid field types', () => {
        const validTypes = Object.values(FORM_FIELD_TYPES)
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
        })
      })

      it('should use INPUT type for all fields', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.type).toBe(FORM_FIELD_TYPES.INPUT)
        })
      })
    })

    describe('Monthly Price Field', () => {
      const monthlyPriceField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'monthly_price')

      it('should exist', () => {
        expect(monthlyPriceField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(monthlyPriceField?.label).toBe('Monthly Price ($)')
        expect(monthlyPriceField?.schema_key).toBe('monthly_price')
        expect(monthlyPriceField?.left_icon).toBe(FaDollarSign)
        expect(monthlyPriceField?.is_required).toBe(true)
        expect(monthlyPriceField?.is_active).toBe(true)
      })

      it('should have numeric placeholder', () => {
        expect(monthlyPriceField?.placeholder).toBe('0.00')
      })
    })

    describe('Additional Device Cost Field', () => {
      const deviceCostField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'additional_device_cost')

      it('should exist', () => {
        expect(deviceCostField).toBeDefined()
      })

      it('should have correct configuration', () => {
        expect(deviceCostField?.label).toBe('Additional Device Cost ($)')
        expect(deviceCostField?.schema_key).toBe('additional_device_cost')
        expect(deviceCostField?.left_icon).toBe(MdDevices)
        expect(deviceCostField?.is_required).toBe(true)
        expect(deviceCostField?.is_active).toBe(true)
      })
    })

    describe('Discount Fields', () => {
      it('should have annual discount field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'annual_discount_percentage')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Annual Discount (%)')
        expect(field?.left_icon).toBe(FaPercent)
        expect(field?.is_active).toBe(true)
      })

      it('should have biennial discount field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'biennial_discount_percentage')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Biennial Discount (%)')
        expect(field?.left_icon).toBe(FaPercent)
      })

      it('should have triennial discount field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'triennial_discount_percentage')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Triennial Discount (%)')
        expect(field?.left_icon).toBe(FaPercent)
      })

      it('should have biennial and triennial fields inactive', () => {
        const biennialField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'biennial_discount_percentage')
        const triennialField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'triennial_discount_percentage')

        expect(biennialField?.is_active).toBe(false)
        expect(triennialField?.is_active).toBe(false)
      })
    })

    describe('Gateway Fee Fields', () => {
      it('should have our gateway fee field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'monthly_fee_our_gateway')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Monthly Fee (Our Gateway) ($)')
        expect(field?.left_icon).toBe(FaDollarSign)
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })

      it('should have BYO processor fee field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'monthly_fee_byo_processor')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Monthly Fee (BYO Processor) ($)')
        expect(field?.left_icon).toBe(FaDollarSign)
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })
    })

    describe('Card Processing Fee Fields', () => {
      it('should have percentage fee field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'card_processing_fee_percentage')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Card Processing Fee (%)')
        expect(field?.left_icon).toBe(FaCreditCard)
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })

      it('should have fixed fee field', () => {
        const field = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'card_processing_fee_fixed')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Card Processing Fee (Fixed) ($)')
        expect(field?.left_icon).toBe(FaCreditCard)
        expect(field?.is_required).toBe(true)
        expect(field?.is_active).toBe(true)
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = PRICING_INFO_QUESTIONS.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBe(index + 1)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...PRICING_INFO_QUESTIONS].sort((a, b) => a.display_order - b.display_order)
        sorted.forEach((field, index) => {
          expect(field.display_order).toBe(index + 1)
        })
      })
    })

    describe('Required Fields', () => {
      it('should have required active fields', () => {
        const requiredActiveFields = PRICING_INFO_QUESTIONS.filter(field => field.is_required && field.is_active)
        expect(requiredActiveFields.length).toBeGreaterThan(0)
      })

      it('should mark core pricing fields as required', () => {
        const monthlyPriceField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'monthly_price')
        const annualDiscountField = PRICING_INFO_QUESTIONS.find(f => f.schema_key === 'annual_discount_percentage')

        expect(monthlyPriceField?.is_required).toBe(true)
        expect(annualDiscountField?.is_required).toBe(true)
      })
    })

    describe('Active Fields', () => {
      it('should have active fields', () => {
        const activeFields = PRICING_INFO_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBeGreaterThan(0)
      })

      it('should have exactly 7 active fields', () => {
        const activeFields = PRICING_INFO_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBe(7)
      })

      it('should have exactly 2 inactive fields', () => {
        const inactiveFields = PRICING_INFO_QUESTIONS.filter(field => !field.is_active)
        expect(inactiveFields.length).toBe(2)
      })
    })

    describe('Icons', () => {
      it('should have icon for each field', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.left_icon).toBeDefined()
          expect(typeof field.left_icon).toBe('function')
        })
      })

      it('should use dollar sign icon for price fields', () => {
        const priceFields = PRICING_INFO_QUESTIONS.filter(f =>
          f.schema_key.includes('price') ||
          f.schema_key.includes('fee') && !f.schema_key.includes('percentage')
        )
        priceFields.forEach(field => {
          if (field.schema_key === 'additional_device_cost') {
            expect(field.left_icon).toBe(MdDevices)
          } else if (!field.schema_key.includes('card_processing')) {
            expect(field.left_icon).toBe(FaDollarSign)
          }
        })
      })

      it('should use percent icon for discount fields', () => {
        const discountFields = PRICING_INFO_QUESTIONS.filter(f => f.schema_key.includes('discount'))
        discountFields.forEach(field => {
          expect(field.left_icon).toBe(FaPercent)
        })
      })

      it('should use credit card icon for card processing fields', () => {
        const cardProcessingFields = PRICING_INFO_QUESTIONS.filter(f => f.schema_key.includes('card_processing'))
        cardProcessingFields.forEach(field => {
          expect(field.left_icon).toBe(FaCreditCard)
        })
      })
    })

    describe('Placeholders', () => {
      it('should have placeholder for each field', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.placeholder).toBeDefined()
          expect(typeof field.placeholder).toBe('string')
        })
      })

      it('should use numeric placeholders', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.placeholder).toBe('0.00')
        })
      })
    })

    describe('Label Formatting', () => {
      it('should include currency symbol for monetary fields', () => {
        const monetaryFields = PRICING_INFO_QUESTIONS.filter(f =>
          f.label.includes('$')
        )
        expect(monetaryFields.length).toBeGreaterThan(0)
      })

      it('should include percentage symbol for percentage fields', () => {
        const percentageFields = PRICING_INFO_QUESTIONS.filter(f =>
          f.label.includes('%')
        )
        expect(percentageFields.length).toBeGreaterThan(0)
      })

      it('should have descriptive labels', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.label.length).toBeGreaterThan(5)
        })
      })
    })

    describe('Grid Configuration', () => {
      it('should use single column layout', () => {
        PRICING_INFO_QUESTIONS.forEach(field => {
          expect(field.grid.col_span).toBe(1)
        })
      })
    })
  })
})
