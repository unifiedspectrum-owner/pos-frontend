/* TypeScript interfaces for subscription addon data structures */

/* Tenant module imports */
import { PlanBillingCycle } from './billing';

/* Addon assignment configuration */
export interface AddonAssignements {
  addon_id: number;
  feature_level?: 'basic' | 'premium' | 'custom';
}

/* Branch-level addon assignments */
export interface BranchAddonAssignments {
  branch_id: number;
  addon_assignments: AddonAssignements[];
}

/* Complete branch information with name and selection state */
export interface BranchSelection {
  branchIndex: number
  branchName: string
  isSelected: boolean
}

/* Legacy type alias for backward compatibility in addons */
export type AddonBranchSelection = BranchSelection

/* Selected addon configuration with pricing and branch data */
export interface SelectedAddon {
  addon_id: number
  addon_name: string
  addon_price: number
  pricing_scope: 'branch' | 'organization'
  branches: AddonBranchSelection[]
  is_included: boolean
}

/* Assigned addon details with assignment tracking */
export interface AssignedAddonDetails {
  assignment_id: number;
  tenant_id: string;
  branch_id: string | null;
  addon_id: number;
  addon_name: string;
  addon_description: string;
  addon_price: number;
  pricing_scope: 'organization' | 'branch';
  status: string;
  feature_level: 'basic' | 'premium' | 'custom';
  billing_cycle: PlanBillingCycle;
}