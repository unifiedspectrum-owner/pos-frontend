import { describe, it, expect } from 'vitest';
import { formatApiDataToFormData, formatFormDataToApiData } from '../plans';
import { PlanDetails, CreateSubscriptionPlanAPIPayloadRequest } from '@plan-management/types/plans';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

describe('formatApiDataToFormData', () => {
  const mockApiPlanData: PlanDetails = {
    id: 1,
    name: 'Basic Plan',
    description: 'A basic subscription plan',
    display_order: 1,
    trial_period_days: 30,
    is_active: 1,
    is_custom: 0,
    monthly_price: 29.99,
    monthly_fee_our_gateway: 5.00,
    monthly_fee_byo_processor: 3.00,
    card_processing_fee_percentage: 2.9,
    card_processing_fee_fixed: 0.30,
    additional_device_cost: 10.00,
    annual_discount_percentage: 15.0,
    biennial_discount_percentage: 25.0,
    triennial_discount_percentage: 35.0,
    included_devices_count: 3,
    max_users_per_branch: 10,
    included_branches_count: 1,
    features: [
      { id: 1, name: 'Feature 1', description: 'First feature', display_order: 1 },
      { id: 2, name: 'Feature 2', description: 'Second feature', display_order: 2 }
    ],
    add_ons: [
      {
        id: 1,
        name: 'Premium Support',
        description: 'Premium support addon',
        pricing_scope: 'organization',
        base_price: 15.00,
        default_quantity: 1,
        is_included: true,
        min_quantity: 1,
        max_quantity: 5,
        display_order: 1
      }
    ],
    support_sla: [
      {
        id: 1,
        name: 'Standard SLA',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: 'Business Hours',
        notes: 'Standard support level',
        display_order: 1
      }
    ],
    volume_discounts: [
      {
        id: 1,
        name: '5+ Branches Discount',
        min_branches: 5,
        max_branches: 10,
        discount_percentage: 10.0
      }
    ]
  };

  it('should convert API data to form data format', () => {
    const result = formatApiDataToFormData(mockApiPlanData);

    expect(result.name).toBe('Basic Plan');
    expect(result.description).toBe('A basic subscription plan');
    expect(result.is_active).toBe(true);
    expect(result.is_custom).toBe(false);
  });

  it('should convert numeric values to strings', () => {
    const result = formatApiDataToFormData(mockApiPlanData);

    expect(result.monthly_fee_our_gateway).toBe('5');
    expect(result.monthly_fee_byo_processor).toBe('3');
    expect(result.card_processing_fee_percentage).toBe('2.9');
    expect(result.card_processing_fee_fixed).toBe('0.3');
    expect(result.monthly_price).toBe('29.99');
    expect(result.annual_discount_percentage).toBe('15');
    expect(result.biennial_discount_percentage).toBe('25');
    expect(result.triennial_discount_percentage).toBe('35');
  });

  it('should convert device and user constraints to strings', () => {
    const result = formatApiDataToFormData(mockApiPlanData);

    expect(result.included_devices_count).toBe('3');
    expect(result.max_users_per_branch).toBe('10');
    expect(result.additional_device_cost).toBe('10');
    expect(result.included_branches_count).toBe('1');
  });

  it('should handle null included_branches_count', () => {
    const apiDataWithNullBranches = {
      ...mockApiPlanData,
      included_branches_count: null
    };
    
    const result = formatApiDataToFormData(apiDataWithNullBranches);
    expect(result.included_branches_count).toBe('');
  });

  it('should extract feature IDs', () => {
    const result = formatApiDataToFormData(mockApiPlanData);
    expect(result.feature_ids).toEqual([1, 2]);
  });

  it('should transform add-on assignments', () => {
    const result = formatApiDataToFormData(mockApiPlanData);
    
    expect(result.addon_assignments).toHaveLength(1);
    expect(result.addon_assignments[0]).toEqual({
      addon_id: 1,
      default_quantity: 1,
      is_included: true,
      feature_level: 'basic',
      min_quantity: 1,
      max_quantity: 5
    });
  });

  it('should extract support SLA IDs', () => {
    const result = formatApiDataToFormData(mockApiPlanData);
    expect(result.support_sla_ids).toEqual([1]);
  });

  it('should transform volume discounts with string conversion', () => {
    const result = formatApiDataToFormData(mockApiPlanData);
    
    expect(result.volume_discounts).toHaveLength(1);
    expect(result.volume_discounts[0]).toEqual({
      id: 1,
      name: '5+ Branches Discount',
      min_branches: '5',
      max_branches: '10',
      discount_percentage: '10'
    });
  });

  it('should handle volume discounts with null max_branches', () => {
    const apiDataWithNullMaxBranches = {
      ...mockApiPlanData,
      volume_discounts: [{
        id: 1,
        name: 'Unlimited Discount',
        min_branches: 10,
        max_branches: null,
        discount_percentage: 15.0
      }]
    };
    
    const result = formatApiDataToFormData(apiDataWithNullMaxBranches);
    expect(result.volume_discounts[0].max_branches).toBe('');
  });
});

