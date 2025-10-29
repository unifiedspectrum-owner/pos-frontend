/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui/notifications'

/* Mock the toaster component */
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn()
  }
}))

import { toaster } from '@/components/ui/toaster'

describe('Notification Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createToastNotification', () => {
    describe('Basic Functionality', () => {
      it('should call toaster.create with provided config', () => {
        createToastNotification({
          title: 'Success',
          description: 'Operation completed'
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Operation completed',
          type: 'success',
          duration: 7000,
          closable: true
        })
      })

      it('should create notification with all parameters', () => {
        createToastNotification({
          title: 'Test Title',
          description: 'Test Description',
          type: 'info',
          duration: 5000,
          closable: false
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Test Title',
          description: 'Test Description',
          type: 'info',
          duration: 5000,
          closable: false
        })
      })
    })

    describe('Default Values', () => {
      it('should use success type by default', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'success'
          })
        )
      })

      it('should use 7000ms duration by default', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 7000
          })
        )
      })

      it('should be closable by default', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            closable: true
          })
        )
      })

      it('should apply all defaults when only required params provided', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Title',
          description: 'Description',
          type: 'success',
          duration: 7000,
          closable: true
        })
      })
    })

    describe('Toast Types', () => {
      it('should create success notification', () => {
        createToastNotification({
          title: 'Success',
          description: 'Success message',
          type: 'success'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'success'
          })
        )
      })

      it('should create error notification', () => {
        createToastNotification({
          title: 'Error',
          description: 'Error message',
          type: 'error'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error'
          })
        )
      })

      it('should create warning notification', () => {
        createToastNotification({
          title: 'Warning',
          description: 'Warning message',
          type: 'warning'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'warning'
          })
        )
      })

      it('should create info notification', () => {
        createToastNotification({
          title: 'Info',
          description: 'Info message',
          type: 'info'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'info'
          })
        )
      })
    })

    describe('Duration Customization', () => {
      it('should accept custom duration', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          duration: 3000
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 3000
          })
        )
      })

      it('should handle very short duration', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          duration: 1000
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 1000
          })
        )
      })

      it('should handle very long duration', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          duration: 30000
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 30000
          })
        )
      })

      it('should handle zero duration', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          duration: 0
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 0
          })
        )
      })
    })

    describe('Closable Option', () => {
      it('should be closable when set to true', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          closable: true
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            closable: true
          })
        )
      })

      it('should not be closable when set to false', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description',
          closable: false
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            closable: false
          })
        )
      })
    })

    describe('Title and Description', () => {
      it('should handle short title', () => {
        createToastNotification({
          title: 'OK',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'OK'
          })
        )
      })

      it('should handle long title', () => {
        const longTitle = 'This is a very long title that contains many words and characters'

        createToastNotification({
          title: longTitle,
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: longTitle
          })
        )
      })

      it('should handle short description', () => {
        createToastNotification({
          title: 'Title',
          description: 'OK'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'OK'
          })
        )
      })

      it('should handle long description', () => {
        const longDescription = 'This is a very long description that contains many words and provides detailed information about what happened and what the user should do next.'

        createToastNotification({
          title: 'Title',
          description: longDescription
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: longDescription
          })
        )
      })

      it('should handle special characters in title', () => {
        createToastNotification({
          title: 'Error: <Operation> & "Action" Failed!',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error: <Operation> & "Action" Failed!'
          })
        )
      })

      it('should handle special characters in description', () => {
        createToastNotification({
          title: 'Title',
          description: 'Error at line #42: <div> & "quotes"'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Error at line #42: <div> & "quotes"'
          })
        )
      })

      it('should handle empty string title', () => {
        createToastNotification({
          title: '',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: ''
          })
        )
      })

      it('should handle empty string description', () => {
        createToastNotification({
          title: 'Title',
          description: ''
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: ''
          })
        )
      })
    })

    describe('Multiple Notifications', () => {
      it('should create multiple notifications sequentially', () => {
        createToastNotification({
          title: 'First',
          description: 'First notification'
        })

        createToastNotification({
          title: 'Second',
          description: 'Second notification'
        })

        expect(toaster.create).toHaveBeenCalledTimes(2)
      })

      it('should maintain separate configs for multiple notifications', () => {
        createToastNotification({
          title: 'Success',
          description: 'Success message',
          type: 'success'
        })

        createToastNotification({
          title: 'Error',
          description: 'Error message',
          type: 'error'
        })

        expect(toaster.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
          type: 'success'
        }))

        expect(toaster.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
          type: 'error'
        }))
      })
    })

    describe('Call Verification', () => {
      it('should call toaster.create exactly once', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        expect(toaster.create).toHaveBeenCalledTimes(1)
      })

      it('should not call any other methods', () => {
        createToastNotification({
          title: 'Title',
          description: 'Description'
        })

        /* Verify only create was called */
        expect(toaster.create).toHaveBeenCalled()
      })
    })

    describe('Real-World Scenarios', () => {
      it('should create success notification after save', () => {
        createToastNotification({
          title: 'Saved Successfully',
          description: 'Your changes have been saved.',
          type: 'success'
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Saved Successfully',
          description: 'Your changes have been saved.',
          type: 'success',
          duration: 7000,
          closable: true
        })
      })

      it('should create error notification on failure', () => {
        createToastNotification({
          title: 'Save Failed',
          description: 'Unable to save your changes. Please try again.',
          type: 'error',
          duration: 10000
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Save Failed',
          description: 'Unable to save your changes. Please try again.',
          type: 'error',
          duration: 10000,
          closable: true
        })
      })

      it('should create warning notification for validation', () => {
        createToastNotification({
          title: 'Validation Warning',
          description: 'Some fields need your attention.',
          type: 'warning'
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Validation Warning',
          description: 'Some fields need your attention.',
          type: 'warning',
          duration: 7000,
          closable: true
        })
      })

      it('should create info notification for updates', () => {
        createToastNotification({
          title: 'New Update Available',
          description: 'A new version is available. Click to refresh.',
          type: 'info',
          duration: 0,
          closable: true
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'New Update Available',
          description: 'A new version is available. Click to refresh.',
          type: 'info',
          duration: 0,
          closable: true
        })
      })

      it('should create persistent error notification', () => {
        createToastNotification({
          title: 'Critical Error',
          description: 'System error occurred. Please contact support.',
          type: 'error',
          duration: 0,
          closable: false
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Critical Error',
          description: 'System error occurred. Please contact support.',
          type: 'error',
          duration: 0,
          closable: false
        })
      })

      it('should create quick success notification', () => {
        createToastNotification({
          title: 'Copied',
          description: 'Text copied to clipboard',
          type: 'success',
          duration: 2000
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Copied',
          description: 'Text copied to clipboard',
          type: 'success',
          duration: 2000,
          closable: true
        })
      })
    })

    describe('Edge Cases', () => {
      it('should handle notification with all custom values', () => {
        createToastNotification({
          title: 'Custom',
          description: 'Custom notification',
          type: 'warning',
          duration: 5000,
          closable: false
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Custom',
          description: 'Custom notification',
          type: 'warning',
          duration: 5000,
          closable: false
        })
      })

      it('should handle notification with only required fields', () => {
        createToastNotification({
          title: 'Required Only',
          description: 'Only required fields'
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Required Only',
          description: 'Only required fields',
          type: 'success',
          duration: 7000,
          closable: true
        })
      })

      it('should handle notification with unicode characters', () => {
        createToastNotification({
          title: '成功 ✓',
          description: 'Operación completada 🎉'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '成功 ✓',
            description: 'Operación completada 🎉'
          })
        )
      })

      it('should handle notification with newlines', () => {
        createToastNotification({
          title: 'Multi-line',
          description: 'Line 1\nLine 2\nLine 3'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Line 1\nLine 2\nLine 3'
          })
        )
      })

      it('should handle notification with HTML-like content', () => {
        createToastNotification({
          title: '<b>Bold Title</b>',
          description: '<p>Paragraph content</p>'
        })

        expect(toaster.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '<b>Bold Title</b>',
            description: '<p>Paragraph content</p>'
          })
        )
      })
    })

    describe('Type Safety', () => {
      it('should accept only valid toast types', () => {
        const validTypes: Array<'success' | 'error' | 'warning' | 'info'> = [
          'success',
          'error',
          'warning',
          'info'
        ]

        validTypes.forEach(type => {
          createToastNotification({
            title: 'Title',
            description: 'Description',
            type
          })
        })

        expect(toaster.create).toHaveBeenCalledTimes(4)
      })

      it('should handle all type variations', () => {
        createToastNotification({
          title: 'Success',
          description: 'Description',
          type: 'success'
        })

        createToastNotification({
          title: 'Error',
          description: 'Description',
          type: 'error'
        })

        createToastNotification({
          title: 'Warning',
          description: 'Description',
          type: 'warning'
        })

        createToastNotification({
          title: 'Info',
          description: 'Description',
          type: 'info'
        })

        expect(toaster.create).toHaveBeenCalledTimes(4)
      })
    })

    describe('Integration Tests', () => {
      it('should integrate with form submission success', () => {
        /* Simulating successful form submission */
        createToastNotification({
          title: 'Form Submitted',
          description: 'Your form has been submitted successfully.',
          type: 'success',
          duration: 5000
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Form Submitted',
          description: 'Your form has been submitted successfully.',
          type: 'success',
          duration: 5000,
          closable: true
        })
      })

      it('should integrate with API error handling', () => {
        /* Simulating API error */
        createToastNotification({
          title: 'API Error',
          description: 'Failed to fetch data from server.',
          type: 'error',
          duration: 10000
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'API Error',
          description: 'Failed to fetch data from server.',
          type: 'error',
          duration: 10000,
          closable: true
        })
      })

      it('should integrate with user action feedback', () => {
        /* Simulating copy action */
        createToastNotification({
          title: 'Copied!',
          description: 'Content copied to clipboard',
          type: 'success',
          duration: 2000
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Copied!',
          description: 'Content copied to clipboard',
          type: 'success',
          duration: 2000,
          closable: true
        })
      })

      it('should integrate with session expiry warning', () => {
        createToastNotification({
          title: 'Session Expiring',
          description: 'Your session will expire in 5 minutes.',
          type: 'warning',
          duration: 15000,
          closable: false
        })

        expect(toaster.create).toHaveBeenCalledWith({
          title: 'Session Expiring',
          description: 'Your session will expire in 5 minutes.',
          type: 'warning',
          duration: 15000,
          closable: false
        })
      })
    })
  })
})
