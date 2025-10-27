/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Auth management module imports */
import { AUTH_MODULE_NAME, AUTH_API_ROUTES, AUTH_PAGE_ROUTES } from '@auth-management/constants'

describe('Auth Management Routes Constants', () => {
  describe('AUTH_MODULE_NAME', () => {
    it('should be defined', () => {
      expect(AUTH_MODULE_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(AUTH_MODULE_NAME).toBe('auth-management')
    })

    it('should be a string', () => {
      expect(typeof AUTH_MODULE_NAME).toBe('string')
    })

    it('should not be empty', () => {
      expect(AUTH_MODULE_NAME.length).toBeGreaterThan(0)
    })

    it('should use kebab-case format', () => {
      expect(AUTH_MODULE_NAME).toMatch(/^[a-z]+(-[a-z]+)*$/)
    })
  })

  describe('AUTH_API_ROUTES', () => {
    it('should be defined', () => {
      expect(AUTH_API_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof AUTH_API_ROUTES).toBe('object')
    })

    it('should not be null', () => {
      expect(AUTH_API_ROUTES).not.toBeNull()
    })

    describe('LOGIN', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.LOGIN).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.LOGIN).toBe('/login')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.LOGIN).toMatch(/^\//)
      })

      it('should be a string', () => {
        expect(typeof AUTH_API_ROUTES.LOGIN).toBe('string')
      })
    })

    describe('VERIFY_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.VERIFY_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.VERIFY_2FA).toBe('/2fa/verify')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.VERIFY_2FA).toMatch(/^\//)
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_API_ROUTES.VERIFY_2FA).toContain('/2fa/')
      })
    })

    describe('GENERATE_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.GENERATE_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.GENERATE_2FA).toBe('/2fa/generate')
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_API_ROUTES.GENERATE_2FA).toContain('/2fa/')
      })
    })

    describe('ENABLE_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.ENABLE_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.ENABLE_2FA).toBe('/2fa/enable')
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_API_ROUTES.ENABLE_2FA).toContain('/2fa/')
      })
    })

    describe('DISABLE_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.DISABLE_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.DISABLE_2FA).toBe('/2fa/disable')
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_API_ROUTES.DISABLE_2FA).toContain('/2fa/')
      })
    })

    describe('LOGOUT', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.LOGOUT).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.LOGOUT).toBe('/logout')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.LOGOUT).toMatch(/^\//)
      })
    })

    describe('REFRESH', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.REFRESH).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.REFRESH).toBe('/refresh')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.REFRESH).toMatch(/^\//)
      })
    })

    describe('FORGOT_PASSWORD', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.FORGOT_PASSWORD).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.FORGOT_PASSWORD).toBe('/forgot-password')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.FORGOT_PASSWORD).toMatch(/^\//)
      })

      it('should use kebab-case', () => {
        expect(AUTH_API_ROUTES.FORGOT_PASSWORD).toMatch(/^\/[a-z-]+$/)
      })
    })

    describe('RESET_PASSWORD', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.RESET_PASSWORD).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.RESET_PASSWORD).toBe('/reset-password')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.RESET_PASSWORD).toMatch(/^\//)
      })

      it('should use kebab-case', () => {
        expect(AUTH_API_ROUTES.RESET_PASSWORD).toMatch(/^\/[a-z-]+$/)
      })
    })

    describe('VALIDATE_TOKEN', () => {
      it('should be defined', () => {
        expect(AUTH_API_ROUTES.VALIDATE_TOKEN).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_API_ROUTES.VALIDATE_TOKEN).toBe('/validate-reset-token')
      })

      it('should start with forward slash', () => {
        expect(AUTH_API_ROUTES.VALIDATE_TOKEN).toMatch(/^\//)
      })

      it('should use kebab-case', () => {
        expect(AUTH_API_ROUTES.VALIDATE_TOKEN).toMatch(/^\/[a-z-]+$/)
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(AUTH_API_ROUTES).toHaveProperty('LOGIN')
        expect(AUTH_API_ROUTES).toHaveProperty('VERIFY_2FA')
        expect(AUTH_API_ROUTES).toHaveProperty('GENERATE_2FA')
        expect(AUTH_API_ROUTES).toHaveProperty('ENABLE_2FA')
        expect(AUTH_API_ROUTES).toHaveProperty('DISABLE_2FA')
        expect(AUTH_API_ROUTES).toHaveProperty('LOGOUT')
        expect(AUTH_API_ROUTES).toHaveProperty('REFRESH')
        expect(AUTH_API_ROUTES).toHaveProperty('FORGOT_PASSWORD')
        expect(AUTH_API_ROUTES).toHaveProperty('RESET_PASSWORD')
        expect(AUTH_API_ROUTES).toHaveProperty('VALIDATE_TOKEN')
      })

      it('should have exactly 10 properties', () => {
        expect(Object.keys(AUTH_API_ROUTES)).toHaveLength(10)
      })

      it('should group 2FA routes with common prefix', () => {
        const twoFARoutes = [
          AUTH_API_ROUTES.VERIFY_2FA,
          AUTH_API_ROUTES.GENERATE_2FA,
          AUTH_API_ROUTES.ENABLE_2FA,
          AUTH_API_ROUTES.DISABLE_2FA
        ]

        twoFARoutes.forEach(route => {
          expect(route).toMatch(/^\/2fa\//)
        })
      })

      it('should group password routes with password keyword', () => {
        const passwordRoutes = [
          AUTH_API_ROUTES.FORGOT_PASSWORD,
          AUTH_API_ROUTES.RESET_PASSWORD
        ]

        passwordRoutes.forEach(route => {
          expect(route).toContain('password')
        })
      })

      it('should not have duplicate values', () => {
        const values = Object.values(AUTH_API_ROUTES)
        const uniqueValues = new Set(values)
        expect(values.length).toBe(uniqueValues.size)
      })

      it('should not end with trailing slash', () => {
        Object.values(AUTH_API_ROUTES).forEach(route => {
          expect(route).not.toMatch(/\/$/)
        })
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(AUTH_API_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        expect(AUTH_API_ROUTES).toBeDefined()
        expect(typeof AUTH_API_ROUTES).toBe('object')
      })
    })
  })

  describe('AUTH_PAGE_ROUTES', () => {
    it('should be defined', () => {
      expect(AUTH_PAGE_ROUTES).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof AUTH_PAGE_ROUTES).toBe('object')
    })

    describe('ADMIN_HOME', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.ADMIN_HOME).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.ADMIN_HOME).toBe('/admin/support-ticket-management')
      })

      it('should start with /admin', () => {
        expect(AUTH_PAGE_ROUTES.ADMIN_HOME).toMatch(/^\/admin/)
      })
    })

    describe('LOGIN', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.LOGIN).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.LOGIN).toBe('/auth/login')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.LOGIN).toMatch(/^\/auth/)
      })
    })

    describe('REGISTER', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.REGISTER).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.REGISTER).toBe('/auth/register')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.REGISTER).toMatch(/^\/auth/)
      })
    })

    describe('FORGOT_PASSWORD', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.FORGOT_PASSWORD).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.FORGOT_PASSWORD).toBe('/auth/forgot-password')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.FORGOT_PASSWORD).toMatch(/^\/auth/)
      })

      it('should use kebab-case', () => {
        expect(AUTH_PAGE_ROUTES.FORGOT_PASSWORD).toContain('forgot-password')
      })
    })

    describe('RESET_PASSWORD', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.RESET_PASSWORD).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.RESET_PASSWORD).toBe('/auth/reset-password')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.RESET_PASSWORD).toMatch(/^\/auth/)
      })

      it('should use kebab-case', () => {
        expect(AUTH_PAGE_ROUTES.RESET_PASSWORD).toContain('reset-password')
      })
    })

    describe('VERIFY_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.VERIFY_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.VERIFY_2FA).toBe('/auth/verify-2fa')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.VERIFY_2FA).toMatch(/^\/auth/)
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_PAGE_ROUTES.VERIFY_2FA).toContain('2fa')
      })
    })

    describe('SETUP_2FA', () => {
      it('should be defined', () => {
        expect(AUTH_PAGE_ROUTES.SETUP_2FA).toBeDefined()
      })

      it('should have correct value', () => {
        expect(AUTH_PAGE_ROUTES.SETUP_2FA).toBe('/auth/setup-2fa')
      })

      it('should start with /auth', () => {
        expect(AUTH_PAGE_ROUTES.SETUP_2FA).toMatch(/^\/auth/)
      })

      it('should contain 2fa segment', () => {
        expect(AUTH_PAGE_ROUTES.SETUP_2FA).toContain('2fa')
      })
    })

    describe('Route Consistency', () => {
      it('should have all required properties', () => {
        expect(AUTH_PAGE_ROUTES).toHaveProperty('ADMIN_HOME')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('LOGIN')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('REGISTER')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('FORGOT_PASSWORD')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('RESET_PASSWORD')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('VERIFY_2FA')
        expect(AUTH_PAGE_ROUTES).toHaveProperty('SETUP_2FA')
      })

      it('should have exactly 7 properties', () => {
        expect(Object.keys(AUTH_PAGE_ROUTES)).toHaveLength(7)
      })

      it('should follow consistent naming pattern', () => {
        Object.values(AUTH_PAGE_ROUTES).forEach(route => {
          const segments = route.split('/')
          segments.forEach(segment => {
            if (segment && !segment.startsWith(':')) {
              expect(segment).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
            }
          })
        })
      })

      it('should not end with trailing slash', () => {
        Object.values(AUTH_PAGE_ROUTES).forEach(route => {
          expect(route).not.toMatch(/\/$/)
        })
      })

      it('should not have duplicate values', () => {
        const values = Object.values(AUTH_PAGE_ROUTES)
        const uniqueValues = new Set(values)
        expect(values.length).toBe(uniqueValues.size)
      })
    })

    describe('Type Safety', () => {
      it('should have all string values', () => {
        Object.values(AUTH_PAGE_ROUTES).forEach(value => {
          expect(typeof value).toBe('string')
        })
      })

      it('should be a const object', () => {
        expect(AUTH_PAGE_ROUTES).toBeDefined()
        expect(typeof AUTH_PAGE_ROUTES).toBe('object')
      })
    })
  })

  describe('Routes Integration', () => {
    it('should have different structures for API and page routes', () => {
      /* API routes use relative paths */
      expect(AUTH_API_ROUTES.LOGIN).toMatch(/^\/[a-z]/)
      /* Page routes use absolute paths with prefix */
      expect(AUTH_PAGE_ROUTES.LOGIN).toMatch(/^\/auth/)
    })

    it('should maintain semantic consistency', () => {
      /* Both should have LOGIN */
      expect(AUTH_API_ROUTES).toHaveProperty('LOGIN')
      expect(AUTH_PAGE_ROUTES).toHaveProperty('LOGIN')

      /* Both should have password reset routes */
      expect(AUTH_API_ROUTES).toHaveProperty('FORGOT_PASSWORD')
      expect(AUTH_API_ROUTES).toHaveProperty('RESET_PASSWORD')
      expect(AUTH_PAGE_ROUTES).toHaveProperty('FORGOT_PASSWORD')
      expect(AUTH_PAGE_ROUTES).toHaveProperty('RESET_PASSWORD')

      /* Both should have 2FA routes */
      expect(AUTH_API_ROUTES).toHaveProperty('VERIFY_2FA')
      expect(AUTH_PAGE_ROUTES).toHaveProperty('VERIFY_2FA')
    })

    it('should all start with forward slash', () => {
      Object.values(AUTH_API_ROUTES).forEach(route => {
        expect(route).toMatch(/^\//)
      })
      Object.values(AUTH_PAGE_ROUTES).forEach(route => {
        expect(route).toMatch(/^\//)
      })
    })
  })
})
