/* Libraries imports */
import { describe, it, expect } from 'vitest'

/* Shared module imports */
import { STATUS_COLORS, STATUS_BADGE_CONFIG, FILE_TYPE_ICONS, getFileTypeIcon } from '@shared/constants/badge-colors'

describe('badge-colors', () => {
  describe('STATUS_COLORS', () => {
    it('should export STATUS_COLORS constant', () => {
      expect(STATUS_COLORS).toBeDefined()
      expect(typeof STATUS_COLORS).toBe('object')
    })

    it('should have BLUE color', () => {
      expect(STATUS_COLORS.BLUE).toBe('#3b82f6')
    })

    it('should have INDIGO color', () => {
      expect(STATUS_COLORS.INDIGO).toBe('#6366f1')
    })

    it('should have AMBER color', () => {
      expect(STATUS_COLORS.AMBER).toBe('#f59e0b')
    })

    it('should have RED color', () => {
      expect(STATUS_COLORS.RED).toBe('#ef4444')
    })

    it('should have PURPLE color', () => {
      expect(STATUS_COLORS.PURPLE).toBe('#8b5cf6')
    })

    it('should have all colors in hex format', () => {
      Object.values(STATUS_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('should have 5 status colors', () => {
      expect(Object.keys(STATUS_COLORS)).toHaveLength(5)
    })

    it('should not have duplicate color values', () => {
      const values = Object.values(STATUS_COLORS)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })
  })

  describe('STATUS_BADGE_CONFIG', () => {
    it('should export STATUS_BADGE_CONFIG constant', () => {
      expect(STATUS_BADGE_CONFIG).toBeDefined()
      expect(typeof STATUS_BADGE_CONFIG).toBe('object')
    })

    it('should have configuration for all status keys', () => {
      const requiredStatuses = [
        'active', 'inactive', 'suspended', 'locked', 'hold', 'pending',
        'pending_verification', 'cancelled', 'trial', 'setup', 'past_due',
        'incomplete', 'paused', 'new', 'open', 'in_progress', 'pending_customer',
        'pending_internal', 'escalated', 'resolved', 'closed', 'success',
        'failed', 'default'
      ]

      requiredStatuses.forEach(status => {
        expect(STATUS_BADGE_CONFIG).toHaveProperty(status)
      })
    })

    it('should have complete BadgeColorsWithIcon structure for each status', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(config).toHaveProperty('color')
        expect(config).toHaveProperty('bg')
        expect(config).toHaveProperty('borderColor')
        expect(config).toHaveProperty('icon')
        expect(config).toHaveProperty('colorScheme')
      })
    })

    it('should have string color values', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(typeof config.color).toBe('string')
        expect(typeof config.bg).toBe('string')
        expect(typeof config.borderColor).toBe('string')
        expect(typeof config.colorScheme).toBe('string')
      })
    })

    it('should have function icon values', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(typeof config.icon).toBe('function')
      })
    })

    it('should use valid colorScheme values', () => {
      const validColorSchemes = ['green', 'gray', 'red', 'orange', 'blue', 'purple', 'yellow']

      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(validColorSchemes).toContain(config.colorScheme)
      })
    })
  })

  describe('Status Badge Categories', () => {
    it('should have positive status badges', () => {
      expect(STATUS_BADGE_CONFIG.active).toBeDefined()
      expect(STATUS_BADGE_CONFIG.success).toBeDefined()
      expect(STATUS_BADGE_CONFIG.resolved).toBeDefined()
    })

    it('should have negative status badges', () => {
      expect(STATUS_BADGE_CONFIG.inactive).toBeDefined()
      expect(STATUS_BADGE_CONFIG.suspended).toBeDefined()
      expect(STATUS_BADGE_CONFIG.failed).toBeDefined()
      expect(STATUS_BADGE_CONFIG.cancelled).toBeDefined()
    })

    it('should have warning status badges', () => {
      expect(STATUS_BADGE_CONFIG.pending).toBeDefined()
      expect(STATUS_BADGE_CONFIG.hold).toBeDefined()
      expect(STATUS_BADGE_CONFIG.locked).toBeDefined()
    })

    it('should have informational status badges', () => {
      expect(STATUS_BADGE_CONFIG.new).toBeDefined()
      expect(STATUS_BADGE_CONFIG.open).toBeDefined()
      expect(STATUS_BADGE_CONFIG.in_progress).toBeDefined()
    })

    it('should have subscription status badges', () => {
      expect(STATUS_BADGE_CONFIG.trial).toBeDefined()
      expect(STATUS_BADGE_CONFIG.setup).toBeDefined()
      expect(STATUS_BADGE_CONFIG.past_due).toBeDefined()
      expect(STATUS_BADGE_CONFIG.paused).toBeDefined()
    })

    it('should have ticket status badges', () => {
      expect(STATUS_BADGE_CONFIG.pending_customer).toBeDefined()
      expect(STATUS_BADGE_CONFIG.pending_internal).toBeDefined()
      expect(STATUS_BADGE_CONFIG.escalated).toBeDefined()
      expect(STATUS_BADGE_CONFIG.closed).toBeDefined()
    })

    it('should have default fallback badge', () => {
      expect(STATUS_BADGE_CONFIG.default).toBeDefined()
    })
  })

  describe('FILE_TYPE_ICONS', () => {
    it('should export FILE_TYPE_ICONS constant', () => {
      expect(FILE_TYPE_ICONS).toBeDefined()
      expect(typeof FILE_TYPE_ICONS).toBe('object')
    })

    it('should have icons for image types', () => {
      expect(FILE_TYPE_ICONS['image/jpeg']).toBeDefined()
      expect(FILE_TYPE_ICONS['image/png']).toBeDefined()
      expect(FILE_TYPE_ICONS['image/gif']).toBeDefined()
    })

    it('should have icon for PDF', () => {
      expect(FILE_TYPE_ICONS['application/pdf']).toBeDefined()
    })

    it('should have icons for Word documents', () => {
      expect(FILE_TYPE_ICONS['application/msword']).toBeDefined()
      expect(FILE_TYPE_ICONS['application/vnd.openxmlformats-officedocument.wordprocessingml.document']).toBeDefined()
    })

    it('should have icons for Excel spreadsheets', () => {
      expect(FILE_TYPE_ICONS['application/vnd.ms-excel']).toBeDefined()
      expect(FILE_TYPE_ICONS['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']).toBeDefined()
    })

    it('should have icons for PowerPoint presentations', () => {
      expect(FILE_TYPE_ICONS['application/vnd.ms-powerpoint']).toBeDefined()
      expect(FILE_TYPE_ICONS['application/vnd.openxmlformats-officedocument.presentationml.presentation']).toBeDefined()
    })

    it('should have icons for video types', () => {
      expect(FILE_TYPE_ICONS['video/mp4']).toBeDefined()
      expect(FILE_TYPE_ICONS['video/mpeg']).toBeDefined()
    })

    it('should have icons for audio types', () => {
      expect(FILE_TYPE_ICONS['audio/mpeg']).toBeDefined()
      expect(FILE_TYPE_ICONS['audio/wav']).toBeDefined()
    })

    it('should have icons for archive types', () => {
      expect(FILE_TYPE_ICONS['application/zip']).toBeDefined()
      expect(FILE_TYPE_ICONS['application/x-rar-compressed']).toBeDefined()
    })

    it('should have icons for code file types', () => {
      expect(FILE_TYPE_ICONS['text/html']).toBeDefined()
      expect(FILE_TYPE_ICONS['text/javascript']).toBeDefined()
      expect(FILE_TYPE_ICONS['application/json']).toBeDefined()
    })

    it('should have default fallback icon', () => {
      expect(FILE_TYPE_ICONS.default).toBeDefined()
    })

    it('should have function values for all icons', () => {
      Object.values(FILE_TYPE_ICONS).forEach(icon => {
        expect(typeof icon).toBe('function')
      })
    })
  })

  describe('getFileTypeIcon Function', () => {
    it('should be exported as a function', () => {
      expect(typeof getFileTypeIcon).toBe('function')
    })

    it('should return correct icon for known MIME types', () => {
      const jpegIcon = getFileTypeIcon('image/jpeg')
      const pdfIcon = getFileTypeIcon('application/pdf')

      expect(jpegIcon).toBe(FILE_TYPE_ICONS['image/jpeg'])
      expect(pdfIcon).toBe(FILE_TYPE_ICONS['application/pdf'])
    })

    it('should return default icon for unknown MIME types', () => {
      const unknownIcon = getFileTypeIcon('unknown/type')
      expect(unknownIcon).toBe(FILE_TYPE_ICONS.default)
    })

    it('should handle all image MIME types', () => {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']

      imageTypes.forEach(type => {
        const icon = getFileTypeIcon(type)
        expect(icon).toBeDefined()
        expect(typeof icon).toBe('function')
      })
    })

    it('should handle all document MIME types', () => {
      const docTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      docTypes.forEach(type => {
        const icon = getFileTypeIcon(type)
        expect(icon).toBeDefined()
        expect(typeof icon).toBe('function')
      })
    })

    it('should be case-sensitive for MIME types', () => {
      const lowerCase = getFileTypeIcon('image/jpeg')
      const upperCase = getFileTypeIcon('IMAGE/JPEG')

      expect(lowerCase).toBe(FILE_TYPE_ICONS['image/jpeg'])
      expect(upperCase).toBe(FILE_TYPE_ICONS.default)
    })

    it('should handle empty string', () => {
      const icon = getFileTypeIcon('')
      expect(icon).toBe(FILE_TYPE_ICONS.default)
    })
  })

  describe('Type Safety and Consistency', () => {
    it('should have all STATUS_COLORS as strings', () => {
      Object.values(STATUS_COLORS).forEach(color => {
        expect(typeof color).toBe('string')
        expect(color.length).toBeGreaterThan(0)
      })
    })

    it('should have all badges with non-empty colors', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(config.color.length).toBeGreaterThan(0)
        expect(config.bg.length).toBeGreaterThan(0)
        expect(config.borderColor.length).toBeGreaterThan(0)
      })
    })

    it('should have all badges with non-empty colorScheme', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(config.colorScheme.length).toBeGreaterThan(0)
      })
    })

    it('should not have null or undefined values', () => {
      Object.values(STATUS_BADGE_CONFIG).forEach(config => {
        expect(config.color).not.toBeNull()
        expect(config.bg).not.toBeNull()
        expect(config.borderColor).not.toBeNull()
        expect(config.icon).not.toBeNull()
        expect(config.colorScheme).not.toBeNull()
      })
    })
  })

  describe('Integration', () => {
    it('should be usable in badge components', () => {
      const statusBadge = {
        status: 'active',
        ...STATUS_BADGE_CONFIG.active
      }

      expect(statusBadge.color).toBeDefined()
      expect(statusBadge.icon).toBeDefined()
      expect(statusBadge.colorScheme).toBe('green')
    })

    it('should support dynamic status lookup', () => {
      const status = 'pending' as keyof typeof STATUS_BADGE_CONFIG
      const config = STATUS_BADGE_CONFIG[status]

      expect(config).toBeDefined()
      expect(config.colorScheme).toBe('orange')
    })

    it('should support file icon lookup', () => {
      const files = [
        { name: 'document.pdf', mimeType: 'application/pdf' },
        { name: 'image.jpg', mimeType: 'image/jpeg' },
        { name: 'data.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      ]

      files.forEach(file => {
        const icon = getFileTypeIcon(file.mimeType)
        expect(icon).toBeDefined()
        expect(typeof icon).toBe('function')
      })
    })
  })

  describe('Color Scheme Mapping', () => {
    it('should map green to success states', () => {
      expect(STATUS_BADGE_CONFIG.active.colorScheme).toBe('green')
      expect(STATUS_BADGE_CONFIG.success.colorScheme).toBe('green')
      expect(STATUS_BADGE_CONFIG.resolved.colorScheme).toBe('green')
    })

    it('should map red to error states', () => {
      expect(STATUS_BADGE_CONFIG.suspended.colorScheme).toBe('red')
      expect(STATUS_BADGE_CONFIG.failed.colorScheme).toBe('red')
      expect(STATUS_BADGE_CONFIG.cancelled.colorScheme).toBe('red')
      expect(STATUS_BADGE_CONFIG.escalated.colorScheme).toBe('red')
    })

    it('should map orange to warning states', () => {
      expect(STATUS_BADGE_CONFIG.pending.colorScheme).toBe('orange')
      expect(STATUS_BADGE_CONFIG.hold.colorScheme).toBe('orange')
      expect(STATUS_BADGE_CONFIG.in_progress.colorScheme).toBe('orange')
    })

    it('should map gray to neutral states', () => {
      expect(STATUS_BADGE_CONFIG.inactive.colorScheme).toBe('gray')
      expect(STATUS_BADGE_CONFIG.closed.colorScheme).toBe('gray')
      expect(STATUS_BADGE_CONFIG.default.colorScheme).toBe('gray')
    })
  })

  describe('File Type Coverage', () => {
    it('should cover all major image formats', () => {
      const imageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']

      imageFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })

    it('should cover all major document formats', () => {
      const docFormats = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]

      docFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })

    it('should cover all major video formats', () => {
      const videoFormats = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']

      videoFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })

    it('should cover all major audio formats', () => {
      const audioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']

      audioFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })

    it('should cover all major archive formats', () => {
      const archiveFormats = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/gzip'
      ]

      archiveFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })

    it('should cover code file formats', () => {
      const codeFormats = [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/xml',
        'text/xml'
      ]

      codeFormats.forEach(format => {
        expect(FILE_TYPE_ICONS[format]).toBeDefined()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle status badge lookup with default fallback', () => {
      const config = STATUS_BADGE_CONFIG.default
      expect(config).toBeDefined()
      expect(config.colorScheme).toBe('gray')
    })

    it('should return same icon reference for same MIME type', () => {
      const icon1 = getFileTypeIcon('image/jpeg')
      const icon2 = getFileTypeIcon('image/jpeg')
      expect(icon1).toBe(icon2)
    })

    it('should handle all status keys without errors', () => {
      Object.keys(STATUS_BADGE_CONFIG).forEach(key => {
        expect(() => {
          const config = STATUS_BADGE_CONFIG[key as keyof typeof STATUS_BADGE_CONFIG]
          expect(config).toBeDefined()
        }).not.toThrow()
      })
    })
  })
})
