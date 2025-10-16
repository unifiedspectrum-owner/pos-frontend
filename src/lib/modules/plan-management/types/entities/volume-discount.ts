/* TypeScript interfaces for volume discount data structures */

/* Volume-based discount tier configuration */
export interface VolumeDiscount {
  id?: number | null;
  name: string;
  min_branches: number;
  max_branches: number | null;
  discount_percentage: number;
}