describe('formatFormDataToApiData', () => {
  const mockFormData: CreatePlanFormData = {
    name: 'Test Plan',
    description: 'Test description',
    is_active: true,
    is_custom: false,
    monthly_fee_our_gateway: '5.00',
    monthly_fee_byo_processor: '3.50',
    card_processing_fee_percentage: '2.9',
    card_processing_fee_fixed: '0.30',
    monthly_price: '49.99',
    annual_discount_percentage: '20',
    biennial_discount_percentage: '30',
    triennial_discount_percentage: '40',
    included_devices_count: '5',
    max_users_per_branch: '15',
    additional_device_cost: '12.00',
    included_branches_count: '2',
    feature_ids: [1, 3, 5],
    addon_assignments: [
      {
        addon_id: 2,
        default_quantity: 2,
        is_included: false,
        feature_level: 'custom',
        min_quantity: 1,
        max_quantity: 10
      }
    ],
    support_sla_ids: [1, 2],
    volume_discounts: [
      {
        id: null,
        name: 'New Discount',
        min_branches: '3',
        max_branches: '8',
        discount_percentage: '12.5'
      }
    ]
  };

  it('should convert form data to API format', () => {
    const result = formatFormDataToApiData(mockFormData);

    expect(result.name).toBe('Test Plan');
    expect(result.description).toBe('Test description');
    expect(result.is_active).toBe(true);
    expect(result.is_custom).toBe(false);
  });

  it('should convert string values to numbers', () => {
    const result = formatFormDataToApiData(mockFormData);

    expect(result.monthly_fee_our_gateway).toBe(5.00);
    expect(result.monthly_fee_byo_processor).toBe(3.50);
    expect(result.card_processing_fee_percentage).toBe(2.9);
    expect(result.card_processing_fee_fixed).toBe(0.30);
    expect(result.monthly_price).toBe(49.99);
    expect(result.annual_discount_percentage).toBe(20);
    expect(result.biennial_discount_percentage).toBe(30);
    expect(result.triennial_discount_percentage).toBe(40);
  });

  it('should convert device and user constraints to numbers', () => {
    const result = formatFormDataToApiData(mockFormData);

    expect(result.included_devices_count).toBe(5);
    expect(result.max_users_per_branch).toBe(15);
    expect(result.additional_device_cost).toBe(12.00);
    expect(result.included_branches_count).toBe(2);
  });

  it('should handle empty string included_branches_count as null', () => {
    const formDataWithEmptyBranches = {
      ...mockFormData,
      included_branches_count: ''
    };
    
    const result = formatFormDataToApiData(formDataWithEmptyBranches);
    expect(result.included_branches_count).toBe(null);
  });

  it('should handle invalid numeric strings with fallback to 0', () => {
    const formDataWithInvalidNumbers = {
      ...mockFormData,
      monthly_price: 'invalid',
      included_devices_count: 'not-a-number'
    };
    
    const result = formatFormDataToApiData(formDataWithInvalidNumbers);
    expect(result.monthly_price).toBe(0);
    expect(result.included_devices_count).toBe(0);
  });

  it('should preserve feature IDs and addon assignments', () => {
    const result = formatFormDataToApiData(mockFormData);

    expect(result.feature_ids).toEqual([1, 3, 5]);
    expect(result.addon_assignments).toEqual(mockFormData.addon_assignments);
    expect(result.support_sla_ids).toEqual([1, 2]);
  });

  it('should handle undefined arrays with empty defaults', () => {
    const formDataWithUndefinedArrays = {
      ...mockFormData,
      feature_ids: undefined,
      addon_assignments: undefined,
      support_sla_ids: undefined
    };
    
    const result = formatFormDataToApiData(formDataWithUndefinedArrays);
    expect(result.feature_ids).toEqual([]);
    expect(result.addon_assignments).toEqual([]);
    expect(result.support_sla_ids).toEqual([]);
  });

  it('should transform volume discounts with numeric conversion', () => {
    const result = formatFormDataToApiData(mockFormData);
    
    expect(result.volume_discounts).toHaveLength(1);
    expect(result.volume_discounts[0]).toEqual({
      id: undefined,
      name: 'New Discount',
      min_branches: 3,
      max_branches: 8,
      discount_percentage: 12.5
    });
  });

  it('should handle volume discounts with existing ID', () => {
    const formDataWithExistingId = {
      ...mockFormData,
      volume_discounts: [{
        id: 5,
        name: 'Existing Discount',
        min_branches: '4',
        max_branches: '',
        discount_percentage: '8.0'
      }]
    };
    
    const result = formatFormDataToApiData(formDataWithExistingId);
    expect(result.volume_discounts[0]).toEqual({
      id: 5,
      name: 'Existing Discount',
      min_branches: 4,
      max_branches: null,
      discount_percentage: 8.0
    });
  });

  it('should handle empty max_branches as null', () => {
    const formDataWithEmptyMaxBranches = {
      ...mockFormData,
      volume_discounts: [{
        id: null,
        name: 'Unlimited Discount',
        min_branches: '5',
        max_branches: '',
        discount_percentage: '15.0'
      }]
    };
    
    const result = formatFormDataToApiData(formDataWithEmptyMaxBranches);
    expect(result.volume_discounts[0].max_branches).toBe(null);
  });

  it('should handle invalid volume discount numbers with fallback to 0', () => {
    const formDataWithInvalidVolumeNumbers = {
      ...mockFormData,
      volume_discounts: [{
        id: null,
        name: 'Test Discount',
        min_branches: 'invalid',
        max_branches: 'also-invalid',
        discount_percentage: 'not-a-number'
      }]
    };
    
    const result = formatFormDataToApiData(formDataWithInvalidVolumeNumbers);
    expect(result.volume_discounts[0].min_branches).toBe(0);
    expect(result.volume_discounts[0].max_branches).toBe(null);
    expect(result.volume_discounts[0].discount_percentage).toBe(0);
  });

  it('should work for update operations', () => {
    const result = formatFormDataToApiData(mockFormData, true);
    
    expect(result.name).toBe('Test Plan');
    expect(result.monthly_price).toBe(49.99);
  });
});