/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Tenant module imports */
import { useBranchManagement } from '../use-branch-management'
import { SelectedAddon } from '@tenant-management/types'
import { MAX_BRANCH_COUNT, TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

describe('useBranchManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useBranchManagement())

      expect(result.current.branchCount).toBe(1)
      expect(result.current.branches).toEqual([
        { branchIndex: 0, branchName: 'Branch 1', isSelected: false }
      ])
    })

    it('loads branch data from localStorage', () => {
      const cachedData = {
        branchCount: 3,
        branches: [
          { branchIndex: 0, branchName: 'Store 1', isSelected: false },
          { branchIndex: 1, branchName: 'Store 2', isSelected: false },
          { branchIndex: 2, branchName: 'Store 3', isSelected: false }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(cachedData)
      )

      const { result } = renderHook(() => useBranchManagement())

      expect(result.current.branchCount).toBe(3)
      expect(result.current.branches).toEqual(cachedData.branches)
    })

    it('generates default branches when only branchCount exists', () => {
      const cachedData = { branchCount: 2 }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(cachedData)
      )

      const { result } = renderHook(() => useBranchManagement())

      expect(result.current.branchCount).toBe(2)
      expect(result.current.branches).toHaveLength(2)
      expect(result.current.branches[0].branchName).toBe('Branch 1')
      expect(result.current.branches[1].branchName).toBe('Branch 2')
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        'invalid json {'
      )

      const { result } = renderHook(() => useBranchManagement())

      expect(result.current.branchCount).toBe(1)
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('createBranchSelections', () => {
    it('creates branch selections with default names', () => {
      const { result } = renderHook(() => useBranchManagement())

      const branches = result.current.createBranchSelections(3)

      expect(branches).toHaveLength(3)
      expect(branches[0]).toEqual({ branchIndex: 0, branchName: 'Branch 1', isSelected: false })
      expect(branches[1]).toEqual({ branchIndex: 1, branchName: 'Branch 2', isSelected: false })
      expect(branches[2]).toEqual({ branchIndex: 2, branchName: 'Branch 3', isSelected: false })
    })

    it('enforces MAX_BRANCH_COUNT limit', () => {
      const { result } = renderHook(() => useBranchManagement())

      const branches = result.current.createBranchSelections(MAX_BRANCH_COUNT + 10)

      expect(branches).toHaveLength(MAX_BRANCH_COUNT)
    })

    it('handles zero count', () => {
      const { result } = renderHook(() => useBranchManagement())

      const branches = result.current.createBranchSelections(0)

      expect(branches).toEqual([])
    })
  })

  describe('handleBranchCountChange', () => {
    it('increases branch count and creates new branches', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(3)
      })

      expect(result.current.branchCount).toBe(3)
      expect(result.current.branches).toHaveLength(3)
    })

    it('decreases branch count and removes branches', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(5)
      })

      expect(result.current.branchCount).toBe(5)

      act(() => {
        result.current.handleBranchCountChange(2)
      })

      expect(result.current.branchCount).toBe(2)
      expect(result.current.branches).toHaveLength(2)
    })

    it('enforces minimum count of 1', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(0)
      })

      expect(result.current.branchCount).toBe(1)
    })

    it('enforces MAX_BRANCH_COUNT limit', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(MAX_BRANCH_COUNT + 50)
      })

      expect(result.current.branchCount).toBe(MAX_BRANCH_COUNT)
    })

    it('syncs addon branches when setSelectedAddons provided', () => {
      const { result } = renderHook(() => useBranchManagement())

      const mockSetSelectedAddons = vi.fn((updater) => {
        if (typeof updater === 'function') {
          const mockAddons: SelectedAddon[] = [
            {
              addon_id: 1,
              addon_name: 'Test',
              addon_price: 50,
              pricing_scope: 'branch',
              branches: [{ branchIndex: 0, branchName: 'B1', isSelected: false }],
              is_included: false
            }
          ]
          return updater(mockAddons)
        }
        return updater
      })

      act(() => {
        result.current.handleBranchCountChange(3, mockSetSelectedAddons)
      })

      expect(mockSetSelectedAddons).toHaveBeenCalled()
    })

    it('preserves existing branch names when increasing count', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.setBranches([
          { branchIndex: 0, branchName: 'Custom Branch 1', isSelected: false },
          { branchIndex: 1, branchName: 'Custom Branch 2', isSelected: false }
        ])
        result.current.setBranchCount(2)
      })

      act(() => {
        result.current.handleBranchCountChange(4)
      })

      expect(result.current.branches[0].branchName).toBe('Custom Branch 1')
      expect(result.current.branches[1].branchName).toBe('Custom Branch 2')
      expect(result.current.branches[2].branchName).toBe('Branch 3')
      expect(result.current.branches[3].branchName).toBe('Branch 4')
    })
  })

  describe('handleBranchNameChange', () => {
    it('updates branch name in branch list', () => {
      const { result } = renderHook(() => useBranchManagement())
      const mockSetSelectedAddons = vi.fn()

      act(() => {
        result.current.handleBranchCountChange(3)
      })

      act(() => {
        result.current.handleBranchNameChange(1, 'Main Office', mockSetSelectedAddons)
      })

      expect(result.current.branches[1].branchName).toBe('Main Office')
    })

    it('updates branch name in addon selections', () => {
      const { result } = renderHook(() => useBranchManagement())

      const mockAddons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Test',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [
            { branchIndex: 0, branchName: 'Branch 1', isSelected: true },
            { branchIndex: 1, branchName: 'Branch 2', isSelected: false }
          ],
          is_included: false
        }
      ]

      const mockSetSelectedAddons = vi.fn((updater) => {
        const result = updater(mockAddons)
        expect(result[0].branches[1].branchName).toBe('Updated Branch')
      })

      act(() => {
        result.current.handleBranchNameChange(1, 'Updated Branch', mockSetSelectedAddons)
      })

      expect(mockSetSelectedAddons).toHaveBeenCalled()
    })

    it('does not affect other branches', () => {
      const { result } = renderHook(() => useBranchManagement())
      const mockSetSelectedAddons = vi.fn()

      act(() => {
        result.current.handleBranchCountChange(3)
      })

      act(() => {
        result.current.handleBranchNameChange(1, 'Modified', mockSetSelectedAddons)
      })

      expect(result.current.branches[0].branchName).toBe('Branch 1')
      expect(result.current.branches[1].branchName).toBe('Modified')
      expect(result.current.branches[2].branchName).toBe('Branch 3')
    })
  })

  describe('updateAddonBranches', () => {
    it('adds branches when count increases', () => {
      const { result } = renderHook(() => useBranchManagement())

      const addons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Test',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [
            { branchIndex: 0, branchName: 'B1', isSelected: true }
          ],
          is_included: false
        }
      ]

      const branchList = [
        { branchIndex: 0, branchName: 'B1', isSelected: false },
        { branchIndex: 1, branchName: 'B2', isSelected: false },
        { branchIndex: 2, branchName: 'B3', isSelected: false }
      ]

      const updated = result.current.updateAddonBranches(addons, 3, branchList)

      expect(updated[0].branches).toHaveLength(3)
      expect(updated[0].branches[1].branchName).toBe('B2')
      expect(updated[0].branches[2].branchName).toBe('B3')
    })

    it('removes branches when count decreases', () => {
      const { result } = renderHook(() => useBranchManagement())

      const addons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Test',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [
            { branchIndex: 0, branchName: 'B1', isSelected: true },
            { branchIndex: 1, branchName: 'B2', isSelected: false },
            { branchIndex: 2, branchName: 'B3', isSelected: false }
          ],
          is_included: false
        }
      ]

      const branchList = [
        { branchIndex: 0, branchName: 'B1', isSelected: false }
      ]

      const updated = result.current.updateAddonBranches(addons, 1, branchList)

      expect(updated[0].branches).toHaveLength(1)
    })

    it('preserves branch selection state', () => {
      const { result } = renderHook(() => useBranchManagement())

      const addons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Test',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [
            { branchIndex: 0, branchName: 'B1', isSelected: true }
          ],
          is_included: false
        }
      ]

      const branchList = [
        { branchIndex: 0, branchName: 'B1', isSelected: false },
        { branchIndex: 1, branchName: 'B2', isSelected: false }
      ]

      const updated = result.current.updateAddonBranches(addons, 2, branchList)

      expect(updated[0].branches[0].isSelected).toBe(true)
      expect(updated[0].branches[1].isSelected).toBe(false)
    })

    it('respects MAX_BRANCH_COUNT limit', () => {
      const { result } = renderHook(() => useBranchManagement())

      const addons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Test',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [],
          is_included: false
        }
      ]

      const branchList = Array.from({ length: MAX_BRANCH_COUNT + 10 }, (_, i) => ({
        branchIndex: i,
        branchName: `B${i + 1}`,
        isSelected: false
      }))

      const updated = result.current.updateAddonBranches(addons, MAX_BRANCH_COUNT + 10, branchList)

      expect(updated[0].branches.length).toBeLessThanOrEqual(MAX_BRANCH_COUNT)
    })

    it('handles multiple addons', () => {
      const { result } = renderHook(() => useBranchManagement())

      const addons: SelectedAddon[] = [
        {
          addon_id: 1,
          addon_name: 'Addon 1',
          addon_price: 50,
          pricing_scope: 'branch',
          branches: [],
          is_included: false
        },
        {
          addon_id: 2,
          addon_name: 'Addon 2',
          addon_price: 75,
          pricing_scope: 'branch',
          branches: [],
          is_included: false
        }
      ]

      const branchList = [
        { branchIndex: 0, branchName: 'B1', isSelected: false },
        { branchIndex: 1, branchName: 'B2', isSelected: false }
      ]

      const updated = result.current.updateAddonBranches(addons, 2, branchList)

      expect(updated).toHaveLength(2)
      expect(updated[0].branches).toHaveLength(2)
      expect(updated[1].branches).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles negative branch count', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(-5)
      })

      expect(result.current.branchCount).toBe(1)
    })

    it('handles very large branch count', () => {
      const { result } = renderHook(() => useBranchManagement())

      act(() => {
        result.current.handleBranchCountChange(10000)
      })

      expect(result.current.branchCount).toBe(MAX_BRANCH_COUNT)
    })

    it('handles empty branch name', () => {
      const { result } = renderHook(() => useBranchManagement())
      const mockSetSelectedAddons = vi.fn()

      act(() => {
        result.current.handleBranchNameChange(0, '', mockSetSelectedAddons)
      })

      expect(result.current.branches[0].branchName).toBe('')
    })

    it('handles special characters in branch name', () => {
      const { result } = renderHook(() => useBranchManagement())
      const mockSetSelectedAddons = vi.fn()

      const specialName = 'Branch #1 & Store "Main"'

      act(() => {
        result.current.handleBranchNameChange(0, specialName, mockSetSelectedAddons)
      })

      expect(result.current.branches[0].branchName).toBe(specialName)
    })
  })
})
