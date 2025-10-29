/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import HeaderSection from '../header'

/* Mock dependencies */
vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn()
}))

vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce',
  GRAY_COLOR: '#718096'
}))

vi.mock('@shared/components/common/bread-crumbs', () => ({
  generateBreadcrumbs: vi.fn()
}))

import { usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { generateBreadcrumbs } from '@shared/components/common/bread-crumbs'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('HeaderSection Component', () => {
  const mockHandleAdd = vi.fn()
  const mockHandleRefresh = vi.fn()
  const mockPush = vi.fn()
  const mockTranslations = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'title': 'Test Title',
      'buttons.refresh': 'Refresh',
      'buttons.add': 'Add New'
    }
    return translations[key] || key
  })

  const defaultProps = {
    translation: 'testModule',
    loading: false,
    handleAdd: mockHandleAdd,
    handleRefresh: mockHandleRefresh
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(usePathname).mockReturnValue('/admin/users')
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>)
    vi.mocked(useLocale).mockReturnValue('en')
    vi.mocked(useTranslations).mockReturnValue(mockTranslations as unknown as ReturnType<typeof useTranslations>)
    vi.mocked(generateBreadcrumbs).mockReturnValue([
      { name: 'Admin', path: '/admin' },
      { name: 'Users', path: '/admin/users' }
    ])
  })

  describe('Basic Rendering', () => {
    it('should render header with title', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render breadcrumbs', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('should render refresh button', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
    })

    it('should render add button by default', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Add New')).toBeInTheDocument()
    })

    it('should render language switcher', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Switch Language')).toBeInTheDocument()
    })
  })

  describe('Add Button', () => {
    it('should show add button when showAddButton is true', () => {
      render(<HeaderSection {...defaultProps} showAddButton={true} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Add New')).toBeInTheDocument()
    })

    it('should hide add button when showAddButton is false', () => {
      render(<HeaderSection {...defaultProps} showAddButton={false} />, { wrapper: TestWrapper })

      expect(screen.queryByTitle('Add New')).not.toBeInTheDocument()
    })

    it('should hide add button when handleAdd is not provided', () => {
      const { handleAdd, ...propsWithoutAdd } = defaultProps

      render(<HeaderSection {...propsWithoutAdd} />, { wrapper: TestWrapper })

      expect(screen.queryByTitle('Add New')).not.toBeInTheDocument()
    })

    it('should call handleAdd when add button is clicked', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const addButton = screen.getByTitle('Add New')
      await user.click(addButton)

      expect(mockHandleAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('Refresh Button', () => {
    it('should render refresh button', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
    })

    it('should call handleRefresh when clicked', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      await user.click(refreshButton)

      expect(mockHandleRefresh).toHaveBeenCalledTimes(1)
    })

    it('should disable refresh button when loading', () => {
      render(<HeaderSection {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).toBeDisabled()
    })

    it('should enable refresh button when not loading', () => {
      render(<HeaderSection {...defaultProps} loading={false} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).not.toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should disable refresh button during loading', () => {
      render(<HeaderSection {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).toBeDisabled()
    })

    it('should not call handleRefresh when disabled', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      await user.click(refreshButton)

      expect(mockHandleRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Breadcrumbs', () => {
    it('should generate breadcrumbs from pathname', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(generateBreadcrumbs).toHaveBeenCalledWith('/admin/users')
    })

    it('should render multiple breadcrumb items', () => {
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Create', path: '/admin/users/create' }
      ])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should render single breadcrumb item', () => {
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Dashboard', path: '/dashboard' }
      ])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render empty breadcrumbs', () => {
      vi.mocked(generateBreadcrumbs).mockReturnValue([])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should have correct href for breadcrumb links', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const adminLink = screen.getByText('Admin').closest('a')
      const usersLink = screen.getByText('Users').closest('a')

      expect(adminLink).toHaveAttribute('href', '/admin')
      expect(usersLink).toHaveAttribute('href', '/admin/users')
    })
  })

  describe('Language Switcher', () => {
    it('should render language switcher button', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Switch Language')).toBeInTheDocument()
    })

    it('should display current language name', () => {
      vi.mocked(useLocale).mockReturnValue('en')

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should display Chinese language', () => {
      vi.mocked(useLocale).mockReturnValue('zh')

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('中文')).toBeInTheDocument()
    })

    it('should display Spanish language', () => {
      vi.mocked(useLocale).mockReturnValue('es')

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Español')).toBeInTheDocument()
    })

    it('should default to English for unknown locale', () => {
      vi.mocked(useLocale).mockReturnValue('unknown')

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should render language menu trigger', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const languageButton = screen.getByTitle('Switch Language')
      await user.click(languageButton)

      /* Menu should open */
      expect(languageButton).toBeInTheDocument()
    })
  })

  describe('Translations', () => {
    it('should use correct translation namespace', () => {
      render(<HeaderSection {...defaultProps} translation="userModule" />, { wrapper: TestWrapper })

      expect(useTranslations).toHaveBeenCalledWith('userModule')
    })

    it('should translate title', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockTranslations).toHaveBeenCalledWith('title')
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should translate refresh button', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockTranslations).toHaveBeenCalledWith('buttons.refresh')
    })

    it('should translate add button', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(mockTranslations).toHaveBeenCalledWith('buttons.add')
    })
  })

  describe('Use Cases', () => {
    it('should render for user management page', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/user-management')
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'User Management', path: '/admin/user-management' }
      ])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should render for role management page', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/role-management')
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'Role Management', path: '/admin/role-management' }
      ])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Role Management')).toBeInTheDocument()
    })

    it('should render view page without add button', () => {
      vi.mocked(usePathname).mockReturnValue('/admin/users/view/123')
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'Users', path: '/admin/users' },
        { name: 'View', path: '/admin/users/view' }
      ])

      render(<HeaderSection {...defaultProps} showAddButton={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.queryByTitle('Add New')).not.toBeInTheDocument()
    })

    it('should render during loading state', () => {
      render(<HeaderSection {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Refresh')).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty translation key', () => {
      vi.mocked(mockTranslations).mockImplementation(() => '')

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      /* Component should still render */
      expect(screen.getByTitle('Switch Language')).toBeInTheDocument()
    })

    it('should handle very long title', () => {
      vi.mocked(mockTranslations).mockImplementation((key: string) => {
        if (key === 'title') return 'This is a very long title that should still render properly'
        return key
      })

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('This is a very long title that should still render properly')).toBeInTheDocument()
    })

    it('should handle deep nested breadcrumbs', () => {
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Edit', path: '/admin/users/edit' },
        { name: '123', path: '/admin/users/edit/123' },
        { name: 'Details', path: '/admin/users/edit/123/details' }
      ])

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should handle multiple rapid refresh clicks', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      await user.click(refreshButton)
      await user.click(refreshButton)
      await user.click(refreshButton)

      expect(mockHandleRefresh).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple rapid add clicks', async () => {
      const user = userEvent.setup()

      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const addButton = screen.getByTitle('Add New')
      await user.click(addButton)
      await user.click(addButton)

      expect(mockHandleAdd).toHaveBeenCalledTimes(2)
    })
  })

  describe('State Management', () => {
    it('should update when loading state changes', () => {
      const { rerender } = render(
        <HeaderSection {...defaultProps} loading={false} />,
        { wrapper: TestWrapper }
      )

      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).not.toBeDisabled()

      rerender(<HeaderSection {...defaultProps} loading={true} />)

      expect(refreshButton).toBeDisabled()
    })

    it('should update when pathname changes', () => {
      const { rerender } = render(
        <HeaderSection {...defaultProps} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Users')).toBeInTheDocument()

      vi.mocked(usePathname).mockReturnValue('/admin/roles')
      vi.mocked(generateBreadcrumbs).mockReturnValue([
        { name: 'Admin', path: '/admin' },
        { name: 'Roles', path: '/admin/roles' }
      ])

      rerender(<HeaderSection {...defaultProps} />)

      expect(screen.getByText('Roles')).toBeInTheDocument()
    })

    it('should update when locale changes', () => {
      const { rerender } = render(
        <HeaderSection {...defaultProps} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('English')).toBeInTheDocument()

      vi.mocked(useLocale).mockReturnValue('es')

      rerender(<HeaderSection {...defaultProps} />)

      expect(screen.getByText('Español')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible refresh button title', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const refreshButton = screen.getByTitle('Refresh')
      expect(refreshButton).toBeInTheDocument()
    })

    it('should have accessible add button title', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const addButton = screen.getByTitle('Add New')
      expect(addButton).toBeInTheDocument()
    })

    it('should have accessible language switcher title', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const languageButton = screen.getByTitle('Switch Language')
      expect(languageButton).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Title')
    })

    it('should have accessible breadcrumb links', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      const adminLink = screen.getByText('Admin').closest('a')
      expect(adminLink).toHaveAttribute('href')
    })
  })

  describe('Responsive Design', () => {
    it('should render all buttons on desktop', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTitle('Switch Language')).toBeInTheDocument()
      expect(screen.getByTitle('Refresh')).toBeInTheDocument()
      expect(screen.getByTitle('Add New')).toBeInTheDocument()
    })

    it('should render with responsive sizes', () => {
      const { container } = render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      /* Component should render successfully with responsive design */
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should integrate with routing', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(usePathname).toHaveBeenCalled()
      expect(useRouter).toHaveBeenCalled()
    })

    it('should integrate with i18n', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(useTranslations).toHaveBeenCalledWith('testModule')
      expect(useLocale).toHaveBeenCalled()
    })

    it('should integrate with breadcrumb generation', () => {
      render(<HeaderSection {...defaultProps} />, { wrapper: TestWrapper })

      expect(generateBreadcrumbs).toHaveBeenCalledWith('/admin/users')
    })
  })
})
