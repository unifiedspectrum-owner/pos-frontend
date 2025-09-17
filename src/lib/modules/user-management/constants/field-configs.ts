/* Libraries imports */
import { IconType } from 'react-icons'
import { FaUser, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaKey, FaDesktop, FaSignInAlt, FaLock, FaExclamationTriangle, FaUserShield, FaGlobe, FaFingerprint } from 'react-icons/fa'

/* User details field configuration interface */
export interface UserDetailsFieldConfig {
  id: number;
  display_order: number;
  is_active: boolean;
  label: string;
  icon_name: IconType;
  data_key: string;
  type: "TEXT" | "VERIFICATION" | "BADGE" | "DATE";
  values?: string[]
}

export type UserDetailsTabType = 'profile_info' | 'statistics_info' | 'permissions'

export interface UserDetailsTabConfig {
  id: UserDetailsTabType,
  label: string;
  icon: IconType
}

export interface UserDetailsSectionConfig {
  id: UserDetailsTabType;
  section_heading: string;
  section_values: UserDetailsFieldConfig[]
}

export const USER_DETAILS_TAB = {
  PROFILE_INFO: 'profile_info',
  STATISTICS_INFO: 'statistics_info',
  PERMISSIONS_INFO: 'permissions'
} as const satisfies Record<string, UserDetailsTabType>


/* Tab configuration for user details view */
export const USER_DETAILS_TABS: UserDetailsTabConfig[] = [
  {
    id: USER_DETAILS_TAB.PROFILE_INFO,
    label: 'Profile Information',
    icon: FaUser
  },
  {
    id: USER_DETAILS_TAB.STATISTICS_INFO,
    label: 'Activity & Statistics',
    icon: FaSignInAlt
  },
  {
    id: USER_DETAILS_TAB.PERMISSIONS_INFO,
    label: 'Roles & Permissions',
    icon: FaUserShield
  }
] as const

/* Field configuration for profile and security information display */
export const UserProfileInfoFields: UserDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: "First Name",
    icon_name: FaUser,
    data_key: "f_name",
    type: "TEXT"
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: "Last Name",
    icon_name: FaUser,
    data_key: "l_name",
    type: "TEXT"
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: "Account Status",
    icon_name: FaCheckCircle,
    data_key: "user_status",
    type: "BADGE",
    values: ["Active", "Inactive"]
  },
  {
    id: 4,
    display_order: 4,
    is_active: true,
    label: "Account Locked Until",
    icon_name: FaLock,
    data_key: "account_locked_until",
    type: "DATE"
  },
  {
    id: 5,
    display_order: 5,
    is_active: true,
    label: "Phone Number",
    icon_name: FaPhoneAlt,
    data_key: "phone",
    type: "VERIFICATION"
  },
  {
    id: 6,
    display_order: 6,
    is_active: true,
    label: "Phone Verified At",
    icon_name: FaCalendarAlt,
    data_key: "phone_verified_at",
    type: "DATE"
  },
  {
    id: 7,
    display_order: 7,
    is_active: true,
    label: "Email Address",
    icon_name: FaEnvelope,
    data_key: "email",
    type: "VERIFICATION"
  },
  {
    id: 8,
    display_order: 8,
    is_active: true,
    label: "Email Verified At",
    icon_name: FaCalendarAlt,
    data_key: "email_verified_at",
    type: "DATE"
  },
  {
    id: 9,
    display_order: 9,
    is_active: true,
    label: "Registration Date",
    icon_name: FaCalendarAlt,
    data_key: "user_created_at",
    type: "DATE"
  },
  {
    id: 10,
    display_order: 10,
    is_active: true,
    label: "Last Updated",
    icon_name: FaCalendarAlt,
    data_key: "user_updated_at",
    type: "DATE"
  },
  {
    id: 11,
    display_order: 11,
    is_active: true,
    label: "Last Password Changed At",
    icon_name: FaKey,
    data_key: "last_password_change",
    type: "DATE"
  }
];

/* Field configuration for activity and statistics information display */
export const UserStatisticsInfoFields: UserDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: "Total Logins",
    icon_name: FaSignInAlt,
    data_key: "total_logins",
    type: "TEXT"
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: "Successful Logins",
    icon_name: FaCheckCircle,
    data_key: "successful_logins",
    type: "TEXT"
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: "Failed Logins",
    icon_name: FaTimesCircle,
    data_key: "failed_logins",
    type: "TEXT"
  },
  {
    id: 4,
    display_order: 4,
    is_active: true,
    label: "Consecutive Failed",
    icon_name: FaExclamationTriangle,
    data_key: "consecutive_failed_attempts",
    type: "TEXT"
  },
  {
    id: 5,
    display_order: 5,
    is_active: true,
    label: "First Login",
    icon_name: FaCalendarAlt,
    data_key: "first_login_at",
    type: "DATE"
  },
  {
    id: 6,
    display_order: 6,
    is_active: true,
    label: "Last Successful Login",
    icon_name: FaCheckCircle,
    data_key: "last_successful_login_at",
    type: "DATE"
  },
  {
    id: 7,
    display_order: 7,
    is_active: true,
    label: "Last Failed Login",
    icon_name: FaTimesCircle,
    data_key: "last_failed_login_at",
    type: "DATE"
  },
  {
    id: 8,
    display_order: 8,
    is_active: true,
    label: "Last Login IP",
    icon_name: FaGlobe,
    data_key: "last_login_ip",
    type: "TEXT"
  },
  {
    id: 9,
    display_order: 9,
    is_active: true,
    label: "Active Sessions",
    icon_name: FaDesktop,
    data_key: "active_sessions",
    type: "TEXT"
  },
  {
    id: 10,
    display_order: 10,
    is_active: true,
    label: "Max Sessions",
    icon_name: FaDesktop,
    data_key: "max_concurrent_sessions",
    type: "TEXT"
  },
  {
    id: 11,
    display_order: 11,
    is_active: true,
    label: "Password Changes",
    icon_name: FaKey,
    data_key: "password_changes_count",
    type: "TEXT"
  },
  {
    id: 12,
    display_order: 12,
    is_active: true,
    label: "Account Lockouts",
    icon_name: FaLock,
    data_key: "account_lockouts_count",
    type: "TEXT"
  },
  {
    id: 13,
    display_order: 13,
    is_active: true,
    label: "Last Lockout",
    icon_name: FaLock,
    data_key: "last_lockout_at",
    type: "DATE"
  },
  {
    id: 14,
    display_order: 14,
    is_active: true,
    label: "Last User Agent",
    icon_name: FaDesktop,
    data_key: "last_user_agent",
    type: "TEXT"
  },
  {
    id: 15,
    display_order: 15,
    is_active: true,
    label: "Device Fingerprint",
    icon_name: FaFingerprint,
    data_key: "last_device_fingerprint",
    type: "TEXT"
  }
];

export const USER_DETAILS: UserDetailsSectionConfig[] = [
  {
    id: USER_DETAILS_TAB.PROFILE_INFO,
    section_heading: "Profile & Security Information",
    section_values: UserProfileInfoFields
  },
  {
    id: USER_DETAILS_TAB.STATISTICS_INFO,
    section_heading: "Activity & Statistics",
    section_values: UserStatisticsInfoFields
  }
]