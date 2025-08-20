import { describe, it, expect } from 'vitest';
import { 
  createPlanSchema, 
  basicInfoSchema,
  pricingInfoSchema,
  featuresInfoSchema,
  addonsInfoSchema,
  slaInfoSchema,
  createFeatureSchema,
  createAddonSchema,
  createSlaSchema,
  type CreatePlanFormData 
} from '../plans';

describe('createPlanSchema', () => {
  const validPlanData: CreatePlanFormData = {
    name: 'Test Plan',
    description: 'A comprehensive test plan',
    is_active: true,
    is_custom: false,
    included_devices_count: '3',
    max_users_per_branch: '10',
    included_branches_count: '1',
    additional_device_cost: '15.00',
    monthly_price: '49.99',
    annual_discount_percentage: '10',
    biennial_discount_percentage: '20',
    triennial_discount_percentage: '30',
    monthly_fee_our_gateway: '5.00',
    monthly_fee_byo_processor: '3.00',
    card_processing_fee_percentage: '2.9',
    card_processing_fee_fixed: '0.30',
    feature_ids: [1, 2, 3],
    addon_assignments: [
      {
        addon_id: 1,
        is_included: false,
        feature_level: 'basic',
        default_quantity: 2,
        min_quantity: 1,
        max_quantity: 5
      }
    ],
    support_sla_ids: [1, 2],
    volume_discounts: [
      {
        id: null,
        name: '5+ Branches Discount',
        min_branches: '5',
        max_branches: '10',
        discount_percentage: '15.5'
      }
    ]
  };

  describe('Valid data validation', () => {
    it('should accept valid complete plan data', () => {
      const result = createPlanSchema.safeParse(validPlanData);
      expect(result.success).toBe(true);
    });

    it('should apply default values for optional fields', () => {
      const minimalData = {
        name: 'Basic Plan',
        description: 'Basic description'
      };
      
      const result = createPlanSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.is_active).toBe(true);
        expect(result.data.is_custom).toBe(false);
        expect(result.data.feature_ids).toEqual([]);
        expect(result.data.addon_assignments).toEqual([]);
        expect(result.data.support_sla_ids).toEqual([]);
        expect(result.data.volume_discounts).toEqual([]);
      }
    });
  });

  describe('Name validation', () => {
    it('should reject empty names', () => {
      const data = { ...validPlanData, name: '' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should reject names with numbers', () => {
      const data = { ...validPlanData, name: 'Plan 123' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Only letters and spaces are allowed');
      }
    });

    it('should reject names with special characters', () => {
      const data = { ...validPlanData, name: 'Plan@Special!' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Only letters and spaces are allowed');
      }
    });

    it('should accept names with spaces', () => {
      const data = { ...validPlanData, name: 'Premium Business Plan' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from names', () => {
      const data = { ...validPlanData, name: '  Test Plan  ' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Plan');
      }
    });
  });

  describe('Description validation', () => {
    it('should reject descriptions shorter than 3 characters', () => {
      const data = { ...validPlanData, description: 'Ab' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be at least 3 characters');
      }
    });

    it('should accept valid descriptions', () => {
      const data = { ...validPlanData, description: 'This is a comprehensive plan for businesses.' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Device and user limits validation', () => {
    it('should reject non-numeric device counts', () => {
      const data = { ...validPlanData, included_devices_count: 'abc' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Included devices count must be a non-negative integer');
      }
    });

    it('should reject negative device counts', () => {
      const data = { ...validPlanData, included_devices_count: '-5' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Included devices count must be a non-negative integer');
      }
    });

    it('should reject decimal device counts', () => {
      const data = { ...validPlanData, included_devices_count: '3.5' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Included devices count must be a non-negative integer');
      }
    });

    it('should accept zero device counts', () => {
      const data = { ...validPlanData, included_devices_count: '0' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should reject zero max users per branch', () => {
      const data = { ...validPlanData, max_users_per_branch: '0' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Max users per branch must be at least 1');
      }
    });

    it('should accept valid user limits', () => {
      const data = { ...validPlanData, max_users_per_branch: '25' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Pricing validation', () => {
    describe('Discount percentage validation', () => {
      const discountFields = [
        'annual_discount_percentage',
        'biennial_discount_percentage', 
        'triennial_discount_percentage'
      ] as const;

      discountFields.forEach(field => {
        it(`should reject ${field} over 100%`, () => {
          const data = { ...validPlanData, [field]: '150' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(false);
          if (!result.success) {
            const error = result.error.issues.find(e => e.path.includes(field));
            expect(error?.message).toMatch(/must be between 0 and 100/);
          }
        });

        it(`should reject negative ${field}`, () => {
          const data = { ...validPlanData, [field]: '-10' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(false);
          if (!result.success) {
            const error = result.error.issues.find(e => e.path.includes(field));
            expect(error?.message).toMatch(/must be between 0 and 100/);
          }
        });

        it(`should accept valid ${field}`, () => {
          const data = { ...validPlanData, [field]: '25.5' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Fee validation', () => {
      const feeFields = [
        'monthly_fee_our_gateway',
        'monthly_fee_byo_processor',
        'additional_device_cost',
        'card_processing_fee_fixed'
      ] as const;

      feeFields.forEach(field => {
        it(`should reject negative ${field}`, () => {
          const data = { ...validPlanData, [field]: '-5.00' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(false);
          if (!result.success) {
            const error = result.error.issues.find(e => e.path.includes(field));
            expect(error?.message).toMatch(/must be a non-negative number/);
          }
        });

        it(`should accept zero ${field}`, () => {
          const data = { ...validPlanData, [field]: '0' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(true);
        });

        it(`should accept decimal ${field}`, () => {
          const data = { ...validPlanData, [field]: '12.99' };
          const result = createPlanSchema.safeParse(data);
          
          expect(result.success).toBe(true);
        });
      });
    });

    it('should reject card processing fee percentage over 100%', () => {
      const data = { ...validPlanData, card_processing_fee_percentage: '150' };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Processing fee percentage must be between 0 and 100');
      }
    });
  });

  describe('Feature IDs validation', () => {
    it('should accept empty feature array', () => {
      const data = { ...validPlanData, feature_ids: [] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should accept valid feature IDs', () => {
      const data = { ...validPlanData, feature_ids: [1, 2, 3, 5, 8] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Support SLA validation', () => {
    it('should reject non-positive SLA IDs', () => {
      const data = { ...validPlanData, support_sla_ids: [1, 0, -1] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.filter(e => e.message === 'SLA ID must be positive');
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should accept valid positive SLA IDs', () => {
      const data = { ...validPlanData, support_sla_ids: [1, 2, 3] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });
  });
});

describe('Addon assignment validation', () => {
  const validAddon = {
    addon_id: 1,
    is_included: false,
    feature_level: 'basic' as const,
    default_quantity: 1,
    min_quantity: 1,
    max_quantity: 5
  };

  const baseData = {
    name: 'Test Plan',
    description: 'Test description'
  };

  it('should accept valid addon assignments', () => {
    const data = { ...baseData, addon_assignments: [validAddon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject when max_quantity < min_quantity', () => {
    const invalidAddon = { ...validAddon, min_quantity: 10, max_quantity: 5 };
    const data = { ...baseData, addon_assignments: [invalidAddon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Maximum quantity must be greater than or equal to minimum quantity');
    }
  });

  it('should accept when max_quantity equals min_quantity', () => {
    const addon = { ...validAddon,  default_quantity: 5, min_quantity: 5, max_quantity: 5 };
    const data = { ...baseData, addon_assignments: [addon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject when default_quantity < min_quantity', () => {
    const invalidAddon = { ...validAddon, default_quantity: 0, min_quantity: 1 };
    const data = { ...baseData, addon_assignments: [invalidAddon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Default quantity must be within the minimum and maximum quantity range');
    }
  });

  it('should reject when default_quantity > max_quantity', () => {
    const invalidAddon = { ...validAddon, default_quantity: 10, max_quantity: 5 };
    const data = { ...baseData, addon_assignments: [invalidAddon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Default quantity must be within the minimum and maximum quantity range');
    }
  });

  it('should accept null quantities', () => {
    const addon = { 
      ...validAddon, 
      default_quantity: null, 
      min_quantity: null, 
      max_quantity: null 
    };
    const data = { ...baseData, addon_assignments: [addon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject negative quantities', () => {
    const invalidAddon = { ...validAddon, min_quantity: -1 };
    const data = { ...baseData, addon_assignments: [invalidAddon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Minimum quantity must be non-negative');
    }
  });

  it('should accept custom feature level', () => {
    const addon = { ...validAddon, feature_level: 'custom' as const };
    const data = { ...baseData, addon_assignments: [addon] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });
});

describe('Volume discount validation', () => {
  const validDiscount = {
    id: null,
    name: 'Small Business Discount',
    min_branches: '2',
    max_branches: '5',
    discount_percentage: '10.5'
  };

  const baseData = {
    name: 'Test Plan',
    description: 'Test description'
  };

  it('should accept valid volume discounts', () => {
    const data = { ...baseData, volume_discounts: [validDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject empty discount names', () => {
    const invalidDiscount = { ...validDiscount, name: '' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Discount name is required');
    }
  });

  it('should reject discount names over 100 characters', () => {
    const longName = 'x'.repeat(101);
    const invalidDiscount = { ...validDiscount, name: longName };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name must be less than 100 characters');
    }
  });

  it('should reject min_branches less than 1', () => {
    const invalidDiscount = { ...validDiscount, min_branches: '0' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Min branches must be at least 1');
    }
  });

  it('should reject non-integer min_branches', () => {
    const invalidDiscount = { ...validDiscount, min_branches: '2.5' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Min branches must be at least 1');
    }
  });

  it('should accept null max_branches (unlimited)', () => {
    const discount = { ...validDiscount, max_branches: null };
    const data = { ...baseData, volume_discounts: [discount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should accept empty string max_branches', () => {
    const discount = { ...validDiscount, max_branches: '' };
    const data = { ...baseData, volume_discounts: [discount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it('should reject max_branches <= min_branches', () => {
    const invalidDiscount = { ...validDiscount, min_branches: '5', max_branches: '3' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Maximum branches must be greater than minimum branches');
    }
  });

  it('should reject discount percentage over 100%', () => {
    const invalidDiscount = { ...validDiscount, discount_percentage: '150' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Discount percentage must be between 0.01 and 100');
    }
  });

  it('should reject discount percentage of 0', () => {
    const invalidDiscount = { ...validDiscount, discount_percentage: '0' };
    const data = { ...baseData, volume_discounts: [invalidDiscount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Discount percentage must be between 0.01 and 100');
    }
  });

  it('should accept minimum valid discount percentage', () => {
    const discount = { ...validDiscount, discount_percentage: '0.01' };
    const data = { ...baseData, volume_discounts: [discount] };
    const result = createPlanSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  describe('Overlapping range validation', () => {
    it('should reject overlapping discount ranges', () => {
      const discount1 = { ...validDiscount, min_branches: '1', max_branches: '5' };
      const discount2 = { ...validDiscount, min_branches: '3', max_branches: '8' };
      const data = { ...baseData, volume_discounts: [discount1, discount2] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const overlappingErrors = result.error.issues.filter(
          e => e.message === 'Volume discount ranges cannot overlap'
        );
        expect(overlappingErrors.length).toBeGreaterThan(0);
      }
    });

    it('should accept adjacent non-overlapping ranges', () => {
      const discount1 = { ...validDiscount, min_branches: '1', max_branches: '5' };
      const discount2 = { ...validDiscount, min_branches: '6', max_branches: '10' };
      const data = { ...baseData, volume_discounts: [discount1, discount2] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should handle unlimited max_branches correctly', () => {
      const discount1 = { ...validDiscount, min_branches: '1', max_branches: '5' };
      const discount2 = { ...validDiscount, min_branches: '6', max_branches: null };
      const data = { ...baseData, volume_discounts: [discount1, discount2] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should reject overlapping ranges with unlimited max_branches', () => {
      const discount1 = { ...validDiscount, min_branches: '1', max_branches: null };
      const discount2 = { ...validDiscount, min_branches: '5', max_branches: '10' };
      const data = { ...baseData, volume_discounts: [discount1, discount2] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const overlappingErrors = result.error.issues.filter(
          e => e.message === 'Volume discount ranges cannot overlap'
        );
        expect(overlappingErrors.length).toBeGreaterThan(0);
      }
    });

    it('should accept single discount', () => {
      const data = { ...baseData, volume_discounts: [validDiscount] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should accept empty discount array', () => {
      const data = { ...baseData, volume_discounts: [] };
      const result = createPlanSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });
  });
});

describe('Tab-specific schemas', () => {
  describe('basicInfoSchema', () => {
    it('should validate basic information fields only', () => {
      const data = {
        name: 'Basic Plan',
        description: 'Basic plan description',
        included_devices_count: '5',
        max_users_per_branch: '10',
        included_branches_count: '1',
        is_active: true,
        is_custom: false
      };
      
      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid basic info fields', () => {
      const data = {
        name: '',
        description: 'Valid description',
        included_devices_count: 'invalid',
        max_users_per_branch: '10',
        included_branches_count: '1',
        is_active: true,
        is_custom: false
      };
      
      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('pricingInfoSchema', () => {
    it('should validate pricing fields including volume discounts', () => {
      const data = {
        monthly_price: '49.99',
        annual_discount_percentage: '10',
        biennial_discount_percentage: '20',
        triennial_discount_percentage: '30',
        additional_device_cost: '15.00',
        monthly_fee_our_gateway: '5.00',
        monthly_fee_byo_processor: '3.00',
        card_processing_fee_percentage: '2.9',
        card_processing_fee_fixed: '0.30',
        volume_discounts: []
      };
      
      const result = pricingInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('featuresInfoSchema', () => {
    it('should validate feature selection', () => {
      const data = { feature_ids: [1, 2, 3] };
      const result = featuresInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('addonsInfoSchema', () => {
    it('should validate addon assignments', () => {
      const data = {
        addon_assignments: [
          {
            addon_id: 1,
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          }
        ]
      };
      
      const result = addonsInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('slaInfoSchema', () => {
    it('should validate SLA selection', () => {
      const data = { support_sla_ids: [1, 2] };
      const result = slaInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Resource creation schemas', () => {
  describe('createFeatureSchema', () => {
    it('should accept valid feature data', () => {
      const data = {
        name: 'Advanced Reporting',
        description: 'Comprehensive reporting and analytics features'
      };
      
      const result = createFeatureSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty feature name', () => {
      const data = {
        name: '',
        description: 'Valid description'
      };
      
      const result = createFeatureSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Feature name is required');
      }
    });

    it('should reject feature name over 100 characters', () => {
      const data = {
        name: 'x'.repeat(101),
        description: 'Valid description'
      };
      
      const result = createFeatureSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Feature name must be less than 100 characters');
      }
    });

    it('should reject feature description over 500 characters', () => {
      const data = {
        name: 'Valid Feature',
        description: 'x'.repeat(501)
      };
      
      const result = createFeatureSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Feature description must be less than 500 characters');
      }
    });
  });

  describe('createAddonSchema', () => {
    it('should accept valid addon data', () => {
      const data = {
        name: 'Premium Support',
        description: '24/7 priority support with dedicated account manager',
        base_price: '29.99',
        pricing_scope: 'organization' as const
      };
      
      const result = createAddonSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty base price (optional)', () => {
      const data = {
        name: 'Free Addon',
        description: 'A complimentary addon',
        base_price: '',
        pricing_scope: 'branch' as const
      };
      
      const result = createAddonSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative base price', () => {
      const data = {
        name: 'Invalid Addon',
        description: 'Addon with negative price',
        base_price: '-10.00',
        pricing_scope: 'branch' as const
      };
      
      const result = createAddonSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Base price must be a non-negative number');
      }
    });

    it('should use default pricing_scope', () => {
      const data = {
        name: 'Default Scope Addon',
        description: 'Addon with default scope'
      };
      
      const result = createAddonSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pricing_scope).toBe('branch');
      }
    });
  });

  describe('createSlaSchema', () => {
    it('should accept valid SLA data', () => {
      const data = {
        name: 'Enterprise SLA',
        support_channel: 'Phone, Email, Chat',
        response_time_hours: '2',
        availability_schedule: '24/7',
        notes: 'Premium support level with guaranteed response times'
      };
      
      const result = createSlaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-integer response time', () => {
      const data = {
        name: 'Invalid SLA',
        support_channel: 'Email',
        response_time_hours: '2.5',
        availability_schedule: 'Business Hours',
        notes: ''
      };
      
      const result = createSlaSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Response time must be a positive integer');
      }
    });

    it('should reject zero response time', () => {
      const data = {
        name: 'Zero Response SLA',
        support_channel: 'Email',
        response_time_hours: '0',
        availability_schedule: 'Business Hours',
        notes: ''
      };
      
      const result = createSlaSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Response time must be a positive integer');
      }
    });

    it('should accept null notes', () => {
      const data = {
        name: 'Basic SLA',
        support_channel: 'Email',
        response_time_hours: '24',
        availability_schedule: 'Business Hours',
        notes: null
      };
      
      const result = createSlaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject notes over 500 characters', () => {
      const data = {
        name: 'Verbose SLA',
        support_channel: 'Email',
        response_time_hours: '24',
        availability_schedule: 'Business Hours',
        notes: 'x'.repeat(501)
      };
      
      const result = createSlaSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Notes must be less than 500 characters');
      }
    });
  });
});