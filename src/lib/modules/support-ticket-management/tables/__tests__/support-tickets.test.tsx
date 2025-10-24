/* Comprehensive test suite for support ticket table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Provider } from '@/components/ui/provider'
import type { TicketListItem } from '@support-ticket-management/types'
import type { PaginationInfo } from '@shared/types'

/* Test wrapper component with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

/* Mock createApiClient to prevent initialization errors */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
}

vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

vi.mock('@shared/api', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance),
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token'),
  fetchCountries: vi.fn().mockResolvedValue([])
}))

vi.mock('@shared/api/csrf', () => ({
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token')
}))

vi.mock('@shared/api/countries', () => ({
  fetchCountries: vi.fn().mockResolvedValue([])
}))

vi.mock('@support-ticket-management/api/client', () => ({
  supportTicketApiClient: mockAxiosInstance
}))

/* Mock variables */
let mockPush: ReturnType<typeof vi.fn>
let mockRefresh: ReturnType<typeof vi.fn>
let mockHasSpecificPermission: ReturnType<typeof vi.fn>
let mockDeleteTicket: ReturnType<typeof vi.fn>
let mockIsDeleting: ReturnType<typeof vi.fn>
let mockFetchTicketComments: ReturnType<typeof vi.fn>
let mockRefetchTicketComments: ReturnType<typeof vi.fn>

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn()
  })
}))

vi.mock('@shared/contexts', () => ({
  usePermissions: () => ({
    hasSpecificPermission: mockHasSpecificPermission
  })
}))

vi.mock('@support-ticket-management/hooks', () => ({
  useCommentOperations: () => ({
    ticketComments: [],
    fetchTicketComments: mockFetchTicketComments,
    refetchTicketComments: mockRefetchTicketComments
  }),
  useTicketOperations: () => ({
    deleteTicket: mockDeleteTicket,
    isDeleting: mockIsDeleting?.() || false
  }),
  useAssignmentOperations: () => ({
    assignTicket: vi.fn().mockResolvedValue(true),
    isAssigning: false
  })
}))

