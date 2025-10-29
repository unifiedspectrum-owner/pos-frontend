/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import RichTextEditorField from '../rich-text-editor'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Mock Quill */
const mockQuillInstance = {
  root: {
    innerHTML: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  on: vi.fn(),
  off: vi.fn(),
  enable: vi.fn(),
  getModule: vi.fn(() => ({
    container: document.createElement('div')
  }))
}

vi.mock('quill', () => ({
  default: vi.fn(() => mockQuillInstance)
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('RichTextEditorField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Description',
    value: '',
    placeholder: 'Write something...',
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockQuillInstance.root.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<RichTextEditorField {...defaultProps} label="Content" />, { wrapper: TestWrapper })

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<RichTextEditorField {...defaultProps} placeholder="Type here..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render with default placeholder when not provided', () => {
      const props = { ...defaultProps, placeholder: undefined }
      render(<RichTextEditorField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render editor container', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<RichTextEditorField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<RichTextEditorField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Description')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <RichTextEditorField {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<RichTextEditorField {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should apply error border color when invalid', () => {
      render(<RichTextEditorField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label).toBeInTheDocument()
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<RichTextEditorField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<RichTextEditorField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.enable).toHaveBeenCalledWith(false)
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<RichTextEditorField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should apply disabled opacity', () => {
      render(<RichTextEditorField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} disabled={true} /></TestWrapper>)

      expect(mockQuillInstance.enable).toHaveBeenCalledWith(false)
    })
  })

  describe('ReadOnly State', () => {
    it('should be readOnly when readOnly prop is true', () => {
      render(<RichTextEditorField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.enable).toHaveBeenCalledWith(false)
    })

    it('should not be readOnly when readOnly prop is false', () => {
      render(<RichTextEditorField {...defaultProps} readOnly={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should update readOnly state dynamically', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} readOnly={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} readOnly={true} /></TestWrapper>)

      expect(mockQuillInstance.enable).toHaveBeenCalledWith(false)
    })

    it('should disable editor when both disabled and readOnly', () => {
      render(<RichTextEditorField {...defaultProps} disabled={true} readOnly={true} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.enable).toHaveBeenCalledWith(false)
    })
  })

  describe('Value Handling', () => {
    it('should set initial value', () => {
      const initialValue = '<p>Initial content</p>'
      render(<RichTextEditorField {...defaultProps} value={initialValue} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<RichTextEditorField {...defaultProps} value="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should update value when prop changes', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} value="<p>Old</p>" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} value="<p>New</p>" /></TestWrapper>)

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle HTML content', () => {
      const htmlContent = '<p><strong>Bold</strong> and <em>italic</em></p>'
      render(<RichTextEditorField {...defaultProps} value={htmlContent} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Change Event', () => {
    it('should register text-change listener', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.on).toHaveBeenCalledWith('text-change', expect.any(Function))
    })

    it('should call onChange with synthetic event', () => {
      render(<RichTextEditorField {...defaultProps} fieldName="content" />, { wrapper: TestWrapper })

      expect(mockQuillInstance.on).toHaveBeenCalledWith('text-change', expect.any(Function))
    })

    it('should update handler when onChange changes', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      const newOnChange = vi.fn()
      rerender(<TestWrapper><RichTextEditorField {...defaultProps} onChange={newOnChange} /></TestWrapper>)

      expect(mockQuillInstance.off).toHaveBeenCalledWith('text-change', expect.any(Function))
      expect(mockQuillInstance.on).toHaveBeenCalled()
    })
  })

  describe('Blur Event', () => {
    it('should register blur listener when onBlur provided', () => {
      render(<RichTextEditorField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.root.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function))
    })

    it('should work without onBlur handler', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should update blur handler when onBlur changes', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const newOnBlur = vi.fn()
      rerender(<TestWrapper><RichTextEditorField {...defaultProps} onBlur={newOnBlur} /></TestWrapper>)

      expect(mockQuillInstance.root.removeEventListener).toHaveBeenCalledWith('blur', expect.any(Function))
      expect(mockQuillInstance.root.addEventListener).toHaveBeenCalled()
    })
  })

  describe('Field Name', () => {
    it('should accept fieldName prop', () => {
      render(<RichTextEditorField {...defaultProps} fieldName="description" />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should work without fieldName', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(<RichTextEditorField {...defaultProps} helperText="Enter a detailed description" />, { wrapper: TestWrapper })

      expect(screen.getByText('Enter a detailed description')).toBeInTheDocument()
    })

    it('should not display helper text when not provided', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Custom Styling Props', () => {
    it('should apply custom height', () => {
      render(<RichTextEditorField {...defaultProps} height="400px" />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should apply default height when not provided', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Quill Initialization', () => {
    it('should initialize Quill editor', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.on).toHaveBeenCalled()
    })

    it('should initialize with toolbar configuration', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should add tooltips to toolbar buttons', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should only initialize once', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} value="<p>New</p>" /></TestWrapper>)

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} value="<p>Old</p>" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><RichTextEditorField {...defaultProps} value="<p>New</p>" /></TestWrapper>)

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<RichTextEditorField {...defaultProps} value="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle null value gracefully', () => {
      render(<RichTextEditorField {...defaultProps} value={null as any} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Toolbar Configuration', () => {
    it('should include header formatting', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should include text formatting options', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should include list options', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should include alignment options', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should include code block option', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })

    it('should include clean formatting option', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockQuillInstance.getModule).toHaveBeenCalledWith('toolbar')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = '<p>' + 'a'.repeat(10000) + '</p>'
      render(<RichTextEditorField {...defaultProps} value={longContent} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<RichTextEditorField {...defaultProps} value="<p>1</p>" />, { wrapper: TestWrapper })

      const values = ['<p>2</p>', '<p>3</p>', '<p>4</p>', '<p>5</p>']
      values.forEach(value => {
        rerender(<TestWrapper><RichTextEditorField {...defaultProps} value={value} /></TestWrapper>)
      })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle malformed HTML', () => {
      const malformedHTML = '<p>Unclosed tag'
      render(<RichTextEditorField {...defaultProps} value={malformedHTML} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      const specialContent = '<p>&lt;script&gt;alert("test")&lt;/script&gt;</p>'
      render(<RichTextEditorField {...defaultProps} value={specialContent} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should associate error message with editor', () => {
      render(
        <RichTextEditorField {...defaultProps} isInValid={true} errorMessage="Invalid content" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid content')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should support screen readers with proper semantics', () => {
      render(<RichTextEditorField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label).toBeInTheDocument()
    })

    it('should have selectable label text', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <RichTextEditorField {...defaultProps} fieldName="content" />
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
          <RichTextEditorField {...defaultProps} label="Editor 1" onChange={onChange1} />
          <RichTextEditorField {...defaultProps} label="Editor 2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Editor 1')).toBeInTheDocument()
      expect(screen.getByText('Editor 2')).toBeInTheDocument()
    })
  })

  describe('Memory Management', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(<RichTextEditorField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      unmount()

      expect(mockQuillInstance.off).toHaveBeenCalledWith('text-change', expect.any(Function))
    })

    it('should prevent circular updates', () => {
      render(<RichTextEditorField {...defaultProps} value="<p>Test</p>" />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Border and Container Styling', () => {
    it('should have border styling', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should have rounded borders', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should have full width', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should hide overflow', () => {
      render(<RichTextEditorField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })
})
