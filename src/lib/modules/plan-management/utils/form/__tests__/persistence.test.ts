import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  hasStorageData, 
  loadDataFromStorage, 
  saveFormDataToStorage, 
  clearStorageData 
} from '../persistence';
import { PLAN_FORM_MODES, STORAGE_KEYS } from '@plan-management/config';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanManagementTabs } from '@plan-management/types/plans';
import { Dispatch, SetStateAction } from 'react';
import { UseFormSetValue } from 'react-hook-form';

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

describe('hasStorageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock to return undefined for non-existent keys
    localStorage.getItem = vi.fn().mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for non-create mode', () => {
    localStorage.setItem(STORAGE_KEYS.DRAFT_PLAN_DATA, JSON.stringify({ name: 'Test' }));
    
    const result = hasStorageData(PLAN_FORM_MODES.EDIT);
    expect(result).toBe(false);
  });

  it('should return true when form data exists in create mode', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.DRAFT_PLAN_DATA) return JSON.stringify({ name: 'Test' });
      return null;
    });
    
    const result = hasStorageData(PLAN_FORM_MODES.CREATE);
    expect(result).toBe(true);
  });

  it('should return true when tab state exists in create mode', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.ACTIVE_TAB) return 'pricing';
      return null;
    });
    
    const result = hasStorageData(PLAN_FORM_MODES.CREATE);
    expect(result).toBe(true);
  });

  it('should return false when no data exists', () => {
    const result = hasStorageData(PLAN_FORM_MODES.CREATE);
    expect(result).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = hasStorageData(PLAN_FORM_MODES.CREATE);
    expect(result).toBe(false);
    expect(consoleSpy.warn).toHaveBeenCalledWith('Storage check failed:', expect.any(Error));

    // Restore original implementation
    localStorage.getItem = originalGetItem;
  });
});

describe('loadDataFromStorage', () => {
  const mockSetValue = vi.fn();
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem = vi.fn().mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing for non-create mode', () => {
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify({ name: 'Test' }));
    
    loadDataFromStorage(PLAN_FORM_MODES.EDIT, mockSetValue, mockSetActiveTab);
    
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });

  it('should restore form data when available', () => {
    const formData = {
      name: 'Test Plan',
      description: 'Test description',
      monthly_price: '29.99'
    };
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.DRAFT_PLAN_DATA) return JSON.stringify(formData);
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(mockSetValue).toHaveBeenCalledTimes(3);
    expect(mockSetValue).toHaveBeenCalledWith('name', 'Test Plan');
    expect(mockSetValue).toHaveBeenCalledWith('description', 'Test description');
    expect(mockSetValue).toHaveBeenCalledWith('monthly_price', '29.99');
  });

  it('should restore active tab when valid', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.ACTIVE_TAB) return 'pricing';
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('pricing');
  });

  it('should ignore invalid tab names', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.ACTIVE_TAB) return 'invalid-tab';
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });

  it('should handle missing form data gracefully', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.ACTIVE_TAB) return 'features';
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockSetActiveTab).toHaveBeenCalledWith('features');
  });

  it('should handle JSON parsing errors', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.DRAFT_PLAN_DATA) return 'invalid-json';
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(consoleSpy.error).toHaveBeenCalledWith('Data restoration failed:', expect.any(Error));
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('should handle localStorage access errors', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage access error');
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(consoleSpy.error).toHaveBeenCalledWith('Data restoration failed:', expect.any(Error));
    
    // Restore original implementation
    localStorage.getItem = originalGetItem;
  });
});

