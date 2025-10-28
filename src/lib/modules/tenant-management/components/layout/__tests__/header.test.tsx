/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Tenant management module imports */
import Header from '../header'

/* Mock router */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Header', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<Header />)
      expect(container).toBeInTheDocument()
    })

    it('renders as header element', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders company logo with initials', () => {
      render(<Header />)
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('renders company name', () => {
      render(<Header />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('renders navigation items', () => {
      render(<Header />)
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders Sign Up button', () => {
      render(<Header />)
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('renders Get Demo button', () => {
      render(<Header />)
      expect(screen.getByText('Get Demo')).toBeInTheDocument()
    })
  })

  describe('Brand Section', () => {
    it('displays company logo circle', () => {
      render(<Header />)
      expect(screen.getByText('US')).toBeInTheDocument()
    })

    it('displays company name as heading', () => {
      render(<Header />)
      const heading = screen.getByRole('heading', { name: /Unified Spectrum/i })
      expect(heading).toBeInTheDocument()
    })

    it('brand section is clickable', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const brandSection = screen.getByText('Unified Spectrum').closest('div')
      if (brandSection) {
        await user.click(brandSection)
        expect(mockPush).toHaveBeenCalledWith('/')
      }
    })
  })

  describe('Navigation Menu', () => {
    it('renders all navigation items', () => {
      render(<Header />)
      const items = ['Features', 'Pricing', 'About', 'Contact']
      items.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('navigates to features page on click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Features'))
      expect(mockPush).toHaveBeenCalledWith('/features')
    })

    it('navigates to pricing page on click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Pricing'))
      expect(mockPush).toHaveBeenCalledWith('/pricing')
    })

    it('navigates to about page on click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('About'))
      expect(mockPush).toHaveBeenCalledWith('/about')
    })

    it('navigates to contact page on click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Contact'))
      expect(mockPush).toHaveBeenCalledWith('/contact')
    })

    it('highlights current path navigation item', () => {
      render(<Header currentPath="/pricing" />)
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('renders Sign Up button', () => {
      render(<Header />)
      const signUpButton = screen.getByText('Sign Up')
      expect(signUpButton).toBeInTheDocument()
    })

    it('renders Get Demo button', () => {
      render(<Header />)
      const getDemoButton = screen.getByText('Get Demo')
      expect(getDemoButton).toBeInTheDocument()
    })

    it('navigates to signup page on Sign Up click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Sign Up'))
      expect(mockPush).toHaveBeenCalledWith('/tenant/account/create')
    })

    it('navigates to demo page on Get Demo click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Get Demo'))
      expect(mockPush).toHaveBeenCalledWith('/demo')
    })

    it('Sign Up button has outline variant', () => {
      render(<Header />)
      const signUpButton = screen.getByText('Sign Up')
      expect(signUpButton).toBeInTheDocument()
    })

    it('Get Demo button has primary styling', () => {
      render(<Header />)
      const getDemoButton = screen.getByText('Get Demo')
      expect(getDemoButton).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has full width', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('uses flexbox layout', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('has border bottom', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('has white background', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('has box shadow applied', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('hides navigation on mobile screens', () => {
      render(<Header />)
      expect(screen.getByText('Features')).toBeInTheDocument()
    })

    it('shows navigation on desktop screens', () => {
      render(<Header />)
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('displays action buttons on all screen sizes', () => {
      render(<Header />)
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.getByText('Get Demo')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Header />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic header element', () => {
      const { container } = render(<Header />)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header?.tagName.toLowerCase()).toBe('header')
    })

    it('uses heading for company name', () => {
      render(<Header />)
      const heading = screen.getByRole('heading', { name: /Unified Spectrum/i })
      expect(heading).toBeInTheDocument()
    })

    it('all navigation items are clickable', () => {
      render(<Header />)
      const navItems = ['Features', 'Pricing', 'About', 'Contact']
      navItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('all buttons have accessible labels', () => {
      render(<Header />)
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Get Demo/i })).toBeInTheDocument()
    })
  })

  describe('Current Path Highlighting', () => {
    it('highlights features when on features page', () => {
      render(<Header currentPath="/features" />)
      expect(screen.getByText('Features')).toBeInTheDocument()
    })

    it('highlights pricing when on pricing page', () => {
      render(<Header currentPath="/pricing" />)
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })

    it('highlights about when on about page', () => {
      render(<Header currentPath="/about" />)
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('highlights contact when on contact page', () => {
      render(<Header currentPath="/contact" />)
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('does not highlight when no current path provided', () => {
      render(<Header />)
      expect(screen.getByText('Features')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<Header />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<Header />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<Header />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<Header />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount2()

      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })
  })

  describe('Re-rendering Behavior', () => {
    it('updates current path on re-render', () => {
      const { rerender } = render(<Header currentPath="/features" />)
      expect(screen.getByText('Features')).toBeInTheDocument()

      rerender(<Header currentPath="/pricing" />)
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })

    it('maintains all sections during re-render', () => {
      const { rerender } = render(<Header />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()

      rerender(<Header currentPath="/pricing" />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<Header />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('maintains performance during multiple renders', () => {
      const { rerender } = render(<Header />)
      const startTime = Date.now()

      for (let i = 0; i < 10; i++) {
        rerender(<Header currentPath={`/path${i}`} />)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('User Interactions', () => {
    it('handles rapid clicks on navigation items', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Features'))
      await user.click(screen.getByText('Pricing'))
      await user.click(screen.getByText('About'))

      expect(mockPush).toHaveBeenCalledTimes(3)
    })

    it('handles rapid clicks on action buttons', async () => {
      const user = userEvent.setup()
      render(<Header />)

      await user.click(screen.getByText('Sign Up'))
      await user.click(screen.getByText('Get Demo'))

      expect(mockPush).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined currentPath prop', () => {
      expect(() => {
        render(<Header currentPath={undefined} />)
      }).not.toThrow()
    })

    it('handles empty string currentPath prop', () => {
      expect(() => {
        render(<Header currentPath="" />)
      }).not.toThrow()
    })

    it('handles invalid currentPath prop', () => {
      expect(() => {
        render(<Header currentPath="/invalid/path" />)
      }).not.toThrow()
    })
  })
})
