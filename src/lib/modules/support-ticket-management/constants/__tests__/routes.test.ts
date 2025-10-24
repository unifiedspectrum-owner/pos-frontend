/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Support ticket management module imports */
import { SUPPORT_TICKET_MODULE_NAME, SUPPORT_TICKET_API_ROUTES, SUPPORT_TICKET_PAGE_ROUTES } from '@support-ticket-management/constants'

describe('Support Ticket Management Routes Constants', () => {
  describe('SUPPORT_TICKET_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(SUPPORT_TICKET_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(SUPPORT_TICKET_MODULE_NAME).toBe('support-ticket-management')
    })

    it('should be a string', () => {
      expect(typeof SUPPORT_TICKET_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(SUPPORT_TICKET_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(SUPPORT_TICKET_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('SUPPORT_TICKET_API_ROUTES', () => {
    it('should be defined', () => {
      expect(SUPPORT_TICKET_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof SUPPORT_TICKET_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(SUPPORT_TICKET_API_ROUTES).not.toBeNull()
    })

    describe('BASE_URL', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toBe('/support-tickets')
      })

      it('should start with forward slash', () => {
        expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toMatch(/^\//)
      })

      it('should not end with forward slash', () => {
        expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).not.toMatch(/\/$/)
      })

      it('should be a string', () => {
        expect(typeof SUPPORT_TICKET_API_ROUTES.BASE_URL).toBe('string')
      })
    })

    describe('LIST', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.LIST).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.LIST).toBe('/list')
      })

      it('should start with forward slash', () => {
        expect(SUPPORT_TICKET_API_ROUTES.LIST).toMatch(/^\//)
      })

      it('should be a valid path segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.LIST).toMatch(/^\/[a-z]+$/)
      })
    })

    describe('UPDATE_STATUS', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS).toBe('/:id/status')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS).toContain(':id')
      })

      it('should contain status segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE_STATUS).toContain('status')
      })
    })

    describe('ATTACHEMENT', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT).toBeDefined()
      })

      it('should be an object', () => {
        expect(typeof SUPPORT_TICKET_API_ROUTES.ATTACHEMENT).toBe('object')
      })

      describe('DOWNLOAD', () => {
        it('should be defined', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toBeDefined()
        })

        it('should have correct value', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toBe('/attachments/:id/download')
        })

        it('should contain id parameter', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toContain(':id')
        })

        it('should contain attachments segment', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toContain('attachments')
        })

        it('should contain download segment', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD).toContain('download')
        })
      })
    })

    describe('DETAILS', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toContain(':id')
      })

      it('should match dynamic route pattern', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toMatch(/^\/:[a-z]+$/)
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CREATE).toBeDefined()
      })

      it('should be empty string for POST to base URL', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CREATE).toBe('')
      })

      it('should be a string', () => {
        expect(typeof SUPPORT_TICKET_API_ROUTES.CREATE).toBe('string')
      })
    })

    describe('UPDATE', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toBe(SUPPORT_TICKET_API_ROUTES.DETAILS)
      })
    })

    describe('DELETE', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DELETE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DELETE).toBe('/:id')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DELETE).toContain(':id')
      })

      it('should match same pattern as DETAILS', () => {
        expect(SUPPORT_TICKET_API_ROUTES.DELETE).toBe(SUPPORT_TICKET_API_ROUTES.DETAILS)
      })
    })

    describe('ASSIGNMENT', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT).toBeDefined()
      })

      it('should be an object', () => {
        expect(typeof SUPPORT_TICKET_API_ROUTES.ASSIGNMENT).toBe('object')
      })

      describe('CREATE', () => {
        it('should be defined', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE).toBeDefined()
        })

        it('should have correct value', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE).toBe('/:id/assign')
        })

        it('should contain id parameter', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE).toContain(':id')
        })

        it('should contain assign segment', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.CREATE).toContain('assign')
        })
      })

      describe('GET', () => {
        it('should be defined', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET).toBeDefined()
        })

        it('should have correct value', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET).toBe('/:id/assignment')
        })

        it('should contain id parameter', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET).toContain(':id')
        })

        it('should contain assignment segment', () => {
          expect(SUPPORT_TICKET_API_ROUTES.ASSIGNMENT.GET).toContain('assignment')
        })
      })
    })

    describe('ADD_COMMENT', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT).toBe('/:id/communications')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT).toContain(':id')
      })

      it('should contain communications segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT).toContain('communications')
      })
    })

    describe('GET_COMMENTS', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS).toBe('/:id/communications')
      })

      it('should match ADD_COMMENT route', () => {
        expect(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS).toBe(SUPPORT_TICKET_API_ROUTES.ADD_COMMENT)
      })

      it('should contain communications segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.GET_COMMENTS).toContain('communications')
      })
    })

    describe('CATEGORIES', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CATEGORIES).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CATEGORIES).toBe('/categories')
      })

      it('should start with forward slash', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CATEGORIES).toMatch(/^\//)
      })

      it('should contain categories segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.CATEGORIES).toContain('categories')
      })
    })

    describe('STATISTICS', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_API_ROUTES.STATISTICS).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_API_ROUTES.STATISTICS).toBe('/statistics')
      })

      it('should start with forward slash', () => {
        expect(SUPPORT_TICKET_API_ROUTES.STATISTICS).toMatch(/^\//)
      })

      it('should contain statistics segment', () => {
        expect(SUPPORT_TICKET_API_ROUTES.STATISTICS).toContain('statistics')
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('BASE_URL')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('LIST')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('UPDATE_STATUS')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ATTACHEMENT')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('DETAILS')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('CREATE')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('UPDATE')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('DELETE')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ASSIGNMENT')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('ADD_COMMENT')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('GET_COMMENTS')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('CATEGORIES')
        expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('STATISTICS')
      })

      it('should use RESTful conventions', () => {
        /* LIST for getting collection */
        expect(SUPPORT_TICKET_API_ROUTES.LIST).toBeTruthy()
        /* Empty string for CREATE (POST to base) */
        expect(SUPPORT_TICKET_API_ROUTES.CREATE).toBe('')
        /* :id parameter for resource operations */
        expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toContain(':id')
        expect(SUPPORT_TICKET_API_ROUTES.UPDATE).toContain(':id')
        expect(SUPPORT_TICKET_API_ROUTES.DELETE).toContain(':id')
      })

      it('should have string or object values', () => {
        Object.values(SUPPORT_TICKET_API_ROUTES).forEach(value => {
          expect(['string', 'object']).toContain(typeof value)
        })
      })
    })

    describe('Type Safety', () => {
      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(SUPPORT_TICKET_API_ROUTES).toBeDefined()
        expect(typeof SUPPORT_TICKET_API_ROUTES).toBe('object')
      })
    })
  })

  describe('SUPPORT_TICKET_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(SUPPORT_TICKET_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof SUPPORT_TICKET_PAGE_ROUTES).toBe('object')
    })

    describe('HOME', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.HOME).toBe('/admin/support-ticket-management')
      })

      it('should start with /admin', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
      })

      it('should contain support-ticket-management segment', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.HOME).toContain('support-ticket-management')
      })
    })

    describe('CREATE', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.CREATE).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.CREATE).toBe('/admin/support-ticket-management/create')
      })

      it('should start with base route', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.CREATE).toContain(SUPPORT_TICKET_PAGE_ROUTES.HOME)
      })

      it('should end with /create', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.CREATE).toMatch(/\/create$/)
      })
    })

    describe('VIEW', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toBe('/admin/support-ticket-management/view/:id')
      })

      it('should start with base route', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toContain('/admin/support-ticket-management')
      })

      it('should contain view segment', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toContain('/view/')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toContain(':id')
      })

      it('should end with :id', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toMatch(/:id$/)
      })
    })

    describe('EDIT', () => {
      it('should be defined', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toBe('/admin/support-ticket-management/edit/:id')
      })

      it('should start with base route', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toContain('/admin/support-ticket-management')
      })

      it('should contain edit segment', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toContain('/edit/')
      })

      it('should contain id parameter', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toContain(':id')
      })

      it('should end with :id', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toMatch(/:id$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('HOME')
        expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('CREATE')
        expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('VIEW')
        expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('EDIT')
      })

      it('should have exactly 4 properties', () => {
        expect(Object.keys(SUPPORT_TICKET_PAGE_ROUTES)).toHaveLength(4)
      })

      it('should all start with /admin', () => {
        Object.values(SUPPORT_TICKET_PAGE_ROUTES).forEach(route => {
          expect(route).toMatch(/^\/admin/)
        })
      })

      it('should all contain support-ticket-management segment', () => {
        Object.values(SUPPORT_TICKET_PAGE_ROUTES).forEach(route => {
          expect(route).toContain('support-ticket-management')
        })
      })

      it('should follow consistent naming pattern', () => {
        /* All routes should use kebab-case */
        Object.values(SUPPORT_TICKET_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z]+(-[a-z]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(SUPPORT_TICKET_PAGE_ROUTES).forEach(route => {
          if (!route.includes(':id')) {
            expect(route).not.toMatch(/\/$/)
          }
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(SUPPORT_TICKET_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        /* TypeScript enforces readonly at compile time with 'as const' */
        expect(SUPPORT_TICKET_PAGE_ROUTES).toBeDefined()
        expect(typeof SUPPORT_TICKET_PAGE_ROUTES).toBe('object')
      })
    })

    describe('Dynamic Route Handling', () => {
      it('should allow id parameter replacement in EDIT route', () => {
        const testId = '123'
        const editRoute = SUPPORT_TICKET_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toBe('/admin/support-ticket-management/edit/123')
      })

      it('should allow id parameter replacement in VIEW route', () => {
        const testId = '456'
        const viewRoute = SUPPORT_TICKET_PAGE_ROUTES.VIEW.replace(':id', testId)
        expect(viewRoute).toBe('/admin/support-ticket-management/view/456')
      })

      it('should handle string IDs', () => {
        const testId = 'ticket-uuid-12345'
        const editRoute = SUPPORT_TICKET_PAGE_ROUTES.EDIT.replace(':id', testId)
        expect(editRoute).toContain(testId)
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have different structures for API and page routes', () => {
      /* API routes use relative paths */
      expect(SUPPORT_TICKET_API_ROUTES.BASE_URL).toMatch(/^\/[a-z]/)
      /* Page routes use absolute paths with /admin prefix */
      expect(SUPPORT_TICKET_PAGE_ROUTES.HOME).toMatch(/^\/admin/)
    })

    it('should maintain semantic consistency', () => {
      /* Both should have LIST/HOME, CREATE, EDIT/UPDATE, DELETE/VIEW */
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('LIST')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('CREATE')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('UPDATE')
      expect(SUPPORT_TICKET_API_ROUTES).toHaveProperty('DELETE')

      expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('HOME')
      expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('CREATE')
      expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('EDIT')
      expect(SUPPORT_TICKET_PAGE_ROUTES).toHaveProperty('VIEW')
    })

    it('should use consistent parameter naming', () => {
      /* Both should use :id for dynamic parameters */
      expect(SUPPORT_TICKET_API_ROUTES.DETAILS).toContain(':id')
      expect(SUPPORT_TICKET_PAGE_ROUTES.EDIT).toContain(':id')
      expect(SUPPORT_TICKET_PAGE_ROUTES.VIEW).toContain(':id')
    })
  })
})
