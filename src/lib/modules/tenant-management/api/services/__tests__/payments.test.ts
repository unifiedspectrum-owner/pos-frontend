/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Tenant management module imports */
import type { InitiateSubscriptionPaymentApiRequest, InitiateSubscriptionPaymentApiResponse, PaymentStatusApiRequest, PaymentStatusApiResponse, CompleteSubscriptionPaymentApiResponse } from '@tenant-management/types'
import type { completeTenantSubscriptionPayment } from '@tenant-management/schemas'
import { TENANT_API_ROUTES } from '@tenant-management/constants'

/* Helper to create mock axios config */
const createMockAxiosConfig = (): InternalAxiosRequestConfig => ({
  headers: {} as AxiosRequestHeaders,
  url: '',
  method: 'get'
})

/* Mock axios instance */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

/* Mock createApiClient to return our mock instance */
vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

/* Mock the client module to use our mock instance */
vi.mock('@tenant-management/api/client', () => ({
  tenantApiClient: mockAxiosInstance
}))

describe('paymentService', () => {
  let paymentService: typeof import('@tenant-management/api/services/payments').paymentService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@tenant-management/api/services/payments')
    paymentService = module.paymentService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API Client Configuration', () => {
    it('should have paymentService with all required methods', () => {
      expect(paymentService).toBeDefined()
      expect(paymentService.initiateTenantSubscriptionPayment).toBeTypeOf('function')
      expect(paymentService.getPaymentStatusForTenant).toBeTypeOf('function')
      expect(paymentService.completeTenantSubscriptionPayment).toBeTypeOf('function')
    })
  })

  describe('initiateTenantSubscriptionPayment', () => {
    it('should initiate payment successfully with monthly billing', async () => {
      const paymentData: InitiateSubscriptionPaymentApiRequest = {
        tenant_id: 'tenant-1',
        plan_id: 1,
        billing_cycle: 'monthly',
        plan_tot_amt: 99.99,
        branch_addon_tot_amt: 30.00,
        org_addon_tot_amt: 20.00,
        tot_amt: 149.99
      }

      const mockResponse: AxiosResponse<InitiateSubscriptionPaymentApiResponse> = {
        data: {
          success: true,
          message: 'Payment initiated successfully',
          data: {
            customer_id: 'cus_abc123',
            type: 'setup',
            clientSecret: 'pi_secret_xyz789'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.initiateTenantSubscriptionPayment(paymentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PAYMENT.INITIATE, paymentData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.customer_id).toBe('cus_abc123')
      expect(result.data.clientSecret).toBe('pi_secret_xyz789')
    })

    it('should initiate payment successfully with yearly billing', async () => {
      const paymentData: InitiateSubscriptionPaymentApiRequest = {
        tenant_id: 'tenant-2',
        plan_id: 2,
        billing_cycle: 'yearly',
        plan_tot_amt: 959.99,
        branch_addon_tot_amt: 288.00,
        org_addon_tot_amt: 192.00,
        tot_amt: 1439.99
      }

      const mockResponse: AxiosResponse<InitiateSubscriptionPaymentApiResponse> = {
        data: {
          success: true,
          message: 'Payment initiated successfully',
          data: {
            customer_id: 'cus_def456',
            type: 'setup',
            clientSecret: 'pi_secret_def456'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.initiateTenantSubscriptionPayment(paymentData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PAYMENT.INITIATE, paymentData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.type).toBe('setup')
    })

    it('should handle payment initiation errors', async () => {
      const paymentData: InitiateSubscriptionPaymentApiRequest = {
        tenant_id: 'tenant-1',
        plan_id: 1,
        billing_cycle: 'monthly',
        plan_tot_amt: 99.99,
        branch_addon_tot_amt: 0,
        org_addon_tot_amt: 0,
        tot_amt: 99.99
      }

      const mockError = new Error('Payment gateway unavailable')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(paymentService.initiateTenantSubscriptionPayment(paymentData)).rejects.toThrow('Payment gateway unavailable')
      expect(consoleSpy).toHaveBeenCalledWith('[PaymentService] Failed to initiate payment:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getPaymentStatusForTenant', () => {
    it('should fetch successful payment status', async () => {
      const statusRequest: PaymentStatusApiRequest = {
        payment_intent: 'pi_123abc'
      }

      const mockResponse: AxiosResponse<PaymentStatusApiResponse> = {
        data: {
          success: true,
          message: 'Payment status retrieved successfully',
          data: {
            payment_details: {
              payment_intent_id: 'pi_123abc',
              status: 'succeeded',
              amount: {
                total: 149.99,
                currency: 'usd',
                formatted: '$149.99'
              },
              created: '2024-01-01T00:00:00Z',
              customer_id: 'cus_abc123',
              description: 'Premium Plan Subscription',
              metadata: {
                tenant_id: 'tenant-1',
                plan_id: '1',
                billing_cycle: 'monthly'
              },
              payment_method_types: ['card'],
              receipt_email: 'john@acme.com',
              client_secret: 'pi_secret_xyz789',
              next_action: null,
              last_payment_error: null
            },
            charge_details: {
              charge_id: 'ch_123',
              amount_captured: 14999,
              paid: true,
              created: '2024-01-01T00:00:00Z',
              payment_method_details: {
                type: 'card',
                card: {
                  brand: 'visa',
                  last4: '4242',
                  exp_month: 12,
                  exp_year: 2025,
                  funding: 'credit',
                  country: 'US'
                }
              },
              receipt_url: 'https://pay.stripe.com/receipts/xyz',
              billing_details: {
                address: {
                  city: 'New York',
                  country: 'US',
                  line1: '123 Main St',
                  line2: null,
                  postal_code: '10001',
                  state: 'NY'
                },
                email: 'john@acme.com',
                name: 'John Doe',
                phone: '+1234567890'
              },
              outcome: {
                network_status: 'approved_by_network',
                reason: null,
                risk_level: 'normal',
                risk_score: 15,
                seller_message: 'Payment complete.',
                type: 'authorized'
              }
            },
            status_info: {
              is_successful: true,
              is_pending: false,
              is_failed: false,
              requires_action: false,
              can_retry: false,
              status_message: 'Payment succeeded',
              raw_status: 'succeeded'
            },
            tenant_info: {
              tenant_id: 'tenant-1',
              plan_id: '1'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.getPaymentStatusForTenant(statusRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PAYMENT.STATUS, statusRequest)
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.payment_details.status).toBe('succeeded')
      expect(result.data?.status_info.is_successful).toBe(true)
    })

    it('should fetch pending payment status', async () => {
      const statusRequest: PaymentStatusApiRequest = {
        payment_intent: 'pi_pending123'
      }

      const mockResponse: AxiosResponse<PaymentStatusApiResponse> = {
        data: {
          success: true,
          message: 'Payment status retrieved successfully',
          data: {
            payment_details: {
              payment_intent_id: 'pi_pending123',
              status: 'processing',
              amount: {
                total: 99.99,
                currency: 'usd',
                formatted: '$99.99'
              },
              created: '2024-01-01T00:00:00Z',
              customer_id: 'cus_def456',
              description: null,
              metadata: {},
              payment_method_types: ['card'],
              receipt_email: null,
              client_secret: null,
              next_action: null,
              last_payment_error: null
            },
            charge_details: null,
            status_info: {
              is_successful: false,
              is_pending: true,
              is_failed: false,
              requires_action: false,
              can_retry: false,
              status_message: 'Payment is being processed',
              raw_status: 'processing'
            },
            tenant_info: null
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.getPaymentStatusForTenant(statusRequest)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PAYMENT.STATUS, statusRequest)
      expect(result.data?.status_info.is_pending).toBe(true)
    })

    it('should fetch failed payment status', async () => {
      const statusRequest: PaymentStatusApiRequest = {
        payment_intent: 'pi_failed123'
      }

      const mockResponse: AxiosResponse<PaymentStatusApiResponse> = {
        data: {
          success: true,
          message: 'Payment status retrieved successfully',
          data: {
            payment_details: {
              payment_intent_id: 'pi_failed123',
              status: 'failed',
              amount: {
                total: 149.99,
                currency: 'usd',
                formatted: '$149.99'
              },
              created: '2024-01-01T00:00:00Z',
              customer_id: 'cus_ghi789',
              description: null,
              metadata: {},
              payment_method_types: ['card'],
              receipt_email: null,
              client_secret: null,
              next_action: null,
              last_payment_error: {
                code: 'card_declined',
                message: 'Your card was declined',
                type: 'card_error',
                decline_code: 'insufficient_funds'
              }
            },
            charge_details: null,
            status_info: {
              is_successful: false,
              is_pending: false,
              is_failed: true,
              requires_action: false,
              can_retry: true,
              status_message: 'Payment failed - Your card was declined',
              raw_status: 'failed'
            },
            tenant_info: null
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.getPaymentStatusForTenant(statusRequest)

      expect(result.data?.status_info.is_failed).toBe(true)
      expect(result.data?.status_info.can_retry).toBe(true)
    })

    it('should handle errors when fetching payment status', async () => {
      const statusRequest: PaymentStatusApiRequest = {
        payment_intent: 'pi_invalid'
      }

      const mockError = new Error('Payment intent not found')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(paymentService.getPaymentStatusForTenant(statusRequest)).rejects.toThrow('Payment intent not found')
      expect(consoleSpy).toHaveBeenCalledWith('[PaymentService] Failed to get payment status:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('completeTenantSubscriptionPayment', () => {
    it('should complete payment successfully', async () => {
      const completionData = {
        tenant_id: 'tenant-1',
        payment_intent: 'pi_123abc'
      } as completeTenantSubscriptionPayment

      const mockResponse: AxiosResponse<CompleteSubscriptionPaymentApiResponse> = {
        data: {
          success: true,
          message: 'Payment completed successfully',
          data: {
            tenant: {
              tenant_id: 'tenant-1',
              organization_name: 'Acme Corp',
              status: 'active'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.completeTenantSubscriptionPayment(completionData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(TENANT_API_ROUTES.PAYMENT.COMPLETE, completionData)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.tenant.status).toBe('active')
      expect(result.data.tenant.tenant_id).toBe('tenant-1')
    })

    it('should handle payment completion errors', async () => {
      const completionData = {
        tenant_id: 'tenant-2',
        payment_intent: 'pi_invalid'
      } as completeTenantSubscriptionPayment

      const mockError = new Error('Payment not confirmed')
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(paymentService.completeTenantSubscriptionPayment(completionData)).rejects.toThrow('Payment not confirmed')
      expect(consoleSpy).toHaveBeenCalledWith('[PaymentService] Failed to initiate payment:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for initiate payment', async () => {
      const mockResponse: AxiosResponse<InitiateSubscriptionPaymentApiResponse> = {
        data: {
          success: true,
          message: 'Payment initiated',
          data: {
            customer_id: 'cus_123',
            type: 'setup',
            clientSecret: 'secret_123'
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.initiateTenantSubscriptionPayment({} as InitiateSubscriptionPaymentApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('customer_id')
      expect(result.data).toHaveProperty('type')
      expect(result.data).toHaveProperty('clientSecret')
      expect(result).toHaveProperty('timestamp')
    })

    it('should return proper response structure for payment status', async () => {
      const mockResponse: AxiosResponse<PaymentStatusApiResponse> = {
        data: {
          success: true,
          message: 'Status retrieved',
          data: {
            payment_details: {
              payment_intent_id: 'pi_123',
              status: 'succeeded',
              amount: {
                total: 100,
                currency: 'usd',
                formatted: '$100.00'
              },
              created: '2024-01-01T00:00:00Z',
              customer_id: null,
              description: null,
              metadata: {},
              payment_method_types: ['card'],
              receipt_email: null,
              client_secret: null,
              next_action: null,
              last_payment_error: null
            },
            charge_details: null,
            status_info: {
              is_successful: true,
              is_pending: false,
              is_failed: false,
              requires_action: false,
              can_retry: false,
              status_message: 'Success',
              raw_status: 'succeeded'
            },
            tenant_info: null
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.getPaymentStatusForTenant({} as PaymentStatusApiRequest)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('payment_details')
      expect(result.data).toHaveProperty('status_info')
    })

    it('should return proper response structure for complete payment', async () => {
      const mockResponse: AxiosResponse<CompleteSubscriptionPaymentApiResponse> = {
        data: {
          success: true,
          message: 'Payment completed',
          data: {
            tenant: {
              tenant_id: 'tenant-1',
              organization_name: 'Test Org',
              status: 'active'
            }
          },
          timestamp: '2024-01-01T00:00:00Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await paymentService.completeTenantSubscriptionPayment({} as completeTenantSubscriptionPayment)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('tenant')
      expect(result.data.tenant).toHaveProperty('tenant_id')
      expect(result.data.tenant).toHaveProperty('organization_name')
      expect(result.data.tenant).toHaveProperty('status')
      expect(result).toHaveProperty('timestamp')
    })
  })
})
