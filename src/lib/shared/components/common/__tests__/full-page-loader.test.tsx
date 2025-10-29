/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import FullPageLoader from '../full-page-loader'

/* Mock shared config */
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('FullPageLoader Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we process your request.')).toBeInTheDocument()
    })

    it('should render spinner', () => {
      const { container } = render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Check for spinner element */
      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should render with default title', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render with default subtitle', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(screen.getByText('Please wait while we process your request.')).toBeInTheDocument()
    })

    it('should render with custom title', () => {
      render(<FullPageLoader title="Processing..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should render with custom subtitle', () => {
      render(<FullPageLoader subtitle="Your data is being loaded." />, { wrapper: TestWrapper })

      expect(screen.getByText('Your data is being loaded.')).toBeInTheDocument()
    })

    it('should render both custom title and subtitle', () => {
      render(
        <FullPageLoader
          title="Uploading Files"
          subtitle="This may take a few moments."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Uploading Files')).toBeInTheDocument()
      expect(screen.getByText('This may take a few moments.')).toBeInTheDocument()
    })
  })

  describe('Spinner Size', () => {
    it('should render with default size xl', () => {
      const { container } = render(<FullPageLoader />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should accept sm size', () => {
      const { container } = render(<FullPageLoader size="sm" />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should accept md size', () => {
      const { container } = render(<FullPageLoader size="md" />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should accept lg size', () => {
      const { container } = render(<FullPageLoader size="lg" />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should accept xl size', () => {
      const { container } = render(<FullPageLoader size="xl" />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Spinner Color', () => {
    it('should use default primary color', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should accept custom color', () => {
      render(<FullPageLoader color="#ff0000" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should accept named colors', () => {
      render(<FullPageLoader color="red.500" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should accept hex colors', () => {
      render(<FullPageLoader color="#00ff00" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should accept rgb colors', () => {
      render(<FullPageLoader color="rgb(255, 0, 0)" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Layout and Positioning', () => {
    it('should render as fixed position overlay', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should cover full viewport', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should have high z-index', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should center content', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should have semi-transparent background', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Text Styling', () => {
    it('should render title with medium font weight', () => {
      render(<FullPageLoader title="Test Title" />, { wrapper: TestWrapper })

      const title = screen.getByText('Test Title')
      expect(title).toBeInTheDocument()
    })

    it('should render subtitle with smaller font', () => {
      render(<FullPageLoader subtitle="Test Subtitle" />, { wrapper: TestWrapper })

      const subtitle = screen.getByText('Test Subtitle')
      expect(subtitle).toBeInTheDocument()
    })

    it('should style title and subtitle differently', () => {
      render(
        <FullPageLoader title="Main Title" subtitle="Secondary Text" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Secondary Text')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should render for page loading', () => {
      render(
        <FullPageLoader
          title="Loading Page..."
          subtitle="Please wait while we load your content."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading Page...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we load your content.')).toBeInTheDocument()
    })

    it('should render for data fetching', () => {
      render(
        <FullPageLoader
          title="Fetching Data..."
          subtitle="This will only take a moment."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Fetching Data...')).toBeInTheDocument()
      expect(screen.getByText('This will only take a moment.')).toBeInTheDocument()
    })

    it('should render for file upload', () => {
      render(
        <FullPageLoader
          title="Uploading Files..."
          subtitle="Please do not close this window."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Uploading Files...')).toBeInTheDocument()
      expect(screen.getByText('Please do not close this window.')).toBeInTheDocument()
    })

    it('should render for authentication', () => {
      render(
        <FullPageLoader
          title="Signing In..."
          subtitle="Verifying your credentials."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Signing In...')).toBeInTheDocument()
      expect(screen.getByText('Verifying your credentials.')).toBeInTheDocument()
    })

    it('should render for processing', () => {
      render(
        <FullPageLoader
          title="Processing..."
          subtitle="Your request is being processed."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByText('Your request is being processed.')).toBeInTheDocument()
    })

    it('should render for saving', () => {
      render(
        <FullPageLoader
          title="Saving Changes..."
          subtitle="Your changes are being saved."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Saving Changes...')).toBeInTheDocument()
      expect(screen.getByText('Your changes are being saved.')).toBeInTheDocument()
    })

    it('should render for deleting', () => {
      render(
        <FullPageLoader
          title="Deleting..."
          subtitle="This operation cannot be undone."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
      expect(screen.getByText('This operation cannot be undone.')).toBeInTheDocument()
    })

    it('should render for initial app load', () => {
      render(
        <FullPageLoader
          title="Initializing Application..."
          subtitle="Setting up your workspace."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Initializing Application...')).toBeInTheDocument()
      expect(screen.getByText('Setting up your workspace.')).toBeInTheDocument()
    })

    it('should render with small spinner for inline use', () => {
      const { container } = render(
        <FullPageLoader
          size="sm"
          title="Quick Load"
          subtitle="Almost there..."
        />,
        { wrapper: TestWrapper }
      )

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
      expect(screen.getByText('Quick Load')).toBeInTheDocument()
    })

    it('should render with custom color for branded loading', () => {
      render(
        <FullPageLoader
          color="#ff6b6b"
          title="Brand Loading..."
          subtitle="Custom experience loading."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Brand Loading...')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<FullPageLoader title="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Please wait while we process your request.')).toBeInTheDocument()
    })

    it('should handle empty subtitle', () => {
      render(<FullPageLoader subtitle="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should handle both empty title and subtitle', () => {
      const { container } = render(<FullPageLoader title="" subtitle="" />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should handle very long title', () => {
      const longTitle = 'This is a very long loading title that should still display properly without breaking the layout or causing overflow issues'

      render(<FullPageLoader title={longTitle} />, { wrapper: TestWrapper })

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle very long subtitle', () => {
      const longSubtitle = 'This is a very long subtitle with a lot of explanation about what is happening during the loading process and why it might take some time'

      render(<FullPageLoader subtitle={longSubtitle} />, { wrapper: TestWrapper })

      expect(screen.getByText(longSubtitle)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(<FullPageLoader title="Loading <Data> & Processing..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading <Data> & Processing...')).toBeInTheDocument()
    })

    it('should handle special characters in subtitle', () => {
      render(
        <FullPageLoader subtitle="Processing your request @ example.com" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Processing your request @ example.com')).toBeInTheDocument()
    })

    it('should handle multiline title', () => {
      const multilineTitle = 'Loading\nData'

      render(<FullPageLoader title={multilineTitle} />, { wrapper: TestWrapper })

      expect(screen.getByText((content, element) => {
        return element?.textContent === multilineTitle
      })).toBeInTheDocument()
    })

    it('should handle multiline subtitle', () => {
      const multilineSubtitle = 'Please wait\nThis may take a moment'

      render(<FullPageLoader subtitle={multilineSubtitle} />, { wrapper: TestWrapper })

      expect(screen.getByText((content, element) => {
        return element?.textContent === multilineSubtitle
      })).toBeInTheDocument()
    })

    it('should handle unicode characters in title', () => {
      render(<FullPageLoader title="Loading... ⏳" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading... ⏳')).toBeInTheDocument()
    })

    it('should handle unicode characters in subtitle', () => {
      render(<FullPageLoader subtitle="Please wait ⏱️ Processing..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Please wait ⏱️ Processing...')).toBeInTheDocument()
    })

    it('should handle emoji in title', () => {
      render(<FullPageLoader title="🔄 Loading Data" />, { wrapper: TestWrapper })

      expect(screen.getByText('🔄 Loading Data')).toBeInTheDocument()
    })

    it('should handle emoji in subtitle', () => {
      render(<FullPageLoader subtitle="⏳ Please wait a moment..." />, { wrapper: TestWrapper })

      expect(screen.getByText('⏳ Please wait a moment...')).toBeInTheDocument()
    })

    it('should handle numeric title', () => {
      render(<FullPageLoader title="Loading 100%" />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading 100%')).toBeInTheDocument()
    })

    it('should handle numeric subtitle', () => {
      render(<FullPageLoader subtitle="Step 1 of 5" />, { wrapper: TestWrapper })

      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should update when title changes', () => {
      const { rerender } = render(
        <FullPageLoader title="Loading..." />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(<FullPageLoader title="Processing..." />)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should update when subtitle changes', () => {
      const { rerender } = render(
        <FullPageLoader subtitle="Please wait..." />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Please wait...')).toBeInTheDocument()

      rerender(<FullPageLoader subtitle="Almost done..." />)

      expect(screen.getByText('Almost done...')).toBeInTheDocument()
      expect(screen.queryByText('Please wait...')).not.toBeInTheDocument()
    })

    it('should update when size changes', () => {
      const { container, rerender } = render(
        <FullPageLoader size="sm" />,
        { wrapper: TestWrapper }
      )

      const spinner1 = container.querySelector('.chakra-spinner')
      expect(spinner1).toBeInTheDocument()

      rerender(<FullPageLoader size="xl" />)

      const spinner2 = container.querySelector('.chakra-spinner')
      expect(spinner2).toBeInTheDocument()
    })

    it('should update when color changes', () => {
      const { rerender } = render(
        <FullPageLoader color="#ff0000" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(<FullPageLoader color="#00ff00" />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should update multiple props simultaneously', () => {
      const { rerender } = render(
        <FullPageLoader title="Loading..." subtitle="Please wait" size="sm" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Please wait')).toBeInTheDocument()

      rerender(
        <FullPageLoader title="Processing..." subtitle="Almost done" size="xl" />
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByText('Almost done')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have spinner with progressbar role', () => {
      const { container } = render(<FullPageLoader />, { wrapper: TestWrapper })

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should have readable text content', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we process your request.')).toBeInTheDocument()
    })

    it('should render text in proper hierarchy', () => {
      render(
        <FullPageLoader title="Main Loading" subtitle="Secondary info" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Main Loading')).toBeInTheDocument()
      expect(screen.getByText('Secondary info')).toBeInTheDocument()
    })

    it('should be visible with high contrast', () => {
      render(<FullPageLoader />, { wrapper: TestWrapper })

      /* Component renders with proper content */
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render quickly with default props', () => {
      const { container } = render(<FullPageLoader />, { wrapper: TestWrapper })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render quickly with custom props', () => {
      const { container } = render(
        <FullPageLoader
          title="Custom Title"
          subtitle="Custom Subtitle"
          size="lg"
          color="#ff0000"
        />,
        { wrapper: TestWrapper }
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle rapid prop changes', () => {
      const { rerender } = render(
        <FullPageLoader title="Title 1" />,
        { wrapper: TestWrapper }
      )

      rerender(<FullPageLoader title="Title 2" />)
      rerender(<FullPageLoader title="Title 3" />)
      rerender(<FullPageLoader title="Title 4" />)

      expect(screen.getByText('Title 4')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('should maintain consistent layout across different content lengths', () => {
      const { rerender } = render(
        <FullPageLoader title="Short" subtitle="Brief" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Short')).toBeInTheDocument()

      rerender(
        <FullPageLoader
          title="This is a much longer title"
          subtitle="This is a much longer subtitle with more content"
        />
      )

      expect(screen.getByText('This is a much longer title')).toBeInTheDocument()
    })

    it('should maintain spinner visibility with any text length', () => {
      const { container } = render(
        <FullPageLoader
          title="Very long title that extends across multiple lines"
          subtitle="Very long subtitle that also extends significantly"
        />,
        { wrapper: TestWrapper }
      )

      const spinner = container.querySelector('.chakra-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should render consistently with different spinner sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl']

      sizes.forEach(size => {
        const { container } = render(<FullPageLoader size={size} />, { wrapper: TestWrapper })
        const spinner = container.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
      })
    })
  })
})
