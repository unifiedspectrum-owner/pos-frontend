/* Interface for holding tenant account */
export interface HoldTenantApiRequest {
  tenant_id: string;
  reason: string;
  hold_until: string | null; // nullable date string
}

export interface HoldTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'hold';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

/* Interface for suspending tenant account */
export interface SuspendTenantApiRequest {
  tenant_id: string;
  reason: string;
  suspend_until: string | null; // nullable date string
}

export interface SuspendTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'suspended';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

/* Interface for activating tenant account */
export interface ActivateTenantApiRequest {
  tenant_id: string;
  reason: string;
}

export interface ActivateTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'active';
    suspension_id: string;
    email_sent: boolean;
  };
  timestamp: string;
}

export interface deleteTenantApiResponse {
  success: boolean;
  message: string;
  data: {
    tenant_id: string;
    status: 'inactive';
    deleted_at: string;
  };
  timestamp: string;
}