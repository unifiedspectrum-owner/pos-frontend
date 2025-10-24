/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* User management module imports */
import { USER_MODULE_NAME, USER_API_ROUTES, USER_PAGE_ROUTES } from '@user-management/constants'

describe('User Management Routes Constants', () => {
  describe('USER_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(USER_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(USER_MODULE_NAME).toBe('user-management')
    })

    it('should be a string', () => {
      expect(typeof USER_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(USER_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(USER_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('USER_API_ROUTES', () => {
    it('should be defined', () => {
      expect(USER_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof USER_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(USER_API_ROUTES).not.toBeNull()
    })

    describe('BASE_URL', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.BASE_URL).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.BASE_URL).toBe('/users')
      })

      it('should start with forward slash', () => {
        expect(USER_API_ROUTES.BASE_URL).toMatch(/^\//)
      })

      it('should not end with forward slash', () => {
        expect(USER_API_ROUTES.BASE_URL).not.toMatch(/\/$/)
      })

      it('should be a string', () => {
        expect(typeof USER_API_ROUTES.BASE_URL).toBe('string')
      })
    })

    describe('LIST', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.LIST).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.LIST).toBe('/list')
      })

      it('should start with forward slash', () => {
        expect(USER_API_ROUTES.LIST).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(USER_API_ROUTES.LIST).toMatch(/^\/[a-z]+$/)
      })
    })

    describe('DETAILS', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.DETAILS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.DETAILS).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(USER_API_ROUTES.DETAILS).toContain(':id')
      })

      it('should match dynamic route pattern', () => {
        expect(USER_API_ROUTES.DETAILS).toMatch(/^\/:[a-z]+$/)
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.CREATE).toBeDefined()
      })

      it('should be empty string for POST to base URL', () => {
        expect(USER_API_ROUTES.CREATE).toBe('')
      })

      it('should be a string', () => {
        expect(typeof USER_API_ROUTES.CREATE).toBe('string')
      })
    })

    describe('UPDATE', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.UPDATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.UPDATE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(USER_API_ROUTES.UPDATE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(USER_API_ROUTES.UPDATE).toBe(USER_API_ROUTES.DETAILS)
      })
    })

    describe('DELETE', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.DELETE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.DELETE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(USER_API_ROUTES.DELETE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(USER_API_ROUTES.DELETE).toBe(USER_API_ROUTES.DETAILS)
      })
    })

    describe('PERMISSIONS_SUMMARY', () => {
      it('should be defined', () => {
        expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toBe('/permissions/summary')
      })

      it('should start with forward slash', () => {
        expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toMatch(/^\//)
      })

      it('should contain permissions segment', () => {
        expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toContain('permissions')
      })

      it('should contain summary segment', () => {
        expect(USER_API_ROUTES.PERMISSIONS_SUMMARY).toContain('summary')
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(USER_API_ROUTES).toHaveProperty('BASE_URL')
        expect(USER_API_ROUTES).toHaveProperty('LIST')
        expect(USER_API_ROUTES).toHaveProperty('DETAILS')
        expect(USER_API_ROUTES).toHaveProperty('CREATE')
        expect(USER_API_ROUTES).toHaveProperty('UPDATE')
        expect(USER_API_ROUTES).toHaveProperty('DELETE')
        expect(USER_API_ROUTES).toHaveProperty('PERMISSIONS_SUMMARY')
      })

      it('should have exactly 7 properties', () => {
        expect(Object.keys(USER_API_ROUTES)).toHaveLength(7)
      })

      it('should use RESTful conventions', () => {
        /* LIST for getting collection */
        expect(USER_API_ROUTES.LIST).toBeTruthy()
        /* Empty string for CREATE (POST to base) */
        expect(USER_API_ROUTES.CREATE).toBe('')
        /* :id parameter for resource operations */
        expect(USER_API_ROUTES.DETAILS).toContain(':id')
        expect(USER_API_ROUTES.UPDATE).toContain(':id')
        expect(USER_API_ROUTES.DELETE).toContain(':id')
      })

      it('should not have duplicate values except for CRUD operations', () => {
        const values = Object.values(USER_API_ROUTES)
        const uniqueValues = new Set(values)
        /* DETAILS, UPDATE, DELETE should be the same */
        expect(values.length).toBe(7)
        expect(uniqueValues.size).toBeLessThan(7)
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(USER_API_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(USER_API_ROUTES).toBeDefined()
        expect(typeof USER_API_ROUTES).toBe('object')
      })
    })
  })

  describe('USER_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(USER_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof USER_PAGE_ROUTES).toBe('object')
    })

    describe('HOME', () => {
      it('should be defined', () => {
        expect(USER_PAGE_ROUTES.HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_PAGE_ROUTES.HOME).toBe('/admin/user-management')
      })

      it('should start with /admin', () => {
        expect(USER_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
      })

      it('should contain user-management segment', () => {
        expect(USER_PAGE_ROUTES.HOME).toContain('user-management')
      })
    })

    describe('LIST', () => {
      it('should be defined', () => {
        expect(USER_PAGE_ROUTES.LIST).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_PAGE_ROUTES.LIST).toBe('/admin/user-management')
      })

      it('should match HOME route', () => {
        expect(USER_PAGE_ROUTES.LIST).toBe(USER_PAGE_ROUTES.HOME)
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(USER_PAGE_ROUTES.CREATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_PAGE_ROUTES.CREATE).toBe('/admin/user-management/create')
      })

      it('should start with base route', () => {
        expect(USER_PAGE_ROUTES.CREATE).toContain(USER_PAGE_ROUTES.HOME)
      })

      it('should end with /create', () => {
        expect(USER_PAGE_ROUTES.CREATE).toMatch(/\/create$/)
      })
    })

    describe('EDIT', () => {
      it('should be defined', () => {
        expect(USER_PAGE_ROUTES.EDIT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_PAGE_ROUTES.EDIT).toBe('/admin/user-management/edit/:id')
      })

      it('should start with base route', () => {
        expect(USER_PAGE_ROUTES.EDIT).toContain('/admin/user-management')
      })

      it('should contain edit segment', () => {
        expect(USER_PAGE_ROUTES.EDIT).toContain('/edit/')
      })

      it('should contain id parameter', () => {
        expect(USER_PAGE_ROUTES.EDIT).toContain(':id')
      })

      it('should end with :id', () => {
        expect(USER_PAGE_ROUTES.EDIT).toMatch(/:id$/)
      })
    })

    describe('VIEW', () => {
      it('should be defined', () => {
        expect(USER_PAGE_ROUTES.VIEW).toBeDefined()
      })

      it('should have correct value', () => {
        expect(USER_PAGE_ROUTES.VIEW).toBe('/admin/user-management/view/:id')
      })

      it('should start with base route', () => {
        expect(USER_PAGE_ROUTES.VIEW).toContain('/admin/user-management')
      })

      it('should contain view segment', () => {
        expect(USER_PAGE_ROUTES.VIEW).toContain('/view/')
      })

      it('should contain id parameter', () => {
        expect(USER_PAGE_ROUTES.VIEW).toContain(':id')
      })

      it('should end with :id', () => {
        expect(USER_PAGE_ROUTES.VIEW).toMatch(/:id$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(USER_PAGE_ROUTES).toHaveProperty('HOME')
        expect(USER_PAGE_ROUTES).toHaveProperty('LIST')
        expect(USER_PAGE_ROUTES).toHaveProperty('CREATE')
        expect(USER_PAGE_ROUTES).toHaveProperty('EDIT')
        expect(USER_PAGE_ROUTES).toHaveProperty('VIEW')
      })

      it('should have exactly 5 properties', () => {
        expect(Object.keys(USER_PAGE_ROUTES)).toHaveLength(5)
      })

      it('should all start with /admin', () => {
        Object.values(USER_PAGE_ROUTES).forEach(route => {
          expect(route).toMatch(/^\/admin/)
        })
      })

      it('should all contain user-management segment', () => {
        Object.values(USER_PAGE_ROUTES).forEach(route => {
          expect(route).toContain('user-management')
        })
      })

      it('should follow consistent naming pattern', () => {
        /* All routes should use kebab-case */
        Object.values(USER_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z]+(-[a-z]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(USER_PAGE_ROUTES).forEach(route => {
          if (!route.includes(':id')) {
            expect(route).not.toMatch(/\/$/)
          }
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(USER_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(USER_PAGE_ROUTES).toBeDefined()
        expect(typeof USER_PAGE_ROUTES).toBe('object')
      })
    })

    describe('Dynamic Route Handling', () => {
      it('should allow id parameter replacement in EDIT route', () => {
        const testId = '123'
        const editRoute = USER_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toBe('/admin/user-management/edit/123')
      })

      it('should allow id parameter replacement in VIEW route', () => {
        const testId = '456'
        const viewRoute = USER_PAGE_ROUTES.VIEW.replace(':id', testId)
        expect(viewRoute).toBe('/admin/user-management/view/456')
      })

      it('should handle string IDs', () => {
        const testId = 'user-uuid-12345'
        const editRoute = USER_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toContain(testId)
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have different structures for API and page routes', () => {
      /* API routes use relative paths */
      expect(USER_API_ROUTES.BASE_URL).toMatch(/^\/[a-z]+$/)
      /* Page routes use absolute paths with /admin prefix */
      expect(USER_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
    })

    it('should maintain semantic consistency', () => {
      /* Both should have LIST, CREATE, EDIT/UPDATE, DELETE/VIEW */
      expect(USER_API_ROUTES).toHaveProperty('LIST')
      expect(USER_API_ROUTES).toHaveProperty('CREATE')
      expect(USER_API_ROUTES).toHaveProperty('UPDATE')
      expect(USER_API_ROUTES).toHaveProperty('DELETE')

      expect(USER_PAGE_ROUTES).toHaveProperty('LIST')
      expect(USER_PAGE_ROUTES).toHaveProperty('CREATE')
      expect(USER_PAGE_ROUTES).toHaveProperty('EDIT')
      expect(USER_PAGE_ROUTES).toHaveProperty('VIEW')
    })

    it('should use consistent parameter naming', () => {
      /* Both should use :id for dynamic parameters */
      expect(USER_API_ROUTES.DETAILS).toContain(':id')
      expect(USER_PAGE_ROUTES.EDIT).toContain(':id')
      expect(USER_PAGE_ROUTES.VIEW).toContain(':id')
    })
  })
})
