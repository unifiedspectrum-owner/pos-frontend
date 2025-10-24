/* Comprehensive test suite for support ticket management validation schemas */

/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'

/* Support ticket management module imports */
import { ticketStatusSchema, attachmentSchema, createTicketSchema, createTicketCommunicationSchema, updateTicketStatusSchema, updateTicketSchema, assignTicketSchema, type CreateTicketFormSchema, type UpdateTicketFormSchema, type CreateTicketCommentFormSchema, type AssignTicketFormSchema, type UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'

describe('Support Ticket Management Validation Schemas', () => {
  describe('ticketStatusSchema', () => {
    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(ticketStatusSchema).toBeDefined()
      })

      it('should be a Zod schema with parse method', () => {
        expect(ticketStatusSchema.parse).toBeDefined()
        expect(ticketStatusSchema.safeParse).toBeDefined()
        expect(typeof ticketStatusSchema.parse).toBe('function')
        expect(typeof ticketStatusSchema.safeParse).toBe('function')
      })
    })

    describe('Valid Status Values', () => {
      const validStatuses = ['new', 'open', 'in_progress', 'pending_customer', 'pending_internal', 'escalated', 'resolved', 'closed', 'cancelled']

      validStatuses.forEach(status => {
        it(`should accept '${status}' as valid status`, () => {
          const result = ticketStatusSchema.safeParse(status)
          expect(result.success).toBe(true)
        })
      })

      it('should accept all valid status values', () => {
        validStatuses.forEach(status => {
          const result = ticketStatusSchema.safeParse(status)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('Invalid Status Values', () => {
      it('should reject invalid status string', () => {
        const result = ticketStatusSchema.safeParse('invalid_status')
        expect(result.success).toBe(false)
      })

      it('should reject empty string', () => {
        const result = ticketStatusSchema.safeParse('')
        expect(result.success).toBe(false)
      })

      it('should reject uppercase status', () => {
        const result = ticketStatusSchema.safeParse('NEW')
        expect(result.success).toBe(false)
      })

      it('should reject mixed case status', () => {
        const result = ticketStatusSchema.safeParse('New')
        expect(result.success).toBe(false)
      })

      it('should reject number', () => {
        const result = ticketStatusSchema.safeParse(1)
        expect(result.success).toBe(false)
      })

      it('should reject boolean', () => {
        const result = ticketStatusSchema.safeParse(true)
        expect(result.success).toBe(false)
      })

      it('should reject null', () => {
        const result = ticketStatusSchema.safeParse(null)
        expect(result.success).toBe(false)
      })

      it('should reject undefined', () => {
        const result = ticketStatusSchema.safeParse(undefined)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('attachmentSchema', () => {
    const validAttachment = {
      filename: 'document.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      file_extension: '.pdf',
      file_content: 'base64EncodedContent',
      is_public: true
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(attachmentSchema).toBeDefined()
      })

      it('should validate complete attachment data', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })
    })

    describe('filename Field Validation', () => {
      it('should accept valid filename', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })

      it('should reject empty filename', () => {
        const data = { ...validAttachment, filename: '' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Filename is required')
        }
      })

      it('should reject filename exceeding 255 characters', () => {
        const data = { ...validAttachment, filename: 'a'.repeat(256) }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept filename with exactly 255 characters', () => {
        const data = { ...validAttachment, filename: 'a'.repeat(255) }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept filename with special characters', () => {
        const data = { ...validAttachment, filename: 'my-file_2024(1).pdf' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('file_size Field Validation', () => {
      it('should accept valid file size', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })

      it('should reject negative file size', () => {
        const data = { ...validAttachment, file_size: -1 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('File size must be positive')
        }
      })

      it('should reject zero file size', () => {
        const data = { ...validAttachment, file_size: 0 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('File size must be positive')
        }
      })

      it('should reject file size exceeding 10MB', () => {
        const data = { ...validAttachment, file_size: 10485761 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('File size cannot exceed 10MB')
        }
      })

      it('should accept file size exactly 10MB', () => {
        const data = { ...validAttachment, file_size: 10485760 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject decimal file size', () => {
        const data = { ...validAttachment, file_size: 1024.5 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject string file size', () => {
        const data = { ...validAttachment, file_size: '1024' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('mime_type Field Validation', () => {
      it('should accept valid mime type', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })

      it('should reject empty mime type', () => {
        const data = { ...validAttachment, mime_type: '' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('MIME type is required')
        }
      })

      it('should accept various mime types', () => {
        const mimeTypes = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain', 'application/json']
        mimeTypes.forEach(mimeType => {
          const data = { ...validAttachment, mime_type: mimeType }
          const result = attachmentSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('file_extension Field Validation', () => {
      it('should accept valid file extension', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })

      it('should accept null file extension', () => {
        const data = { ...validAttachment, file_extension: null }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined file extension', () => {
        const data = { ...validAttachment, file_extension: undefined }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept file extension without dot', () => {
        const data = { ...validAttachment, file_extension: 'pdf' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject file extension exceeding 10 characters', () => {
        const data = { ...validAttachment, file_extension: '.verylongext' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept file extension with exactly 10 characters', () => {
        const data = { ...validAttachment, file_extension: 'a'.repeat(10) }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('file_content Field Validation', () => {
      it('should accept valid file content', () => {
        const result = attachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
      })

      it('should reject empty file content', () => {
        const data = { ...validAttachment, file_content: '' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('File content is required')
        }
      })

      it('should accept base64 encoded content', () => {
        const data = { ...validAttachment, file_content: 'SGVsbG8gV29ybGQh' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('is_public Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validAttachment, is_public: true }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validAttachment, is_public: false }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validAttachment, is_public: 1 }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject string value', () => {
        const data = { ...validAttachment, is_public: 'true' }
        const result = attachmentSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })
  })

  describe('createTicketSchema', () => {
    const validTicketData = {
      tenant_id: 'tenant123',
      requester_user_id: 'user456',
      requester_email: 'user@example.com',
      requester_name: 'John Doe',
      requester_phone: '+1234567890',
      category_id: 'cat789',
      subject: 'Login Issue',
      message_content: 'Unable to login to my account',
      resolution_due: '2024-12-31',
      internal_notes: 'Customer called support',
      attachments: []
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createTicketSchema).toBeDefined()
      })

      it('should validate complete ticket data', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })
    })

    describe('tenant_id Field Validation', () => {
      it('should accept valid tenant ID', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject empty tenant ID', () => {
        const data = { ...validTicketData, tenant_id: '' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject missing tenant ID', () => {
        const { tenant_id, ...data } = validTicketData
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('requester_user_id Field Validation', () => {
      it('should accept valid user ID', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should accept null user ID', () => {
        const data = { ...validTicketData, requester_user_id: null }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined user ID', () => {
        const data = { ...validTicketData, requester_user_id: undefined }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('requester_email Field Validation', () => {
      it('should accept valid email', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email format', () => {
        const data = { ...validTicketData, requester_email: 'invalid-email' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email format')
        }
      })

      it('should reject email without @', () => {
        const data = { ...validTicketData, requester_email: 'userexample.com' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject email without domain', () => {
        const data = { ...validTicketData, requester_email: 'user@' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept email with subdomain', () => {
        const data = { ...validTicketData, requester_email: 'user@mail.example.com' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept email with plus sign', () => {
        const data = { ...validTicketData, requester_email: 'user+tag@example.com' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('requester_name Field Validation', () => {
      it('should accept valid name', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject name with less than 2 characters', () => {
        const data = { ...validTicketData, requester_name: 'A' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Requester name must be at least 2 characters')
        }
      })

      it('should accept name with exactly 2 characters', () => {
        const data = { ...validTicketData, requester_name: 'Jo' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject name exceeding 255 characters', () => {
        const data = { ...validTicketData, requester_name: 'a'.repeat(256) }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept name with exactly 255 characters', () => {
        const data = { ...validTicketData, requester_name: 'a'.repeat(255) }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept name with spaces', () => {
        const data = { ...validTicketData, requester_name: 'John Smith Jr.' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('requester_phone Field Validation', () => {
      it('should accept valid phone number', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should accept null phone number', () => {
        const data = { ...validTicketData, requester_phone: null }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined phone number', () => {
        const data = { ...validTicketData, requester_phone: undefined }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('category_id Field Validation', () => {
      it('should accept valid category ID', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject empty category ID', () => {
        const data = { ...validTicketData, category_id: '' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject missing category ID', () => {
        const { category_id, ...data } = validTicketData
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('subject Field Validation', () => {
      it('should accept valid subject', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject subject with less than 5 characters', () => {
        const data = { ...validTicketData, subject: 'Test' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Subject must be at least 5 characters')
        }
      })

      it('should accept subject with exactly 5 characters', () => {
        const data = { ...validTicketData, subject: 'Issue' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject subject exceeding 500 characters', () => {
        const data = { ...validTicketData, subject: 'a'.repeat(501) }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept subject with exactly 500 characters', () => {
        const data = { ...validTicketData, subject: 'a'.repeat(500) }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('message_content Field Validation', () => {
      it('should accept valid message content', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should reject message with less than 10 characters', () => {
        const data = { ...validTicketData, message_content: 'Short msg' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Initial message must be at least 10 characters')
        }
      })

      it('should accept message with exactly 10 characters', () => {
        const data = { ...validTicketData, message_content: '1234567890' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept long message content', () => {
        const data = { ...validTicketData, message_content: 'a'.repeat(1000) }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('resolution_due Field Validation', () => {
      it('should accept valid resolution due date', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should accept null resolution due', () => {
        const data = { ...validTicketData, resolution_due: null }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined resolution due', () => {
        const data = { ...validTicketData, resolution_due: undefined }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('internal_notes Field Validation', () => {
      it('should accept valid internal notes', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should accept null internal notes', () => {
        const data = { ...validTicketData, internal_notes: null }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined internal notes', () => {
        const data = { ...validTicketData, internal_notes: undefined }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept empty string internal notes', () => {
        const data = { ...validTicketData, internal_notes: '' }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('attachments Field Validation', () => {
      it('should accept empty attachments array', () => {
        const result = createTicketSchema.safeParse(validTicketData)
        expect(result.success).toBe(true)
      })

      it('should accept null attachments', () => {
        const data = { ...validTicketData, attachments: null }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined attachments', () => {
        const data = { ...validTicketData, attachments: undefined }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept valid attachments', () => {
        const data = {
          ...validTicketData,
          attachments: [
            {
              filename: 'doc.pdf',
              file_size: 1024,
              mime_type: 'application/pdf',
              file_extension: '.pdf',
              file_content: 'base64',
              is_public: true
            }
          ]
        }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject more than 5 attachments', () => {
        const attachment = {
          filename: 'doc.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          file_extension: '.pdf',
          file_content: 'base64',
          is_public: true
        }
        const data = {
          ...validTicketData,
          attachments: [attachment, attachment, attachment, attachment, attachment, attachment]
        }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Maximum 5 attachments allowed per ticket')
        }
      })

      it('should accept exactly 5 attachments', () => {
        const attachment = {
          filename: 'doc.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          file_extension: '.pdf',
          file_content: 'base64',
          is_public: true
        }
        const data = {
          ...validTicketData,
          attachments: [attachment, attachment, attachment, attachment, attachment]
        }
        const result = createTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: CreateTicketFormSchema = {
          tenant_id: 'tenant123',
          requester_user_id: null,
          requester_email: 'user@example.com',
          requester_name: 'John Doe',
          requester_phone: null,
          category_id: 'cat789',
          subject: 'Issue',
          message_content: 'Description of issue',
          resolution_due: null,
          internal_notes: null,
          attachments: []
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('createTicketCommunicationSchema', () => {
    const validCommunicationData = {
      message_content: 'This is a follow-up message',
      is_internal: false,
      attachments: []
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(createTicketCommunicationSchema).toBeDefined()
      })

      it('should validate complete communication data', () => {
        const result = createTicketCommunicationSchema.safeParse(validCommunicationData)
        expect(result.success).toBe(true)
      })
    })

    describe('message_content Field Validation', () => {
      it('should accept valid message content', () => {
        const result = createTicketCommunicationSchema.safeParse(validCommunicationData)
        expect(result.success).toBe(true)
      })

      it('should reject empty message content', () => {
        const data = { ...validCommunicationData, message_content: '' }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Message content is required')
        }
      })

      it('should accept message with exactly 1 character', () => {
        const data = { ...validCommunicationData, message_content: 'A' }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject message exceeding 10000 characters', () => {
        const data = { ...validCommunicationData, message_content: 'a'.repeat(10001) }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Message content cannot exceed 10000 characters')
        }
      })

      it('should accept message with exactly 10000 characters', () => {
        const data = { ...validCommunicationData, message_content: 'a'.repeat(10000) }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('is_internal Field Validation', () => {
      it('should accept true value', () => {
        const data = { ...validCommunicationData, is_internal: true }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept false value', () => {
        const data = { ...validCommunicationData, is_internal: false }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject non-boolean value', () => {
        const data = { ...validCommunicationData, is_internal: 1 }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject string value', () => {
        const data = { ...validCommunicationData, is_internal: 'false' }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('attachments Field Validation', () => {
      it('should accept empty attachments array', () => {
        const result = createTicketCommunicationSchema.safeParse(validCommunicationData)
        expect(result.success).toBe(true)
      })

      it('should accept null attachments', () => {
        const data = { ...validCommunicationData, attachments: null }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept undefined attachments', () => {
        const data = { ...validCommunicationData, attachments: undefined }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject more than 5 attachments', () => {
        const attachment = {
          filename: 'doc.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          file_extension: '.pdf',
          file_content: 'base64',
          is_public: true
        }
        const data = {
          ...validCommunicationData,
          attachments: [attachment, attachment, attachment, attachment, attachment, attachment]
        }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Maximum 5 attachments allowed per communication')
        }
      })

      it('should accept exactly 5 attachments', () => {
        const attachment = {
          filename: 'doc.pdf',
          file_size: 1024,
          mime_type: 'application/pdf',
          file_extension: '.pdf',
          file_content: 'base64',
          is_public: true
        }
        const data = {
          ...validCommunicationData,
          attachments: [attachment, attachment, attachment, attachment, attachment]
        }
        const result = createTicketCommunicationSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: CreateTicketCommentFormSchema = {
          message_content: 'Comment',
          is_internal: false,
          attachments: null
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('updateTicketStatusSchema', () => {
    const validStatusUpdateData = {
      status: 'in_progress',
      status_reason: 'Investigating the reported issue'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(updateTicketStatusSchema).toBeDefined()
      })

      it('should validate complete status update data', () => {
        const result = updateTicketStatusSchema.safeParse(validStatusUpdateData)
        expect(result.success).toBe(true)
      })
    })

    describe('status Field Validation', () => {
      it('should accept valid status', () => {
        const result = updateTicketStatusSchema.safeParse(validStatusUpdateData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid status', () => {
        const data = { ...validStatusUpdateData, status: 'invalid_status' }
        const result = updateTicketStatusSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should use ticketStatusSchema for validation', () => {
        const validStatuses = ['new', 'open', 'in_progress', 'pending_customer', 'pending_internal', 'escalated', 'resolved', 'closed', 'cancelled']
        validStatuses.forEach(status => {
          const data = { ...validStatusUpdateData, status }
          const result = updateTicketStatusSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })
    })

    describe('status_reason Field Validation', () => {
      it('should accept valid status reason', () => {
        const result = updateTicketStatusSchema.safeParse(validStatusUpdateData)
        expect(result.success).toBe(true)
      })

      it('should reject reason with less than 5 characters', () => {
        const data = { ...validStatusUpdateData, status_reason: 'Done' }
        const result = updateTicketStatusSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept reason with exactly 5 characters', () => {
        const data = { ...validStatusUpdateData, status_reason: 'Fixed' }
        const result = updateTicketStatusSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject reason exceeding 500 characters', () => {
        const data = { ...validStatusUpdateData, status_reason: 'a'.repeat(501) }
        const result = updateTicketStatusSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept reason with exactly 500 characters', () => {
        const data = { ...validStatusUpdateData, status_reason: 'a'.repeat(500) }
        const result = updateTicketStatusSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: UpdateTicketStatusFormSchema = {
          status: 'resolved',
          status_reason: 'Issue has been resolved'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('updateTicketSchema', () => {
    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(updateTicketSchema).toBeDefined()
      })

      it('should allow partial updates', () => {
        const partialData = { subject: 'Updated Subject' }
        const result = updateTicketSchema.safeParse(partialData)
        expect(result.success).toBe(true)
      })

      it('should accept empty object for partial update', () => {
        const data = {}
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Partial Fields Validation', () => {
      it('should accept update with only subject', () => {
        const data = { subject: 'Updated Issue' }
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with only message_content', () => {
        const data = { message_content: 'Updated description of the issue' }
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept update with multiple fields', () => {
        const data = {
          subject: 'Updated Subject',
          message_content: 'Updated description',
          category_id: 'new_cat'
        }
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should apply same validation rules as createTicketSchema for subject', () => {
        const data = { subject: 'Test' }
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should apply same validation rules as createTicketSchema for email', () => {
        const data = { requester_email: 'invalid-email' }
        const result = updateTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type with optional fields', () => {
        const data: UpdateTicketFormSchema = {
          subject: 'Updated'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('assignTicketSchema', () => {
    const validAssignmentData = {
      user_id: 'user123',
      reason: 'Assigning to specialist for resolution'
    }

    describe('Schema Definition', () => {
      it('should be defined', () => {
        expect(assignTicketSchema).toBeDefined()
      })

      it('should validate complete assignment data', () => {
        const result = assignTicketSchema.safeParse(validAssignmentData)
        expect(result.success).toBe(true)
      })
    })

    describe('user_id Field Validation', () => {
      it('should accept valid user ID', () => {
        const result = assignTicketSchema.safeParse(validAssignmentData)
        expect(result.success).toBe(true)
      })

      it('should reject empty user ID', () => {
        const data = { ...validAssignmentData, user_id: '' }
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Valid user ID is required')
        }
      })

      it('should reject missing user ID', () => {
        const { user_id, ...data } = validAssignmentData
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('reason Field Validation', () => {
      it('should accept valid reason', () => {
        const result = assignTicketSchema.safeParse(validAssignmentData)
        expect(result.success).toBe(true)
      })

      it('should reject reason with less than 5 characters', () => {
        const data = { ...validAssignmentData, reason: 'Done' }
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Assignment reason must be at least 5 characters')
        }
      })

      it('should accept reason with exactly 5 characters', () => {
        const data = { ...validAssignmentData, reason: 'Fixed' }
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should reject reason exceeding 500 characters', () => {
        const data = { ...validAssignmentData, reason: 'a'.repeat(501) }
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should accept reason with exactly 500 characters', () => {
        const data = { ...validAssignmentData, reason: 'a'.repeat(500) }
        const result = assignTicketSchema.safeParse(data)

        expect(result.success).toBe(true)
      })
    })

    describe('Type Inference', () => {
      it('should infer correct TypeScript type', () => {
        const data: AssignTicketFormSchema = {
          user_id: 'user123',
          reason: 'Assigning to user'
        }

        expect(data).toBeDefined()
      })
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      const invalidData = { subject: 'Test' }
      const result = createTicketSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should include field path in error', () => {
      const invalidData = {
        tenant_id: 'tenant123',
        requester_email: 'invalid-email',
        requester_name: 'John Doe',
        category_id: 'cat789',
        subject: 'Issue',
        message_content: 'Description'
      }
      const result = createTicketSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('requester_email')
      }
    })

    it('should provide multiple error messages for multiple invalid fields', () => {
      const invalidData = {
        tenant_id: '',
        requester_email: 'invalid',
        requester_name: 'A',
        category_id: '',
        subject: 'T',
        message_content: 'Short'
      }
      const result = createTicketSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(3)
      }
    })
  })
})
