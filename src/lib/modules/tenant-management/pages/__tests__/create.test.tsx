/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import CreateTenantPage from '@tenant-management/pages/create'

/* Mock tenant layout components */
vi.mock('@tenant-management/components/layout', () => ({
  Header: ({ currentPath }: { currentPath: string }) => (
    <div data-testid="tenant-header">
      <div data-testid="header-path">{currentPath}</div>
    </div>
  ),
  Footer: () => <div data-testid="tenant-footer">Footer</div>
}))

/* Mock AccountCreateForm component */
vi.mock('@/lib/modules/tenant-management/forms', () => ({
  AccountCreateForm: () => (
    <div data-testid="account-create-form">Account Create Form</div>
  )
}))

describe('CreateTenantPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  it('should render the create tenant page', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tenant-header')).toBeInTheDocument()
    expect(screen.getByTestId('tenant-footer')).toBeInTheDocument()
    expect(screen.getByTestId('account-create-form')).toBeInTheDocument()
  })

  it('should render header with correct path', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByTestId('header-path')).toHaveTextContent('/tenant/account/create')
  })

  it('should render account create form', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByText('Account Create Form')).toBeInTheDocument()
  })

  it('should render footer', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should have correct layout structure', () => {
    const { container } = render(<CreateTenantPage />, { wrapper: TestWrapper })

    const vstack = container.querySelector('[class*="chakra-stack"]')
    expect(vstack).toBeInTheDocument()
  })

  it('should display all main components in order', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    const header = screen.getByTestId('tenant-header')
    const form = screen.getByTestId('account-create-form')
    const footer = screen.getByTestId('tenant-footer')

    expect(header).toBeInTheDocument()
    expect(form).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })

  it('should render without errors', () => {
    expect(() => render(<CreateTenantPage />, { wrapper: TestWrapper })).not.toThrow()
  })

  it('should have full viewport height container', () => {
    const { container } = render(<CreateTenantPage />, { wrapper: TestWrapper })

    const vstack = container.querySelector('[class*="chakra-stack"]')
    expect(vstack).toBeInTheDocument()
  })

  it('should have main content flex container', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByTestId('account-create-form')).toBeInTheDocument()
  })

  it('should render with default props', () => {
    render(<CreateTenantPage />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tenant-header')).toBeInTheDocument()
    expect(screen.getByTestId('account-create-form')).toBeInTheDocument()
    expect(screen.getByTestId('tenant-footer')).toBeInTheDocument()
  })
})
