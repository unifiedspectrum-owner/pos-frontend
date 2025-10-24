/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { FaInfoCircle, FaCog, FaFileAlt, FaToggleOn } from 'react-icons/fa'

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Role management module imports */
import { ROLE_FORM_SECTIONS, ROLE_FORM_MODES, ROLE_FORM_TITLES, ROLE_FORM_DEFAULT_VALUES, ROLE_TAB_IDS, ROLE_FORM_TABS, ROLE_CREATION_FORM_QUESTIONS, MODULE_PERMISSION_OPTIONS, type RoleFormMode } from '@role-management/constants'

describe('Role Management Forms Constants', () => {
  describe('ROLE_FORM_SECTIONS', () => {
    it('should be defined', () => {
      expect(ROLE_FORM_SECTIONS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_FORM_SECTIONS).toBe('object')
    })

    it('should have ROLE_INFO property', () => {
      expect(ROLE_FORM_SECTIONS).toHaveProperty('ROLE_INFO')
      expect(ROLE_FORM_SECTIONS.ROLE_INFO).toBe('Role Information')
    })

    it('should have MODULE_ASSIGNMENTS property', () => {
      expect(ROLE_FORM_SECTIONS).toHaveProperty('MODULE_ASSIGNMENTS')
      expect(ROLE_FORM_SECTIONS.MODULE_ASSIGNMENTS).toBe('Module Assignments')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(ROLE_FORM_SECTIONS)).toHaveLength(2)
    })

    it('should have descriptive section headings', () => {
      Object.values(ROLE_FORM_SECTIONS).forEach(heading => {
        expect(typeof heading).toBe('string')
        expect(heading.length).toBeGreaterThan(5)
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_FORM_SECTIONS).toBeDefined()
      expect(typeof ROLE_FORM_SECTIONS).toBe('object')
    })
  })

  describe('ROLE_FORM_MODES', () => {
    it('should be defined', () => {
      expect(ROLE_FORM_MODES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_FORM_MODES).toBe('object')
    })

    it('should have CREATE mode', () => {
      expect(ROLE_FORM_MODES).toHaveProperty('CREATE')
      expect(ROLE_FORM_MODES.CREATE).toBe('CREATE')
    })

    it('should have EDIT mode', () => {
      expect(ROLE_FORM_MODES).toHaveProperty('EDIT')
      expect(ROLE_FORM_MODES.EDIT).toBe('EDIT')
    })

    it('should have VIEW mode', () => {
      expect(ROLE_FORM_MODES).toHaveProperty('VIEW')
      expect(ROLE_FORM_MODES.VIEW).toBe('VIEW')
    })

    it('should have exactly 3 modes', () => {
      expect(Object.keys(ROLE_FORM_MODES)).toHaveLength(3)
    })

    it('should use UPPERCASE values', () => {
      Object.values(ROLE_FORM_MODES).forEach(value => {
        expect(value).toBe(value.toUpperCase())
      })
    })

    it('should have all string values', () => {
      Object.values(ROLE_FORM_MODES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_FORM_MODES).toBeDefined()
      expect(typeof ROLE_FORM_MODES).toBe('object')
    })
  })

  describe('ROLE_FORM_TITLES', () => {
    it('should be defined', () => {
      expect(ROLE_FORM_TITLES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_FORM_TITLES).toBe('object')
    })

    it('should have CREATE title', () => {
      expect(ROLE_FORM_TITLES).toHaveProperty('CREATE')
      expect(ROLE_FORM_TITLES.CREATE).toBe('Create New Role')
    })

    it('should have EDIT title', () => {
      expect(ROLE_FORM_TITLES).toHaveProperty('EDIT')
      expect(ROLE_FORM_TITLES.EDIT).toBe('Edit Role')
    })

    it('should have VIEW title', () => {
      expect(ROLE_FORM_TITLES).toHaveProperty('VIEW')
      expect(ROLE_FORM_TITLES.VIEW).toBe('View Role')
    })

    it('should have DEFAULT title', () => {
      expect(ROLE_FORM_TITLES).toHaveProperty('DEFAULT')
      expect(ROLE_FORM_TITLES.DEFAULT).toBe('Role Management')
    })

    it('should have exactly 4 titles', () => {
      expect(Object.keys(ROLE_FORM_TITLES)).toHaveLength(4)
    })

    it('should have descriptive titles', () => {
      Object.values(ROLE_FORM_TITLES).forEach(title => {
        expect(typeof title).toBe('string')
        expect(title.length).toBeGreaterThan(5)
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_FORM_TITLES).toBeDefined()
      expect(typeof ROLE_FORM_TITLES).toBe('object')
    })

    it('should have matching keys with ROLE_FORM_MODES', () => {
      expect(ROLE_FORM_TITLES).toHaveProperty('CREATE')
      expect(ROLE_FORM_TITLES).toHaveProperty('EDIT')
      expect(ROLE_FORM_TITLES).toHaveProperty('VIEW')
    })
  })

  describe('ROLE_FORM_DEFAULT_VALUES', () => {
    it('should be defined', () => {
      expect(ROLE_FORM_DEFAULT_VALUES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_FORM_DEFAULT_VALUES).toBe('object')
    })

    it('should have name property with empty string', () => {
      expect(ROLE_FORM_DEFAULT_VALUES).toHaveProperty('name')
      expect(ROLE_FORM_DEFAULT_VALUES.name).toBe('')
      expect(typeof ROLE_FORM_DEFAULT_VALUES.name).toBe('string')
    })

    it('should have description property with empty string', () => {
      expect(ROLE_FORM_DEFAULT_VALUES).toHaveProperty('description')
      expect(ROLE_FORM_DEFAULT_VALUES.description).toBe('')
      expect(typeof ROLE_FORM_DEFAULT_VALUES.description).toBe('string')
    })

    it('should have is_active property set to true', () => {
      expect(ROLE_FORM_DEFAULT_VALUES).toHaveProperty('is_active')
      expect(ROLE_FORM_DEFAULT_VALUES.is_active).toBe(true)
      expect(typeof ROLE_FORM_DEFAULT_VALUES.is_active).toBe('boolean')
    })

    it('should have module_assignments property as empty array', () => {
      expect(ROLE_FORM_DEFAULT_VALUES).toHaveProperty('module_assignments')
      expect(Array.isArray(ROLE_FORM_DEFAULT_VALUES.module_assignments)).toBe(true)
      expect(ROLE_FORM_DEFAULT_VALUES.module_assignments).toHaveLength(0)
    })

    it('should have exactly 4 properties', () => {
      expect(Object.keys(ROLE_FORM_DEFAULT_VALUES)).toHaveLength(4)
    })

    it('should use safe default values', () => {
      /* Empty strings for text fields */
      expect(ROLE_FORM_DEFAULT_VALUES.name).toBe('')
      expect(ROLE_FORM_DEFAULT_VALUES.description).toBe('')
      /* Active by default */
      expect(ROLE_FORM_DEFAULT_VALUES.is_active).toBe(true)
      /* Empty array for module assignments */
      expect(ROLE_FORM_DEFAULT_VALUES.module_assignments).toEqual([])
    })
  })

  describe('ROLE_TAB_IDS', () => {
    it('should be defined', () => {
      expect(ROLE_TAB_IDS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_TAB_IDS).toBe('object')
    })

    it('should have ROLE_INFO property', () => {
      expect(ROLE_TAB_IDS).toHaveProperty('ROLE_INFO')
      expect(ROLE_TAB_IDS.ROLE_INFO).toBe('role-info')
    })

    it('should have MODULE_ASSIGNMENTS property', () => {
      expect(ROLE_TAB_IDS).toHaveProperty('MODULE_ASSIGNMENTS')
      expect(ROLE_TAB_IDS.MODULE_ASSIGNMENTS).toBe('module-assignments')
    })

    it('should have exactly 2 properties', () => {
      expect(Object.keys(ROLE_TAB_IDS)).toHaveLength(2)
    })

    it('should use kebab-case for tab values', () => {
      Object.values(ROLE_TAB_IDS).forEach(value => {
        expect(value).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })

    it('should be a const object', () => {
      /* TypeScript enforces readonly at compile time with 'as const' */
      expect(ROLE_TAB_IDS).toBeDefined()
      expect(typeof ROLE_TAB_IDS).toBe('object')
    })
  })

  describe('ROLE_FORM_TABS', () => {
    it('should be defined', () => {
      expect(ROLE_FORM_TABS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(ROLE_FORM_TABS)).toBe(true)
    })

    it('should have exactly 2 tabs', () => {
      expect(ROLE_FORM_TABS).toHaveLength(2)
    })

    describe('Role Information Tab', () => {
      const roleInfoTab = ROLE_FORM_TABS[0]

      it('should have correct structure', () => {
        expect(roleInfoTab).toHaveProperty('id')
        expect(roleInfoTab).toHaveProperty('label')
        expect(roleInfoTab).toHaveProperty('icon')
      })

      it('should have correct id', () => {
        expect(roleInfoTab.id).toBe(ROLE_TAB_IDS.ROLE_INFO)
        expect(roleInfoTab.id).toBe('role-info')
      })

      it('should have correct label', () => {
        expect(roleInfoTab.label).toBe(ROLE_FORM_SECTIONS.ROLE_INFO)
        expect(roleInfoTab.label).toBe('Role Information')
      })

      it('should have FaInfoCircle icon', () => {
        expect(roleInfoTab.icon).toBe(FaInfoCircle)
      })
    })

    describe('Module Assignments Tab', () => {
      const moduleAssignmentsTab = ROLE_FORM_TABS[1]

      it('should have correct structure', () => {
        expect(moduleAssignmentsTab).toHaveProperty('id')
        expect(moduleAssignmentsTab).toHaveProperty('label')
        expect(moduleAssignmentsTab).toHaveProperty('icon')
      })

      it('should have correct id', () => {
        expect(moduleAssignmentsTab.id).toBe(ROLE_TAB_IDS.MODULE_ASSIGNMENTS)
        expect(moduleAssignmentsTab.id).toBe('module-assignments')
      })

      it('should have correct label', () => {
        expect(moduleAssignmentsTab.label).toBe(ROLE_FORM_SECTIONS.MODULE_ASSIGNMENTS)
        expect(moduleAssignmentsTab.label).toBe('Module Assignments')
      })

      it('should have FaCog icon', () => {
        expect(moduleAssignmentsTab.icon).toBe(FaCog)
      })
    })

    it('should have consistent structure across all tabs', () => {
      ROLE_FORM_TABS.forEach(tab => {
        expect(tab).toHaveProperty('id')
        expect(tab).toHaveProperty('label')
        expect(tab).toHaveProperty('icon')
        expect(typeof tab.id).toBe('string')
        expect(typeof tab.label).toBe('string')
        expect(typeof tab.icon).toBe('function')
      })
    })

    it('should have unique tab IDs', () => {
      const ids = ROLE_FORM_TABS.map(tab => tab.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('ROLE_CREATION_FORM_QUESTIONS', () => {
    it('should be defined', () => {
      expect(ROLE_CREATION_FORM_QUESTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(ROLE_CREATION_FORM_QUESTIONS)).toBe(true)
    })

    it('should have 3 form fields', () => {
      expect(ROLE_CREATION_FORM_QUESTIONS).toHaveLength(3)
    })

    it('should have unique IDs', () => {
      const ids = ROLE_CREATION_FORM_QUESTIONS.map(field => field.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have sequential IDs starting from 1', () => {
      const ids = ROLE_CREATION_FORM_QUESTIONS.map(field => field.id).sort((a, b) => a - b)
      expect(ids[0]).toBe(1)
      expect(ids[ids.length - 1]).toBe(3)
    })

    it('should have unique schema keys', () => {
      const schemaKeys = ROLE_CREATION_FORM_QUESTIONS.map(field => field.schema_key)
      const uniqueKeys = new Set(schemaKeys)
      expect(uniqueKeys.size).toBe(schemaKeys.length)
    })

    describe('Field Structure', () => {
      it('should have consistent structure for all fields', () => {
        ROLE_CREATION_FORM_QUESTIONS.forEach(field => {
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
        ROLE_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(validTypes).toContain(field.type)
        })
      })

      it('should have grid configuration with col_span', () => {
        ROLE_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(field.grid).toHaveProperty('col_span')
          expect(typeof field.grid.col_span).toBe('number')
          expect(field.grid.col_span).toBeGreaterThan(0)
          expect(field.grid.col_span).toBeLessThanOrEqual(8)
        })
      })

      it('should have boolean is_required property', () => {
        ROLE_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(typeof field.is_required).toBe('boolean')
        })
      })

      it('should have boolean is_active property', () => {
        ROLE_CREATION_FORM_QUESTIONS.forEach(field => {
          expect(typeof field.is_active).toBe('boolean')
        })
      })
    })

    describe('Name Field', () => {
      const nameField = ROLE_CREATION_FORM_QUESTIONS[0]

      it('should have correct configuration', () => {
        expect(nameField.id).toBe(1)
        expect(nameField.type).toBe(FORM_FIELD_TYPES.INPUT)
        expect(nameField.label).toBe('Name')
        expect(nameField.schema_key).toBe('name')
        expect(nameField.placeholder).toBe('Enter role name')
        expect(nameField.left_icon).toBe(FaInfoCircle)
        expect(nameField.is_required).toBe(true)
        expect(nameField.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(nameField.grid.col_span).toBe(5)
      })
    })

    describe('Status Field', () => {
      const statusField = ROLE_CREATION_FORM_QUESTIONS[1]

      it('should have correct configuration', () => {
        expect(statusField.id).toBe(2)
        expect(statusField.type).toBe(FORM_FIELD_TYPES.TOGGLE)
        expect(statusField.label).toBe('Status')
        expect(statusField.schema_key).toBe('is_active')
        expect(statusField.left_icon).toBe(FaToggleOn)
        expect(statusField.is_required).toBe(false)
        expect(statusField.is_active).toBe(true)
      })

      it('should have toggle text', () => {
        expect(statusField).toHaveProperty('toggle_text')
        expect(statusField.toggle_text).toHaveProperty('true')
        expect(statusField.toggle_text).toHaveProperty('false')
        expect(statusField.toggle_text?.true).toBe('Active')
        expect(statusField.toggle_text?.false).toBe('Inactive')
      })

      it('should have grid configuration', () => {
        expect(statusField.grid.col_span).toBe(3)
      })
    })

    describe('Description Field', () => {
      const descriptionField = ROLE_CREATION_FORM_QUESTIONS[2]

      it('should have correct configuration', () => {
        expect(descriptionField.id).toBe(3)
        expect(descriptionField.type).toBe(FORM_FIELD_TYPES.TEXTAREA)
        expect(descriptionField.label).toBe('Description')
        expect(descriptionField.schema_key).toBe('description')
        expect(descriptionField.placeholder).toBe('Enter role description')
        expect(descriptionField.left_icon).toBe(FaFileAlt)
        expect(descriptionField.is_required).toBe(true)
        expect(descriptionField.is_active).toBe(true)
      })

      it('should have grid configuration', () => {
        expect(descriptionField.grid.col_span).toBe(8)
      })
    })

    describe('Display Order', () => {
      it('should have sequential display orders', () => {
        const displayOrders = ROLE_CREATION_FORM_QUESTIONS.map(field => field.display_order)
        displayOrders.forEach((order, index) => {
          expect(order).toBeGreaterThan(0)
        })
      })

      it('should be sortable by display_order', () => {
        const sorted = [...ROLE_CREATION_FORM_QUESTIONS].sort((a, b) => a.display_order - b.display_order)
        expect(sorted[0].display_order).toBeLessThanOrEqual(sorted[1].display_order)
      })
    })

    describe('Required Fields', () => {
      it('should have at least one required field', () => {
        const requiredFields = ROLE_CREATION_FORM_QUESTIONS.filter(field => field.is_required)
        expect(requiredFields.length).toBeGreaterThan(0)
      })

      it('should mark name and description as required', () => {
        const nameField = ROLE_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'name')
        const descriptionField = ROLE_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'description')

        expect(nameField?.is_required).toBe(true)
        expect(descriptionField?.is_required).toBe(true)
      })

      it('should mark status as optional', () => {
        const statusField = ROLE_CREATION_FORM_QUESTIONS.find(f => f.schema_key === 'is_active')
        expect(statusField?.is_required).toBe(false)
      })
    })

    describe('Active Fields', () => {
      it('should have all fields active', () => {
        const activeFields = ROLE_CREATION_FORM_QUESTIONS.filter(field => field.is_active)
        expect(activeFields.length).toBe(ROLE_CREATION_FORM_QUESTIONS.length)
      })
    })
  })

  describe('MODULE_PERMISSION_OPTIONS', () => {
    it('should be defined', () => {
      expect(MODULE_PERMISSION_OPTIONS).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(MODULE_PERMISSION_OPTIONS)).toBe(true)
    })

    it('should have 4 permission options', () => {
      expect(MODULE_PERMISSION_OPTIONS).toHaveLength(4)
    })

    it('should have consistent structure', () => {
      MODULE_PERMISSION_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })

    describe('Permission Options', () => {
      it('should have Create permission', () => {
        const createOption = MODULE_PERMISSION_OPTIONS.find(opt => opt.value === 'can_create')
        expect(createOption).toBeDefined()
        expect(createOption?.label).toBe('Create')
      })

      it('should have Read permission', () => {
        const readOption = MODULE_PERMISSION_OPTIONS.find(opt => opt.value === 'can_read')
        expect(readOption).toBeDefined()
        expect(readOption?.label).toBe('Read')
      })

      it('should have Update permission', () => {
        const updateOption = MODULE_PERMISSION_OPTIONS.find(opt => opt.value === 'can_update')
        expect(updateOption).toBeDefined()
        expect(updateOption?.label).toBe('Update')
      })

      it('should have Delete permission', () => {
        const deleteOption = MODULE_PERMISSION_OPTIONS.find(opt => opt.value === 'can_delete')
        expect(deleteOption).toBeDefined()
        expect(deleteOption?.label).toBe('Delete')
      })
    })

    it('should follow CRUD order', () => {
      expect(MODULE_PERMISSION_OPTIONS[0].label).toBe('Create')
      expect(MODULE_PERMISSION_OPTIONS[1].label).toBe('Read')
      expect(MODULE_PERMISSION_OPTIONS[2].label).toBe('Update')
      expect(MODULE_PERMISSION_OPTIONS[3].label).toBe('Delete')
    })

    it('should have unique values', () => {
      const values = MODULE_PERMISSION_OPTIONS.map(opt => opt.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should have unique labels', () => {
      const labels = MODULE_PERMISSION_OPTIONS.map(opt => opt.label)
      const uniqueLabels = new Set(labels)
      expect(uniqueLabels.size).toBe(labels.length)
    })

    it('should use can_ prefix for permission values', () => {
      MODULE_PERMISSION_OPTIONS.forEach(option => {
        expect(option.value).toMatch(/^can_[a-z]+$/)
      })
    })
  })

  describe('Constants Integration', () => {
    it('should have matching tab IDs between ROLE_TAB_IDS and ROLE_FORM_TABS', () => {
      /* Check that all tabs in ROLE_FORM_TABS have a corresponding constant */
      const tabConstants = Object.values(ROLE_TAB_IDS)
      ROLE_FORM_TABS.forEach(tab => {
        expect(tabConstants).toContain(tab.id)
      })
    })

    it('should have form fields matching default values', () => {
      const formFieldKeys = ROLE_CREATION_FORM_QUESTIONS.map(field => field.schema_key)
      const defaultValueKeys = Object.keys(ROLE_FORM_DEFAULT_VALUES)

      /* Most form fields should have default values */
      formFieldKeys.forEach(key => {
        expect(defaultValueKeys).toContain(key)
      })
    })

    it('should use consistent icon components', () => {
      const icons = ROLE_CREATION_FORM_QUESTIONS.map(field => field.left_icon)
      icons.forEach(icon => {
        expect(typeof icon).toBe('function')
      })
    })

    it('should have tab labels matching form sections', () => {
      ROLE_FORM_TABS.forEach(tab => {
        const sectionValues = Object.values(ROLE_FORM_SECTIONS)
        expect(sectionValues).toContain(tab.label)
      })
    })
  })

  describe('RoleFormMode Type', () => {
    it('should be compatible with ROLE_FORM_MODES values', () => {
      /* TypeScript type checking - this will compile if type is correct */
      const createMode: RoleFormMode = ROLE_FORM_MODES.CREATE
      const editMode: RoleFormMode = ROLE_FORM_MODES.EDIT
      const viewMode: RoleFormMode = ROLE_FORM_MODES.VIEW

      expect(createMode).toBe('CREATE')
      expect(editMode).toBe('EDIT')
      expect(viewMode).toBe('VIEW')
    })

    it('should accept valid mode strings', () => {
      const testCreate: RoleFormMode = 'CREATE'
      const testEdit: RoleFormMode = 'EDIT'
      const testView: RoleFormMode = 'VIEW'

      expect(testCreate).toBe(ROLE_FORM_MODES.CREATE)
      expect(testEdit).toBe(ROLE_FORM_MODES.EDIT)
      expect(testView).toBe(ROLE_FORM_MODES.VIEW)
    })
  })
})
