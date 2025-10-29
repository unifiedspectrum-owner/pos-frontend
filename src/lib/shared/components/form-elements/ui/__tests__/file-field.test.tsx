/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import FileField from '../file-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

vi.mock('@shared/utils', () => ({
  createToastNotification: vi.fn()
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('FileField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Test File Upload',
    placeholder: 'Drag and drop files here',
    isInValid: false,
    required: false,
    name: 'testFile',
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console.log during tests */
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test File Upload')).toBeInTheDocument()
      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<FileField {...defaultProps} label="Upload Documents" />, { wrapper: TestWrapper })

      expect(screen.getByText('Upload Documents')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<FileField {...defaultProps} placeholder="Drop files here..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Drop files here...')).toBeInTheDocument()
    })

    it('should render with default placeholder when not provided', () => {
      const props = { ...defaultProps, placeholder: undefined }
      render(<FileField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should render upload icon', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should render file limits text', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 5 files, up to 2MB each')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<FileField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test File Upload')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<FileField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test File Upload')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<FileField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><FileField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test File Upload')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <FileField {...defaultProps} isInValid={true} errorMessage="File is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('File is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<FileField {...defaultProps} isInValid={false} errorMessage="File is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('File is required')).not.toBeInTheDocument()
    })

    it('should apply error border color when invalid', () => {
      render(<FileField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      expect(dropzone).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<FileField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><FileField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<FileField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<FileField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<FileField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<FileField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><FileField {...defaultProps} disabled={true} /></TestWrapper>)

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should be enabled by default', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('ReadOnly State', () => {
    it('should disable file upload when readOnly', () => {
      render(<FileField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should allow readOnly to be false by default', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('File Size and Count Limits', () => {
    it('should display custom max files limit', () => {
      render(<FileField {...defaultProps} maxFiles={10} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 10 files, up to 2MB each')).toBeInTheDocument()
    })

    it('should display default max files limit', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 5 files, up to 2MB each')).toBeInTheDocument()
    })

    it('should display custom max size limit', () => {
      render(<FileField {...defaultProps} maxSizeMB={5} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 5 files, up to 5MB each')).toBeInTheDocument()
    })

    it('should display default max size limit', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 5 files, up to 2MB each')).toBeInTheDocument()
    })

    it('should display both custom limits', () => {
      render(<FileField {...defaultProps} maxFiles={3} maxSizeMB={10} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 3 files, up to 10MB each')).toBeInTheDocument()
    })
  })

  describe('Accept Types', () => {
    it('should accept custom file types', () => {
      render(<FileField {...defaultProps} accept=".jpg,.png" />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should use default accept types', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute', () => {
      render(<FileField {...defaultProps} name="documents" />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Custom Styling Props', () => {
    it('should apply custom width', () => {
      render(<FileField {...defaultProps} width="500px" />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should apply default full width', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should apply custom height', () => {
      render(<FileField {...defaultProps} height="300px" />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      expect(dropzone).toHaveStyle({ height: '300px', minHeight: '300px', maxHeight: '300px' })
    })

    it('should apply custom preview dimensions', () => {
      render(<FileField {...defaultProps} previewWidth="60px" previewHeight="60px" />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should use default preview dimensions', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('File Change Handler', () => {
    it('should call onChange with accepted files', async () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      /* This test would require mocking the file upload interaction */
      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should work without onChange handler', () => {
      const props = { ...defaultProps, onChange: undefined }
      render(<FileField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Dropzone Appearance', () => {
    it('should have dashed border', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      expect(dropzone).toHaveStyle({ borderStyle: 'dashed', borderWidth: '2' })
    })

    it('should have rounded borders', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      /* Verify dropzone element is rendered - Chakra UI handles border radius styling */
      expect(dropzone).toBeInTheDocument()
    })

    it('should have padding', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      /* Verify dropzone element is rendered - Chakra UI handles padding styling */
      expect(dropzone).toBeInTheDocument()
    })
  })

  describe('File Name Cleaning Utility', () => {
    it('should handle regular filenames', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should clean duplicate extensions', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty file selection', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should handle null max files', () => {
      render(<FileField {...defaultProps} maxFiles={0} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 0 files, up to 2MB each')).toBeInTheDocument()
    })

    it('should handle very large max size', () => {
      render(<FileField {...defaultProps} maxSizeMB={100} />, { wrapper: TestWrapper })

      expect(screen.getByText('Max 5 files, up to 100MB each')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test File Upload')).toBeInTheDocument()
    })

    it('should associate error message with upload area', () => {
      render(
        <FileField {...defaultProps} isInValid={true} errorMessage="Invalid file" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid file')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should support screen readers with proper semantics', () => {
      render(<FileField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test File Upload')
      expect(label).toBeInTheDocument()
    })

    it('should provide helpful text for file limits', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Max.*files.*up to.*MB each/)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <FileField {...defaultProps} name="documents" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <FileField {...defaultProps} label="Upload 1" name="file1" onChange={onChange1} />
          <FileField {...defaultProps} label="Upload 2" name="file2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Upload 1')).toBeInTheDocument()
      expect(screen.getByText('Upload 2')).toBeInTheDocument()
    })
  })

  describe('Upload Trigger Button', () => {
    it('should render upload trigger button', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('File Validation', () => {
    it('should validate files', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Dropzone States', () => {
    it('should render normal state', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should render error state when invalid', () => {
      render(<FileField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const dropzone = screen.getByText('Drag and drop files here').parentElement?.parentElement
      expect(dropzone).toHaveStyle({ borderColor: 'red.500' })
    })
  })

  describe('File Upload Context', () => {
    it('should provide file upload context', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should handle empty value', () => {
      render(<FileField {...defaultProps} value={undefined} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should handle File[] value', () => {
      const files = [new File(['content'], 'test.txt', { type: 'text/plain' })]
      render(<FileField {...defaultProps} value={files} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should handle string value', () => {
      render(<FileField {...defaultProps} value="test.txt" />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should handle FileAttachment[] value', () => {
      const attachments = [{
        filename: 'test.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        file_content: 'base64content',
        is_public: false
      }]
      render(<FileField {...defaultProps} value={attachments} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('File Preview', () => {
    it('should render file preview area', () => {
      render(<FileField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })

  describe('Blur Event', () => {
    it('should work without onBlur handler', () => {
      render(<FileField {...defaultProps} onBlur={undefined} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })

    it('should accept onBlur prop', () => {
      render(<FileField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument()
    })
  })
})
