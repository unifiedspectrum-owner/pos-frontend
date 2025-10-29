/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import LoaderWrapper from '../loader-wrapper'

/* Mock shared config */
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('LoaderWrapper Component', () => {
  describe('Basic Rendering', () => {
    it('should render children when not loading', () => {
      render(
        <LoaderWrapper isLoading={false}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render spinner when loading', () => {
      const { container } = render(
        <LoaderWrapper isLoading={true}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
    })

    it('should render loading text by default', () => {
      render(
        <LoaderWrapper isLoading={true}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should hide children when loading', () => {
      render(
        <LoaderWrapper isLoading={true}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('Loading Text', () => {
    it('should show custom loading text', () => {
      render(
        <LoaderWrapper isLoading={true} loadingText="Please wait...">
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })

    it('should hide loading text when showLoadingText is false', () => {
      render(
        <LoaderWrapper isLoading={true} showLoadingText={false}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  describe('Spinner Properties', () => {
    it('should accept custom spinner size', () => {
      const { container } = render(
        <LoaderWrapper isLoading={true} spinnerSize="xl">
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
    })

    it('should accept custom spinner color', () => {
      const { container } = render(
        <LoaderWrapper isLoading={true} spinnerColor="#ff0000">
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
    })

    it('should accept custom min height', () => {
      const { container } = render(
        <LoaderWrapper isLoading={true} minHeight="400px">
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Custom Loader', () => {
    it('should render custom loader component', () => {
      render(
        <LoaderWrapper
          isLoading={true}
          customLoader={<div>Custom Loader</div>}
        >
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Custom Loader')).toBeInTheDocument()
    })

    it('should not show default spinner with custom loader', () => {
      const { container } = render(
        <LoaderWrapper
          isLoading={true}
          customLoader={<div>Custom Loader</div>}
        >
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should wrap table with loader', () => {
      render(
        <LoaderWrapper isLoading={false}>
          <table><tbody><tr><td>Data</td></tr></tbody></table>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Data')).toBeInTheDocument()
    })

    it('should wrap form with loader', () => {
      render(
        <LoaderWrapper isLoading={true} loadingText="Loading form...">
          <form>Form Fields</form>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading form...')).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    it('should transition from loading to content', () => {
      const { rerender } = render(
        <LoaderWrapper isLoading={true}>
          <div>Content</div>
        </LoaderWrapper>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <LoaderWrapper isLoading={false}>
          <div>Content</div>
        </LoaderWrapper>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
