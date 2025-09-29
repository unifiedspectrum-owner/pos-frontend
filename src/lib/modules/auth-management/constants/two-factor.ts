/* Two-factor authentication setup instructions */

interface TwoFactorInstructions {
  id: number;
  title: string;
  description: string;
  showButton?: boolean
}

/* Instructions for when 2FA is disabled */
export const TWO_FACTOR_SETUP_INSTRUCTIONS: TwoFactorInstructions[] = [
  {
    id: 1,
    title: "Download an Authenticator App",
    description: "Install one of these free apps on your smartphone: Google Authenticator (recommended), Microsoft Authenticator, or Authy. These apps generate time-based codes that refresh every 30 seconds."
  },
  {
    id: 2,
    title: "Enable 2FA and Get QR Code",
    description: "Click the button below to enable 2FA and get your QR code and backup codes to configure your authenticator app.",
    showButton: true
  },
  {
    id: 3,
    title: "Scan the QR Code",
    description: "Open your authenticator app and use the camera to scan the QR code from step 2. Alternatively, you can manually enter the setup key if QR scanning is not available."
  },
  {
    id: 4,
    title: "Verify Setup with 6-Digit Code",
    description: "Your authenticator app will display a 6-digit code that refreshes every 30 seconds. Enter this code when prompted to complete the 2FA setup and verify everything is working correctly."
  },
  {
    id: 5,
    title: "Save Your Recovery Codes",
    description: "Store the backup recovery codes from step 2 in a secure location (password manager, safe, etc.). These codes allow account recovery if you lose access to your authenticator app."
  }
] as const

/* Instructions for when 2FA is enabled */
export const TWO_FACTOR_MANAGE_INSTRUCTIONS: TwoFactorInstructions[] = [
  {
    id: 1,
    title: "Manage Your 2FA Settings",
    description: "Your account is protected with two-factor authentication. You can view your backup codes or disable 2FA if needed.",
    showButton: true
  },
  {
    id: 2,
    title: "Backup Recovery Codes",
    description: "Keep your backup codes safe and accessible. Each code can only be used once and will help you regain access if you lose your authenticator device."
  },
  {
    id: 3,
    title: "Authenticator App Required",
    description: "When logging in, you'll need to enter a 6-digit code from your authenticator app after entering your password."
  },
  {
    id: 4,
    title: "Disable 2FA",
    description: "If you need to disable 2FA, click the button above. This will remove the extra security layer from your account."
  }
] as const

/* Maintain backward compatibility */
export const TWO_FACTOR_INSTRUCTIONS = TWO_FACTOR_SETUP_INSTRUCTIONS

/* Two-factor authentication informational text */
export const TWO_FACTOR_INFO = {
  description: "Two-Factor Authentication adds an extra layer of security to your account by requiring both your password and a time-sensitive code from your mobile device. This significantly reduces the risk of unauthorized access even if your password is compromised.",
  note: "You can enable 2FA to add an extra layer of security to your account. Once enabled, you'll need to enter a code from your authenticator app each time you log in.",
  enabledMessage: "2FA is currently active on your account. Your account is protected with an additional security layer."
} as const