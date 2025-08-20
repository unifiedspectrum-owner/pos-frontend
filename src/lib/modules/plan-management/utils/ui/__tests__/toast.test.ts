import { describe, it, expect } from 'vitest';
import { createToastNotification, TOAST_PRESETS, ToastConfig } from '../toast';

describe('createToastNotification', () => {
  it('should create success toast with default duration', () => {
    const result = createToastNotification('success', 'Success Title', 'Success message');
    
    expect(result).toEqual({
      type: 'success',
      title: 'Success Title',
      description: 'Success message',
      duration: 5000,
      closable: true
    });
  });

  it('should create error toast with extended duration', () => {
    const result = createToastNotification('error', 'Error Title', 'Error message');
    
    expect(result).toEqual({
      type: 'error',
      title: 'Error Title',
      description: 'Error message',
      duration: 7000,
      closable: true
    });
  });

  it('should create warning toast with default duration', () => {
    const result = createToastNotification('warning', 'Warning Title', 'Warning message');
    
    expect(result).toEqual({
      type: 'warning',
      title: 'Warning Title',
      description: 'Warning message',
      duration: 5000,
      closable: true
    });
  });

  it('should create info toast with default duration', () => {
    const result = createToastNotification('info', 'Info Title', 'Info message');
    
    expect(result).toEqual({
      type: 'info',
      title: 'Info Title',
      description: 'Info message',
      duration: 5000,
      closable: true
    });
  });

  it('should always set closable to true', () => {
    const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];
    
    types.forEach(type => {
      const result = createToastNotification(type, 'Title', 'Description');
      expect(result.closable).toBe(true);
    });
  });
});

