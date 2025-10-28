/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

/* Tenant module imports */
import useTenantSuspension from '../use-tenant-suspension'
import { tenantService } from '@tenant-management/api'

/* Shared module imports */
import { createToastNotification, handleApiError } from '@shared/utils'

/* Mock the API services */
vi.mock('@tenant-management/api', () => ({
  tenantService: {
    suspendTenant: vi.fn(),
    holdTenant: vi.fn(),
    activateTenant: vi.fn()
  }
}))

/* Mock shared utils */
vi.mock('@shared/utils', () => ({
  createToastNotification: vi.fn(),
  handleApiError: vi.fn()
}))

describe('useTenantSuspension', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useTenantSuspension())

      expect(result.current.isSuspending).toBe(false)
      expect(result.current.isHolding).toBe(false)
      expect(result.current.isActivating).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.suspendTenant).toBe('function')
      expect(typeof result.current.holdTenant).toBe('function')
      expect(typeof result.current.activateTenant).toBe('function')
    })

    it('accepts optional callbacks', () => {
      const onSuccess = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useTenantSuspension({ onSuccess, onError })
      )

      expect(result.current.isSuspending).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('suspendTenant Operation', () => {
    const mockSuspendResponse = {
      success: true,
      message: 'Tenant suspended successfully',
      data: {
        tenant_id: 'tenant-001',
        status: 'suspended' as const,
        suspension_id: 'susp-001',
        email_sent: true
      },
      timestamp: new Date().toISOString()
    }

    it('successfully suspends a tenant', async () => {
      vi.mocked(tenantService.suspendTenant).mockResolvedValue(mockSuspendResponse)

      const { result } = renderHook(() => useTenantSuspension())

      await act(async () => {
        await result.current.suspendTenant({ reason: 'Violation of terms', suspend_until: null }, 'tenant-001')
      })

      expect(tenantService.suspendTenant).toHaveBeenCalledWith(
        { reason: 'Violation of terms', suspend_until: null },
        'tenant-001'
      )
      expect(createToastNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Tenant Suspended'
        })
      )
    })

    it('calls onSuccess callback', async () => {
      vi.mocked(tenantService.suspendTenant).mockResolvedValue(mockSuspendResponse)
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useTenantSuspension({ onSuccess }))

      await act(async () => {
        await result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(onSuccess).toHaveBeenCalled()
    })

    it('sets loading state during operation', async () => {
      vi.mocked(tenantService.suspendTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSuspendResponse), 100))
      )

      const { result } = renderHook(() => useTenantSuspension())

      act(() => {
        result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(result.current.isSuspending).toBe(true)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuspending).toBe(false)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles API errors', async () => {
      const error = new Error('Suspension failed')
      vi.mocked(tenantService.suspendTenant).mockRejectedValue(error)
      const onError = vi.fn()

      const { result } = renderHook(() => useTenantSuspension({ onError }))

      await act(async () => {
        await result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(onError).toHaveBeenCalledWith(error)
      expect(handleApiError).toHaveBeenCalled()
    })

    it('resets loading state after error', async () => {
      vi.mocked(tenantService.suspendTenant).mockRejectedValue(new Error('Test'))

      const { result } = renderHook(() => useTenantSuspension())

      await act(async () => {
        await result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(result.current.isSuspending).toBe(false)
    })
  })

  describe('holdTenant Operation', () => {
    const mockHoldResponse = {
      success: true,
      message: 'Tenant placed on hold successfully',
      data: {
        tenant_id: 'tenant-001',
        status: 'hold' as const,
        suspension_id: 'hold-001',
        email_sent: true
      },
      timestamp: new Date().toISOString()
    }

    it('successfully puts tenant on hold', async () => {
      vi.mocked(tenantService.holdTenant).mockResolvedValue(mockHoldResponse)

      const { result } = renderHook(() => useTenantSuspension())

      await act(async () => {
        await result.current.holdTenant({ reason: 'Investigation', hold_until: null }, 'tenant-001')
      })

      expect(tenantService.holdTenant).toHaveBeenCalledWith(
        { reason: 'Investigation', hold_until: null },
        'tenant-001'
      )
      expect(createToastNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Tenant Placed on Hold'
        })
      )
    })

    it('sets loading state during operation', async () => {
      vi.mocked(tenantService.holdTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockHoldResponse), 100))
      )

      const { result } = renderHook(() => useTenantSuspension())

      act(() => {
        result.current.holdTenant({ reason: 'Test', hold_until: null }, 'tenant-001')
      })

      expect(result.current.isHolding).toBe(true)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isHolding).toBe(false)
      })
    })

    it('handles API errors', async () => {
      const error = new Error('Hold failed')
      vi.mocked(tenantService.holdTenant).mockRejectedValue(error)
      const onError = vi.fn()

      const { result } = renderHook(() => useTenantSuspension({ onError }))

      await act(async () => {
        await result.current.holdTenant({ reason: 'Test', hold_until: null }, 'tenant-001')
      })

      expect(onError).toHaveBeenCalledWith(error)
    })
  })

  describe('activateTenant Operation', () => {
    const mockActivateResponse = {
      success: true,
      message: 'Tenant activated successfully',
      data: {
        tenant_id: 'tenant-001',
        status: 'active' as const,
        suspension_id: 'act-001',
        email_sent: true
      },
      timestamp: new Date().toISOString()
    }

    it('successfully activates a tenant', async () => {
      vi.mocked(tenantService.activateTenant).mockResolvedValue(mockActivateResponse)

      const { result } = renderHook(() => useTenantSuspension())

      await act(async () => {
        await result.current.activateTenant({ reason: 'Issue resolved' }, 'tenant-001')
      })

      expect(tenantService.activateTenant).toHaveBeenCalledWith({ reason: 'Issue resolved' }, 'tenant-001')
      expect(createToastNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Tenant Activated'
        })
      )
    })

    it('sets loading state during operation', async () => {
      vi.mocked(tenantService.activateTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockActivateResponse), 100))
      )

      const { result } = renderHook(() => useTenantSuspension())

      act(() => {
        result.current.activateTenant({ reason: 'Test activation' }, 'tenant-001')
      })

      expect(result.current.isActivating).toBe(true)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isActivating).toBe(false)
      })
    })

    it('handles API errors', async () => {
      const error = new Error('Activation failed')
      vi.mocked(tenantService.activateTenant).mockRejectedValue(error)
      const onError = vi.fn()

      const { result } = renderHook(() => useTenantSuspension({ onError }))

      await act(async () => {
        await result.current.activateTenant({ reason: 'Test' }, 'tenant-001')
      })

      expect(onError).toHaveBeenCalledWith(error)
    })
  })

  describe('Combined Loading State', () => {
    it('isLoading is true when any operation is running', async () => {
      const mockResponse = {
        success: true,
        message: 'Tenant suspended successfully',
        data: {
          tenant_id: 'tenant-001',
          status: 'suspended' as const,
          suspension_id: 'susp-001',
          email_sent: true
        },
        timestamp: new Date().toISOString()
      }

      vi.mocked(tenantService.suspendTenant).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      )

      const { result } = renderHook(() => useTenantSuspension())

      act(() => {
        result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(result.current.isSuspending).toBe(true)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('maintains separate loading states', async () => {
      const mockSuspendResponse = {
        success: true,
        message: 'Tenant suspended successfully',
        data: {
          tenant_id: 'tenant-001',
          status: 'suspended' as const,
          suspension_id: 'susp-001',
          email_sent: true
        },
        timestamp: new Date().toISOString()
      }

      const mockHoldResponse = {
        success: true,
        message: 'Tenant placed on hold successfully',
        data: {
          tenant_id: 'tenant-001',
          status: 'hold' as const,
          suspension_id: 'hold-001',
          email_sent: true
        },
        timestamp: new Date().toISOString()
      }

      vi.mocked(tenantService.suspendTenant).mockResolvedValue(mockSuspendResponse)
      vi.mocked(tenantService.holdTenant).mockResolvedValue(mockHoldResponse)

      const { result } = renderHook(() => useTenantSuspension())

      await act(async () => {
        await result.current.suspendTenant({ reason: 'Test', suspend_until: null }, 'tenant-001')
      })

      expect(result.current.isSuspending).toBe(false)
      expect(result.current.isHolding).toBe(false)
      expect(result.current.isActivating).toBe(false)
    })
  })
})
