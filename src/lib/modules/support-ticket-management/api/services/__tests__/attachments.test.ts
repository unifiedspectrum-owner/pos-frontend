/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Support ticket management module imports */
import type { DownloadTicketCommunicationAttachmentApiResponse } from '@support-ticket-management/types'
import { SUPPORT_TICKET_API_ROUTES } from '@support-ticket-management/constants'

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
vi.mock('@support-ticket-management/api/client', () => ({
  supportTicketApiClient: mockAxiosInstance
}))

describe('attachmentsService', () => {
  let attachmentsService: typeof import('@support-ticket-management/api/services/attachments').attachmentsService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@support-ticket-management/api/services/attachments')
    attachmentsService = module.attachmentsService
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
    it('should have attachmentsService with all required methods', () => {
      expect(attachmentsService).toBeDefined()
      expect(attachmentsService.downloadAttachment).toBeTypeOf('function')
    })
  })

  describe('downloadAttachment', () => {
    it('should download image attachment successfully', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '1',
            filename: 'screenshot.png',
            file_content: 'https://example.com/files/screenshot.png',
            mime_type: 'image/png',
            file_size: '102400',
            file_extension: 'png'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD.replace(':id', attachmentId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.filename).toBe('screenshot.png')
      expect(result.data?.mime_type).toBe('image/png')
    })

    it('should download PDF attachment successfully', async () => {
      const attachmentId = '2'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '2',
            filename: 'invoice.pdf',
            file_content: 'https://example.com/files/invoice.pdf',
            mime_type: 'application/pdf',
            file_size: '524288',
            file_extension: 'pdf'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(SUPPORT_TICKET_API_ROUTES.ATTACHEMENT.DOWNLOAD.replace(':id', attachmentId))
      expect(result).toEqual(mockResponse.data)
      expect(result.data?.mime_type).toBe('application/pdf')
    })

    it('should download document attachment successfully', async () => {
      const attachmentId = '3'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '3',
            filename: 'requirements.docx',
            file_content: 'https://example.com/files/requirements.docx',
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            file_size: '1048576',
            file_extension: 'docx'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(result.data?.filename).toBe('requirements.docx')
      expect(result.data?.file_size).toBe('1048576')
    })

    it('should download text file attachment successfully', async () => {
      const attachmentId = '4'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '4',
            filename: 'log.txt',
            file_content: 'https://example.com/files/log.txt',
            mime_type: 'text/plain',
            file_size: '2048',
            file_extension: 'txt'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(result.data?.mime_type).toBe('text/plain')
      expect(result.data?.file_size).toBe('2048')
    })

    it('should download large file attachment successfully', async () => {
      const attachmentId = '5'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '5',
            filename: 'video-recording.mp4',
            file_content: 'https://example.com/files/video-recording.mp4',
            mime_type: 'video/mp4',
            file_size: '1048576',
            file_extension: 'mp4'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(Number(result.data?.file_size)).toBeGreaterThan(1000000)
      expect(result.data?.mime_type).toBe('video/mp4')
    })

    it('should handle errors when attachment not found', async () => {
      const attachmentId = '999'
      const mockError = new Error('Attachment not found')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(attachmentsService.downloadAttachment(attachmentId)).rejects.toThrow('Attachment not found')
      expect(consoleSpy).toHaveBeenCalledWith('[AttachmentsService] Failed to download attachment:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle errors when file is deleted or unavailable', async () => {
      const attachmentId = '10'
      const mockError = new Error('File no longer available')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(attachmentsService.downloadAttachment(attachmentId)).rejects.toThrow('File no longer available')
      expect(consoleSpy).toHaveBeenCalledWith('[AttachmentsService] Failed to download attachment:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      const attachmentId = '1'
      const mockError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(attachmentsService.downloadAttachment(attachmentId)).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith('[AttachmentsService] Failed to download attachment:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle permission errors', async () => {
      const attachmentId = '1'
      const mockError = new Error('Access denied')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(attachmentsService.downloadAttachment(attachmentId)).rejects.toThrow('Access denied')
      expect(consoleSpy).toHaveBeenCalledWith('[AttachmentsService] Failed to download attachment:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('Response Data Structure', () => {
    it('should return proper response structure for download attachment', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded',
          data: {
            attachment_id: '1',
            filename: 'file.png',
            file_content: 'https://example.com/file.png',
            mime_type: 'image/png',
            file_size: '1024',
            file_extension: 'png'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('attachment_id')
      expect(result.data).toHaveProperty('filename')
      expect(result.data).toHaveProperty('file_content')
      expect(result.data).toHaveProperty('mime_type')
      expect(result.data).toHaveProperty('file_size')
    })

    it('should return attachment data with valid URL', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded',
          data: {
            attachment_id: '1',
            filename: 'document.pdf',
            file_content: 'https://cdn.example.com/attachments/abc123/document.pdf',
            mime_type: 'application/pdf',
            file_size: '2048',
            file_extension: 'txt'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(result.data?.file_content).toMatch(/^https?:\/\//)
      expect(result.data?.file_content).toContain('document.pdf')
    })
  })

  describe('Type Safety and Parameter Validation', () => {
    it('should accept string attachment IDs', async () => {
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded',
          data: {
            attachment_id: '1',
            filename: 'file.png',
            file_content: 'https://example.com/file.png',
            mime_type: 'image/png',
            file_size: '1024',
            file_extension: 'png'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await expect(attachmentsService.downloadAttachment('123')).resolves.toBeDefined()
    })

    it('should return typed response', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded',
          data: {
            attachment_id: '1',
            filename: 'test.jpg',
            file_content: 'https://example.com/test.jpg',
            mime_type: 'image/jpeg',
            file_size: '2048',
            file_extension: 'txt'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(typeof result.success).toBe('boolean')
      expect(typeof result.message).toBe('string')
      expect(typeof result.data?.attachment_id).toBe('string')
      expect(typeof result.data?.filename).toBe('string')
      expect(typeof result.data?.file_content).toBe('string')
      expect(typeof result.data?.mime_type).toBe('string')
      expect(typeof result.data?.file_size).toBe('string')
    })
  })

  describe('File Type Handling', () => {
    it('should handle different image types', async () => {
      const imageTypes = [
        { ext: 'jpg', mime: 'image/jpeg' },
        { ext: 'png', mime: 'image/png' },
        { ext: 'gif', mime: 'image/gif' },
        { ext: 'svg', mime: 'image/svg+xml' }
      ]

      for (const [index, type] of imageTypes.entries()) {
        const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
          data: {
            success: true,
            message: 'Attachment downloaded',
            data: {
              attachment_id: String(index + 1),
              filename: `image.${type.ext}`,
              file_content: `https://example.com/image.${type.ext}`,
              mime_type: type.mime,
              file_size: '51200',
              file_extension: type.ext
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await attachmentsService.downloadAttachment(String(index + 1))
        expect(result.data?.mime_type).toBe(type.mime)
      }
    })

    it('should handle different document types', async () => {
      const documentTypes = [
        { ext: 'pdf', mime: 'application/pdf' },
        { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      ]

      for (const [index, type] of documentTypes.entries()) {
        const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
          data: {
            success: true,
            message: 'Attachment downloaded',
            data: {
              attachment_id: String(index + 10),
              filename: `document.${type.ext}`,
              file_content: `https://example.com/document.${type.ext}`,
              mime_type: type.mime,
              file_size: '2048',
            file_extension: 'txt'
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: createMockAxiosConfig()
        }

        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

        const result = await attachmentsService.downloadAttachment(String(index + 10))
        expect(result.data?.mime_type).toBe(type.mime)
      }
    })
  })

  describe('Integration Scenarios', () => {
    it('should download attachment from communication', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '1',
            filename: 'error-screenshot.png',
            file_content: 'https://cdn.example.com/tickets/1/error-screenshot.png',
            mime_type: 'image/png',
            file_size: '153600',
            file_extension: 'png'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)

      expect(result.success).toBe(true)
      expect(result.data?.file_content).toBeTruthy()
      expect(result.data?.filename).toBeTruthy()
    })

    it('should provide file size for display purposes', async () => {
      const attachmentId = '1'
      const mockResponse: AxiosResponse<DownloadTicketCommunicationAttachmentApiResponse> = {
        data: {
          success: true,
          message: 'Attachment downloaded successfully',
          data: {
            attachment_id: '1',
            filename: 'large-file.zip',
            file_content: 'https://example.com/large-file.zip',
            mime_type: 'application/zip',
            file_size: '5242880',
            file_extension: 'zip'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await attachmentsService.downloadAttachment(attachmentId)
      const fileSizeInMB = (Number(result.data?.file_size) || 0) / (1024 * 1024)

      expect(fileSizeInMB).toBeCloseTo(5, 1)
    })
  })
})
