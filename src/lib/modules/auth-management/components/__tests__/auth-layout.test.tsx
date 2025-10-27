/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Auth management module imports */
import AuthLayout from '../auth-layout'

/* Mock public components */
vi.mock('@public/components/layout', () => ({
  PublicHeader: () => <header data-testid="public-header">Public Header</header>,
  PublicFooter: () => <footer data-testid="public-footer">Public Footer</footer>
}))

describe('AuthLayout', () => {
  const testChildren = <div data-testid="test-children">Test Content</div>

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)
      expect(container).toBeInTheDocument()
    })

    it('renders public header', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByText('Public Header')).toBeInTheDocument()
    })

    it('renders public footer', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
      expect(screen.getByText('Public Footer')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders all three sections (header, content, footer)', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('maintains vertical stack layout', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)

      const vstack = container.querySelector('.chakra-stack')
      expect(vstack).toBeInTheDocument()
    })

    it('applies full width to container', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)

      const vstack = container.querySelector('.chakra-stack')
      expect(vstack).toBeInTheDocument()
    })

    it('applies minimum height of 100vh', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)

      const vstack = container.querySelector('.chakra-stack')
      expect(vstack).toBeInTheDocument()
    })

    it('positions elements in correct order', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)

      const elements = container.querySelectorAll('header, div[data-testid="test-children"], footer')
      expect(elements).toHaveLength(3)
    })
  })

  describe('Main Content Area', () => {
    it('renders content area with flex layout', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('centers content horizontally and vertically', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('applies gray background to content area', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('applies full width to content area', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('applies padding to content area', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('allows content area to grow and fill available space', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Children Rendering', () => {
    it('renders simple text children', () => {
      render(<AuthLayout>Simple Text</AuthLayout>)

      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders complex component children', () => {
      const complexChild = (
        <div>
          <h1 data-testid="title">Login</h1>
          <form data-testid="form">
            <input type="text" />
            <button>Submit</button>
          </form>
        </div>
      )

      render(<AuthLayout>{complexChild}</AuthLayout>)

      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('form')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <AuthLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </AuthLayout>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
      expect(screen.getByTestId('child3')).toBeInTheDocument()
    })

    it('renders null children gracefully', () => {
      expect(() => {
        render(<AuthLayout>{null}</AuthLayout>)
      }).not.toThrow()
    })

    it('renders undefined children gracefully', () => {
      expect(() => {
        render(<AuthLayout>{undefined}</AuthLayout>)
      }).not.toThrow()
    })

    it('renders empty fragment children', () => {
      expect(() => {
        render(<AuthLayout>{<></>}</AuthLayout>)
      }).not.toThrow()
    })
  })

  describe('Header and Footer Integration', () => {
    it('renders header at the top', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      const header = screen.getByTestId('public-header')
      expect(header).toBeInTheDocument()
      expect(header.tagName.toLowerCase()).toBe('header')
    })

    it('renders footer at the bottom', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      const footer = screen.getByTestId('public-footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders content between header and footer', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('maintains header and footer visibility with different content', () => {
      const { rerender } = render(<AuthLayout><div>Content 1</div></AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()

      rerender(<AuthLayout><div>Content 2</div></AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('has proper semantic structure with header', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      const header = screen.getByTestId('public-header')
      expect(header.tagName.toLowerCase()).toBe('header')
    })

    it('has proper semantic structure with footer', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      const footer = screen.getByTestId('public-footer')
      expect(footer.tagName.toLowerCase()).toBe('footer')
    })

    it('maintains semantic structure for screen readers', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<AuthLayout>{testChildren}</AuthLayout>)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
      expect(screen.queryByTestId('public-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('public-footer')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount1()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()

      const { unmount: unmount2 } = render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      unmount2()

      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    })
  })

  describe('Re-rendering Behavior', () => {
    it('updates children content on re-render', () => {
      const { rerender } = render(<AuthLayout><div>Initial Content</div></AuthLayout>)

      expect(screen.getByText('Initial Content')).toBeInTheDocument()

      rerender(<AuthLayout><div>Updated Content</div></AuthLayout>)

      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument()
      expect(screen.getByText('Updated Content')).toBeInTheDocument()
    })

    it('maintains header and footer during children updates', () => {
      const { rerender } = render(<AuthLayout><div>Content 1</div></AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()

      rerender(<AuthLayout><div>Content 2</div></AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('handles rapid content changes', () => {
      const { rerender } = render(<AuthLayout><div>Content 1</div></AuthLayout>)

      for (let i = 2; i <= 10; i++) {
        rerender(<AuthLayout><div>Content {i}</div></AuthLayout>)
      }

      expect(screen.getByText('Content 10')).toBeInTheDocument()
      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly with single child', () => {
      const startTime = Date.now()
      render(<AuthLayout>{testChildren}</AuthLayout>)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles complex children efficiently', () => {
      const complexChild = (
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <h1>Section {i}</h1>
              <p>Content for section {i}</p>
            </div>
          ))}
        </div>
      )

      const startTime = Date.now()
      render(<AuthLayout>{complexChild}</AuthLayout>)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(200)
    })

    it('maintains performance during multiple re-renders', () => {
      const { rerender } = render(<AuthLayout><div>Content 1</div></AuthLayout>)

      const startTime = Date.now()

      for (let i = 2; i <= 50; i++) {
        rerender(<AuthLayout><div>Content {i}</div></AuthLayout>)
      }

      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in narrow viewports', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('maintains structure in wide viewports', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('handles viewport changes gracefully', () => {
      const { rerender } = render(
        <div style={{ width: '500px' }}>
          <AuthLayout>{testChildren}</AuthLayout>
        </div>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()

      rerender(
        <div style={{ width: '1200px' }}>
          <AuthLayout>{testChildren}</AuthLayout>
        </div>
      )

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string children', () => {
      render(<AuthLayout>{''}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('handles whitespace-only children', () => {
      render(<AuthLayout>{'   '}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })

    it('handles boolean children', () => {
      expect(() => {
        render(<AuthLayout>{true as any}</AuthLayout>)
      }).not.toThrow()
    })

    it('handles number children', () => {
      render(<AuthLayout>{42 as any}</AuthLayout>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('handles array of children', () => {
      const childrenArray = [
        <div key="1" data-testid="item1">Item 1</div>,
        <div key="2" data-testid="item2">Item 2</div>,
        <div key="3" data-testid="item3">Item 3</div>
      ]

      render(<AuthLayout>{childrenArray}</AuthLayout>)

      expect(screen.getByTestId('item1')).toBeInTheDocument()
      expect(screen.getByTestId('item2')).toBeInTheDocument()
      expect(screen.getByTestId('item3')).toBeInTheDocument()
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<AuthLayout>{testChildren}</AuthLayout>)
      }).not.toThrow()
    })
  })

  describe('Integration Scenarios', () => {
    it('works with login form component', () => {
      const loginForm = (
        <form data-testid="login-form">
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Login</button>
        </form>
      )

      render(<AuthLayout>{loginForm}</AuthLayout>)

      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })

    it('works with forgot password component', () => {
      const forgotPasswordForm = (
        <div data-testid="forgot-password">
          <h1>Forgot Password</h1>
          <input type="email" placeholder="Enter your email" />
        </div>
      )

      render(<AuthLayout>{forgotPasswordForm}</AuthLayout>)

      expect(screen.getByTestId('forgot-password')).toBeInTheDocument()
      expect(screen.getByText('Forgot Password')).toBeInTheDocument()
    })

    it('works with 2FA setup component', () => {
      const twoFASetup = (
        <div data-testid="2fa-setup">
          <h1>Setup Two-Factor Authentication</h1>
          <div>Scan QR Code</div>
        </div>
      )

      render(<AuthLayout>{twoFASetup}</AuthLayout>)

      expect(screen.getByTestId('2fa-setup')).toBeInTheDocument()
      expect(screen.getByText('Setup Two-Factor Authentication')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent layout structure', () => {
      const { container } = render(<AuthLayout>{testChildren}</AuthLayout>)

      const vstack = container.querySelector('.chakra-stack')
      expect(vstack).toBeInTheDocument()
    })

    it('applies consistent background color to content area', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('test-children')).toBeInTheDocument()
    })

    it('maintains vertical spacing between sections', () => {
      render(<AuthLayout>{testChildren}</AuthLayout>)

      expect(screen.getByTestId('public-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByTestId('public-footer')).toBeInTheDocument()
    })
  })
})
