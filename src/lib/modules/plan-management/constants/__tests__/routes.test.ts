/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Plan management module imports */
import { PLAN_MODULE_NAME, PLAN_API_ROUTES, PLAN_PAGE_ROUTES } from '@plan-management/constants/routes'

describe('Plan Management Routes Constants', () => {
  describe('PLAN_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(PLAN_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(PLAN_MODULE_NAME).toBe('plan-management')
    })

    it('should be a string', () => {
      expect(typeof PLAN_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(PLAN_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(PLAN_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('PLAN_API_ROUTES', () => {
    it('should be defined', () => {
      expect(PLAN_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(PLAN_API_ROUTES).not.toBeNull()
    })

    describe('BASE_URL', () => {
      it('should be defined', () => {
        expect(PLAN_API_ROUTES.BASE_URL).toBeDefined()
      })

      it('should have correct value', () => {
        expect(PLAN_API_ROUTES.BASE_URL).toBe('/plans')
      })

      it('should start with forward slash', () => {
        expect(PLAN_API_ROUTES.BASE_URL).toMatch(/^\//)
      })

      it('should not end with forward slash', () => {
        expect(PLAN_API_ROUTES.BASE_URL).not.toMatch(/\/$/)
      })

      it('should be a string', () => {
        expect(typeof PLAN_API_ROUTES.BASE_URL).toBe('string')
      })
    })

    describe('PLAN Routes', () => {
      it('should have PLAN object', () => {
        expect(PLAN_API_ROUTES).toHaveProperty('PLAN')
        expect(typeof PLAN_API_ROUTES.PLAN).toBe('object')
      })

      it('should have CREATE route', () => {
        expect(PLAN_API_ROUTES.PLAN).toHaveProperty('CREATE')
        expect(PLAN_API_ROUTES.PLAN.CREATE).toBe('')
      })

      it('should have LIST route', () => {
        expect(PLAN_API_ROUTES.PLAN).toHaveProperty('LIST')
        expect(PLAN_API_ROUTES.PLAN.LIST).toBe('')
      })

      it('should have DETAILS route', () => {
        expect(PLAN_API_ROUTES.PLAN).toHaveProperty('DETAILS')
        expect(PLAN_API_ROUTES.PLAN.DETAILS).toBe('/:id')
        expect(PLAN_API_ROUTES.PLAN.DETAILS).toContain(':id')
      })

      it('should have UPDATE route', () => {
        expect(PLAN_API_ROUTES.PLAN).toHaveProperty('UPDATE')
        expect(PLAN_API_ROUTES.PLAN.UPDATE).toBe('/:id')
        expect(PLAN_API_ROUTES.PLAN.UPDATE).toContain(':id')
      })

      it('should have DELETE route', () => {
        expect(PLAN_API_ROUTES.PLAN).toHaveProperty('DELETE')
        expect(PLAN_API_ROUTES.PLAN.DELETE).toBe('/:id')
        expect(PLAN_API_ROUTES.PLAN.DELETE).toContain(':id')
      })

      it('should have exactly 5 properties', () => {
        expect(Object.keys(PLAN_API_ROUTES.PLAN)).toHaveLength(5)
      })
    })

    describe('FEATURE Routes', () => {
      it('should have FEATURE object', () => {
        expect(PLAN_API_ROUTES).toHaveProperty('FEATURE')
        expect(typeof PLAN_API_ROUTES.FEATURE).toBe('object')
      })

      it('should have CREATE route', () => {
        expect(PLAN_API_ROUTES.FEATURE).toHaveProperty('CREATE')
        expect(PLAN_API_ROUTES.FEATURE.CREATE).toBe('/features')
      })

      it('should have LIST route', () => {
        expect(PLAN_API_ROUTES.FEATURE).toHaveProperty('LIST')
        expect(PLAN_API_ROUTES.FEATURE.LIST).toBe('/features')
      })

      it('should have exactly 2 properties', () => {
        expect(Object.keys(PLAN_API_ROUTES.FEATURE)).toHaveLength(2)
      })
    })

    describe('ADD_ON Routes', () => {
      it('should have ADD_ON object', () => {
        expect(PLAN_API_ROUTES).toHaveProperty('ADD_ON')
        expect(typeof PLAN_API_ROUTES.ADD_ON).toBe('object')
      })

      it('should have CREATE route', () => {
        expect(PLAN_API_ROUTES.ADD_ON).toHaveProperty('CREATE')
        expect(PLAN_API_ROUTES.ADD_ON.CREATE).toBe('/add-ons')
      })

      it('should have LIST route', () => {
        expect(PLAN_API_ROUTES.ADD_ON).toHaveProperty('LIST')
        expect(PLAN_API_ROUTES.ADD_ON.LIST).toBe('/add-ons')
      })

      it('should have exactly 2 properties', () => {
        expect(Object.keys(PLAN_API_ROUTES.ADD_ON)).toHaveLength(2)
      })
    })

    describe('SLA Routes', () => {
      it('should have SLA object', () => {
        expect(PLAN_API_ROUTES).toHaveProperty('SLA')
        expect(typeof PLAN_API_ROUTES.SLA).toBe('object')
      })

      it('should have CREATE route', () => {
        expect(PLAN_API_ROUTES.SLA).toHaveProperty('CREATE')
        expect(PLAN_API_ROUTES.SLA.CREATE).toBe('/sla')
      })

      it('should have LIST route', () => {
        expect(PLAN_API_ROUTES.SLA).toHaveProperty('LIST')
        expect(PLAN_API_ROUTES.SLA.LIST).toBe('/sla')
      })

      it('should have exactly 2 properties', () => {
        expect(Object.keys(PLAN_API_ROUTES.SLA)).toHaveLength(2)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required top-level properties', () => {
        expect(PLAN_API_ROUTES).toHaveProperty('BASE_URL')
        expect(PLAN_API_ROUTES).toHaveProperty('PLAN')
        expect(PLAN_API_ROUTES).toHaveProperty('FEATURE')
        expect(PLAN_API_ROUTES).toHaveProperty('ADD_ON')
        expect(PLAN_API_ROUTES).toHaveProperty('SLA')
      })

      it('should use RESTful conventions for PLAN routes', () => {
        /* Empty string for CREATE/LIST (POST/GET to base) */
        expect(PLAN_API_ROUTES.PLAN.CREATE).toBe('')
        expect(PLAN_API_ROUTES.PLAN.LIST).toBe('')
        /* :id parameter for resource operations */
        expect(PLAN_API_ROUTES.PLAN.DETAILS).toContain(':id')
        expect(PLAN_API_ROUTES.PLAN.UPDATE).toContain(':id')
        expect(PLAN_API_ROUTES.PLAN.DELETE).toContain(':id')
      })

      it('should use consistent paths for resource endpoints', () => {
        /* Features should use /features */
        expect(PLAN_API_ROUTES.FEATURE.CREATE).toContain('features')
        expect(PLAN_API_ROUTES.FEATURE.LIST).toContain('features')
        /* Add-ons should use /add-ons */
        expect(PLAN_API_ROUTES.ADD_ON.CREATE).toContain('add-ons')
        expect(PLAN_API_ROUTES.ADD_ON.LIST).toContain('add-ons')
        /* SLA should use /sla */
        expect(PLAN_API_ROUTES.SLA.CREATE).toContain('sla')
        expect(PLAN_API_ROUTES.SLA.LIST).toContain('sla')
      })
    })

    describe('Type Safety', () => {
      it('should have all string values in nested objects', () => {
        Object.values(PLAN_API_ROUTES.PLAN).forEach(value => {
          expect(typeof value).toBe('string')
        })
        Object.values(PLAN_API_ROUTES.FEATURE).forEach(value => {
          expect(typeof value).toBe('string')
        })
        Object.values(PLAN_API_ROUTES.ADD_ON).forEach(value => {
          expect(typeof value).toBe('string')
        })
        Object.values(PLAN_API_ROUTES.SLA).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(PLAN_API_ROUTES).toBeDefined()
        expect(typeof PLAN_API_ROUTES).toBe('object')
      })
    })
  })

  describe('PLAN_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(PLAN_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof PLAN_PAGE_ROUTES).toBe('object')
    })

    describe('HOME', () => {
      it('should be defined', () => {
        expect(PLAN_PAGE_ROUTES.HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(PLAN_PAGE_ROUTES.HOME).toBe('/admin/plan-management')
      })

      it('should start with /admin', () => {
        expect(PLAN_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
      })

      it('should contain plan-management segment', () => {
        expect(PLAN_PAGE_ROUTES.HOME).toContain('plan-management')
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(PLAN_PAGE_ROUTES.CREATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(PLAN_PAGE_ROUTES.CREATE).toBe('/admin/plan-management/create')
      })

      it('should start with base route', () => {
        expect(PLAN_PAGE_ROUTES.CREATE).toContain(PLAN_PAGE_ROUTES.HOME)
      })

      it('should end with /create', () => {
        expect(PLAN_PAGE_ROUTES.CREATE).toMatch(/\/create$/)
      })
    })

    describe('VIEW', () => {
      it('should be defined', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toBeDefined()
      })

      it('should have correct value', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toBe('/admin/plan-management/view/:id')
      })

      it('should start with base route', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toContain('/admin/plan-management')
      })

      it('should contain view segment', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toContain('/view/')
      })

      it('should contain id parameter', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toContain(':id')
      })

      it('should end with :id', () => {
        expect(PLAN_PAGE_ROUTES.VIEW).toMatch(/:id$/)
      })
    })

    describe('EDIT', () => {
      it('should be defined', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toBe('/admin/plan-management/edit/:id')
      })

      it('should start with base route', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toContain('/admin/plan-management')
      })

      it('should contain edit segment', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toContain('/edit/')
      })

      it('should contain id parameter', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toContain(':id')
      })

      it('should end with :id', () => {
        expect(PLAN_PAGE_ROUTES.EDIT).toMatch(/:id$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(PLAN_PAGE_ROUTES).toHaveProperty('HOME')
        expect(PLAN_PAGE_ROUTES).toHaveProperty('CREATE')
        expect(PLAN_PAGE_ROUTES).toHaveProperty('VIEW')
        expect(PLAN_PAGE_ROUTES).toHaveProperty('EDIT')
      })

      it('should have exactly 4 properties', () => {
        expect(Object.keys(PLAN_PAGE_ROUTES)).toHaveLength(4)
      })

      it('should all start with /admin', () => {
        Object.values(PLAN_PAGE_ROUTES).forEach(route => {
          expect(route).toMatch(/^\/admin/)
        })
      })

      it('should all contain plan-management segment', () => {
        Object.values(PLAN_PAGE_ROUTES).forEach(route => {
          expect(route).toContain('plan-management')
        })
      })

      it('should follow consistent naming pattern', () => {
        /* All routes should use kebab-case */
        Object.values(PLAN_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z]+(-[a-z]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(PLAN_PAGE_ROUTES).forEach(route => {
          if (!route.includes(':id')) {
            expect(route).not.toMatch(/\/$/)
          }
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(PLAN_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(PLAN_PAGE_ROUTES).toBeDefined()
        expect(typeof PLAN_PAGE_ROUTES).toBe('object')
      })
    })

    describe('Dynamic Route Handling', () => {
      it('should allow id parameter replacement in EDIT route', () => {
        const testId = '123'
        const editRoute = PLAN_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toBe('/admin/plan-management/edit/123')
      })

      it('should allow id parameter replacement in VIEW route', () => {
        const testId = '456'
        const viewRoute = PLAN_PAGE_ROUTES.VIEW.replace(':id', testId)
        expect(viewRoute).toBe('/admin/plan-management/view/456')
      })

      it('should handle string IDs', () => {
        const testId = 'plan-uuid-12345'
        const editRoute = PLAN_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toContain(testId)
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have different structures for API and page routes', () => {
      /* API routes use relative paths */
      expect(PLAN_API_ROUTES.BASE_URL).toMatch(/^\/[a-z]+/)
      /* Page routes use absolute paths with /admin prefix */
      expect(PLAN_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
    })

    it('should maintain semantic consistency', () => {
      /* API routes should have PLAN, FEATURE, ADD_ON, SLA */
      expect(PLAN_API_ROUTES).toHaveProperty('PLAN')
      expect(PLAN_API_ROUTES).toHaveProperty('FEATURE')
      expect(PLAN_API_ROUTES).toHaveProperty('ADD_ON')
      expect(PLAN_API_ROUTES).toHaveProperty('SLA')

      /* Page routes should have HOME, CREATE, EDIT, VIEW */
      expect(PLAN_PAGE_ROUTES).toHaveProperty('HOME')
      expect(PLAN_PAGE_ROUTES).toHaveProperty('CREATE')
      expect(PLAN_PAGE_ROUTES).toHaveProperty('EDIT')
      expect(PLAN_PAGE_ROUTES).toHaveProperty('VIEW')
    })

    it('should use consistent parameter naming', () => {
      /* Both should use :id for dynamic parameters */
      expect(PLAN_API_ROUTES.PLAN.DETAILS).toContain(':id')
      expect(PLAN_PAGE_ROUTES.EDIT).toContain(':id')
      expect(PLAN_PAGE_ROUTES.VIEW).toContain(':id')
    })
  })
})
