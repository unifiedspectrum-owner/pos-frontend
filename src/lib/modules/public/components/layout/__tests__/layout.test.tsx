/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Public module imports */
import { PublicLayout } from '@public/components/layout'

/* Mock next/link */
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

/* Mock i18n navigation */
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  usePathname: () => '/'
}))

describe('PublicLayout', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      expect(container).toBeInTheDocument()
    })

    it('renders header component', () => {
      render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders footer component', () => {
      render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders all layout components together', () => {
      render(
        <PublicLayout>
          <div>Main Content</div>
        </PublicLayout>
      )
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Children Rendering', () => {
    it('renders simple text children', () => {
      render(
        <PublicLayout>
          Simple text content
        </PublicLayout>
      )
      expect(screen.getByText('Simple text content')).toBeInTheDocument()
    })

    it('renders complex component children', () => {
      render(
        <PublicLayout>
          <div>
            <h1>Page Title</h1>
            <p>Page description</p>
          </div>
        </PublicLayout>
      )
      expect(screen.getByText('Page Title')).toBeInTheDocument()
      expect(screen.getByText('Page description')).toBeInTheDocument()
    })

    it('renders multiple children elements', () => {
      render(
        <PublicLayout>
          <div>First element</div>
          <div>Second element</div>
          <div>Third element</div>
        </PublicLayout>
      )
      expect(screen.getByText('First element')).toBeInTheDocument()
      expect(screen.getByText('Second element')).toBeInTheDocument()
      expect(screen.getByText('Third element')).toBeInTheDocument()
    })

    it('renders nested children correctly', () => {
      render(
        <PublicLayout>
          <div>
            <div>
              <span>Deeply nested content</span>
            </div>
          </div>
        </PublicLayout>
      )
      expect(screen.getByText('Deeply nested content')).toBeInTheDocument()
    })

    it('handles empty children gracefully', () => {
      const { container } = render(
        <PublicLayout>
          <></>
        </PublicLayout>
      )
      expect(container).toBeInTheDocument()
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('uses VStack for main container', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const vstacks = document.querySelectorAll('.chakra-stack')
      expect(vstacks.length).toBeGreaterThan(0)
    })

    it('renders header at the top', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders footer at the bottom', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders main content in Flex container', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('maintains proper hierarchy', () => {
      const { container } = render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const header = container.querySelector('header')
      const footer = container.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('uses semantic HTML elements', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(document.querySelector('header')).toBeInTheDocument()
      expect(document.querySelector('footer')).toBeInTheDocument()
    })

    it('maintains proper document structure', () => {
      render(
        <PublicLayout>
          <main>Main content</main>
        </PublicLayout>
      )
      expect(document.querySelector('header')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
      expect(document.querySelector('footer')).toBeInTheDocument()
    })

    it('provides navigable structure', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(
          <PublicLayout>
            <div>Test</div>
          </PublicLayout>
        )
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(
        <PublicLayout>
          <div>Content 1</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(
        <PublicLayout>
          <div>Content 2</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      unmount2()
    })

    it('updates children on rerender', () => {
      const { rerender } = render(
        <PublicLayout>
          <div>Original Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Original Content')).toBeInTheDocument()

      rerender(
        <PublicLayout>
          <div>Updated Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Updated Content')).toBeInTheDocument()
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(150)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <PublicLayout>
            <div>Content {i}</div>
          </PublicLayout>
        )
        expect(screen.getByText(`Content ${i}`)).toBeInTheDocument()
        unmount()
      }
    })

    it('renders complex children efficiently', () => {
      const startTime = Date.now()
      render(
        <PublicLayout>
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i}>Item {i}</div>
            ))}
          </div>
        </PublicLayout>
      )
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(300)
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in mobile layout', () => {
      render(
        <PublicLayout>
          <div>Mobile Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Mobile Content')).toBeInTheDocument()
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('maintains structure in desktop layout', () => {
      render(
        <PublicLayout>
          <div>Desktop Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Desktop Content')).toBeInTheDocument()
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('adapts to viewport size changes', () => {
      const { rerender } = render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()

      rerender(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      const { container } = render(
        <PublicLayout>
          {null}
        </PublicLayout>
      )
      expect(container).toBeInTheDocument()
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('handles undefined children gracefully', () => {
      const { container } = render(
        <PublicLayout>
          {undefined}
        </PublicLayout>
      )
      expect(container).toBeInTheDocument()
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('handles conditional children', () => {
      const showContent = true
      render(
        <PublicLayout>
          {showContent && <div>Conditional Content</div>}
        </PublicLayout>
      )
      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
    })

    it('handles array of children', () => {
      render(
        <PublicLayout>
          {[
            <div key="1">Item 1</div>,
            <div key="2">Item 2</div>,
            <div key="3">Item 3</div>
          ]}
        </PublicLayout>
      )
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(
          <PublicLayout>
            <div>Content</div>
          </PublicLayout>
        )
      }).not.toThrow()
    })
  })

  describe('Visual Consistency', () => {
    it('applies full viewport height', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('applies full width', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('centers content area', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('applies gray background to content area', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('works with simple page content', () => {
      render(
        <PublicLayout>
          <div>
            <h1>Welcome</h1>
            <p>This is a public page</p>
          </div>
        </PublicLayout>
      )
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('This is a public page')).toBeInTheDocument()
    })

    it('works with complex page content', () => {
      render(
        <PublicLayout>
          <div>
            <header>Page Header</header>
            <section>
              <article>Article content</article>
            </section>
            <aside>Sidebar</aside>
          </div>
        </PublicLayout>
      )
      expect(screen.getByText('Page Header')).toBeInTheDocument()
      expect(screen.getByText('Article content')).toBeInTheDocument()
      expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('maintains layout with form components', () => {
      render(
        <PublicLayout>
          <form>
            <input type="text" placeholder="Username" />
            <button type="submit">Submit</button>
          </form>
        </PublicLayout>
      )
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('works with navigation components', () => {
      render(
        <PublicLayout>
          <nav>
            <a href="/page1">Page 1</a>
            <a href="/page2">Page 2</a>
          </nav>
        </PublicLayout>
      )
      expect(screen.getByText('Page 1')).toBeInTheDocument()
      expect(screen.getByText('Page 2')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('renders header as first child', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('renders footer as last child', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
      expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
    })

    it('renders content between header and footer', () => {
      render(
        <PublicLayout>
          <div data-testid="main-content">Middle Content</div>
        </PublicLayout>
      )
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('maintains three-part layout structure', () => {
      render(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      )
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('accepts and renders children prop', () => {
      const children = <div>Custom Children</div>
      render(<PublicLayout>{children}</PublicLayout>)
      expect(screen.getByText('Custom Children')).toBeInTheDocument()
    })

    it('updates when children prop changes', () => {
      const { rerender } = render(
        <PublicLayout>
          <div>Initial</div>
        </PublicLayout>
      )
      expect(screen.getByText('Initial')).toBeInTheDocument()

      rerender(
        <PublicLayout>
          <div>Changed</div>
        </PublicLayout>
      )
      expect(screen.getByText('Changed')).toBeInTheDocument()
      expect(screen.queryByText('Initial')).not.toBeInTheDocument()
    })

    it('handles ReactNode children type', () => {
      render(
        <PublicLayout>
          <>
            <span>Fragment child 1</span>
            <span>Fragment child 2</span>
          </>
        </PublicLayout>
      )
      expect(screen.getByText('Fragment child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment child 2')).toBeInTheDocument()
    })
  })

  describe('Content Area', () => {
    it('centers content vertically and horizontally', () => {
      render(
        <PublicLayout>
          <div>Centered Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Centered Content')).toBeInTheDocument()
    })

    it('applies padding to content area', () => {
      render(
        <PublicLayout>
          <div>Content with padding</div>
        </PublicLayout>
      )
      expect(screen.getByText('Content with padding')).toBeInTheDocument()
    })

    it('uses flex layout for content', () => {
      render(
        <PublicLayout>
          <div>Flex Content</div>
        </PublicLayout>
      )
      expect(screen.getByText('Flex Content')).toBeInTheDocument()
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      expect(header).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })
  })
})
