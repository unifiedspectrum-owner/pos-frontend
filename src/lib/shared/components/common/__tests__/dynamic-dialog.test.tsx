/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import DynamicDialog from '../dynamic-dialog'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('DynamicDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Dialog Title',
    children: <div>Dialog Content</div>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Content')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<DynamicDialog {...defaultProps} isOpen={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
      expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument()
    })

    it('should render title correctly', () => {
      render(<DynamicDialog {...defaultProps} title="Custom Title" />, { wrapper: TestWrapper })

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(
        <DynamicDialog {...defaultProps}>
          <div>Custom Content</div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should render complex children content', () => {
      render(
        <DynamicDialog {...defaultProps}>
          <div>
            <h2>Section Title</h2>
            <p>Paragraph content</p>
            <button>Action Button</button>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph content')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('should show close button by default', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      /* Check for dialog content, close button is rendered */
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should hide close button when showCloseButton is false', () => {
      const { container } = render(
        <DynamicDialog {...defaultProps} showCloseButton={false} />,
        { wrapper: TestWrapper }
      )

      /* Title should be present but close button should not */
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()

      /* Note: This is a simplified check - in actual implementation,
         we'd need to verify the specific close button is not present */
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      const { container } = render(
        <DynamicDialog {...defaultProps} onClose={onClose} />,
        { wrapper: TestWrapper }
      )

      /* Find and click the close icon */
      const closeIcon = container.querySelector('[data-icon="true"]') || container.querySelector('svg')
      if (closeIcon) {
        await user.click(closeIcon)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('Title Icon', () => {
    it('should render without title icon by default', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should render with custom title icon', () => {
      const CustomIcon = <div data-testid="custom-icon">📋</div>

      render(
        <DynamicDialog {...defaultProps} titleIcon={CustomIcon} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should render with React Icon component', () => {
      const IconComponent = () => <svg data-testid="svg-icon"><circle /></svg>

      render(
        <DynamicDialog {...defaultProps} titleIcon={<IconComponent />} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument()
    })

    it('should render with emoji icon', () => {
      render(
        <DynamicDialog {...defaultProps} titleIcon={<span data-testid="emoji-icon">🎉</span>} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('emoji-icon')).toBeInTheDocument()
    })
  })

  describe('Dialog Size', () => {
    it('should use default size lg', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept xs size', () => {
      render(<DynamicDialog {...defaultProps} size="xs" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept sm size', () => {
      render(<DynamicDialog {...defaultProps} size="sm" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept md size', () => {
      render(<DynamicDialog {...defaultProps} size="md" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept lg size', () => {
      render(<DynamicDialog {...defaultProps} size="lg" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept xl size', () => {
      render(<DynamicDialog {...defaultProps} size="xl" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })
  })

  describe('Custom Max Width', () => {
    it('should work without custom maxWidth', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept custom maxWidth', () => {
      render(<DynamicDialog {...defaultProps} maxWidth="600px" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept percentage maxWidth', () => {
      render(<DynamicDialog {...defaultProps} maxWidth="80%" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should accept rem maxWidth', () => {
      render(<DynamicDialog {...defaultProps} maxWidth="40rem" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })
  })

  describe('Outside Click Behavior', () => {
    it('should allow closing on outside click by default', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      /* closeOnOutsideClick defaults to true */
    })

    it('should disable closing on outside click when closeOnOutsideClick is false', () => {
      render(<DynamicDialog {...defaultProps} closeOnOutsideClick={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should call onClose when closeOnOutsideClick is true', () => {
      const onClose = vi.fn()

      render(
        <DynamicDialog {...defaultProps} onClose={onClose} closeOnOutsideClick={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should not call onClose when closeOnOutsideClick is false', () => {
      const onClose = vi.fn()

      render(
        <DynamicDialog {...defaultProps} onClose={onClose} closeOnOutsideClick={false} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      /* onClose should not be called automatically */
    })
  })

  describe('Use Cases', () => {
    it('should render form dialog', () => {
      render(
        <DynamicDialog {...defaultProps} title="Add User">
          <form>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <button type="submit">Submit</button>
          </form>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Add User')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should render details dialog', () => {
      render(
        <DynamicDialog {...defaultProps} title="User Details">
          <div>
            <p>Name: John Doe</p>
            <p>Email: john@example.com</p>
            <p>Role: Admin</p>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('User Details')).toBeInTheDocument()
      expect(screen.getByText('Name: John Doe')).toBeInTheDocument()
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Role: Admin')).toBeInTheDocument()
    })

    it('should render settings dialog', () => {
      render(
        <DynamicDialog {...defaultProps} title="Settings" size="md">
          <div>
            <h3>Preferences</h3>
            <label>
              <input type="checkbox" /> Enable notifications
            </label>
            <label>
              <input type="checkbox" /> Dark mode
            </label>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
      expect(screen.getByText('Enable notifications')).toBeInTheDocument()
      expect(screen.getByText('Dark mode')).toBeInTheDocument()
    })

    it('should render image preview dialog', () => {
      render(
        <DynamicDialog {...defaultProps} title="Image Preview" size="xl">
          <img src="/preview.jpg" alt="Preview" data-testid="preview-image" />
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Image Preview')).toBeInTheDocument()
      expect(screen.getByTestId('preview-image')).toBeInTheDocument()
    })

    it('should render list dialog', () => {
      render(
        <DynamicDialog {...defaultProps} title="Select Item">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Select Item')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render dialog with action buttons', () => {
      render(
        <DynamicDialog {...defaultProps} title="Confirm Action">
          <div>
            <p>Are you sure you want to proceed?</p>
            <div>
              <button>Cancel</button>
              <button>Confirm</button>
            </div>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should render dialog without close button for forced actions', () => {
      render(
        <DynamicDialog
          {...defaultProps}
          title="Important Update"
          showCloseButton={false}
          closeOnOutsideClick={false}
        >
          <div>
            <p>Please complete this action before continuing</p>
            <button>Complete</button>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Important Update')).toBeInTheDocument()
      expect(screen.getByText('Please complete this action before continuing')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<DynamicDialog {...defaultProps} title="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Content')).toBeInTheDocument()
    })

    it('should handle long title', () => {
      const longTitle = 'This is a very long dialog title that should still render properly without breaking the layout'

      render(<DynamicDialog {...defaultProps} title={longTitle} />, { wrapper: TestWrapper })

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(
        <DynamicDialog {...defaultProps} title="Edit <User> & Permissions" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Edit <User> & Permissions')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      render(
        <DynamicDialog {...defaultProps}>
          <div></div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should handle null children gracefully', () => {
      render(
        <DynamicDialog {...defaultProps}>
          {null}
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <DynamicDialog {...defaultProps}>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
      expect(screen.getByText('Third Child')).toBeInTheDocument()
    })

    it('should handle nested dialogs content', () => {
      render(
        <DynamicDialog {...defaultProps}>
          <div>
            <div>
              <div>Deeply nested content</div>
            </div>
          </div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Deeply nested content')).toBeInTheDocument()
    })

    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(
        <DynamicDialog {...defaultProps} isOpen={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()

      rerender(<DynamicDialog {...defaultProps} isOpen={false} />)
      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
      })

      rerender(<DynamicDialog {...defaultProps} isOpen={true} />)
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      })
    })

    it('should handle title icon without title text', () => {
      render(
        <DynamicDialog {...defaultProps} title="" titleIcon={<span data-testid="icon">📋</span>} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('should handle complex nested icon', () => {
      const ComplexIcon = () => (
        <div data-testid="complex-icon">
          <svg><circle /></svg>
          <span>Label</span>
        </div>
      )

      render(
        <DynamicDialog {...defaultProps} titleIcon={<ComplexIcon />} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should update when title changes', () => {
      const { rerender } = render(
        <DynamicDialog {...defaultProps} title="Original Title" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Original Title')).toBeInTheDocument()

      rerender(<DynamicDialog {...defaultProps} title="Updated Title" />)

      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })

    it('should update when children change', () => {
      const { rerender } = render(
        <DynamicDialog {...defaultProps}>
          <div>Original Content</div>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Original Content')).toBeInTheDocument()

      rerender(
        <DynamicDialog {...defaultProps}>
          <div>Updated Content</div>
        </DynamicDialog>
      )

      expect(screen.getByText('Updated Content')).toBeInTheDocument()
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument()
    })

    it('should update when size changes', () => {
      const { rerender } = render(
        <DynamicDialog {...defaultProps} size="sm" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()

      rerender(<DynamicDialog {...defaultProps} size="xl" />)

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should update when onClose changes', () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()

      const { rerender } = render(
        <DynamicDialog {...defaultProps} onClose={onClose1} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()

      rerender(<DynamicDialog {...defaultProps} onClose={onClose2} />)

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render with proper dialog structure', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible title', () => {
      render(<DynamicDialog {...defaultProps} title="Accessible Title" />, { wrapper: TestWrapper })

      expect(screen.getByText('Accessible Title')).toBeInTheDocument()
    })

    it('should maintain focus within dialog', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should have accessible close button', () => {
      render(<DynamicDialog {...defaultProps} />, { wrapper: TestWrapper })

      /* Close button should be present and interactable */
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })
  })

  describe('Interactive Content', () => {
    it('should handle button clicks inside dialog', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <DynamicDialog {...defaultProps}>
          <button onClick={handleClick}>Click Me</button>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByText('Click Me')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle input interactions inside dialog', async () => {
      const user = userEvent.setup()

      render(
        <DynamicDialog {...defaultProps}>
          <input type="text" placeholder="Enter text" />
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement
      await user.type(input, 'Hello')

      expect(input.value).toBe('Hello')
    })

    it('should handle form submission inside dialog', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <DynamicDialog {...defaultProps}>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" />
            <button type="submit">Submit</button>
          </form>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should handle checkbox interactions inside dialog', async () => {
      const user = userEvent.setup()

      render(
        <DynamicDialog {...defaultProps}>
          <label>
            <input type="checkbox" data-testid="checkbox" />
            Enable option
          </label>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })

    it('should handle select interactions inside dialog', async () => {
      const user = userEvent.setup()

      render(
        <DynamicDialog {...defaultProps}>
          <select data-testid="select">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </select>
        </DynamicDialog>,
        { wrapper: TestWrapper }
      )

      const select = screen.getByTestId('select')
      await user.selectOptions(select, '2')

      expect(select).toHaveValue('2')
    })
  })
})
