/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant information module imports */
import * as TenantInfoComponents from '../index'
import BasicInformation from '../basic-information'
import AddressInformation from '../address-information'

describe('Tenant Info Components - Index Exports', () => {
  describe('Module Exports', () => {
    it('should export BasicInformation component', () => {
      expect(TenantInfoComponents.BasicInformation).toBeDefined()
    })

    it('should export AddressInformation component', () => {
      expect(TenantInfoComponents.AddressInformation).toBeDefined()
    })

    it('should export exactly 2 components', () => {
      const exportedKeys = Object.keys(TenantInfoComponents)
      expect(exportedKeys).toHaveLength(2)
    })

    it('should have all expected exports', () => {
      const exportedKeys = Object.keys(TenantInfoComponents)
      expect(exportedKeys).toEqual(
        expect.arrayContaining(['BasicInformation', 'AddressInformation'])
      )
    })
  })

  describe('Export Integrity', () => {
    it('should export BasicInformation as the correct component', () => {
      expect(TenantInfoComponents.BasicInformation).toBe(BasicInformation)
    })

    it('should export AddressInformation as the correct component', () => {
      expect(TenantInfoComponents.AddressInformation).toBe(AddressInformation)
    })

    it('should export components that are functions', () => {
      expect(typeof TenantInfoComponents.BasicInformation).toBe('function')
      expect(typeof TenantInfoComponents.AddressInformation).toBe('function')
    })
  })

  describe('Named Exports', () => {
    it('should allow destructuring BasicInformation', () => {
      const { BasicInformation: Component } = TenantInfoComponents
      expect(Component).toBeDefined()
      expect(Component).toBe(BasicInformation)
    })

    it('should allow destructuring AddressInformation', () => {
      const { AddressInformation: Component } = TenantInfoComponents
      expect(Component).toBeDefined()
      expect(Component).toBe(AddressInformation)
    })

    it('should support multiple destructuring', () => {
      const { BasicInformation: Basic, AddressInformation: Address } = TenantInfoComponents
      expect(Basic).toBe(BasicInformation)
      expect(Address).toBe(AddressInformation)
    })
  })

  describe('Component Availability', () => {
    it('should not export any unexpected components', () => {
      const exportedKeys = Object.keys(TenantInfoComponents)
      const expectedKeys = ['BasicInformation', 'AddressInformation']

      exportedKeys.forEach(key => {
        expect(expectedKeys).toContain(key)
      })
    })

    it('should ensure no default export pollution', () => {
      expect(TenantInfoComponents).not.toHaveProperty('default')
    })
  })

  describe('Re-export Verification', () => {
    it('should re-export BasicInformation correctly', () => {
      expect(TenantInfoComponents.BasicInformation).toBeTruthy()
      expect(TenantInfoComponents.BasicInformation.name).toBe('BasicInformation')
    })

    it('should re-export AddressInformation correctly', () => {
      expect(TenantInfoComponents.AddressInformation).toBeTruthy()
      expect(TenantInfoComponents.AddressInformation.name).toBe('AddressInformation')
    })
  })

  describe('Type Safety', () => {
    it('should export components with correct types', () => {
      expect(TenantInfoComponents.BasicInformation).toBeTypeOf('function')
      expect(TenantInfoComponents.AddressInformation).toBeTypeOf('function')
    })

    it('should not include undefined exports', () => {
      Object.values(TenantInfoComponents).forEach(exportedValue => {
        expect(exportedValue).not.toBeUndefined()
      })
    })

    it('should not include null exports', () => {
      Object.values(TenantInfoComponents).forEach(exportedValue => {
        expect(exportedValue).not.toBeNull()
      })
    })
  })

  describe('Barrel Export Pattern', () => {
    it('should follow barrel export pattern', () => {
      const exports = TenantInfoComponents
      expect(exports).toHaveProperty('BasicInformation')
      expect(exports).toHaveProperty('AddressInformation')
    })

    it('should make imports cleaner from parent modules', () => {
      expect(() => {
        const { BasicInformation, AddressInformation } = TenantInfoComponents
        return { BasicInformation, AddressInformation }
      }).not.toThrow()
    })

    it('should centralize component exports', () => {
      const componentCount = Object.keys(TenantInfoComponents).length
      expect(componentCount).toBeGreaterThan(0)
      expect(componentCount).toBe(2)
    })
  })

  describe('Import Consistency', () => {
    it('should maintain reference equality', () => {
      const firstImport = TenantInfoComponents.BasicInformation
      const secondImport = TenantInfoComponents.BasicInformation
      expect(firstImport).toBe(secondImport)
    })

    it('should maintain reference equality for AddressInformation', () => {
      const firstImport = TenantInfoComponents.AddressInformation
      const secondImport = TenantInfoComponents.AddressInformation
      expect(firstImport).toBe(secondImport)
    })

    it('should not create new instances on import', () => {
      expect(TenantInfoComponents.BasicInformation).toBe(BasicInformation)
      expect(TenantInfoComponents.AddressInformation).toBe(AddressInformation)
    })
  })

  describe('Module Structure', () => {
    it('should export an object with component references', () => {
      expect(typeof TenantInfoComponents).toBe('object')
      expect(TenantInfoComponents).not.toBe(null)
    })

    it('should have enumerable properties', () => {
      const keys = Object.keys(TenantInfoComponents)
      expect(keys.length).toBeGreaterThan(0)
    })

    it('should allow property access', () => {
      expect(TenantInfoComponents['BasicInformation']).toBeDefined()
      expect(TenantInfoComponents['AddressInformation']).toBeDefined()
    })
  })

  describe('Export Completeness', () => {
    it('should not have missing exports', () => {
      expect(TenantInfoComponents.BasicInformation).not.toBeUndefined()
      expect(TenantInfoComponents.AddressInformation).not.toBeUndefined()
    })

    it('should export components that can be instantiated', () => {
      const { BasicInformation, AddressInformation } = TenantInfoComponents

      expect(BasicInformation).toBeTruthy()
      expect(AddressInformation).toBeTruthy()
    })

    it('should maintain module integrity', () => {
      expect(Object.keys(TenantInfoComponents)).toHaveLength(2)
      expect(TenantInfoComponents).toHaveProperty('BasicInformation')
      expect(TenantInfoComponents).toHaveProperty('AddressInformation')
    })
  })
})
