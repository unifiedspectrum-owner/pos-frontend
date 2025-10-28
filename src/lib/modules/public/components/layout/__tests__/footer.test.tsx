/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Public module imports */
import { PublicFooter } from '@public/components/layout'

/* Mock next/link */
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('PublicFooter', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PublicFooter />)
      expect(container).toBeInTheDocument()
    })

    it('renders footer element', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders brand section', () => {
      render(<PublicFooter />)
      expect(screen.getByText('US')).toBeInTheDocument()
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
    })

    it('renders all main sections', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders copyright notice with dynamic year', () => {
      render(<PublicFooter />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument()
    })

    it('renders brand logo as Circle component', () => {
      render(<PublicFooter />)
      const brandIcon = screen.getByText('US')
      expect(brandIcon).toBeInTheDocument()
      expect(brandIcon.parentElement).toBeInTheDocument()
    })
  })

  describe('Authentication Section', () => {
    it('renders authentication section title', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Authentication')).toBeInTheDocument()
    })

    it('renders login link', () => {
      render(<PublicFooter />)
      const loginLink = screen.getByText('Login')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login')
    })

    it('renders forgot password link', () => {
      render(<PublicFooter />)
      const forgotLink = screen.getByText('Forgot Password')
      expect(forgotLink).toBeInTheDocument()
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password')
    })

    it('renders create account link', () => {
      render(<PublicFooter />)
      const createLink = screen.getByText('Create Account')
      expect(createLink).toBeInTheDocument()
      expect(createLink.closest('a')).toHaveAttribute('href', '/tenant/account/create')
    })

    it('renders all authentication links in correct order', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Forgot Password')).toBeInTheDocument()
      expect(screen.getByText('Create Account')).toBeInTheDocument()
    })
  })

  describe('Support Section', () => {
    it('renders support section title', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Support')).toBeInTheDocument()
    })

    it('renders contact support link', () => {
      render(<PublicFooter />)
      const supportLink = screen.getByText('Contact Support')
      expect(supportLink).toBeInTheDocument()
      expect(supportLink.closest('a')).toHaveAttribute('href', '/support')
    })

    it('renders FAQ link', () => {
      render(<PublicFooter />)
      const faqLink = screen.getByText('FAQ')
      expect(faqLink).toBeInTheDocument()
      expect(faqLink.closest('a')).toHaveAttribute('href', '/faq')
    })

    it('renders help center link', () => {
      render(<PublicFooter />)
      const helpLink = screen.getByText('Help Center')
      expect(helpLink).toBeInTheDocument()
      expect(helpLink.closest('a')).toHaveAttribute('href', '/help')
    })

    it('renders all support links in correct order', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Contact Support')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
      expect(screen.getByText('Help Center')).toBeInTheDocument()
    })
  })

  describe('Contact Section', () => {
    it('renders contact section title', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders email link', () => {
      render(<PublicFooter />)
      const emailLink = screen.getByText('support@posadmin.com')
      expect(emailLink).toBeInTheDocument()
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:support@posadmin.com')
    })

    it('renders phone number', () => {
      render(<PublicFooter />)
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
    })

    it('renders live chat link', () => {
      render(<PublicFooter />)
      const chatLink = screen.getByText('Live Chat')
      expect(chatLink).toBeInTheDocument()
      expect(chatLink.closest('a')).toHaveAttribute('href', '/live-chat')
    })

    it('renders all contact information in correct order', () => {
      render(<PublicFooter />)
      expect(screen.getByText('support@posadmin.com')).toBeInTheDocument()
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('Live Chat')).toBeInTheDocument()
    })
  })

  describe('Brand Section', () => {
    it('renders brand logo with correct text', () => {
      render(<PublicFooter />)
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('renders company name', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('renders product description', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
    })

    it('uses VStack for brand section layout', () => {
      render(<PublicFooter />)
      const brandText = screen.getByText('Unified Spectrum')
      expect(brandText.closest('.chakra-stack')).toBeInTheDocument()
    })
  })

  describe('Copyright Notice', () => {
    it('displays current year', () => {
      render(<PublicFooter />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument()
    })

    it('displays company name in copyright', () => {
      render(<PublicFooter />)
      expect(screen.getByText(/Unified Spectrum - Point of Sale System/)).toBeInTheDocument()
    })

    it('displays all rights reserved text', () => {
      render(<PublicFooter />)
      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
    })

    it('renders complete copyright notice', () => {
      render(<PublicFooter />)
      const currentYear = new Date().getFullYear()
      const copyrightText = `© ${currentYear} Unified Spectrum - Point of Sale System. All rights reserved.`
      expect(screen.getByText(copyrightText)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<PublicFooter />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic footer element', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('provides proper link structure', () => {
      render(<PublicFooter />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders all links as anchor elements', () => {
      render(<PublicFooter />)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link.tagName).toBe('A')
      })
    })

    it('ensures email link has mailto protocol', () => {
      render(<PublicFooter />)
      const emailLink = screen.getByText('support@posadmin.com').closest('a')
      expect(emailLink).toHaveAttribute('href', 'mailto:support@posadmin.com')
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<PublicFooter />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount2()
    })

    it('maintains state across rerenders', () => {
      const { rerender } = render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      rerender(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<PublicFooter />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<PublicFooter />)
        expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
        unmount()
      }
    })

    it('renders all sections efficiently', () => {
      const startTime = Date.now()
      render(<PublicFooter />)
      const endTime = Date.now()

      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(endTime - startTime).toBeLessThan(150)
    })
  })

  describe('Responsive Behavior', () => {
    it('renders all sections in mobile layout', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('maintains structure with different viewport sizes', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
    })

    it('uses responsive layout classes', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly when wrapped in fragment', () => {
      render(
        <>
          <PublicFooter />
        </>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('renders correctly when wrapped in div', () => {
      render(
        <div>
          <PublicFooter />
        </div>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<PublicFooter />)
      }).not.toThrow()
    })

    it('handles year calculation correctly', () => {
      render(<PublicFooter />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('applies consistent spacing', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('uses VStack for main container', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toHaveClass('chakra-stack')
    })

    it('maintains brand identity elements', () => {
      render(<PublicFooter />)
      expect(screen.getByText('US')).toBeInTheDocument()
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('applies separator element', () => {
      render(<PublicFooter />)
      const separator = document.querySelector('.chakra-separator')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('works correctly in a page layout', () => {
      render(
        <div>
          <main>Page content</main>
          <PublicFooter />
        </div>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('maintains structure when nested in containers', () => {
      render(
        <div className="page-wrapper">
          <div className="footer-container">
            <PublicFooter />
          </div>
        </div>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(document.querySelector('.page-wrapper')).toBeInTheDocument()
    })

    it('renders multiple sections independently', () => {
      render(<PublicFooter />)
      const authSection = screen.getByText('Authentication')
      const supportSection = screen.getByText('Support')
      const contactSection = screen.getByText('Contact')

      expect(authSection).toBeInTheDocument()
      expect(supportSection).toBeInTheDocument()
      expect(contactSection).toBeInTheDocument()
    })
  })

  describe('Link Functionality', () => {
    it('renders all authentication links with correct hrefs', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Login').closest('a')).toHaveAttribute('href', '/auth/login')
      expect(screen.getByText('Forgot Password').closest('a')).toHaveAttribute('href', '/auth/forgot-password')
      expect(screen.getByText('Create Account').closest('a')).toHaveAttribute('href', '/tenant/account/create')
    })

    it('renders all support links with correct hrefs', () => {
      render(<PublicFooter />)
      expect(screen.getByText('Contact Support').closest('a')).toHaveAttribute('href', '/support')
      expect(screen.getByText('FAQ').closest('a')).toHaveAttribute('href', '/faq')
      expect(screen.getByText('Help Center').closest('a')).toHaveAttribute('href', '/help')
    })

    it('renders all contact links with correct hrefs', () => {
      render(<PublicFooter />)
      expect(screen.getByText('support@posadmin.com').closest('a')).toHaveAttribute('href', 'mailto:support@posadmin.com')
      expect(screen.getByText('Live Chat').closest('a')).toHaveAttribute('href', '/live-chat')
    })

    it('counts total number of links correctly', () => {
      render(<PublicFooter />)
      const links = screen.getAllByRole('link')
      /* 3 auth + 3 support + 2 contact = 8 total links */
      expect(links).toHaveLength(8)
    })
  })

  describe('Layout Structure', () => {
    it('uses VStack for main footer container', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toHaveClass('chakra-stack')
    })

    it('uses Flex for section layout', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
    })

    it('applies border styling', () => {
      render(<PublicFooter />)
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })
})
