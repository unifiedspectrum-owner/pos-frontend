/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaUser, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaKey, FaDesktop, FaSignInAlt, FaLock, FaExclamationTriangle, FaUserShield, FaGlobe, FaFingerprint } from 'react-icons/fa'

/* User management module imports */
import { USER_STATUS_FILTER_OPTIONS, USER_ROLE_FILTER_BASE_OPTIONS, USER_DETAILS_TAB, USER_DETAILS_TABS, UserProfileInfoFields, UserStatisticsInfoFields, USER_DETAILS } from '@user-management/constants'

describe('User Management Filters Constants', () => {
  describe('USER_STATUS_FILTER_OPTIONS', () => {
    it('should be defined', () => {
      expect(USER_STATUS_FILTER_OPTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_STATUS_FILTER_OPTIONS)).toBe(true)
    })

    it('should have 5 status options', () => {
      expect(USER_STATUS_FILTER_OPTIONS).toHaveLength(5)
    })

    it('should have consistent structure', () => {
      USER_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })

    it('should have "All Users" option', () => {
      const allOption = USER_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'all')
      expect(allOption).toBeDefined()
      expect(allOption?.label).toBe('All Users')
    })

    it('should have "Active" option', () => {
      const activeOption = USER_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'active')
      expect(activeOption).toBeDefined()
      expect(activeOption?.label).toBe('Active')
    })

    it('should have "Inactive" option', () => {
      const inactiveOption = USER_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'inactive')
      expect(inactiveOption).toBeDefined()
      expect(inactiveOption?.label).toBe('Inactive')
    })

    it('should have "Pending" option', () => {
      const pendingOption = USER_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'pending')
      expect(pendingOption).toBeDefined()
      expect(pendingOption?.label).toBe('Pending')
    })

    it('should have "Suspended" option', () => {
      const suspendedOption = USER_STATUS_FILTER_OPTIONS.find(opt => opt.value === 'suspended')
      expect(suspendedOption).toBeDefined()
      expect(suspendedOption?.label).toBe('Suspended')
    })

    it('should have unique values', () => {
      const values = USER_STATUS_FILTER_OPTIONS.map(opt => opt.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should use lowercase values', () => {
      USER_STATUS_FILTER_OPTIONS.forEach(option => {
        expect(option.value).toBe(option.value.toLowerCase())
      })
    })
  })

  describe('USER_ROLE_FILTER_BASE_OPTIONS', () => {
    it('should be defined', () => {
      expect(USER_ROLE_FILTER_BASE_OPTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_ROLE_FILTER_BASE_OPTIONS)).toBe(true)
    })

    it('should have 1 base option', () => {
      expect(USER_ROLE_FILTER_BASE_OPTIONS).toHaveLength(1)
    })

    it('should have "All Roles" option', () => {
      const allRolesOption = USER_ROLE_FILTER_BASE_OPTIONS[0]
      expect(allRolesOption.label).toBe('All Roles')
      expect(allRolesOption.value).toBe('all')
    })

    it('should have consistent structure', () => {
      USER_ROLE_FILTER_BASE_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })
  })

  describe('USER_DETAILS_TAB', () => {
    it('should be defined', () => {
      expect(USER_DETAILS_TAB).toBeDefined()
    })

    it('should have PROFILE_INFO property', () => {
      expect(USER_DETAILS_TAB).toHaveProperty('PROFILE_INFO')
      expect(USER_DETAILS_TAB.PROFILE_INFO).toBe('profile_info')
    })

    it('should have STATISTICS_INFO property', () => {
      expect(USER_DETAILS_TAB).toHaveProperty('STATISTICS_INFO')
      expect(USER_DETAILS_TAB.STATISTICS_INFO).toBe('statistics_info')
    })

    it('should have PERMISSIONS_INFO property', () => {
      expect(USER_DETAILS_TAB).toHaveProperty('PERMISSIONS_INFO')
      expect(USER_DETAILS_TAB.PERMISSIONS_INFO).toBe('permissions')
    })

    it('should have exactly 3 properties', () => {
      expect(Object.keys(USER_DETAILS_TAB)).toHaveLength(3)
    })

    it('should use snake_case for tab values', () => {
      Object.values(USER_DETAILS_TAB).forEach(value => {
        expect(value).toMatch(/^[a-z]+(_[a-z]+)*$/)
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with satisfies and 'as const' */
      expect(USER_DETAILS_TAB).toBeDefined()
      expect(typeof USER_DETAILS_TAB).toBe('object')
    })
  })

  describe('USER_DETAILS_TABS', () => {
    it('should be defined', () => {
      expect(USER_DETAILS_TABS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_DETAILS_TABS)).toBe(true)
    })

    it('should have 3 tabs', () => {
      expect(USER_DETAILS_TABS).toHaveLength(3)
    })

    describe('Profile Information Tab', () => {
      const profileTab = USER_DETAILS_TABS[0]

      it('should have correct configuration', () => {
        expect(profileTab.id).toBe('profile_info')
        expect(profileTab.label).toBe('Profile Information')
        expect(profileTab.icon).toBe(FaUser)
      })
    })

    describe('Activity & Statistics Tab', () => {
      const statsTab = USER_DETAILS_TABS[1]

      it('should have correct configuration', () => {
        expect(statsTab.id).toBe('statistics_info')
        expect(statsTab.label).toBe('Activity & Statistics')
        expect(statsTab.icon).toBe(FaSignInAlt)
      })
    })

    describe('Roles & Permissions Tab', () => {
      const permissionsTab = USER_DETAILS_TABS[2]

      it('should have correct configuration', () => {
        expect(permissionsTab.id).toBe('permissions')
        expect(permissionsTab.label).toBe('Roles & Permissions')
        expect(permissionsTab.icon).toBe(FaUserShield)
      })
    })

    it('should have consistent structure', () => {
      USER_DETAILS_TABS.forEach(tab => {
        expect(tab).toHaveProperty('id')
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        expect(typeof tab.id).toBe('string')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })

    it('should have unique tab IDs', () => {
      const ids = USER_DETAILS_TABS.map(tab => tab.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('UserProfileInfoFields', () => {
    it('should be defined', () => {
      expect(UserProfileInfoFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(UserProfileInfoFields)).toBe(true)
    })

    it('should have 11 profile fields', () => {
      expect(UserProfileInfoFields).toHaveLength(11)
    })

    it('should have consistent structure', () => {
      UserProfileInfoFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
      })
    })

    it('should have unique IDs', () => {
      const ids = UserProfileInfoFields.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique data keys', () => {
      const dataKeys = UserProfileInfoFields.map(field => field.data_key)
      const uniqueKeys = new Set(dataKeys)
      expect(uniqueKeys.size).toBe(dataKeys.length)
    })

    it('should have valid field types', () => {
      const validTypes = ['TEXT', 'VERIFICATION', 'BADGE', 'DATE']
      UserProfileInfoFields.forEach(field => {
        expect(validTypes).toContain(field.type)
      })
    })

    it('should have sequential display orders', () => {
      const displayOrders = UserProfileInfoFields.map(field => field.display_order).sort((a, b) => a - b)
      expect(displayOrders[0]).toBe(1)
      expect(displayOrders[displayOrders.length - 1]).toBe(11)
    })

    it('should have all fields active', () => {
      UserProfileInfoFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    describe('Field Types Distribution', () => {
      it('should have TEXT fields', () => {
        const textFields = UserProfileInfoFields.filter(f => f.type === 'TEXT')
        expect(textFields.length).toBeGreaterThan(0)
      })

      it('should have VERIFICATION fields', () => {
        const verificationFields = UserProfileInfoFields.filter(f => f.type === 'VERIFICATION')
        expect(verificationFields.length).toBe(2) /* phone and email */
      })

      it('should have BADGE fields', () => {
        const badgeFields = UserProfileInfoFields.filter(f => f.type === 'BADGE')
        expect(badgeFields.length).toBe(1) /* user_status */
      })

      it('should have DATE fields', () => {
        const dateFields = UserProfileInfoFields.filter(f => f.type === 'DATE')
        expect(dateFields.length).toBeGreaterThan(3)
      })
    })

    describe('Specific Fields', () => {
      it('should have First Name field', () => {
        const field = UserProfileInfoFields.find(f => f.data_key === 'f_name')
        expect(field).toBeDefined()
        expect(field?.label).toBe('First Name')
        expect(field?.type).toBe('TEXT')
        expect(field?.icon_name).toBe(FaUser)
      })

      it('should have Email field with VERIFICATION type', () => {
        const field = UserProfileInfoFields.find(f => f.data_key === 'email')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Email Address')
        expect(field?.type).toBe('VERIFICATION')
        expect(field?.icon_name).toBe(FaEnvelope)
      })

      it('should have Phone field with VERIFICATION type', () => {
        const field = UserProfileInfoFields.find(f => f.data_key === 'phone')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Phone Number')
        expect(field?.type).toBe('VERIFICATION')
        expect(field?.icon_name).toBe(FaPhoneAlt)
      })

      it('should have Account Status with BADGE type', () => {
        const field = UserProfileInfoFields.find(f => f.data_key === 'user_status')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Account Status')
        expect(field?.type).toBe('BADGE')
        expect(field?.values).toEqual(['Active', 'Inactive'])
      })

      it('should have date fields for timestamps', () => {
        const dateFields = UserProfileInfoFields.filter(f => f.type === 'DATE')
        const dateDataKeys = dateFields.map(f => f.data_key)

        expect(dateDataKeys).toContain('phone_verified_at')
        expect(dateDataKeys).toContain('email_verified_at')
        expect(dateDataKeys).toContain('user_created_at')
        expect(dateDataKeys).toContain('user_updated_at')
        expect(dateDataKeys).toContain('last_password_change')
      })
    })
  })

  describe('UserStatisticsInfoFields', () => {
    it('should be defined', () => {
      expect(UserStatisticsInfoFields).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(UserStatisticsInfoFields)).toBe(true)
    })

    it('should have 15 statistics fields', () => {
      expect(UserStatisticsInfoFields).toHaveLength(15)
    })

    it('should have consistent structure', () => {
      UserStatisticsInfoFields.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('display_order')
        expect(field).toHaveProperty('is_active')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('icon_name')
        expect(field).toHaveProperty('data_key')
        expect(field).toHaveProperty('type')
      })
    })

    it('should have unique IDs', () => {
      const ids = UserStatisticsInfoFields.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique data keys', () => {
      const dataKeys = UserStatisticsInfoFields.map(field => field.data_key)
      const uniqueKeys = new Set(dataKeys)
      expect(uniqueKeys.size).toBe(dataKeys.length)
    })

    it('should have sequential display orders', () => {
      const displayOrders = UserStatisticsInfoFields.map(field => field.display_order).sort((a, b) => a - b)
      expect(displayOrders[0]).toBe(1)
      expect(displayOrders[displayOrders.length - 1]).toBe(15)
    })

    it('should have all fields active', () => {
      UserStatisticsInfoFields.forEach(field => {
        expect(field.is_active).toBe(true)
      })
    })

    describe('Field Types Distribution', () => {
      it('should have TEXT fields', () => {
        const textFields = UserStatisticsInfoFields.filter(f => f.type === 'TEXT')
        expect(textFields.length).toBeGreaterThan(5)
      })

      it('should have DATE fields', () => {
        const dateFields = UserStatisticsInfoFields.filter(f => f.type === 'DATE')
        expect(dateFields.length).toBeGreaterThan(3)
      })

      it('should not have VERIFICATION or BADGE fields', () => {
        const verificationFields = UserStatisticsInfoFields.filter(f => f.type === 'VERIFICATION')
        const badgeFields = UserStatisticsInfoFields.filter(f => f.type === 'BADGE')
        expect(verificationFields).toHaveLength(0)
        expect(badgeFields).toHaveLength(0)
      })
    })

    describe('Login Statistics Fields', () => {
      it('should have Total Logins field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'total_logins')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Total Logins')
        expect(field?.type).toBe('TEXT')
        expect(field?.icon_name).toBe(FaSignInAlt)
      })

      it('should have Successful Logins field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'successful_logins')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Successful Logins')
        expect(field?.icon_name).toBe(FaCheckCircle)
      })

      it('should have Failed Logins field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'failed_logins')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Failed Logins')
        expect(field?.icon_name).toBe(FaTimesCircle)
      })

      it('should have Consecutive Failed field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'consecutive_failed_attempts')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Consecutive Failed')
        expect(field?.icon_name).toBe(FaExclamationTriangle)
      })
    })

    describe('Session Fields', () => {
      it('should have Active Sessions field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'active_sessions')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Active Sessions')
        expect(field?.icon_name).toBe(FaDesktop)
      })

      it('should have Max Sessions field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'max_concurrent_sessions')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Max Sessions')
        expect(field?.icon_name).toBe(FaDesktop)
      })
    })

    describe('Security Fields', () => {
      it('should have Password Changes field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'password_changes_count')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Password Changes')
        expect(field?.icon_name).toBe(FaKey)
      })

      it('should have Account Lockouts field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'account_lockouts_count')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Account Lockouts')
        expect(field?.icon_name).toBe(FaLock)
      })

      it('should have Last Lockout field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'last_lockout_at')
        expect(field).toBeDefined()
        expect(field?.type).toBe('DATE')
      })
    })

    describe('Device Fields', () => {
      it('should have Last Login IP field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'last_login_ip')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Last Login IP')
        expect(field?.icon_name).toBe(FaGlobe)
      })

      it('should have Last User Agent field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'last_user_agent')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Last User Agent')
        expect(field?.icon_name).toBe(FaDesktop)
      })

      it('should have Device Fingerprint field', () => {
        const field = UserStatisticsInfoFields.find(f => f.data_key === 'last_device_fingerprint')
        expect(field).toBeDefined()
        expect(field?.label).toBe('Device Fingerprint')
        expect(field?.icon_name).toBe(FaFingerprint)
      })
    })
  })

  describe('USER_DETAILS', () => {
    it('should be defined', () => {
      expect(USER_DETAILS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(USER_DETAILS)).toBe(true)
    })

    it('should have 2 sections', () => {
      expect(USER_DETAILS).toHaveLength(2)
    })

    describe('Profile Section', () => {
      const profileSection = USER_DETAILS[0]

      it('should have correct configuration', () => {
        expect(profileSection.id).toBe('profile_info')
        expect(profileSection.section_heading).toBe('Profile & Security Information')
        expect(profileSection.section_values).toBe(UserProfileInfoFields)
      })

      it('should contain all profile fields', () => {
        expect(profileSection.section_values).toHaveLength(11)
      })
    })

    describe('Statistics Section', () => {
      const statsSection = USER_DETAILS[1]

      it('should have correct configuration', () => {
        expect(statsSection.id).toBe('statistics_info')
        expect(statsSection.section_heading).toBe('Activity & Statistics')
        expect(statsSection.section_values).toBe(UserStatisticsInfoFields)
      })

      it('should contain all statistics fields', () => {
        expect(statsSection.section_values).toHaveLength(15)
      })
    })

    it('should have consistent structure', () => {
      USER_DETAILS.forEach(section => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('section_heading')
        expect(section).toHaveProperty('section_values')
        expect(Array.isArray(section.section_values)).toBe(true)
      })
    })

    it('should have unique section IDs', () => {
      const ids = USER_DETAILS.map(section => section.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('Constants Integration', () => {
    it('should have matching tab IDs between USER_DETAILS_TAB and USER_DETAILS_TABS', () => {
      /* Check that all tabs in USER_DETAILS_TABS have a corresponding constant */
      const tabConstants = Object.values(USER_DETAILS_TAB)
      USER_DETAILS_TABS.forEach(tab => {
        expect(tabConstants).toContain(tab.id)
      })
    })

    it('should have matching section IDs in USER_DETAILS and USER_DETAILS_TAB', () => {
      /* Check that all sections in USER_DETAILS have a corresponding constant */
      const tabConstants = Object.values(USER_DETAILS_TAB)
      USER_DETAILS.forEach(section => {
        expect(tabConstants).toContain(section.id)
      })
    })

    it('should use consistent icon components', () => {
      const profileIcons = UserProfileInfoFields.map(field => field.icon_name)
      const statsIcons = UserStatisticsInfoFields.map(field => field.icon_name)

      profileIcons.forEach(icon => {
        expect(typeof icon).toBe('function')
      })

      statsIcons.forEach(icon => {
        expect(typeof icon).toBe('function')
      })
    })

    it('should have descriptive labels for all fields', () => {
      const allFields = [...UserProfileInfoFields, ...UserStatisticsInfoFields]

      allFields.forEach(field => {
        expect(field.label.length).toBeGreaterThan(3)
        expect(field.label).not.toBe(field.data_key)
      })
    })

    it('should use snake_case for data keys', () => {
      const allFields = [...UserProfileInfoFields, ...UserStatisticsInfoFields]

      allFields.forEach(field => {
        expect(field.data_key).toMatch(/^[a-z]+(_[a-z]+)*$/)
      })
    })
  })
})
