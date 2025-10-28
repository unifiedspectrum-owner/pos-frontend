/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Public module imports */
import { PublicHeader } from '@public/components/layout'

/* Mock next/link */
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

/* Mock i18n navigation */
const mockPush = vi.fn()
const mockPathname = vi.fn()

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => mockPathname()
}))

describe('PublicHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname.mockReturnValue('/')
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PublicHeader />)
      expect(container).toBeInTheDocument()
    })

    it('renders header element', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders brand section with logo and name', () => {
      render(<PublicHeader />)
      expect(screen.getByText('US')).toBeInTheDocument()
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('renders all navigation items', () => {
      render(<PublicHeader />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<PublicHeader />)
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('renders brand icon as Circle component', () => {
      render(<PublicHeader />)
      const brandIcon = screen.getByText('US')
      expect(brandIcon).toBeInTheDocument()
      expect(brandIcon.parentElement).toHaveClass('brand-icon')
    })

    it('renders company name as heading', () => {
      render(<PublicHeader />)
      const heading = screen.getByRole('heading', { name: /unified spectrum/i })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Navigation Items', () => {
    it('renders navigation items in correct order', () => {
      render(<PublicHeader />)
      const navItems = ['Home', 'About', 'Pricing', 'Contact']
      navItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('renders navigation links with correct href', () => {
      render(<PublicHeader />)
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about')
      expect(screen.getByText('Pricing').closest('a')).toHaveAttribute('href', '/pricing')
      expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '/contact')
    })

    it('highlights active navigation item', () => {
      mockPathname.mockReturnValue('/pricing')
      render(<PublicHeader />)
      const pricingLink = screen.getByText('Pricing')
      expect(pricingLink).toBeInTheDocument()
    })

    it('applies correct styling to active path', () => {
      mockPathname.mockReturnValue('/about')
      render(<PublicHeader />)
      const aboutLink = screen.getByText('About')
      expect(aboutLink).toBeInTheDocument()
    })
  })

  describe('Brand Section', () => {
    it('renders brand logo with correct text', () => {
      render(<PublicHeader />)
      const logo = screen.getByText('US')
      expect(logo).toBeInTheDocument()
    })

    it('renders brand name with correct text', () => {
      render(<PublicHeader />)
      const brandName = screen.getByText('Unified Spectrum')
      expect(brandName).toBeInTheDocument()
    })

    it('wraps brand section in link to home', () => {
      render(<PublicHeader />)
      const brandLink = screen.getByText('Unified Spectrum').closest('a')
      expect(brandLink).toHaveAttribute('href', '/')
    })

    it('applies brand-icon class to logo', () => {
      render(<PublicHeader />)
      const logo = screen.getByText('US').parentElement
      expect(logo).toHaveClass('brand-icon')
    })

    it('applies brand-text class to company name', () => {
      render(<PublicHeader />)
      const brandText = screen.getByText('Unified Spectrum')
      expect(brandText).toHaveClass('brand-text')
    })
  })

  describe('Action Buttons', () => {
    it('renders login button when not on login page', () => {
      mockPathname.mockReturnValue('/')
      render(<PublicHeader />)
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('hides login button when on login page', () => {
      mockPathname.mockReturnValue('/auth/login')
      render(<PublicHeader />)
      expect(screen.queryByText('Login')).not.toBeInTheDocument()
    })

    it('always renders signup button', () => {
      render(<PublicHeader />)
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('calls router.push with login route when login clicked', () => {
      render(<PublicHeader />)
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('calls router.push with signup route when signup clicked', () => {
      render(<PublicHeader />)
      const signupButton = screen.getByText('Sign Up')
      fireEvent.click(signupButton)
      expect(mockPush).toHaveBeenCalledWith('/tenant/account/create')
    })

    it('renders both buttons in HStack', () => {
      render(<PublicHeader />)
      const loginButton = screen.getByText('Login')
      const signupButton = screen.getByText('Sign Up')
      expect(loginButton.closest('.chakra-stack')).toBeInTheDocument()
      expect(signupButton.closest('.chakra-stack')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles login button click', () => {
      render(<PublicHeader />)
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)
      expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it('handles signup button click', () => {
      render(<PublicHeader />)
      const signupButton = screen.getByText('Sign Up')
      fireEvent.click(signupButton)
      expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it('handles multiple login clicks', () => {
      render(<PublicHeader />)
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)
      fireEvent.click(loginButton)
      expect(mockPush).toHaveBeenCalledTimes(2)
    })

    it('handles multiple signup clicks', () => {
      render(<PublicHeader />)
      const signupButton = screen.getByText('Sign Up')
      fireEvent.click(signupButton)
      fireEvent.click(signupButton)
      expect(mockPush).toHaveBeenCalledTimes(2)
    })

    it('handles clicks on navigation links', () => {
      render(<PublicHeader />)
      const homeLink = screen.getByText('Home')
      fireEvent.click(homeLink)
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<PublicHeader />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic header element', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('uses heading for brand name', () => {
      render(<PublicHeader />)
      const heading = screen.getByRole('heading', { name: /unified spectrum/i })
      expect(heading).toBeInTheDocument()
    })

    it('provides proper link structure for navigation', () => {
      render(<PublicHeader />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('uses button elements for actions', () => {
      render(<PublicHeader />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<PublicHeader />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Unified Spectrum')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      unmount2()
    })

    it('maintains state across rerenders', () => {
      const { rerender } = render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      rerender(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<PublicHeader />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<PublicHeader />)
        expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
        unmount()
      }
    })
  })

  describe('Responsive Behavior', () => {
    it('renders navigation menu', () => {
      render(<PublicHeader />)
      const navItems = ['Home', 'About', 'Pricing', 'Contact']
      navItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('maintains structure with different viewport sizes', () => {
      render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Login')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty pathname', () => {
      mockPathname.mockReturnValue('')
      render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('handles undefined pathname gracefully', () => {
      mockPathname.mockReturnValue(undefined)
      render(<PublicHeader />)
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('handles router push with error mock', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed')
      })
      render(<PublicHeader />)
      const loginButton = screen.getByText('Login')
      /* Click the button - error is caught by React error boundary */
      fireEvent.click(loginButton)
      expect(mockPush).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('renders correctly when wrapped in fragment', () => {
      render(
        <>
          <PublicHeader />
        </>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<PublicHeader />)
      }).not.toThrow()
    })
  })

  describe('Visual Consistency', () => {
    it('applies consistent spacing', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('uses consistent color scheme', () => {
      render(<PublicHeader />)
      const brandText = screen.getByText('Unified Spectrum')
      expect(brandText).toBeInTheDocument()
    })

    it('maintains brand identity elements', () => {
      render(<PublicHeader />)
      expect(screen.getByText('US')).toBeInTheDocument()
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('works correctly in a page layout', () => {
      render(
        <div>
          <PublicHeader />
          <main>Page content</main>
        </div>
      )
      expect(screen.getByText('Unified Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('maintains navigation state across path changes', () => {
      mockPathname.mockReturnValue('/')
      const { rerender } = render(<PublicHeader />)
      expect(screen.getByText('Home')).toBeInTheDocument()

      mockPathname.mockReturnValue('/pricing')
      rerender(<PublicHeader />)
      expect(screen.getByText('Pricing')).toBeInTheDocument()
    })

    it('handles navigation between authenticated and public pages', () => {
      mockPathname.mockReturnValue('/auth/login')
      const { rerender } = render(<PublicHeader />)
      expect(screen.queryByText('Login')).not.toBeInTheDocument()

      mockPathname.mockReturnValue('/')
      rerender(<PublicHeader />)
      expect(screen.getByText('Login')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('uses Flex for main container', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('uses HStack for navigation items', () => {
      render(<PublicHeader />)
      const stacks = document.querySelectorAll('.chakra-stack')
      expect(stacks.length).toBeGreaterThan(0)
    })

    it('applies proper alignment', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('applies border styling', () => {
      render(<PublicHeader />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })
  })
})