describe('saveFormDataToStorage', () => {
  const mockSetShowSavedIndicator = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.setItem = vi.fn();
    localStorage.getItem = vi.fn().mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should return false for non-create mode', () => {
    const formData = { name: 'Test' } as CreatePlanFormData;
    
    const result = saveFormDataToStorage(
      PLAN_FORM_MODES.EDIT, 
      formData, 
      mockSetShowSavedIndicator
    );
    
    expect(result).toBe(false);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should save form data to localStorage in create mode', () => {
    const formData = { 
      name: 'Test Plan',
      description: 'Test description' 
    } as CreatePlanFormData;

    const result = saveFormDataToStorage(
      PLAN_FORM_MODES.CREATE, 
      formData, 
      mockSetShowSavedIndicator
    );

    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.DRAFT_PLAN_DATA, 
      JSON.stringify(formData)
    );
  });

  it('should trigger save indicator', () => {
    const formData = { name: 'Test' } as CreatePlanFormData;
    
    // Mock the setter function to capture and execute the callback
    let capturedCallback: any = null;
    mockSetShowSavedIndicator.mockImplementation((callback) => {
      if (typeof callback === 'function') {
        capturedCallback = callback;
        const result = callback(false);
        return result;
      }
    });

    saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator);

    expect(mockSetShowSavedIndicator).toHaveBeenCalledWith(expect.any(Function));

    // Fast-forward time to test setTimeout
    vi.advanceTimersByTime(2000);
    expect(mockSetShowSavedIndicator).toHaveBeenCalledTimes(2);
  });

  it('should not reset timer if indicator is already showing', () => {
    const formData = { name: 'Test' } as CreatePlanFormData;
    mockSetShowSavedIndicator.mockImplementation((callback) => {
      const result = callback(true); // Already showing
      return result;
    });

    saveFormDataToStorage(PLAN_FORM_MODES.CREATE, formData, mockSetShowSavedIndicator);

    expect(mockSetShowSavedIndicator).toHaveBeenCalledWith(expect.any(Function));
    
    // Fast-forward time
    vi.advanceTimersByTime(2000);
    // Should only be called once since indicator was already showing
    expect(mockSetShowSavedIndicator).toHaveBeenCalledTimes(1);
  });

  it('should handle localStorage save errors', () => {
    // Mock localStorage.setItem to throw an error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const formData = { name: 'Test' } as CreatePlanFormData;
    
    const result = saveFormDataToStorage(
      PLAN_FORM_MODES.CREATE, 
      formData, 
      mockSetShowSavedIndicator
    );

    expect(result).toBe(false);
    expect(consoleSpy.error).toHaveBeenCalledWith('Form data save failed:', expect.any(Error));

    // Restore original implementation
    localStorage.setItem = originalSetItem;
  });
});

describe('clearStorageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clear all storage keys', () => {
    clearStorageData();

    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.DRAFT_PLAN_DATA);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.ACTIVE_TAB);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.removeItem to throw an error
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage access error');
    });

    clearStorageData();

    expect(consoleSpy.warn).toHaveBeenCalledWith('Storage cleanup failed:', expect.any(Error));

    // Restore original implementation
    localStorage.removeItem = originalRemoveItem;
  });

  it('should log successful cleanup', () => {
    clearStorageData();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('All form storage data cleared');
  });
});

// Test tab validation logic through loadDataFromStorage
describe('Tab validation in loadDataFromStorage', () => {
  const mockSetValue = vi.fn() as unknown as UseFormSetValue<CreatePlanFormData>;
  const mockSetActiveTab = vi.fn() as unknown as Dispatch<SetStateAction<PlanManagementTabs | null>>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem = vi.fn().mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const validTabs: PlanManagementTabs[] = ['basic', 'pricing', 'features', 'addons', 'sla'];
  
  validTabs.forEach(tab => {
    it(`should accept valid tab: ${tab}`, () => {
      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === STORAGE_KEYS.ACTIVE_TAB) return tab;
        return null;
      });

      loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith(tab);
    });
  });

  it('should reject invalid tab names', () => {
    localStorage.getItem = vi.fn().mockImplementation((key) => {
      if (key === STORAGE_KEYS.ACTIVE_TAB) return 'invalid-tab-name';
      return null;
    });

    loadDataFromStorage(PLAN_FORM_MODES.CREATE, mockSetValue, mockSetActiveTab);

    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
});