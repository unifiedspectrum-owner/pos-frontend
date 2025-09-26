/* Password strength validation utilities */

/* Password strength check result interface */
export interface PasswordStrengthResult {
  score: number; /* Score from 0-100 */
  label: string; /* Strength label */
  color: string; /* Color for UI display */
  checks: PasswordChecks; /* Individual requirement checks */
}

/* Individual password requirement checks */
export interface PasswordChecks {
  length: boolean; /* At least 8 characters */
  lowercase: boolean; /* Contains lowercase letter */
  uppercase: boolean; /* Contains uppercase letter */
  number: boolean; /* Contains number */
  special: boolean; /* Contains special character */
}

/* Calculate password strength and return visual indicators */
export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'gray.300',
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
      }
    }
  }

  /* Check individual requirements */
  const checks: PasswordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password)
  }

  /* Calculate score based on requirements met */
  const requirementsMet = Object.values(checks).filter(Boolean).length
  const score = (requirementsMet / 5) * 100

  /* Strength mapping */
  const strengthMap = {
    0: { label: 'Very Weak', color: 'red.500' },
    1: { label: 'Very Weak', color: 'red.500' },
    2: { label: 'Weak', color: 'orange.500' },
    3: { label: 'Fair', color: 'yellow.500' },
    4: { label: 'Good', color: 'blue.500' },
    5: { label: 'Strong', color: 'green.500' }
  }

  const strengthInfo = strengthMap[requirementsMet as keyof typeof strengthMap]

  return {
    score,
    label: strengthInfo.label,
    color: strengthInfo.color,
    checks
  }
}