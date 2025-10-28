/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Tenant management module imports */
import { TENANT_MODULE_NAME, TENANT_API_ROUTES, TENANT_PAGE_ROUTES } from '../routes'

describe('Routes Constants', () => {
  describe('TENANT_MODULE_NAME', () => {
    it('is set to tenant-management', () => {
      expect(TENANT_MODULE_NAME).toBe('tenant-management')
    })

    it('is a string', () => {
      expect(typeof TENANT_MODULE_NAME).toBe('string')
    })

    it('follows kebab-case naming convention', () => {
      expect(TENANT_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('TENANT_API_ROUTES', () => {
    it('has BASE_URL', () => {
      expect(TENANT_API_ROUTES.BASE_URL).toBe('/tenants')
    })

    it('has LIST route', () => {
      expect(TENANT_API_ROUTES.LIST).toBe('/list')
    })

    it('has LIST_WITH_BASIC_DETAILS route', () => {
      expect(TENANT_API_ROUTES.LIST_WITH_BASIC_DETAILS).toBe('/list/basic')
    })

    it('has DETAILS route with id parameter', () => {
      expect(TENANT_API_ROUTES.DETAILS).toBe('/details/:id')
    })

    describe('PROVISION routes', () => {
      it('has START route', () => {
        expect(TENANT_API_ROUTES.PROVISION.START).toBe('/:id/provision')
      })

      it('START route contains id parameter', () => {
        expect(TENANT_API_ROUTES.PROVISION.START).toContain(':id')
      })
    })

    describe('ACCOUNT routes', () => {
      it('has CREATE route', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.CREATE).toBe('/account/create')
      })

      it('has REQUEST_OTP route', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.REQUEST_OTP).toBe('/account/request-otp')
      })

      it('has VERIFY_OTP route', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.VERIFY_OTP).toBe('/account/verify-otp')
      })

      it('has STATUS route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.STATUS).toBe('/:id/status')
      })

      it('has ASSIGN_PLAN route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN).toBe('/:id/plan')
      })

      it('has GET_ASSIGNED_PLAN route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN).toBe('/:id/plan')
      })

      it('all parameterized routes contain :id', () => {
        expect(TENANT_API_ROUTES.ACCOUNT.STATUS).toContain(':id')
        expect(TENANT_API_ROUTES.ACCOUNT.ASSIGN_PLAN).toContain(':id')
        expect(TENANT_API_ROUTES.ACCOUNT.GET_ASSIGNED_PLAN).toContain(':id')
      })
    })

    describe('PAYMENT routes', () => {
      it('has INITIATE route', () => {
        expect(TENANT_API_ROUTES.PAYMENT.INITIATE).toBe('/account/payment/initiate')
      })

      it('has STATUS route', () => {
        expect(TENANT_API_ROUTES.PAYMENT.STATUS).toBe('/account/payment/status')
      })

      it('has COMPLETE route', () => {
        expect(TENANT_API_ROUTES.PAYMENT.COMPLETE).toBe('/account/payment/complete')
      })

      it('all payment routes start with /account/payment', () => {
        expect(TENANT_API_ROUTES.PAYMENT.INITIATE.startsWith('/account/payment')).toBe(true)
        expect(TENANT_API_ROUTES.PAYMENT.STATUS.startsWith('/account/payment')).toBe(true)
        expect(TENANT_API_ROUTES.PAYMENT.COMPLETE.startsWith('/account/payment')).toBe(true)
      })
    })

    describe('ACTIONS routes', () => {
      it('has SUSPEND route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACTIONS.SUSPEND).toBe('/:id/suspend')
      })

      it('has ACTIVATE route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACTIONS.ACTIVATE).toBe('/:id/activate')
      })

      it('has HOLD route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACTIONS.HOLD).toBe('/:id/hold')
      })

      it('has DELETE route with id parameter', () => {
        expect(TENANT_API_ROUTES.ACTIONS.DELETE).toBe('/:id')
      })

      it('all action routes contain :id parameter', () => {
        expect(TENANT_API_ROUTES.ACTIONS.SUSPEND).toContain(':id')
        expect(TENANT_API_ROUTES.ACTIONS.ACTIVATE).toContain(':id')
        expect(TENANT_API_ROUTES.ACTIONS.HOLD).toContain(':id')
        expect(TENANT_API_ROUTES.ACTIONS.DELETE).toContain(':id')
      })
    })
  })

  describe('TENANT_PAGE_ROUTES', () => {
    it('has HOME route', () => {
      expect(TENANT_PAGE_ROUTES.HOME).toBe('/admin/tenant-management')
    })

    it('has CREATE route', () => {
      expect(TENANT_PAGE_ROUTES.CREATE).toBe('/admin/tenant-management/create')
    })

    it('has EDIT route with id parameter', () => {
      expect(TENANT_PAGE_ROUTES.EDIT).toBe('/admin/tenant-management/edit/:id')
    })

    it('has VIEW route with id parameter', () => {
      expect(TENANT_PAGE_ROUTES.VIEW).toBe('/admin/tenant-management/view/:id')
    })

    it('all routes start with /admin/tenant-management', () => {
      expect(TENANT_PAGE_ROUTES.HOME.startsWith('/admin/tenant-management')).toBe(true)
      expect(TENANT_PAGE_ROUTES.CREATE.startsWith('/admin/tenant-management')).toBe(true)
      expect(TENANT_PAGE_ROUTES.EDIT.startsWith('/admin/tenant-management')).toBe(true)
      expect(TENANT_PAGE_ROUTES.VIEW.startsWith('/admin/tenant-management')).toBe(true)
    })

    it('parameterized routes contain :id', () => {
      expect(TENANT_PAGE_ROUTES.EDIT).toContain(':id')
      expect(TENANT_PAGE_ROUTES.VIEW).toContain(':id')
    })

    it('has exactly 4 page routes', () => {
      const keys = Object.keys(TENANT_PAGE_ROUTES)
      expect(keys).toHaveLength(4)
    })
  })

  describe('Route Structure Validation', () => {
    it('API routes use valid URL path format', () => {
      const urlPattern = /^\/[a-z0-9/:_-]*$/i

      expect(TENANT_API_ROUTES.BASE_URL).toMatch(urlPattern)
      expect(TENANT_API_ROUTES.LIST).toMatch(urlPattern)
      expect(TENANT_API_ROUTES.DETAILS).toMatch(urlPattern)
    })

    it('page routes use valid URL path format', () => {
      const urlPattern = /^\/[a-z0-9/:_-]*$/i

      expect(TENANT_PAGE_ROUTES.HOME).toMatch(urlPattern)
      expect(TENANT_PAGE_ROUTES.CREATE).toMatch(urlPattern)
      expect(TENANT_PAGE_ROUTES.EDIT).toMatch(urlPattern)
      expect(TENANT_PAGE_ROUTES.VIEW).toMatch(urlPattern)
    })

    it('parameterized routes use :id format', () => {
      const paramPattern = /:id/

      expect(TENANT_API_ROUTES.DETAILS).toMatch(paramPattern)
      expect(TENANT_API_ROUTES.ACCOUNT.STATUS).toMatch(paramPattern)
      expect(TENANT_PAGE_ROUTES.EDIT).toMatch(paramPattern)
      expect(TENANT_PAGE_ROUTES.VIEW).toMatch(paramPattern)
    })
  })

  describe('Route Consistency', () => {
    it('page routes align with module name', () => {
      const moduleName = 'tenant-management'
      expect(TENANT_PAGE_ROUTES.HOME).toContain(moduleName)
      expect(TENANT_PAGE_ROUTES.CREATE).toContain(moduleName)
      expect(TENANT_PAGE_ROUTES.EDIT).toContain(moduleName)
      expect(TENANT_PAGE_ROUTES.VIEW).toContain(moduleName)
    })

    it('API base URL matches resource name', () => {
      expect(TENANT_API_ROUTES.BASE_URL).toBe('/tenants')
    })

    it('CRUD operations have consistent structure', () => {
      expect(TENANT_PAGE_ROUTES.CREATE.endsWith('/create')).toBe(true)
      expect(TENANT_PAGE_ROUTES.EDIT).toContain('/edit/')
      expect(TENANT_PAGE_ROUTES.VIEW).toContain('/view/')
    })
  })
})