describe('TOAST_PRESETS', () => {
  describe('Success toasts', () => {
    it('should create PLAN_CREATED toast', () => {
      const planName = 'Premium Plan';
      const result = TOAST_PRESETS.PLAN_CREATED(planName);
      
      expect(result.type).toBe('success');
      expect(result.title).toBe('Plan Created Successfully');
      expect(result.description).toBe('"Premium Plan" has been created and is ready to use.');
      expect(result.duration).toBe(5000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_UPDATED toast', () => {
      const planName = 'Basic Plan';
      const result = TOAST_PRESETS.PLAN_UPDATED(planName);
      
      expect(result.type).toBe('success');
      expect(result.title).toBe('Plan Updated Successfully');
      expect(result.description).toBe('"Basic Plan" has been updated with the latest changes.');
      expect(result.duration).toBe(5000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_DELETED toast', () => {
      const planName = 'Old Plan';
      const result = TOAST_PRESETS.PLAN_DELETED(planName);
      
      expect(result.type).toBe('success');
      expect(result.title).toBe('Plan Deleted Successfully');
      expect(result.description).toBe('"Old Plan" has been deleted successfully.');
      expect(result.duration).toBe(5000);
      expect(result.closable).toBe(true);
    });
  });

  describe('Error toasts', () => {
    it('should create PLAN_CREATE_ERROR toast with default message', () => {
      const result = TOAST_PRESETS.PLAN_CREATE_ERROR();
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Create Plan');
      expect(result.description).toBe('An error occurred while creating the plan.');
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_CREATE_ERROR toast with custom message', () => {
      const customMessage = 'Validation failed for plan name';
      const result = TOAST_PRESETS.PLAN_CREATE_ERROR(customMessage);
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Create Plan');
      expect(result.description).toBe(customMessage);
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_UPDATE_ERROR toast with default message', () => {
      const result = TOAST_PRESETS.PLAN_UPDATE_ERROR();
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Update Plan');
      expect(result.description).toBe('An error occurred while updating the plan.');
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_UPDATE_ERROR toast with custom message', () => {
      const customMessage = 'Server connection timeout';
      const result = TOAST_PRESETS.PLAN_UPDATE_ERROR(customMessage);
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Update Plan');
      expect(result.description).toBe(customMessage);
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_DELETE_ERROR toast with default message', () => {
      const result = TOAST_PRESETS.PLAN_DELETE_ERROR();
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Delete Plan');
      expect(result.description).toBe('An error occurred while deleting the plan.');
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create PLAN_DELETE_ERROR toast with custom message', () => {
      const customMessage = 'Plan is currently in use by active subscriptions';
      const result = TOAST_PRESETS.PLAN_DELETE_ERROR(customMessage);
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Failed to Delete Plan');
      expect(result.description).toBe(customMessage);
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });

    it('should create UNEXPECTED_ERROR toast', () => {
      const result = TOAST_PRESETS.UNEXPECTED_ERROR;
      
      expect(result.type).toBe('error');
      expect(result.title).toBe('Unexpected Error');
      expect(result.description).toBe('An unexpected error occurred. Please try again.');
      expect(result.duration).toBe(7000);
      expect(result.closable).toBe(true);
    });
  });

  describe('Auto-save toasts', () => {
    it('should create DATA_SAVED toast', () => {
      const result = TOAST_PRESETS.DATA_SAVED;
      
      expect(result.type).toBe('success');
      expect(result.title).toBe('Data Saved');
      expect(result.description).toBe('Your changes have been saved automatically.');
      expect(result.duration).toBe(5000);
      expect(result.closable).toBe(true);
    });

    it('should create DATA_RESTORED toast', () => {
      const result = TOAST_PRESETS.DATA_RESTORED;
      
      expect(result.type).toBe('success');
      expect(result.title).toBe('Data Restored');
      expect(result.description).toBe('Your draft data has been restored successfully.');
      expect(result.duration).toBe(5000);
      expect(result.closable).toBe(true);
    });
  });

  describe('Toast preset consistency', () => {
    it('should have all success presets use success type', () => {
      const successPresets = [
        TOAST_PRESETS.PLAN_CREATED('Test'),
        TOAST_PRESETS.PLAN_UPDATED('Test'),
        TOAST_PRESETS.PLAN_DELETED('Test'),
        TOAST_PRESETS.DATA_SAVED,
        TOAST_PRESETS.DATA_RESTORED
      ];

      successPresets.forEach(preset => {
        expect(preset.type).toBe('success');
        expect(preset.duration).toBe(5000);
        expect(preset.closable).toBe(true);
      });
    });

    it('should have all error presets use error type with extended duration', () => {
      const errorPresets = [
        TOAST_PRESETS.PLAN_CREATE_ERROR(),
        TOAST_PRESETS.PLAN_UPDATE_ERROR(),
        TOAST_PRESETS.PLAN_DELETE_ERROR(),
        TOAST_PRESETS.UNEXPECTED_ERROR
      ];

      errorPresets.forEach(preset => {
        expect(preset.type).toBe('error');
        expect(preset.duration).toBe(7000);
        expect(preset.closable).toBe(true);
      });
    });

    it('should have all presets with non-empty titles and descriptions', () => {
      const allPresets = [
        TOAST_PRESETS.PLAN_CREATED('Test Plan'),
        TOAST_PRESETS.PLAN_UPDATED('Test Plan'),
        TOAST_PRESETS.PLAN_DELETED('Test Plan'),
        TOAST_PRESETS.PLAN_CREATE_ERROR(),
        TOAST_PRESETS.PLAN_UPDATE_ERROR(),
        TOAST_PRESETS.PLAN_DELETE_ERROR(),
        TOAST_PRESETS.UNEXPECTED_ERROR,
        TOAST_PRESETS.DATA_SAVED,
        TOAST_PRESETS.DATA_RESTORED
      ];

      allPresets.forEach(preset => {
        expect(preset.title).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.title.length).toBeGreaterThan(0);
        expect(preset.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Type safety and structure', () => {
    it('should maintain ToastConfig interface compliance', () => {
      const testToast: ToastConfig = TOAST_PRESETS.PLAN_CREATED('Test');
      
      expect(testToast).toHaveProperty('type');
      expect(testToast).toHaveProperty('title');
      expect(testToast).toHaveProperty('description');
      expect(testToast).toHaveProperty('duration');
      expect(testToast).toHaveProperty('closable');
      
      expect(['success', 'error', 'warning', 'info']).toContain(testToast.type);
      expect(typeof testToast.title).toBe('string');
      expect(typeof testToast.description).toBe('string');
      expect(typeof testToast.duration).toBe('number');
      expect(typeof testToast.closable).toBe('boolean');
    });

    it('should handle empty strings in dynamic messages', () => {
      const emptyNameToasts = [
        TOAST_PRESETS.PLAN_CREATED(''),
        TOAST_PRESETS.PLAN_UPDATED(''),
        TOAST_PRESETS.PLAN_DELETED('')
      ];

      emptyNameToasts.forEach(toast => {
        expect(toast.description).toContain('""');
        expect(toast.description.length).toBeGreaterThan(10); // Should still have meaningful content
      });
    });

    it('should handle special characters in plan names', () => {
      const specialPlanName = 'Plan "Special" & <Complex>';
      const toast = TOAST_PRESETS.PLAN_CREATED(specialPlanName);
      
      expect(toast.description).toContain(specialPlanName);
      expect(toast.description).toBe(`"${specialPlanName}" has been created and is ready to use.`);
    });
  });
});