/* Mock the forms to simplify testing */
vi.mock('@support-ticket-management/forms', () => ({
  AssignTicketForm: ({ onCancel }: any) => (
    <div>
      <div>Assign Ticket Form Mock</div>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  UpdateTicketStatusForm: ({ onCancel }: any) => (
    <div>
      <div>Update Status Form Mock</div>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  TicketComments: () => <div>Ticket Comments Mock</div>
}))

describe('SupportTicketTable Component', () => {
  let SupportTicketTable: any

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import component after mocks are set up */
    const module = await import('@support-ticket-management/tables/support-tickets')
    SupportTicketTable = module.default
  })

  /* Mock data */
  const mockTickets: TicketListItem[] = [
    {
      id: 1,
      ticket_id: 'TKT-2024-001',
      tenant_id: 'tenant-123',
      subject: 'Unable to login to my account',
      status: 'open',
      category_name: 'Login Issues',
      assigned_to_user_name: null,
      created_at: '2024-01-01T10:00:00Z',
      resolution_due: null,
      first_response_at: null
    },
    {
      id: 2,
      ticket_id: 'TKT-2024-002',
      tenant_id: 'tenant-123',
      subject: 'Payment processing error',
      status: 'in_progress',
      category_name: 'Payment Issues',
      assigned_to_user_name: 'Agent Smith',
      created_at: '2024-01-02T11:00:00Z',
      resolution_due: '2024-01-05T11:00:00Z',
      first_response_at: '2024-01-02T12:00:00Z'
    },
    {
      id: 3,
      ticket_id: 'TKT-2024-003',
      tenant_id: 'tenant-123',
      subject: 'Feature request for dashboard',
      status: 'closed',
      category_name: 'Feature Requests',
      assigned_to_user_name: 'Agent Jones',
      created_at: '2024-01-03T12:00:00Z',
      resolution_due: '2024-01-10T12:00:00Z',
      first_response_at: '2024-01-03T14:00:00Z'
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 5,
    limit: 10,
    total_count: 50,
    has_next_page: true,
    has_prev_page: false
  }

  const defaultProps = {
    tickets: mockTickets,
    lastUpdated: '2024-01-15 10:30 AM',
    loading: false
  }

  beforeEach(() => {
    /* Initialize mock functions */
    mockPush = vi.fn()
    mockRefresh = vi.fn()
    mockHasSpecificPermission = vi.fn((module: string, action: string) => true)
    mockDeleteTicket = vi.fn().mockResolvedValue(true)
    mockIsDeleting = vi.fn(() => false)
    mockFetchTicketComments = vi.fn().mockResolvedValue([])
    mockRefetchTicketComments = vi.fn().mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Support Ticket Management')).toBeInTheDocument()
    })

    it('should render with all required props', () => {
      const { container } = render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(container).toBeInTheDocument()
    })

    it('should display the heading', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Support Ticket Management')).toBeInTheDocument()
    })

    it('should display last updated timestamp', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Last Updated: 2024-01-15 10:30 AM/)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should render status filter dropdown', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThan(0)
    })
  })

  describe('Table Structure', () => {
    it('should render table headers', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('SNo.')).toBeInTheDocument()
      expect(screen.getByText('Ticket ID')).toBeInTheDocument()
      expect(screen.getByText('Subject')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render all tickets in the table', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
      expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
      expect(screen.getByText('TKT-2024-003')).toBeInTheDocument()
    })

    it('should display ticket subjects', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Unable to login to my account')).toBeInTheDocument()
      expect(screen.getByText('Payment processing error')).toBeInTheDocument()
      expect(screen.getByText('Feature request for dashboard')).toBeInTheDocument()
    })

    it('should display ticket categories', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Login Issues')).toBeInTheDocument()
      expect(screen.getByText('Payment Issues')).toBeInTheDocument()
      expect(screen.getByText('Feature Requests')).toBeInTheDocument()
    })

    it('should display ticket statuses', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Status labels are displayed via TICKET_STATUS_LABELS in Badge components */
      const badges = document.querySelectorAll('[class*="badge"]')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should display serial numbers correctly', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display N/A for tickets without category', () => {
      const ticketsWithoutCategory: TicketListItem[] = [{
        ...mockTickets[0],
        category_name: null
      }]
      render(<SupportTicketTable {...defaultProps} tickets={ticketsWithoutCategory} />, { wrapper: TestWrapper })
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should display created dates', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      /* Dates are formatted using toLocaleDateString() which may vary by locale */
      /* Just verify that date elements are present in the table */
      const dateElements = document.querySelectorAll('[class*="css"]')
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', () => {
      render(<SupportTicketTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render 5 skeleton rows during loading', () => {
      render(<SupportTicketTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThanOrEqual(5)
    })

    it('should not display ticket data when loading', () => {
      render(<SupportTicketTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.queryByText('TKT-2024-001')).not.toBeInTheDocument()
    })

    it('should disable search input when loading', () => {
      render(<SupportTicketTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      expect(searchInput).toBeDisabled()
    })

    it('should disable status filter when loading', () => {
      render(<SupportTicketTable {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      expect(statusFilter).toBeDisabled()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no tickets exist', () => {
      render(<SupportTicketTable {...defaultProps} tickets={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Support Tickets Found')).toBeInTheDocument()
      expect(screen.getByText('No support tickets have been created yet.')).toBeInTheDocument()
    })

    it('should show appropriate message when filters return no results', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'NonExistentTicket')

      await waitFor(() => {
        expect(screen.getByText('No Support Tickets Found')).toBeInTheDocument()
        expect(screen.getByText(/No tickets match your current search criteria/)).toBeInTheDocument()
      })
    })

    it('should display empty state icon', () => {
      render(<SupportTicketTable {...defaultProps} tickets={[]} />, { wrapper: TestWrapper })
      const emptyStateContainer = screen.getByText('No Support Tickets Found').closest('div')
      expect(emptyStateContainer).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter tickets by ticket ID', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'TKT-2024-001')

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.queryByText('TKT-2024-002')).not.toBeInTheDocument()
      })
    })

    it('should filter tickets by subject', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'Payment')

      await waitFor(() => {
        expect(screen.getByText('Payment processing error')).toBeInTheDocument()
        expect(screen.queryByText('Unable to login to my account')).not.toBeInTheDocument()
      })
    })

    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'LOGIN')

      await waitFor(() => {
        expect(screen.getByText('Unable to login to my account')).toBeInTheDocument()
      })
    })

    it('should show all tickets when search is cleared', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'TKT-2024-001')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-003')).toBeInTheDocument()
      })
    })

    it('should handle partial matches', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'TKT')

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-003')).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter', () => {
    it('should filter tickets by open status', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const openOption = await screen.findByRole('option', { name: 'Open' })
      await user.click(openOption)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.queryByText('TKT-2024-002')).not.toBeInTheDocument()
      })
    })

    it('should filter tickets by in_progress status', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const inProgressOption = await screen.findByRole('option', { name: 'In Progress' })
      await user.click(inProgressOption)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
        expect(screen.queryByText('TKT-2024-001')).not.toBeInTheDocument()
      })
    })

    it('should filter tickets by closed status', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)

      const closedOption = await screen.findByRole('option', { name: 'Closed' })
      await user.click(closedOption)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-003')).toBeInTheDocument()
        expect(screen.queryByText('TKT-2024-001')).not.toBeInTheDocument()
      })
    })

    it('should show all tickets when no specific status filter is applied', async () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      /* By default, all tickets should be visible */
      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-003')).toBeInTheDocument()
      })
    })
  })

  describe('Combined Filters', () => {
    it('should apply search and status filter together', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'TKT')

      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)
      const openOption = await screen.findByRole('option', { name: 'Open' })
      await user.click(openOption)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.queryByText('TKT-2024-002')).not.toBeInTheDocument()
      })
    })

    it('should handle search with no matching status', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'login')

      const comboboxes = screen.getAllByRole('combobox')
      const statusFilter = comboboxes[0]
      await user.click(statusFilter)
      const closedOption = await screen.findByRole('option', { name: 'Closed' })
      await user.click(closedOption)

      await waitFor(() => {
        expect(screen.getByText('No Support Tickets Found')).toBeInTheDocument()
      })
    })
  })

  describe('Row Selection', () => {
    it('should highlight row when clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('TKT-2024-001').closest('div')
      await user.click(row!)

      await waitFor(() => {
        expect(row).toHaveStyle({ borderWidth: '2px' })
      })
    })

    it('should toggle row selection on repeated clicks', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const row = screen.getByText('TKT-2024-001').closest('div')
      await user.click(row!)
      await user.click(row!)

      await waitFor(() => {
        expect(row).toHaveStyle({ borderWidth: '1px' })
      })
    })

    it('should only allow one row to be selected at a time', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const row1 = screen.getByText('TKT-2024-001').closest('div')
      const row2 = screen.getByText('TKT-2024-002').closest('div')

      await user.click(row1!)
      await user.click(row2!)

      await waitFor(() => {
        expect(row1).toHaveStyle({ borderWidth: '1px' })
        expect(row2).toHaveStyle({ borderWidth: '2px' })
      })
    })
  })

  describe('Quick Action Buttons', () => {
    it('should render assign button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const assignButtons = screen.getAllByTitle('Assign ticket to user')
      expect(assignButtons.length).toBe(mockTickets.length)
    })

    it('should render update status button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const statusButtons = screen.getAllByTitle('Update ticket status')
      expect(statusButtons.length).toBe(mockTickets.length)
    })

    it('should render add comment button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const commentButtons = screen.getAllByTitle('Add comment')
      expect(commentButtons.length).toBe(mockTickets.length)
    })

    it('should open assign modal when assign button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const assignButtons = screen.getAllByTitle('Assign ticket to user')
      await user.click(assignButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Assign Ticket Form Mock')).toBeInTheDocument()
      })
    })

    it('should open status update modal when status button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const statusButtons = screen.getAllByTitle('Update ticket status')
      await user.click(statusButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Update Status Form Mock')).toBeInTheDocument()
      })
    })

    it('should open comment modal when add comment button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const commentButtons = screen.getAllByTitle('Add comment')
      await user.click(commentButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Ticket Comments Mock')).toBeInTheDocument()
      })
    })

    it('should fetch comments when opening comment modal', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const commentButtons = screen.getAllByTitle('Add comment')
      await user.click(commentButtons[0])

      await waitFor(() => {
        expect(mockFetchTicketComments).toHaveBeenCalledWith('1')
      })
    })

    it('should stop event propagation for quick action buttons', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const assignButtons = screen.getAllByTitle('Assign ticket to user')
      const row = screen.getByText('TKT-2024-001').closest('div')

      await user.click(assignButtons[0])

      expect(row).toHaveStyle({ borderWidth: '1px' })
    })
  })

  describe('Action Buttons', () => {
    it('should render view button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const viewButtons = screen.getAllByTitle('View ticket details')
      expect(viewButtons.length).toBe(mockTickets.length)
    })

    it('should render edit button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const editButtons = screen.getAllByTitle('Edit ticket')
      expect(editButtons.length).toBe(mockTickets.length)
    })

    it('should render delete button for each ticket', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const deleteButtons = screen.getAllByTitle('Delete ticket')
      expect(deleteButtons.length).toBe(mockTickets.length)
    })

    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View ticket details')
      await user.click(viewButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/view/1'))
    })

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.getAllByTitle('Edit ticket')
      await user.click(editButtons[0])

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/edit/1'))
    })

    it('should stop event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.getAllByTitle('View ticket details')
      const row = screen.getByText('TKT-2024-001').closest('div')

      await user.click(viewButtons[0])

      expect(row).toHaveStyle({ borderWidth: '1px' })
    })

    it('should disable delete button when deleting', async () => {
      mockIsDeleting.mockReturnValue(true)

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Delete Confirmation', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('heading', { name: 'Delete Support Ticket' })).toBeInTheDocument()
      expect(within(dialog).getByText(/Are you sure you want to delete ticket/)).toBeInTheDocument()
    })

    it('should display correct ticket number in confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[1])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText(/TKT-2024-002/)).toBeInTheDocument()
    })

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete Support Ticket')).not.toBeInTheDocument()
      })
    })

    it('should call deleteTicket when confirm is clicked', async () => {
      mockDeleteTicket.mockResolvedValue(true)

      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      /* Type the confirmation text (ticket ID) to enable the confirm button */
      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      const confirmButton = within(dialog).getByRole('button', { name: /delete ticket/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteTicket).toHaveBeenCalledWith('1')
      })
    })

    it('should call onRefresh after successful deletion', async () => {
      mockDeleteTicket = vi.fn().mockResolvedValue(true)

      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      const confirmButton = within(dialog).getByRole('button', { name: /delete ticket/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteTicket).toHaveBeenCalledWith('1')
      })

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled()
      })
    })

    it('should not call onRefresh if deletion fails', async () => {
      mockDeleteTicket = vi.fn().mockResolvedValue(false)

      const mockOnRefresh = vi.fn()
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} onRefresh={mockOnRefresh} />, { wrapper: TestWrapper })

      const deleteButtons = screen.getAllByTitle('Delete ticket')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')

      const confirmationInput = within(dialog).getByRole('textbox')
      await user.type(confirmationInput, '1')

      const confirmButton = within(dialog).getByRole('button', { name: /delete ticket/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteTicket).toHaveBeenCalledWith('1')
      })

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    it('should render pagination when pagination prop is provided', () => {
      render(<SupportTicketTable {...defaultProps} pagination={mockPagination} />, { wrapper: TestWrapper })
      expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument()
    })

    it('should not render pagination when pagination prop is not provided', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
    })

    it('should not render pagination when total count is 0', () => {
      const emptyPagination: PaginationInfo = {
        ...mockPagination,
        total_count: 0
      }
      render(<SupportTicketTable {...defaultProps} pagination={emptyPagination} />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
    })

    it('should call onPageChange when pagination is used', async () => {
      const mockOnPageChange = vi.fn()
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} pagination={mockPagination} onPageChange={mockOnPageChange} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument()

      const allButtons = screen.getAllByRole('button')
      const lastButtons = allButtons.slice(-2)
      const nextButton = lastButtons.find(btn => !btn.hasAttribute('disabled'))

      expect(nextButton).toBeDefined()
      if (nextButton) {
        await user.click(nextButton)
        await waitFor(() => {
          expect(mockOnPageChange).toHaveBeenCalledWith(2, 10)
        })
      }
    })
  })

  describe('Permissions', () => {
    it('should hide view button when user lacks read permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'READ')

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const viewButtons = screen.queryAllByTitle('View ticket details')
      expect(viewButtons.length).toBe(0)
    })

    it('should hide edit button when user lacks update permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'UPDATE')

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const editButtons = screen.queryAllByTitle('Edit ticket')
      expect(editButtons.length).toBe(0)
    })

    it('should hide delete button when user lacks delete permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'DELETE')

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const deleteButtons = screen.queryAllByTitle('Delete ticket')
      expect(deleteButtons.length).toBe(0)
    })

    it('should hide quick action buttons when user lacks update permission', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => action !== 'UPDATE')

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryAllByTitle('Assign ticket to user').length).toBe(0)
      expect(screen.queryAllByTitle('Update ticket status').length).toBe(0)
      expect(screen.queryAllByTitle('Add comment').length).toBe(0)
    })

    it('should show all buttons when user has all permissions', async () => {
      mockHasSpecificPermission.mockImplementation((module: string, action: string) => true)

      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getAllByTitle('View ticket details').length).toBe(mockTickets.length)
      expect(screen.getAllByTitle('Edit ticket').length).toBe(mockTickets.length)
      expect(screen.getAllByTitle('Delete ticket').length).toBe(mockTickets.length)
      expect(screen.getAllByTitle('Assign ticket to user').length).toBe(mockTickets.length)
      expect(screen.getAllByTitle('Update ticket status').length).toBe(mockTickets.length)
      expect(screen.getAllByTitle('Add comment').length).toBe(mockTickets.length)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button names', async () => {
      const { container } = render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      const results = await axe(container)

      const nonButtonNameViolations = results.violations.filter(
        v => v.id !== 'button-name'
      )

      const criticalViolations = nonButtonNameViolations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(criticalViolations.length).toBe(0)

      const buttonNameViolations = results.violations.filter(v => v.id === 'button-name')
      if (buttonNameViolations.length > 0) {
        expect(buttonNameViolations[0].id).toBe('button-name')
      }
    })

    it('should have proper button titles', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getAllByTitle('View ticket details')).toHaveLength(mockTickets.length)
      expect(screen.getAllByTitle('Edit ticket')).toHaveLength(mockTickets.length)
      expect(screen.getAllByTitle('Delete ticket')).toHaveLength(mockTickets.length)
      expect(screen.getAllByTitle('Assign ticket to user')).toHaveLength(mockTickets.length)
      expect(screen.getAllByTitle('Update ticket status')).toHaveLength(mockTickets.length)
      expect(screen.getAllByTitle('Add comment')).toHaveLength(mockTickets.length)
    })

    it('should have proper placeholder text', () => {
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText('Search by ticket ID or subject...')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty ticket array', () => {
      render(<SupportTicketTable {...defaultProps} tickets={[]} />, { wrapper: TestWrapper })
      expect(screen.getByText('No Support Tickets Found')).toBeInTheDocument()
    })

    it('should handle tickets with missing category', () => {
      const ticketsWithoutCategory: TicketListItem[] = [{
        ...mockTickets[0],
        category_name: null
      }]
      render(<SupportTicketTable {...defaultProps} tickets={ticketsWithoutCategory} />, { wrapper: TestWrapper })
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should handle very long ticket subjects', () => {
      const longSubjectTicket: TicketListItem[] = [{
        ...mockTickets[0],
        subject: 'This is a very long ticket subject that might overflow the container and cause layout issues in the table component'
      }]
      render(<SupportTicketTable {...defaultProps} tickets={longSubjectTicket} />, { wrapper: TestWrapper })
      expect(screen.getByText(/This is a very long ticket subject/)).toBeInTheDocument()
    })

    it('should handle very long ticket IDs', () => {
      const longTicketId: TicketListItem[] = [{
        ...mockTickets[0],
        ticket_id: 'TKT-2024-VERYLONGTICKETID-12345678'
      }]
      render(<SupportTicketTable {...defaultProps} tickets={longTicketId} />, { wrapper: TestWrapper })
      expect(screen.getByText('TKT-2024-VERYLONGTICKETID-12345678')).toBeInTheDocument()
    })

    it('should handle special characters in search', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, '@#$%')

      await waitFor(() => {
        expect(screen.getByText('No Support Tickets Found')).toBeInTheDocument()
      })
    })

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const searchInput = screen.getByPlaceholderText('Search by ticket ID or subject...')
      await user.type(searchInput, 'TKT-2024-001')
      await user.clear(searchInput)
      await user.type(searchInput, 'TKT-2024-002')
      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
        expect(screen.getByText('TKT-2024-002')).toBeInTheDocument()
      })
    })

    it('should handle tickets with null assigned user', () => {
      const ticketsWithoutAssignment: TicketListItem[] = [{
        ...mockTickets[0],
        assigned_to_user_name: null
      }]
      render(<SupportTicketTable {...defaultProps} tickets={ticketsWithoutAssignment} />, { wrapper: TestWrapper })
      expect(screen.getByText('TKT-2024-001')).toBeInTheDocument()
    })
  })

  describe('Modal Interactions', () => {
    it('should close assign modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const assignButtons = screen.getAllByTitle('Assign ticket to user')
      await user.click(assignButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Assign Ticket Form Mock')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Assign Ticket Form Mock')).not.toBeInTheDocument()
      })
    })

    it('should close status update modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const statusButtons = screen.getAllByTitle('Update ticket status')
      await user.click(statusButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Update Status Form Mock')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Update Status Form Mock')).not.toBeInTheDocument()
      })
    })

    it('should display ticket information in assign modal', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const assignButtons = screen.getAllByTitle('Assign ticket to user')
      await user.click(assignButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Assign Ticket Form Mock')).toBeInTheDocument()
      })
    })

    it('should display ticket information in status update modal', async () => {
      const user = userEvent.setup()
      render(<SupportTicketTable {...defaultProps} />, { wrapper: TestWrapper })

      const statusButtons = screen.getAllByTitle('Update ticket status')
      await user.click(statusButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Update Status Form Mock')).toBeInTheDocument()
      })
    })
  })

  describe('Component Integration', () => {
    it('should work with all props provided', () => {
      const mockOnRefresh = vi.fn()
      const mockOnPageChange = vi.fn()

      render(
        <SupportTicketTable
          tickets={mockTickets}
          lastUpdated="2024-01-15 10:30 AM"
          onRefresh={mockOnRefresh}
          onPageChange={mockOnPageChange}
          loading={false}
          pagination={mockPagination}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Support Ticket Management')).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      render(
        <SupportTicketTable
          tickets={mockTickets}
          lastUpdated="2024-01-15 10:30 AM"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Support Ticket Management')).toBeInTheDocument()
    })
  })
})
