/* Comprehensive test suite for useTabNavigation hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Plan module imports */
import { useTabNavigation } from '@plan-management/hooks/use-tab-navigation'
import { PlanFormTab, PlanFormMode } from '@plan-management/types'
import { PLAN_FORM_MODES, PLAN_FORM_TAB } from '@plan-management/constants'

describe('useTabNavigation Hook', () => {
  /* Mock data */
  const mockSetActiveTab = vi.fn()

  const defaultValidationState = {
    isBasicInfoValid: false,
    isPricingInfoValid: false,
    isFeaturesValid: false,
    isAddonsValid: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should return tab unlock state', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      expect(result.current.tabUnlockState).toBeDefined()
      expect(typeof result.current.isTabUnlocked).toBe('function')
      expect(typeof result.current.handleTabChange).toBe('function')
      expect(typeof result.current.handleNextTab).toBe('function')
      expect(typeof result.current.handlePreviousTab).toBe('function')
    })

    it('should have Basic tab always unlocked', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.BASIC]).toBe(true)
    })
  })

  describe('Tab Unlock Logic - Create Mode', () => {
    it('should lock all tabs except Basic when validation states are false', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.BASIC]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(false)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(false)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.ADDONS]).toBe(false)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(false)
    })

    it('should unlock Pricing tab when Basic info is valid', () => {
      const validationState = {
        ...defaultValidationState,
        isBasicInfoValid: true
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(false)
    })

    it('should unlock Features tab when Basic and Pricing are valid', () => {
      const validationState = {
        ...defaultValidationState,
        isBasicInfoValid: true,
        isPricingInfoValid: true
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.ADDONS]).toBe(false)
    })

    it('should unlock Addons tab when Basic, Pricing, and Features are valid', () => {
      const validationState = {
        ...defaultValidationState,
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.ADDONS]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(false)
    })

    it('should unlock SLA tab when all previous tabs are valid', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(true)
    })
  })

  describe('Tab Unlock Logic - View Mode', () => {
    it('should unlock all tabs in view mode', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.VIEW,
          defaultValidationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.BASIC]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.ADDONS]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(true)
    })

    it('should unlock all tabs in view mode regardless of validation state', () => {
      const invalidState = {
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.VIEW,
          invalidState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.ADDONS]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(true)
    })
  })

  describe('Tab Unlock Logic - Edit Mode', () => {
    it('should behave like create mode in edit mode', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.EDIT,
          validationState
        )
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.BASIC]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(true)
      expect(result.current.tabUnlockState[PLAN_FORM_TAB.FEATURES]).toBe(false)
    })
  })

  describe('isTabUnlocked Function', () => {
    it('should return true for unlocked tabs', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: false,
        isAddonsValid: false
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.BASIC)).toBe(true)
      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.PRICING)).toBe(true)
      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.FEATURES)).toBe(true)
    })

    it('should return false for locked tabs', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.PRICING)).toBe(false)
      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.FEATURES)).toBe(false)
      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.ADDONS)).toBe(false)
      expect(result.current.isTabUnlocked(PLAN_FORM_TAB.SLA)).toBe(false)
    })
  })

  describe('handleTabChange Function', () => {
    it('should change tab when tab is unlocked', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      act(() => {
        result.current.handleTabChange(PLAN_FORM_TAB.PRICING)
      })

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.PRICING)
    })

    it('should not change tab when tab is locked', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handleTabChange(PLAN_FORM_TAB.FEATURES)
      })

      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should always allow tab change in view mode', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.VIEW,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handleTabChange(PLAN_FORM_TAB.SLA)
      })

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.SLA)
    })
  })

  describe('handleNextTab Function', () => {
    it('should navigate to next tab when unlocked', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false
      }

      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          validationState
        )
      )

      act(() => {
        result.current.handleNextTab()
      })

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.PRICING)
    })

    it('should not navigate to next tab when locked', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handleNextTab()
      })

      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should not navigate beyond last tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.SLA,
          mockSetActiveTab,
          PLAN_FORM_MODES.VIEW,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handleNextTab()
      })

      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should navigate through multiple tabs in sequence', () => {
      const validationState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true
      }

      const { result, rerender } = renderHook(
        ({ activeTab, mode, validation }) =>
          useTabNavigation(activeTab, mockSetActiveTab, mode, validation),
        {
          initialProps: {
            activeTab: PLAN_FORM_TAB.BASIC as PlanFormTab,
            mode: PLAN_FORM_MODES.CREATE as PlanFormMode,
            validation: validationState
          }
        }
      )

      act(() => {
        result.current.handleNextTab()
      })
      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.PRICING)

      rerender({
        activeTab: PLAN_FORM_TAB.PRICING,
        mode: PLAN_FORM_MODES.CREATE,
        validation: validationState
      })

      act(() => {
        result.current.handleNextTab()
      })
      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.FEATURES)
    })
  })

  describe('handlePreviousTab Function', () => {
    it('should navigate to previous tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.PRICING,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handlePreviousTab()
      })

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.BASIC)
    })

    it('should not navigate before first tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.BASIC,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handlePreviousTab()
      })

      expect(mockSetActiveTab).not.toHaveBeenCalled()
    })

    it('should always allow navigation to previous tab', () => {
      const { result } = renderHook(() =>
        useTabNavigation(
          PLAN_FORM_TAB.FEATURES,
          mockSetActiveTab,
          PLAN_FORM_MODES.CREATE,
          defaultValidationState
        )
      )

      act(() => {
        result.current.handlePreviousTab()
      })

      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.PRICING)
    })

    it('should navigate backward through multiple tabs', () => {
      const { result, rerender } = renderHook(
        ({ activeTab, mode, validation }) =>
          useTabNavigation(activeTab, mockSetActiveTab, mode, validation),
        {
          initialProps: {
            activeTab: PLAN_FORM_TAB.SLA as PlanFormTab,
            mode: PLAN_FORM_MODES.VIEW as PlanFormMode,
            validation: defaultValidationState
          }
        }
      )

      act(() => {
        result.current.handlePreviousTab()
      })
      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.ADDONS)

      rerender({
        activeTab: PLAN_FORM_TAB.ADDONS,
        mode: PLAN_FORM_MODES.VIEW,
        validation: defaultValidationState
      })

      act(() => {
        result.current.handlePreviousTab()
      })
      expect(mockSetActiveTab).toHaveBeenCalledWith(PLAN_FORM_TAB.FEATURES)
    })
  })

  describe('Validation State Changes', () => {
    it('should update tab unlock state when validation changes', () => {
      const { result, rerender } = renderHook(
        ({ validation }) =>
          useTabNavigation(
            PLAN_FORM_TAB.BASIC,
            mockSetActiveTab,
            PLAN_FORM_MODES.CREATE,
            validation
          ),
        { initialProps: { validation: defaultValidationState } }
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(false)

      const updatedValidation = {
        ...defaultValidationState,
        isBasicInfoValid: true
      }

      rerender({ validation: updatedValidation })

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.PRICING]).toBe(true)
    })

    it('should lock tabs when validation becomes invalid', () => {
      const validState = {
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true
      }

      const { result, rerender } = renderHook(
        ({ validation }) =>
          useTabNavigation(
            PLAN_FORM_TAB.FEATURES,
            mockSetActiveTab,
            PLAN_FORM_MODES.CREATE,
            validation
          ),
        { initialProps: { validation: validState } }
      )

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(true)

      const invalidatedState = {
        ...validState,
        isAddonsValid: false
      }

      rerender({ validation: invalidatedState })

      expect(result.current.tabUnlockState[PLAN_FORM_TAB.SLA]).toBe(false)
    })
  })
})
