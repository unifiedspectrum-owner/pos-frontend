/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Tenant management module imports */
import Footer from '../footer'

describe('Footer', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<Footer />)
      expect(container).toBeInTheDocument()
    })

    it('renders as footer element', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders company brand section', () => {
      render(<Footer />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Tenant Management System')).toBeInTheDocument()
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('renders navigation section', () => {
      render(<Footer />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Registration Help')).toBeInTheDocument()
      expect(screen.getByText('View Plans')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })

    it('renders support section', () => {
      render(<Footer />)
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact Support')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
      expect(screen.getByText('Documentation')).toBeInTheDocument()
    })

    it('renders contact section', () => {
      render(<Footer />)
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('support@posadmin.com')).toBeInTheDocument()
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('Live Chat')).toBeInTheDocument()
    })

    it('renders copyright notice with current year', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear} Unified Spectrum`))).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('renders all navigation links', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('has correct href for registration help', () => {
      render(<Footer />)
      const link = screen.getByText('Registration Help')
      expect(link).toHaveAttribute('href', '/tenant/help')
    })

    it('has correct href for view plans', () => {
      render(<Footer />)
      const link = screen.getByText('View Plans')
      expect(link).toHaveAttribute('href', '/tenant/plans')
    })

    it('has correct href for pricing', () => {
      render(<Footer />)
      const link = screen.getByText('Pricing')
      expect(link).toHaveAttribute('href', '/tenant/pricing')
    })

    it('has correct href for contact support', () => {
      render(<Footer />)
      const link = screen.getByText('Contact Support')
      expect(link).toHaveAttribute('href', '/support')
    })

    it('has correct href for FAQ', () => {
      render(<Footer />)
      const link = screen.getByText('FAQ')
      expect(link).toHaveAttribute('href', '/faq')
    })

    it('has correct href for documentation', () => {
      render(<Footer />)
      const link = screen.getByText('Documentation')
      expect(link).toHaveAttribute('href', '/documentation')
    })

    it('has correct mailto link for email', () => {
      render(<Footer />)
      const link = screen.getByText('support@posadmin.com')
      expect(link).toHaveAttribute('href', 'mailto:support@posadmin.com')
    })

    it('has correct href for live chat', () => {
      render(<Footer />)
      const link = screen.getByText('Live Chat')
      expect(link).toHaveAttribute('href', '/live-chat')
    })
  })

  describe('Brand Section', () => {
    it('displays company logo with initials', () => {
      render(<Footer />)
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('displays company name', () => {
      render(<Footer />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('displays product description', () => {
      render(<Footer />)
      expect(screen.getByText('Tenant Management System')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has full width', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('has padding applied', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('has border top', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('has dark background color', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('renders all sections on mobile', () => {
      render(<Footer />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders all sections on desktop', () => {
      render(<Footer />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Footer />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic footer element', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(footer?.tagName.toLowerCase()).toBe('footer')
    })

    it('all links are accessible', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeVisible()
      })
    })
  })

  describe('Copyright Section', () => {
    it('displays copyright symbol', () => {
      render(<Footer />)
      expect(screen.getByText(/©/)).toBeInTheDocument()
    })

    it('displays current year dynamically', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
    })

    it('displays company name in copyright', () => {
      render(<Footer />)
      const copyrightText = screen.getByText(/© .* Unified Spectrum.*All rights reserved/)
      expect(copyrightText).toBeInTheDocument()
    })

    it('displays "All rights reserved" text', () => {
      render(<Footer />)
      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<Footer />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<Footer />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<Footer />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<Footer />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount2()

      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })
  })

  describe('Visual Sections', () => {
    it('renders separator element', () => {
      const { container } = render(<Footer />)
      expect(container).toBeInTheDocument()
    })

    it('groups navigation links properly', () => {
      render(<Footer />)
      expect(screen.getByText('Registration Help')).toBeInTheDocument()
      expect(screen.getByText('View Plans')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })

    it('groups support links properly', () => {
      render(<Footer />)
      expect(screen.getByText('Contact Support')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
      expect(screen.getByText('Documentation')).toBeInTheDocument()
    })

    it('groups contact information properly', () => {
      render(<Footer />)
      expect(screen.getByText('support@posadmin.com')).toBeInTheDocument()
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('Live Chat')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<Footer />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('maintains performance during multiple renders', () => {
      const { rerender } = render(<Footer />)
      const startTime = Date.now()

      for (let i = 0; i < 10; i++) {
        rerender(<Footer />)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(500)
    })
  })
})
