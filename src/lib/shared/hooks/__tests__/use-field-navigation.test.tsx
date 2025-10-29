/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import React from 'react'

/* Shared module imports */
import { useFieldNavigation } from '@shared/hooks/use-field-navigation'

/* Test form interface */
interface TestFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

describe('use-field-navigation', () => {
  describe('Initialization', () => {
    it('should initialize with field refs', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      expect(result.current).toHaveProperty('getFieldProps')
      expect(typeof result.current.getFieldProps).toBe('function')
    })

    it('should create refs for all provided fields', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email', 'phone']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      fields.forEach(field => {
        const props = result.current.getFieldProps(field)
        expect(props).toHaveProperty('ref')
        expect(props).toHaveProperty('inputProps')
      })
    })
  })

  describe('getFieldProps', () => {
    it('should return ref and inputProps', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      const props = result.current.getFieldProps('firstName')

      expect(props).toHaveProperty('ref')
      expect(props).toHaveProperty('inputProps')
      expect(props.inputProps).toHaveProperty('onKeyDown')
      expect(typeof props.inputProps.onKeyDown).toBe('function')
    })

    it('should return different refs for different fields', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      const firstNameProps = result.current.getFieldProps('firstName')
      const lastNameProps = result.current.getFieldProps('lastName')

      expect(firstNameProps.ref).toBeDefined()
      expect(lastNameProps.ref).toBeDefined()
      expect(firstNameProps.ref).not.toBe(lastNameProps.ref)
    })

    it('should return stable references across rerenders', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result, rerender } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      const firstRender = result.current.getFieldProps('firstName')

      rerender()

      const secondRender = result.current.getFieldProps('firstName')

      expect(firstRender.ref).toBeDefined()
      expect(secondRender.ref).toBeDefined()
      expect(firstRender.ref).toBe(secondRender.ref)
    })
  })

  describe('Enter key navigation', () => {
    it('should focus next field on Enter key press when validation passes', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: {
            firstName: 'John',
            lastName: '',
            email: '',
            phone: ''
          }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input elements */
      const firstNameInput = document.createElement('input')
      const lastNameInput = document.createElement('input')

      document.body.appendChild(firstNameInput)
      document.body.appendChild(lastNameInput)

      /* Assign refs */
      const firstNameProps = result.current.getFieldProps('firstName')
      const lastNameProps = result.current.getFieldProps('lastName')

      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }
      if (lastNameProps.ref && 'current' in lastNameProps.ref) {
        lastNameProps.ref.current = lastNameInput
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Spy on focus */
      const focusSpy = vi.spyOn(lastNameInput, 'focus')

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await firstNameProps.inputProps.onKeyDown(event)
      })

      expect(focusSpy).toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(firstNameInput)
      document.body.removeChild(lastNameInput)
    })

    it('should call onSubmit on last field when Enter is pressed', async () => {
      const onSubmit = vi.fn()
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          onSubmit,
          fields
        })
      )

      /* Create mock input element */
      const emailInput = document.createElement('input')
      document.body.appendChild(emailInput)

      /* Assign ref */
      const emailProps = result.current.getFieldProps('email')
      if (emailProps.ref && 'current' in emailProps.ref) {
        emailProps.ref.current = emailInput
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: emailInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await emailProps.inputProps.onKeyDown(event)
      })

      expect(onSubmit).toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(emailInput)
    })

    it('should handle validation failure on Enter key', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: '', lastName: '', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input elements */
      const firstNameInput = document.createElement('input')
      const lastNameInput = document.createElement('input')

      document.body.appendChild(firstNameInput)
      document.body.appendChild(lastNameInput)

      /* Assign refs */
      const firstNameProps = result.current.getFieldProps('firstName')
      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }

      const lastNameProps = result.current.getFieldProps('lastName')
      if (lastNameProps.ref && 'current' in lastNameProps.ref) {
        lastNameProps.ref.current = lastNameInput
      }

      /* Mock validation to fail */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(false)

      /* Spy on focus */
      const lastNameFocusSpy = vi.spyOn(lastNameInput, 'focus')

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await firstNameProps.inputProps.onKeyDown(event)
      })

      /* Hook still moves to next field regardless of validation result */
      expect(lastNameFocusSpy).toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(firstNameInput)
      document.body.removeChild(lastNameInput)
    })

    it('should not trigger on non-Enter keys', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: '', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input element */
      const firstNameInput = document.createElement('input')
      document.body.appendChild(firstNameInput)

      /* Assign ref */
      const firstNameProps = result.current.getFieldProps('firstName')
      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }

      const triggerSpy = vi.spyOn(formResult.current, 'trigger')

      /* Create Tab key event */
      const event = new KeyboardEvent('keydown', { key: 'Tab' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await firstNameProps.inputProps.onKeyDown(event)
      })

      expect(triggerSpy).not.toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(firstNameInput)
    })
  })

  describe('Field blur handling', () => {
    it('should blur current field before validation', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: '', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input element */
      const firstNameInput = document.createElement('input')
      document.body.appendChild(firstNameInput)

      /* Assign ref */
      const firstNameProps = result.current.getFieldProps('firstName')
      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }

      /* Mock validation */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Spy on blur */
      const blurSpy = vi.spyOn(firstNameInput, 'blur')

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await firstNameProps.inputProps.onKeyDown(event)
      })

      expect(blurSpy).toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(firstNameInput)
    })
  })

  describe('Edge cases', () => {
    it('should handle single field form', async () => {
      const onSubmit = vi.fn()
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: '', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          onSubmit,
          fields
        })
      )

      /* Create mock input element */
      const firstNameInput = document.createElement('input')
      document.body.appendChild(firstNameInput)

      /* Assign ref */
      const firstNameProps = result.current.getFieldProps('firstName')
      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Trigger onKeyDown */
      await act(async () => {
        await firstNameProps.inputProps.onKeyDown(event)
      })

      expect(onSubmit).toHaveBeenCalled()

      /* Cleanup */
      document.body.removeChild(firstNameInput)
    })

    it('should handle missing next field ref', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: '', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input element */
      const firstNameInput = document.createElement('input')
      document.body.appendChild(firstNameInput)

      /* Assign only first field ref */
      const firstNameProps = result.current.getFieldProps('firstName')
      if (firstNameProps.ref && 'current' in firstNameProps.ref) {
        firstNameProps.ref.current = firstNameInput
      }

      /* Don't assign next field ref */
      const lastNameProps = result.current.getFieldProps('lastName')
      if (lastNameProps.ref && 'current' in lastNameProps.ref) {
        lastNameProps.ref.current = null
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: firstNameInput, writable: true })

      /* Should not throw error */
      await act(async () => {
        await expect(firstNameProps.inputProps.onKeyDown(event)).resolves.not.toThrow()
      })

      /* Cleanup */
      document.body.removeChild(firstNameInput)
    })

    it('should handle last field without onSubmit', async () => {
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: { firstName: 'John', lastName: 'Doe', email: '', phone: '' }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Create mock input element */
      const lastNameInput = document.createElement('input')
      document.body.appendChild(lastNameInput)

      /* Assign ref */
      const lastNameProps = result.current.getFieldProps('lastName')
      if (lastNameProps.ref && 'current' in lastNameProps.ref) {
        lastNameProps.ref.current = lastNameInput
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Create Enter key event */
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
      Object.defineProperty(event, 'currentTarget', { value: lastNameInput, writable: true })

      /* Should not throw error */
      await act(async () => {
        await expect(lastNameProps.inputProps.onKeyDown(event)).resolves.not.toThrow()
      })

      /* Cleanup */
      document.body.removeChild(lastNameInput)
    })

    it('should handle field not in fields array', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      /* Get props for field not in array */
      const props = result.current.getFieldProps('email')

      expect(props).toHaveProperty('ref')
      expect(props).toHaveProperty('inputProps')
    })
  })

  describe('Function stability', () => {
    it('should maintain stable getFieldProps function', () => {
      const { result: formResult } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result, rerender } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          fields
        })
      )

      const firstRender = result.current.getFieldProps

      rerender()

      expect(result.current.getFieldProps).toBe(firstRender)
    })

    it('should update when trigger changes', () => {
      const { result: formResult1 } = renderHook(() => useForm<TestFormData>())
      const { result: formResult2 } = renderHook(() => useForm<TestFormData>())
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName']

      const { result, rerender } = renderHook(
        ({ trigger }) => useFieldNavigation({ trigger, fields }),
        { initialProps: { trigger: formResult1.current.trigger } }
      )

      const firstRender = result.current.getFieldProps

      rerender({ trigger: formResult2.current.trigger })

      expect(result.current.getFieldProps).not.toBe(firstRender)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete form navigation flow', async () => {
      const onSubmit = vi.fn()
      const { result: formResult } = renderHook(() =>
        useForm<TestFormData>({
          defaultValues: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            phone: ''
          }
        })
      )
      const fields: (keyof TestFormData)[] = ['firstName', 'lastName', 'email']

      const { result } = renderHook(() =>
        useFieldNavigation({
          trigger: formResult.current.trigger,
          onSubmit,
          fields
        })
      )

      /* Create mock input elements */
      const inputs = {
        firstName: document.createElement('input'),
        lastName: document.createElement('input'),
        email: document.createElement('input')
      }

      Object.values(inputs).forEach(input => document.body.appendChild(input))

      /* Assign refs */
      const props = {
        firstName: result.current.getFieldProps('firstName'),
        lastName: result.current.getFieldProps('lastName'),
        email: result.current.getFieldProps('email')
      }

      if (props.firstName.ref && 'current' in props.firstName.ref) {
        props.firstName.ref.current = inputs.firstName
      }
      if (props.lastName.ref && 'current' in props.lastName.ref) {
        props.lastName.ref.current = inputs.lastName
      }
      if (props.email.ref && 'current' in props.email.ref) {
        props.email.ref.current = inputs.email
      }

      /* Mock validation to pass */
      vi.spyOn(formResult.current, 'trigger').mockResolvedValue(true)

      /* Navigate from first to last field */
      const createEnterEvent = (input: HTMLInputElement) => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent<HTMLInputElement>
        Object.defineProperty(event, 'currentTarget', { value: input, writable: true })
        return event
      }

      /* Press Enter on firstName */
      await act(async () => {
        await props.firstName.inputProps.onKeyDown(createEnterEvent(inputs.firstName))
      })

      /* Press Enter on lastName */
      await act(async () => {
        await props.lastName.inputProps.onKeyDown(createEnterEvent(inputs.lastName))
      })

      /* Press Enter on email (last field) */
      await act(async () => {
        await props.email.inputProps.onKeyDown(createEnterEvent(inputs.email))
      })

      expect(onSubmit).toHaveBeenCalled()

      /* Cleanup */
      Object.values(inputs).forEach(input => document.body.removeChild(input))
    })
  })
})
