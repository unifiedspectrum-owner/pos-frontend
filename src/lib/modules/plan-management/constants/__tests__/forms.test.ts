/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaPlus } from 'react-icons/fa'
import { FaSackDollar } from 'react-icons/fa6'
import { FiInfo } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { LiaHandshake } from 'react-icons/lia'

/* Plan management module imports */
import { ADDON_PRICING_SCOPES, ADDON_FEATURE_LEVELS, PLAN_FORM_TAB, PLAN_MANAGEMENT_FORM_TABS, PLAN_FORM_MODES, PLAN_FORM_TITLES, FEATURE_SECTION_TITLES, ADDON_SECTION_TITLES, SLA_SECTION_TITLES, PLAN_FORM_DEFAULT_VALUES } from '@plan-management/constants/forms'

describe('Plan Management Forms Constants', () => {
  describe('ADDON_PRICING_SCOPES', () => {
    it('should be defined', () => {
      expect(ADDON_PRICING_SCOPES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ADDON_PRICING_SCOPES).toBe('object')
    })

    it('should have BRANCH scope', () => {
      expect(ADDON_PRICING_SCOPES).toHaveProperty('BRANCH')
      expect(ADDON_PRICING_SCOPES.BRANCH).toBe('branch')
    })

    it('should have ORGANIZATION scope', () => {
      expect(ADDON_PRICING_SCOPES).toHaveProperty('ORGANIZATION')
      expect(ADDON_PRICING_SCOPES.ORGANIZATION).toBe('organization')
    })

    it('should have exactly 2 scopes', () => {
      expect(Object.keys(ADDON_PRICING_SCOPES)).toHaveLength(2)
    })

    it('should have lowercase values', () => {
      Object.values(ADDON_PRICING_SCOPES).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })

    it('should be a const object', () => {
      expect(ADDON_PRICING_SCOPES).toBeDefined()
      expect(typeof ADDON_PRICING_SCOPES).toBe('object')
    })
  })

  describe('ADDON_FEATURE_LEVELS', () => {
    it('should be defined', () => {
      expect(ADDON_FEATURE_LEVELS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ADDON_FEATURE_LEVELS).toBe('object')
    })

    it('should have BASIC level', () => {
      expect(ADDON_FEATURE_LEVELS).toHaveProperty('BASIC')
      expect(ADDON_FEATURE_LEVELS.BASIC).toBe('basic')
    })

    it('should have CUSTOM level', () => {
      expect(ADDON_FEATURE_LEVELS).toHaveProperty('CUSTOM')
      expect(ADDON_FEATURE_LEVELS.CUSTOM).toBe('custom')
    })

    it('should have exactly 2 levels', () => {
      expect(Object.keys(ADDON_FEATURE_LEVELS)).toHaveLength(2)
    })

    it('should have lowercase values', () => {
      Object.values(ADDON_FEATURE_LEVELS).forEach(value => {
        expect(value).toBe(value.toLowerCase())
      })
    })

    it('should be a const object', () => {
      expect(ADDON_FEATURE_LEVELS).toBeDefined()
      expect(typeof ADDON_FEATURE_LEVELS).toBe('object')
    })
  })

  describe('PLAN_FORM_TAB', () => {
    it('should be defined', () => {
      expect(PLAN_FORM_TAB).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_FORM_TAB).toBe('object')
    })

    it('should have BASIC tab', () => {
      expect(PLAN_FORM_TAB).toHaveProperty('BASIC')
      expect(PLAN_FORM_TAB.BASIC).toBe('Basic Info')
    })

    it('should have PRICING tab', () => {
      expect(PLAN_FORM_TAB).toHaveProperty('PRICING')
      expect(PLAN_FORM_TAB.PRICING).toBe('Pricing')
    })

    it('should have FEATURES tab', () => {
      expect(PLAN_FORM_TAB).toHaveProperty('FEATURES')
      expect(PLAN_FORM_TAB.FEATURES).toBe('Features')
    })

    it('should have ADDONS tab', () => {
      expect(PLAN_FORM_TAB).toHaveProperty('ADDONS')
      expect(PLAN_FORM_TAB.ADDONS).toBe('Add-ons')
    })

    it('should have SLA tab', () => {
      expect(PLAN_FORM_TAB).toHaveProperty('SLA')
      expect(PLAN_FORM_TAB.SLA).toBe('SLA')
    })

    it('should have exactly 5 tabs', () => {
      expect(Object.keys(PLAN_FORM_TAB)).toHaveLength(5)
    })

    it('should have descriptive tab labels', () => {
      Object.values(PLAN_FORM_TAB).forEach(label => {
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('PLAN_MANAGEMENT_FORM_TABS', () => {
    it('should be defined', () => {
      expect(PLAN_MANAGEMENT_FORM_TABS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(PLAN_MANAGEMENT_FORM_TABS)).toBe(true)
    })

    it('should have exactly 5 tabs', () => {
      expect(PLAN_MANAGEMENT_FORM_TABS).toHaveLength(5)
    })

    it('should have consistent structure for all tabs', () => {
      PLAN_MANAGEMENT_FORM_TABS.forEach(tab => {
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })

    it('should match labels with PLAN_FORM_TAB', () => {
      expect(PLAN_MANAGEMENT_FORM_TABS[0].label).toBe(PLAN_FORM_TAB.BASIC)
      expect(PLAN_MANAGEMENT_FORM_TABS[1].label).toBe(PLAN_FORM_TAB.PRICING)
      expect(PLAN_MANAGEMENT_FORM_TABS[2].label).toBe(PLAN_FORM_TAB.FEATURES)
      expect(PLAN_MANAGEMENT_FORM_TABS[3].label).toBe(PLAN_FORM_TAB.ADDONS)
      expect(PLAN_MANAGEMENT_FORM_TABS[4].label).toBe(PLAN_FORM_TAB.SLA)
    })

    describe('Tab Icons', () => {
      it('should have FiInfo icon for Basic Info tab', () => {
        expect(PLAN_MANAGEMENT_FORM_TABS[0].icon).toBe(FiInfo)
      })

      it('should have FaSackDollar icon for Pricing tab', () => {
        expect(PLAN_MANAGEMENT_FORM_TABS[1].icon).toBe(FaSackDollar)
      })

      it('should have HiSparkles icon for Features tab', () => {
        expect(PLAN_MANAGEMENT_FORM_TABS[2].icon).toBe(HiSparkles)
      })

      it('should have FaPlus icon for Add-ons tab', () => {
        expect(PLAN_MANAGEMENT_FORM_TABS[3].icon).toBe(FaPlus)
      })

      it('should have LiaHandshake icon for SLA tab', () => {
        expect(PLAN_MANAGEMENT_FORM_TABS[4].icon).toBe(LiaHandshake)
      })
    })

    it('should have unique labels', () => {
      const labels = PLAN_MANAGEMENT_FORM_TABS.map(tab => tab.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })
  })

  describe('PLAN_FORM_MODES', () => {
    it('should be defined', () => {
      expect(PLAN_FORM_MODES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_FORM_MODES).toBe('object')
    })

    it('should have CREATE mode', () => {
      expect(PLAN_FORM_MODES).toHaveProperty('CREATE')
      expect(PLAN_FORM_MODES.CREATE).toBe('CREATE')
    })

    it('should have EDIT mode', () => {
      expect(PLAN_FORM_MODES).toHaveProperty('EDIT')
      expect(PLAN_FORM_MODES.EDIT).toBe('EDIT')
    })

    it('should have VIEW mode', () => {
      expect(PLAN_FORM_MODES).toHaveProperty('VIEW')
      expect(PLAN_FORM_MODES.VIEW).toBe('VIEW')
    })

    it('should have exactly 3 modes', () => {
      expect(Object.keys(PLAN_FORM_MODES)).toHaveLength(3)
    })

    it('should use UPPERCASE values', () => {
      Object.values(PLAN_FORM_MODES).forEach(value => {
        expect(value).toBe(value.toUpperCase())
      })
    })

    it('should be a const object', () => {
      expect(PLAN_FORM_MODES).toBeDefined()
      expect(typeof PLAN_FORM_MODES).toBe('object')
    })
  })

  describe('PLAN_FORM_TITLES', () => {
    it('should be defined', () => {
      expect(PLAN_FORM_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_FORM_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('CREATE')
      expect(PLAN_FORM_TITLES.CREATE).toBe('Create Plan')
    })

    it('should have EDIT title', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('EDIT')
      expect(PLAN_FORM_TITLES.EDIT).toBe('Edit Plan')
    })

    it('should have VIEW title', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('VIEW')
      expect(PLAN_FORM_TITLES.VIEW).toBe('View Plan')
    })

    it('should have DEFAULT title', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('DEFAULT')
      expect(PLAN_FORM_TITLES.DEFAULT).toBe('Plan Management')
    })

    it('should have exactly 4 titles', () => {
      expect(Object.keys(PLAN_FORM_TITLES)).toHaveLength(4)
    })

    it('should have descriptive titles', () => {
      Object.values(PLAN_FORM_TITLES).forEach(title => {
        expect(typeof title).toBe('string')
        expect(title.length).toBeGreaterThan(5)
      })
    })

    it('should have matching keys with PLAN_FORM_MODES', () => {
      expect(PLAN_FORM_TITLES).toHaveProperty('CREATE')
      expect(PLAN_FORM_TITLES).toHaveProperty('EDIT')
      expect(PLAN_FORM_TITLES).toHaveProperty('VIEW')
    })

    it('should be a const object', () => {
      expect(PLAN_FORM_TITLES).toBeDefined()
      expect(typeof PLAN_FORM_TITLES).toBe('object')
    })
  })

  describe('FEATURE_SECTION_TITLES', () => {
    it('should be defined', () => {
      expect(FEATURE_SECTION_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof FEATURE_SECTION_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(FEATURE_SECTION_TITLES).toHaveProperty('CREATE')
      expect(FEATURE_SECTION_TITLES.CREATE).toBe('Create Feature')
    })

    it('should have AVAILABLE title', () => {
      expect(FEATURE_SECTION_TITLES).toHaveProperty('AVAILABLE')
      expect(FEATURE_SECTION_TITLES.AVAILABLE).toBe('Available Features')
    })

    it('should have INCLUDED title', () => {
      expect(FEATURE_SECTION_TITLES).toHaveProperty('INCLUDED')
      expect(FEATURE_SECTION_TITLES.INCLUDED).toBe('Included Features')
    })

    it('should have exactly 3 titles', () => {
      expect(Object.keys(FEATURE_SECTION_TITLES)).toHaveLength(3)
    })

    it('should be a const object', () => {
      expect(FEATURE_SECTION_TITLES).toBeDefined()
      expect(typeof FEATURE_SECTION_TITLES).toBe('object')
    })
  })

  describe('ADDON_SECTION_TITLES', () => {
    it('should be defined', () => {
      expect(ADDON_SECTION_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ADDON_SECTION_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(ADDON_SECTION_TITLES).toHaveProperty('CREATE')
      expect(ADDON_SECTION_TITLES.CREATE).toBe('Create Add-on')
    })

    it('should have AVAILABLE title', () => {
      expect(ADDON_SECTION_TITLES).toHaveProperty('AVAILABLE')
      expect(ADDON_SECTION_TITLES.AVAILABLE).toBe('Available Add-ons')
    })

    it('should have INCLUDED title', () => {
      expect(ADDON_SECTION_TITLES).toHaveProperty('INCLUDED')
      expect(ADDON_SECTION_TITLES.INCLUDED).toBe('Included Add-ons')
    })

    it('should have exactly 3 titles', () => {
      expect(Object.keys(ADDON_SECTION_TITLES)).toHaveLength(3)
    })

    it('should be a const object', () => {
      expect(ADDON_SECTION_TITLES).toBeDefined()
      expect(typeof ADDON_SECTION_TITLES).toBe('object')
    })
  })

  describe('SLA_SECTION_TITLES', () => {
    it('should be defined', () => {
      expect(SLA_SECTION_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof SLA_SECTION_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(SLA_SECTION_TITLES).toHaveProperty('CREATE')
      expect(SLA_SECTION_TITLES.CREATE).toBe('Create SLA')
    })

    it('should have AVAILABLE title', () => {
      expect(SLA_SECTION_TITLES).toHaveProperty('AVAILABLE')
      expect(SLA_SECTION_TITLES.AVAILABLE).toBe('Available SLAs')
    })

    it('should have INCLUDED title', () => {
      expect(SLA_SECTION_TITLES).toHaveProperty('INCLUDED')
      expect(SLA_SECTION_TITLES.INCLUDED).toBe('Included SLAs')
    })

    it('should have exactly 3 titles', () => {
      expect(Object.keys(SLA_SECTION_TITLES)).toHaveLength(3)
    })

    it('should be a const object', () => {
      expect(SLA_SECTION_TITLES).toBeDefined()
      expect(typeof SLA_SECTION_TITLES).toBe('object')
    })
  })

  describe('PLAN_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(PLAN_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_FORM_DEFAULT_VALUES).toBe('object')
    })

    describe('Basic Information Fields', () => {
      it('should have name as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('name')
        expect(PLAN_FORM_DEFAULT_VALUES.name).toBe('')
      })

      it('should have description as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('description')
        expect(PLAN_FORM_DEFAULT_VALUES.description).toBe('')
      })

      it('should have is_active as true', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('is_active')
        expect(PLAN_FORM_DEFAULT_VALUES.is_active).toBe(true)
      })

      it('should have is_custom as false', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('is_custom')
        expect(PLAN_FORM_DEFAULT_VALUES.is_custom).toBe(false)
      })
    })

    describe('Device and User Limits', () => {
      it('should have included_devices_count as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('included_devices_count')
        expect(PLAN_FORM_DEFAULT_VALUES.included_devices_count).toBe('')
      })

      it('should have max_users_per_branch as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('max_users_per_branch')
        expect(PLAN_FORM_DEFAULT_VALUES.max_users_per_branch).toBe('')
      })

      it('should have included_branches_count as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('included_branches_count')
        expect(PLAN_FORM_DEFAULT_VALUES.included_branches_count).toBe('')
      })

      it('should have additional_device_cost as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('additional_device_cost')
        expect(PLAN_FORM_DEFAULT_VALUES.additional_device_cost).toBe('')
      })
    })

    describe('Pricing Configuration', () => {
      it('should have monthly_price as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('monthly_price')
        expect(PLAN_FORM_DEFAULT_VALUES.monthly_price).toBe('')
      })

      it('should have annual_discount_percentage as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('annual_discount_percentage')
        expect(PLAN_FORM_DEFAULT_VALUES.annual_discount_percentage).toBe('')
      })
    })

    describe('Payment Gateway Fees', () => {
      it('should have monthly_fee_our_gateway as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('monthly_fee_our_gateway')
        expect(PLAN_FORM_DEFAULT_VALUES.monthly_fee_our_gateway).toBe('')
      })

      it('should have monthly_fee_byo_processor as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('monthly_fee_byo_processor')
        expect(PLAN_FORM_DEFAULT_VALUES.monthly_fee_byo_processor).toBe('')
      })

      it('should have card_processing_fee_percentage as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('card_processing_fee_percentage')
        expect(PLAN_FORM_DEFAULT_VALUES.card_processing_fee_percentage).toBe('')
      })

      it('should have card_processing_fee_fixed as empty string', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('card_processing_fee_fixed')
        expect(PLAN_FORM_DEFAULT_VALUES.card_processing_fee_fixed).toBe('')
      })
    })

    describe('Feature and Resource Selection', () => {
      it('should have feature_ids as empty array', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('feature_ids')
        expect(Array.isArray(PLAN_FORM_DEFAULT_VALUES.feature_ids)).toBe(true)
        expect(PLAN_FORM_DEFAULT_VALUES.feature_ids).toHaveLength(0)
      })

      it('should have addon_assignments as empty array', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('addon_assignments')
        expect(Array.isArray(PLAN_FORM_DEFAULT_VALUES.addon_assignments)).toBe(true)
        expect(PLAN_FORM_DEFAULT_VALUES.addon_assignments).toHaveLength(0)
      })

      it('should have support_sla_ids as empty array', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('support_sla_ids')
        expect(Array.isArray(PLAN_FORM_DEFAULT_VALUES.support_sla_ids)).toBe(true)
        expect(PLAN_FORM_DEFAULT_VALUES.support_sla_ids).toHaveLength(0)
      })

      it('should have volume_discounts as empty array', () => {
        expect(PLAN_FORM_DEFAULT_VALUES).toHaveProperty('volume_discounts')
        expect(Array.isArray(PLAN_FORM_DEFAULT_VALUES.volume_discounts)).toBe(true)
        expect(PLAN_FORM_DEFAULT_VALUES.volume_discounts).toHaveLength(0)
      })
    })

    it('should use safe default values', () => {
      /* Empty strings for text and number fields */
      expect(PLAN_FORM_DEFAULT_VALUES.name).toBe('')
      expect(PLAN_FORM_DEFAULT_VALUES.description).toBe('')
      /* Active by default */
      expect(PLAN_FORM_DEFAULT_VALUES.is_active).toBe(true)
      /* Not custom by default */
      expect(PLAN_FORM_DEFAULT_VALUES.is_custom).toBe(false)
      /* Empty arrays for selections */
      expect(PLAN_FORM_DEFAULT_VALUES.feature_ids).toEqual([])
      expect(PLAN_FORM_DEFAULT_VALUES.addon_assignments).toEqual([])
    })
  })

  describe('Section Titles Consistency', () => {
    it('should have consistent structure across all section titles', () => {
      const sectionTitleGroups = [
        FEATURE_SECTION_TITLES,
        ADDON_SECTION_TITLES,
        SLA_SECTION_TITLES
      ]

      sectionTitleGroups.forEach(group => {
        expect(group).toHaveProperty('CREATE')
        expect(group).toHaveProperty('AVAILABLE')
        expect(group).toHaveProperty('INCLUDED')
        expect(Object.keys(group)).toHaveLength(3)
      })
    })

    it('should have unique CREATE titles', () => {
      expect(FEATURE_SECTION_TITLES.CREATE).not.toBe(ADDON_SECTION_TITLES.CREATE)
      expect(FEATURE_SECTION_TITLES.CREATE).not.toBe(SLA_SECTION_TITLES.CREATE)
      expect(ADDON_SECTION_TITLES.CREATE).not.toBe(SLA_SECTION_TITLES.CREATE)
    })

    it('should have descriptive AVAILABLE titles', () => {
      expect(FEATURE_SECTION_TITLES.AVAILABLE).toContain('Features')
      expect(ADDON_SECTION_TITLES.AVAILABLE).toContain('Add-ons')
      expect(SLA_SECTION_TITLES.AVAILABLE).toContain('SLAs')
    })

    it('should have descriptive INCLUDED titles', () => {
      expect(FEATURE_SECTION_TITLES.INCLUDED).toContain('Features')
      expect(ADDON_SECTION_TITLES.INCLUDED).toContain('Add-ons')
      expect(SLA_SECTION_TITLES.INCLUDED).toContain('SLAs')
    })
  })

  describe('Constants Integration', () => {
    it('should have matching tab labels in PLAN_FORM_TAB and PLAN_MANAGEMENT_FORM_TABS', () => {
      const tabLabels = Object.values(PLAN_FORM_TAB)
      PLAN_MANAGEMENT_FORM_TABS.forEach(tab => {
        expect(tabLabels).toContain(tab.label)
      })
    })

    it('should have matching keys between PLAN_FORM_MODES and PLAN_FORM_TITLES', () => {
      expect(PLAN_FORM_TITLES.CREATE).toBeDefined()
      expect(PLAN_FORM_TITLES.EDIT).toBeDefined()
      expect(PLAN_FORM_TITLES.VIEW).toBeDefined()
      expect(PLAN_FORM_MODES.CREATE).toBeDefined()
      expect(PLAN_FORM_MODES.EDIT).toBeDefined()
      expect(PLAN_FORM_MODES.VIEW).toBeDefined()
    })

    it('should use consistent icon components', () => {
      PLAN_MANAGEMENT_FORM_TABS.forEach(tab => {
        expect(typeof tab.icon).toBe('function')
      })
    })
  })
})
