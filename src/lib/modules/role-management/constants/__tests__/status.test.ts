/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Role management module imports */
import { ROLE_STATUS, ROLE_STATUS_LABELS, ROLE_STATUS_FILTER_OPTIONS, type RoleStatus } from '@role-management/constants'

describe('Role Management Status Constants', () => {
  describe('ROLE_STATUS', () => {
    it('should be defined', () => {
      expect(ROLE_STATUS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_STATUS).toBe('object')
    })

    it('should have ACTIVE property', () => {
      expect(ROLE_STATUS).toHaveProperty('ACTIVE')
      expect(ROLE_STATUS.ACTIVE).toBe('active')
    })

    it('should have INACTIVE property', () => {
      expect(ROLE_STATUS).toHaveProperty('INACTIVE')
      expect(ROLE_STATUS.INACTIVE).toBe('inactive')
    })

    it('should have ALL property', () => {
      expect(ROLE_STATUS).toHaveProperty('ALL')
      expect(ROLE_STATUS.ALL).toBe('all')
    })

    it('should have exactly 3 properties', () => {
      expect(Object.keys(ROLE_STATUS)).toHaveLength(3)
    })

    it('should use lowercase values', () => {
      Object.values(ROLE_STATUS).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })

    it('should have all string values', () => {
      Object.values(ROLE_STATUS).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_STATUS).toBeDefined()
      expect(typeof ROLE_STATUS).toBe('object')
    })

    it('should have unique values', () => {
      const values = Object.values(ROLE_STATUS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should use simple status names', () => {
      Object.values(ROLE_STATUS).forEach(value => {
        expect(value).toMatch(/^[a-z]+$/)
      })
    })
  })

  describe('ROLE_STATUS_LABELS', () => {
    it('should be defined', () => {
      expect(ROLE_STATUS_LABELS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_STATUS_LABELS).toBe('object')
    })

    it('should have label for ACTIVE status', () => {
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE]).toBeDefined()
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE]).toBe('Active')
    })

    it('should have label for INACTIVE status', () => {
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE]).toBeDefined()
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE]).toBe('Inactive')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(ROLE_STATUS_LABELS)).toHaveLength(2)
    })

    it('should have all string values', () => {
      Object.values(ROLE_STATUS_LABELS).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should use proper case for display labels', () => {
      Object.values(ROLE_STATUS_LABELS).forEach(label => {
        /* First character should be uppercase */
        expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_STATUS_LABELS).toBeDefined()
      expect(typeof ROLE_STATUS_LABELS).toBe('object')
    })

    it('should have labels for all status values except ALL', () => {
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE]).toBeDefined()
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE]).toBeDefined()
      /* ALL status should not have a display label */
    })

    it('should have non-empty labels', () => {
      Object.values(ROLE_STATUS_LABELS).forEach(label => {
        expect(label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('ROLE_STATUS_FILTER_OPTIONS', () => {
    it('should be defined', () => {
      expect(ROLE_STATUS_FILTER_OPTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(ROLE_STATUS_FILTER_OPTIONS)).toBe(true)
    })

    it('should have 3 filter options', () => {
      expect(ROLE_STATUS_FILTER_OPTIONS).toHaveLength(3)
    })

    it('should have consistent structure', () => {
      ROLE_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })

    describe('All Status Option', () => {
      const allOption = ROLE_STATUS_FILTER_OPTIONS[0]

      it('should be the first option', () => {
        expect(allOption.value).toBe(ROLE_STATUS.ALL)
      })

      it('should have correct label', () => {
        expect(allOption.label).toBe('All Status')
      })

      it('should have correct value', () => {
        expect(allOption.value).toBe('all')
      })
    })

    describe('Active Status Option', () => {
      const activeOption = ROLE_STATUS_FILTER_OPTIONS[1]

      it('should be the second option', () => {
        expect(activeOption.value).toBe(ROLE_STATUS.ACTIVE)
      })

      it('should have correct label', () => {
        expect(activeOption.label).toBe(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE])
        expect(activeOption.label).toBe('Active')
      })

      it('should have correct value', () => {
        expect(activeOption.value).toBe('active')
      })
    })

    describe('Inactive Status Option', () => {
      const inactiveOption = ROLE_STATUS_FILTER_OPTIONS[2]

      it('should be the third option', () => {
        expect(inactiveOption.value).toBe(ROLE_STATUS.INACTIVE)
      })

      it('should have correct label', () => {
        expect(inactiveOption.label).toBe(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE])
        expect(inactiveOption.label).toBe('Inactive')
      })

      it('should have correct value', () => {
        expect(inactiveOption.value).toBe('inactive')
      })
    })

    it('should have unique values', () => {
      const values = ROLE_STATUS_FILTER_OPTIONS.map(opt => opt.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have unique labels', () => {
      const labels = ROLE_STATUS_FILTER_OPTIONS.map(opt => opt.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })

    it('should use status values from ROLE_STATUS constant', () => {
      const statusValues = Object.values(ROLE_STATUS)
      ROLE_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(statusValues).toContain(option.value)
      })
    })

    it('should be a const array', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_STATUS_FILTER_OPTIONS).toBeDefined()
      expect(Array.isArray(ROLE_STATUS_FILTER_OPTIONS)).toBe(true)
    })

    it('should have non-empty labels', () => {
      ROLE_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option.label.length).toBeGreaterThan(0)
      })
    })

    it('should have lowercase values', () => {
      ROLE_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option.value).toBe(option.value.toLowerCase())
      })
    })

    it('should be suitable for dropdown/filter use', () => {
      /* Should have "All" option as first item */
      expect(ROLE_STATUS_FILTER_OPTIONS[0].value).toBe('all')
      /* Should have specific status options after */
      expect(ROLE_STATUS_FILTER_OPTIONS.slice(1).every(opt => opt.value !== 'all')).toBe(true)
    })
  })

  describe('Status Constants Integration', () => {
    it('should use ROLE_STATUS values in ROLE_STATUS_FILTER_OPTIONS', () => {
      const statusValues = Object.values(ROLE_STATUS)
      ROLE_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(statusValues).toContain(option.value)
      })
    })

    it('should use ROLE_STATUS_LABELS in ROLE_STATUS_FILTER_OPTIONS', () => {
      const activeOption = ROLE_STATUS_FILTER_OPTIONS.find(opt => opt.value === ROLE_STATUS.ACTIVE)
      const inactiveOption = ROLE_STATUS_FILTER_OPTIONS.find(opt => opt.value === ROLE_STATUS.INACTIVE)

      expect(activeOption?.label).toBe(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE])
      expect(inactiveOption?.label).toBe(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE])
    })

    it('should have consistent naming convention', () => {
      /* ROLE_STATUS uses lowercase values */
      Object.values(ROLE_STATUS).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })

      /* ROLE_STATUS_LABELS uses proper case */
      Object.values(ROLE_STATUS_LABELS).forEach(label => {
        expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
      })
    })

    it('should cover all filterable statuses', () => {
      /* All non-ALL statuses should have labels */
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE]).toBeDefined()
      expect(ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE]).toBeDefined()
    })

    it('should have matching number of filter options', () => {
      /* Filter options = status count (including "All") */
      const statusCount = Object.keys(ROLE_STATUS).length
      expect(ROLE_STATUS_FILTER_OPTIONS).toHaveLength(statusCount)
    })
  })

  describe('RoleStatus Type', () => {
    it('should be compatible with ROLE_STATUS values', () => {
      /* TypeScript type checking - this will compile if type is correct */
      const activeStatus: RoleStatus = ROLE_STATUS.ACTIVE
      const inactiveStatus: RoleStatus = ROLE_STATUS.INACTIVE
      const allStatus: RoleStatus = ROLE_STATUS.ALL

      expect(activeStatus).toBe('active')
      expect(inactiveStatus).toBe('inactive')
      expect(allStatus).toBe('all')
    })

    it('should accept valid status strings', () => {
      const testActive: RoleStatus = 'active'
      const testInactive: RoleStatus = 'inactive'
      const testAll: RoleStatus = 'all'

      expect(testActive).toBe(ROLE_STATUS.ACTIVE)
      expect(testInactive).toBe(ROLE_STATUS.INACTIVE)
      expect(testAll).toBe(ROLE_STATUS.ALL)
    })
  })
})
