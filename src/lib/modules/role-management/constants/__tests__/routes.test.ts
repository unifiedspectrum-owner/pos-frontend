/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Role management module imports */
import { ROLE_MODULE_NAME, ROLE_API_ROUTES, MODULE_API_ROUTES, ROLE_PAGE_ROUTES } from '@role-management/constants'

describe('Role Management Routes Constants', () => {
  describe('ROLE_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(ROLE_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(ROLE_MODULE_NAME).toBe('role-management')
    })

    it('should be a string', () => {
      expect(typeof ROLE_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(ROLE_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(ROLE_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('ROLE_API_ROUTES', () => {
    it('should be defined', () => {
      expect(ROLE_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(ROLE_API_ROUTES).not.toBeNull()
    })

    describe('BASE_URL', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.BASE_URL).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.BASE_URL).toBe('/users/roles')
      })

      it('should start with forward slash', () => {
        expect(ROLE_API_ROUTES.BASE_URL).toMatch(/^\//)
      })

      it('should not end with forward slash', () => {
        expect(ROLE_API_ROUTES.BASE_URL).not.toMatch(/\/$/)
      })

      it('should be a string', () => {
        expect(typeof ROLE_API_ROUTES.BASE_URL).toBe('string')
      })
    })

    describe('LIST', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.LIST).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.LIST).toBe('/list')
      })

      it('should start with forward slash', () => {
        expect(ROLE_API_ROUTES.LIST).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(ROLE_API_ROUTES.LIST).toMatch(/^\/[a-z]+$/)
      })
    })

    describe('DETAILS', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.DETAILS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.DETAILS).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(ROLE_API_ROUTES.DETAILS).toContain(':id')
      })

      it('should match dynamic route pattern', () => {
        expect(ROLE_API_ROUTES.DETAILS).toMatch(/^\/:[a-z]+$/)
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.CREATE).toBeDefined()
      })

      it('should be empty string for POST to base URL', () => {
        expect(ROLE_API_ROUTES.CREATE).toBe('')
      })

      it('should be a string', () => {
        expect(typeof ROLE_API_ROUTES.CREATE).toBe('string')
      })
    })

    describe('UPDATE', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.UPDATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.UPDATE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(ROLE_API_ROUTES.UPDATE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(ROLE_API_ROUTES.UPDATE).toBe(ROLE_API_ROUTES.DETAILS)
      })
    })

    describe('DELETE', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.DELETE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.DELETE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(ROLE_API_ROUTES.DELETE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(ROLE_API_ROUTES.DELETE).toBe(ROLE_API_ROUTES.DETAILS)
      })
    })

    describe('PERMISSIONS', () => {
      it('should be defined', () => {
        expect(ROLE_API_ROUTES.PERMISSIONS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_API_ROUTES.PERMISSIONS).toBe('/permissions')
      })

      it('should start with forward slash', () => {
        expect(ROLE_API_ROUTES.PERMISSIONS).toMatch(/^\//)
      })

      it('should contain permissions segment', () => {
        expect(ROLE_API_ROUTES.PERMISSIONS).toContain('permissions')
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(ROLE_API_ROUTES).toHaveProperty('BASE_URL')
        expect(ROLE_API_ROUTES).toHaveProperty('LIST')
        expect(ROLE_API_ROUTES).toHaveProperty('DETAILS')
        expect(ROLE_API_ROUTES).toHaveProperty('CREATE')
        expect(ROLE_API_ROUTES).toHaveProperty('UPDATE')
        expect(ROLE_API_ROUTES).toHaveProperty('DELETE')
        expect(ROLE_API_ROUTES).toHaveProperty('PERMISSIONS')
      })

      it('should have exactly 7 properties', () => {
        expect(Object.keys(ROLE_API_ROUTES)).toHaveLength(7)
      })

      it('should use RESTful conventions', () => {
        /* LIST for getting collection */
        expect(ROLE_API_ROUTES.LIST).toBeTruthy()
        /* Empty string for CREATE (POST to base) */
        expect(ROLE_API_ROUTES.CREATE).toBe('')
        /* :id parameter for resource operations */
        expect(ROLE_API_ROUTES.DETAILS).toContain(':id')
        expect(ROLE_API_ROUTES.UPDATE).toContain(':id')
        expect(ROLE_API_ROUTES.DELETE).toContain(':id')
      })

      it('should not have duplicate values except for CRUD operations', () => {
        const values = Object.values(ROLE_API_ROUTES)
        const uniqueValues = new Set(values)
        /* DETAILS, UPDATE, DELETE should be the same */
        expect(values.length).toBe(7)
        expect(uniqueValues.size).toBeLessThan(7)
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(ROLE_API_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(ROLE_API_ROUTES).toBeDefined()
        expect(typeof ROLE_API_ROUTES).toBe('object')
      })
    })
  })

  describe('MODULE_API_ROUTES', () => {
    it('should be defined', () => {
      expect(MODULE_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof MODULE_API_ROUTES).toBe('object')
    })

    describe('LIST', () => {
      it('should be defined', () => {
        expect(MODULE_API_ROUTES.LIST).toBeDefined()
      })

      it('should have correct value', () => {
        expect(MODULE_API_ROUTES.LIST).toBe('/modules/list')
      })

      it('should start with forward slash', () => {
        expect(MODULE_API_ROUTES.LIST).toMatch(/^\//)
      })

      it('should contain modules segment', () => {
        expect(MODULE_API_ROUTES.LIST).toContain('modules')
      })
    })

    it('should have exactly 1 property', () => {
      expect(Object.keys(MODULE_API_ROUTES)).toHaveLength(1)
    })

    it('should have all string values', () => {
      Object.values(MODULE_API_ROUTES).forEach(value => {
        expect(typeof value).toBe('string')
      })
    })
  })

  describe('ROLE_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(ROLE_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof ROLE_PAGE_ROUTES).toBe('object')
    })

    describe('HOME', () => {
      it('should be defined', () => {
        expect(ROLE_PAGE_ROUTES.HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_PAGE_ROUTES.HOME).toBe('/admin/role-management')
      })

      it('should start with /admin', () => {
        expect(ROLE_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
      })

      it('should contain role-management segment', () => {
        expect(ROLE_PAGE_ROUTES.HOME).toContain('role-management')
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(ROLE_PAGE_ROUTES.CREATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_PAGE_ROUTES.CREATE).toBe('/admin/role-management/create')
      })

      it('should start with base route', () => {
        expect(ROLE_PAGE_ROUTES.CREATE).toContain(ROLE_PAGE_ROUTES.HOME)
      })

      it('should end with /create', () => {
        expect(ROLE_PAGE_ROUTES.CREATE).toMatch(/\/create$/)
      })
    })

    describe('VIEW', () => {
      it('should be defined', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toBe('/admin/role-management/view/:id')
      })

      it('should start with base route', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toContain('/admin/role-management')
      })

      it('should contain view segment', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toContain('/view/')
      })

      it('should contain id parameter', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toContain(':id')
      })

      it('should end with :id', () => {
        expect(ROLE_PAGE_ROUTES.VIEW).toMatch(/:id$/)
      })
    })

    describe('EDIT', () => {
      it('should be defined', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toBe('/admin/role-management/edit/:id')
      })

      it('should start with base route', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toContain('/admin/role-management')
      })

      it('should contain edit segment', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toContain('/edit/')
      })

      it('should contain id parameter', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toContain(':id')
      })

      it('should end with :id', () => {
        expect(ROLE_PAGE_ROUTES.EDIT).toMatch(/:id$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(ROLE_PAGE_ROUTES).toHaveProperty('HOME')
        expect(ROLE_PAGE_ROUTES).toHaveProperty('CREATE')
        expect(ROLE_PAGE_ROUTES).toHaveProperty('VIEW')
        expect(ROLE_PAGE_ROUTES).toHaveProperty('EDIT')
      })

      it('should have exactly 4 properties', () => {
        expect(Object.keys(ROLE_PAGE_ROUTES)).toHaveLength(4)
      })

      it('should all start with /admin', () => {
        Object.values(ROLE_PAGE_ROUTES).forEach(route => {
          expect(route).toMatch(/^\/admin/)
        })
      })

      it('should all contain role-management segment', () => {
        Object.values(ROLE_PAGE_ROUTES).forEach(route => {
          expect(route).toContain('role-management')
        })
      })

      it('should follow consistent naming pattern', () => {
        /* All routes should use kebab-case */
        Object.values(ROLE_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z]+(-[a-z]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(ROLE_PAGE_ROUTES).forEach(route => {
          if (!route.includes(':id')) {
            expect(route).not.toMatch(/\/$/)
          }
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(ROLE_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(ROLE_PAGE_ROUTES).toBeDefined()
        expect(typeof ROLE_PAGE_ROUTES).toBe('object')
      })
    })

    describe('Dynamic Route Handling', () => {
      it('should allow id parameter replacement in EDIT route', () => {
        const testId = '123'
        const editRoute = ROLE_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toBe('/admin/role-management/edit/123')
      })

      it('should allow id parameter replacement in VIEW route', () => {
        const testId = '456'
        const viewRoute = ROLE_PAGE_ROUTES.VIEW.replace(':id', testId)
        expect(viewRoute).toBe('/admin/role-management/view/456')
      })

      it('should handle string IDs', () => {
        const testId = 'role-uuid-12345'
        const editRoute = ROLE_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toContain(testId)
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have different structures for API and page routes', () => {
      /* API routes use relative paths */
      expect(ROLE_API_ROUTES.BASE_URL).toMatch(/^\/[a-z]+/)
      /* Page routes use absolute paths with /admin prefix */
      expect(ROLE_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
    })

    it('should maintain semantic consistency', () => {
      /* Both should have LIST/HOME, CREATE, EDIT/UPDATE, DELETE/VIEW */
      expect(ROLE_API_ROUTES).toHaveProperty('LIST')
      expect(ROLE_API_ROUTES).toHaveProperty('CREATE')
      expect(ROLE_API_ROUTES).toHaveProperty('UPDATE')
      expect(ROLE_API_ROUTES).toHaveProperty('DELETE')

      expect(ROLE_PAGE_ROUTES).toHaveProperty('HOME')
      expect(ROLE_PAGE_ROUTES).toHaveProperty('CREATE')
      expect(ROLE_PAGE_ROUTES).toHaveProperty('EDIT')
      expect(ROLE_PAGE_ROUTES).toHaveProperty('VIEW')
    })

    it('should use consistent parameter naming', () => {
      /* Both should use :id for dynamic parameters */
      expect(ROLE_API_ROUTES.DETAILS).toContain(':id')
      expect(ROLE_PAGE_ROUTES.EDIT).toContain(':id')
      expect(ROLE_PAGE_ROUTES.VIEW).toContain(':id')
    })
  })
})
