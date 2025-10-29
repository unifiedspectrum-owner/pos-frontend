/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'

/* Shared module imports */
import { formatFileSize, fileToBase64 } from '@shared/utils/formatting/file'

describe('File Formatting Utilities', () => {
  describe('formatFileSize', () => {
    describe('Bytes', () => {
      it('should format 0 bytes', () => {
        expect(formatFileSize(0)).toBe('0 Bytes')
      })

      it('should format 1 byte', () => {
        expect(formatFileSize(1)).toBe('1 Bytes')
      })

      it('should format 10 bytes', () => {
        expect(formatFileSize(10)).toBe('10 Bytes')
      })

      it('should format 999 bytes', () => {
        expect(formatFileSize(999)).toBe('999 Bytes')
      })

      it('should format 1023 bytes', () => {
        expect(formatFileSize(1023)).toBe('1023 Bytes')
      })
    })

    describe('Kilobytes', () => {
      it('should format 1024 bytes as 1 KB', () => {
        expect(formatFileSize(1024)).toBe('1 KB')
      })

      it('should format 2048 bytes as 2 KB', () => {
        expect(formatFileSize(2048)).toBe('2 KB')
      })

      it('should format 5120 bytes as 5 KB', () => {
        expect(formatFileSize(5120)).toBe('5 KB')
      })

      it('should format 10240 bytes as 10 KB', () => {
        expect(formatFileSize(10240)).toBe('10 KB')
      })

      it('should format 1536 bytes as 1.5 KB', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB')
      })

      it('should format 2560 bytes as 2.5 KB', () => {
        expect(formatFileSize(2560)).toBe('2.5 KB')
      })

      it('should format 1048575 bytes (just under 1 MB)', () => {
        const result = formatFileSize(1048575)
        expect(result).toContain('KB')
        expect(result).toBe('1024 KB')
      })
    })

    describe('Megabytes', () => {
      it('should format 1048576 bytes as 1 MB', () => {
        expect(formatFileSize(1048576)).toBe('1 MB')
      })

      it('should format 2097152 bytes as 2 MB', () => {
        expect(formatFileSize(2097152)).toBe('2 MB')
      })

      it('should format 5242880 bytes as 5 MB', () => {
        expect(formatFileSize(5242880)).toBe('5 MB')
      })

      it('should format 10485760 bytes as 10 MB', () => {
        expect(formatFileSize(10485760)).toBe('10 MB')
      })

      it('should format 1572864 bytes as 1.5 MB', () => {
        expect(formatFileSize(1572864)).toBe('1.5 MB')
      })

      it('should format 100 MB', () => {
        expect(formatFileSize(104857600)).toBe('100 MB')
      })

      it('should format 500 MB', () => {
        expect(formatFileSize(524288000)).toBe('500 MB')
      })
    })

    describe('Gigabytes', () => {
      it('should format 1073741824 bytes as 1 GB', () => {
        expect(formatFileSize(1073741824)).toBe('1 GB')
      })

      it('should format 2147483648 bytes as 2 GB', () => {
        expect(formatFileSize(2147483648)).toBe('2 GB')
      })

      it('should format 5 GB', () => {
        expect(formatFileSize(5368709120)).toBe('5 GB')
      })

      it('should format 10 GB', () => {
        expect(formatFileSize(10737418240)).toBe('10 GB')
      })

      it('should format 1.5 GB', () => {
        expect(formatFileSize(1610612736)).toBe('1.5 GB')
      })

      it('should format 100 GB', () => {
        expect(formatFileSize(107374182400)).toBe('100 GB')
      })
    })

    describe('Decimal Precision', () => {
      it('should round to 2 decimal places', () => {
        const result = formatFileSize(1536)
        expect(result).toBe('1.5 KB')
      })

      it('should handle values requiring rounding', () => {
        const result = formatFileSize(1638)
        expect(result).toBe('1.6 KB')
      })

      it('should round up correctly', () => {
        const result = formatFileSize(1638400)
        expect(result).toBe('1.56 MB')
      })

      it('should round down correctly', () => {
        const result = formatFileSize(1536000)
        expect(result).toBe('1.46 MB')
      })
    })

    describe('Edge Cases', () => {
      it('should handle very small files', () => {
        expect(formatFileSize(1)).toBe('1 Bytes')
        expect(formatFileSize(5)).toBe('5 Bytes')
      })

      it('should handle very large files', () => {
        const result = formatFileSize(999999999999)
        expect(result).toContain('GB')
      })

      it('should handle negative numbers', () => {
        /* Technically invalid, but should handle gracefully */
        const result = formatFileSize(-1024)
        expect(result).toBeDefined()
      })

      it('should handle floating point bytes', () => {
        const result = formatFileSize(1024.5)
        expect(result).toBeDefined()
      })
    })

    describe('Common File Sizes', () => {
      it('should format typical image file (2 MB)', () => {
        expect(formatFileSize(2097152)).toBe('2 MB')
      })

      it('should format typical document (100 KB)', () => {
        expect(formatFileSize(102400)).toBe('100 KB')
      })

      it('should format typical video (500 MB)', () => {
        expect(formatFileSize(524288000)).toBe('500 MB')
      })

      it('should format typical audio (5 MB)', () => {
        expect(formatFileSize(5242880)).toBe('5 MB')
      })

      it('should format HD video (2 GB)', () => {
        expect(formatFileSize(2147483648)).toBe('2 GB')
      })
    })

    describe('Return Type', () => {
      it('should return string', () => {
        const result = formatFileSize(1024)
        expect(typeof result).toBe('string')
      })

      it('should contain number and unit', () => {
        const result = formatFileSize(1024)
        expect(result).toMatch(/^\d+(\.\d+)?\s[A-Z]+$/)
      })
    })
  })

  describe('fileToBase64', () => {
    describe('Valid File Conversion', () => {
      it('should convert file to base64', async () => {
        const fileContent = 'Hello World'
        const blob = new Blob([fileContent], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should convert image file to base64', async () => {
        const blob = new Blob(['fake-image-data'], { type: 'image/png' })
        const file = new File([blob], 'test.png', { type: 'image/png' })

        const result = await fileToBase64(file)

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      })

      it('should convert PDF file to base64', async () => {
        const blob = new Blob(['fake-pdf-data'], { type: 'application/pdf' })
        const file = new File([blob], 'test.pdf', { type: 'application/pdf' })

        const result = await fileToBase64(file)

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      })

      it('should strip data URL prefix', async () => {
        const blob = new Blob(['test'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)

        /* Should not contain data:text/plain;base64, prefix */
        expect(result).not.toContain('data:')
        expect(result).not.toContain('base64,')
      })
    })

    describe('Different File Types', () => {
      it('should handle text files', async () => {
        const blob = new Blob(['text content'], { type: 'text/plain' })
        const file = new File([blob], 'doc.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
      })

      it('should handle JSON files', async () => {
        const blob = new Blob(['{"key": "value"}'], { type: 'application/json' })
        const file = new File([blob], 'data.json', { type: 'application/json' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
      })

      it('should handle CSV files', async () => {
        const blob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' })
        const file = new File([blob], 'data.csv', { type: 'text/csv' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
      })
    })

    describe('File Sizes', () => {
      it('should handle empty file', async () => {
        const blob = new Blob([''], { type: 'text/plain' })
        const file = new File([blob], 'empty.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      })

      it('should handle small file', async () => {
        const blob = new Blob(['x'], { type: 'text/plain' })
        const file = new File([blob], 'small.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
      })

      it('should handle larger file', async () => {
        const largeContent = 'x'.repeat(10000)
        const blob = new Blob([largeContent], { type: 'text/plain' })
        const file = new File([blob], 'large.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('Promise Behavior', () => {
      it('should return Promise', () => {
        const blob = new Blob(['test'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const result = fileToBase64(file)
        expect(result).toBeInstanceOf(Promise)
      })

      it('should resolve with string', async () => {
        const blob = new Blob(['test'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        await expect(fileToBase64(file)).resolves.toBeDefined()
      })

      it('should handle multiple conversions', async () => {
        const files = [
          new File([new Blob(['file1'])], 'file1.txt'),
          new File([new Blob(['file2'])], 'file2.txt'),
          new File([new Blob(['file3'])], 'file3.txt')
        ]

        const results = await Promise.all(files.map(file => fileToBase64(file)))

        expect(results).toHaveLength(3)
        results.forEach(result => {
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        })
      })
    })

    describe('Error Handling', () => {
      it('should reject on FileReader error', async () => {
        const blob = new Blob(['test'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        /* Mock FileReader to trigger error */
        const originalFileReader = global.FileReader
        const MockFileReader = vi.fn().mockImplementation(() => ({
          readAsDataURL: vi.fn(function(this: FileReader) {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Read error') as unknown as ProgressEvent<FileReader>)
              }
            }, 0)
          }),
          result: null,
          onerror: null,
          onload: null
        }))

        /* Add static properties */
        Object.defineProperty(MockFileReader, 'EMPTY', { value: 0 })
        Object.defineProperty(MockFileReader, 'LOADING', { value: 1 })
        Object.defineProperty(MockFileReader, 'DONE', { value: 2 })

        global.FileReader = MockFileReader as unknown as typeof FileReader

        await expect(fileToBase64(file)).rejects.toBeDefined()

        global.FileReader = originalFileReader
      })
    })

    describe('Base64 Format', () => {
      it('should return valid base64 string', async () => {
        const blob = new Blob(['test'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const result = await fileToBase64(file)

        /* Base64 should only contain alphanumeric, +, /, and = */
        expect(result).toMatch(/^[A-Za-z0-9+/=]*$/)
      })

      it('should be decodable', async () => {
        const originalContent = 'Hello World'
        const blob = new Blob([originalContent], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const base64 = await fileToBase64(file)

        /* Decode and verify */
        const decoded = atob(base64)
        expect(decoded).toBe(originalContent)
      })
    })

    describe('Integration', () => {
      it('should work with File API', async () => {
        const file = new File(['test content'], 'test.txt', {
          type: 'text/plain',
          lastModified: Date.now()
        })

        expect(file.name).toBe('test.txt')
        expect(file.type).toBe('text/plain')

        const result = await fileToBase64(file)
        expect(result).toBeDefined()
      })

      it('should maintain consistency across multiple calls', async () => {
        const blob = new Blob(['same content'], { type: 'text/plain' })
        const file = new File([blob], 'test.txt', { type: 'text/plain' })

        const result1 = await fileToBase64(file)
        const result2 = await fileToBase64(file)

        expect(result1).toBe(result2)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should format file size and convert to base64', async () => {
      const content = 'test file content'
      const blob = new Blob([content], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })

      const size = formatFileSize(file.size)
      expect(size).toBeDefined()
      expect(size).toContain('Bytes')

      const base64 = await fileToBase64(file)
      expect(base64).toBeDefined()
      expect(typeof base64).toBe('string')
    })

    it('should handle typical file upload workflow', async () => {
      const file = new File(
        [new Blob(['file data'])],
        'document.pdf',
        { type: 'application/pdf' }
      )

      /* Format size for display */
      const displaySize = formatFileSize(file.size)
      expect(displaySize).toBeDefined()

      /* Convert for upload */
      const base64Data = await fileToBase64(file)
      expect(base64Data).toBeDefined()
      expect(base64Data.length).toBeGreaterThan(0)
    })
  })
})
