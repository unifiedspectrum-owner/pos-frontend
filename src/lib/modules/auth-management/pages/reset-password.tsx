"use client"

/* Libraries imports */
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/* Auth management module imports */
import { ResetPasswordForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components/layout'
import { useAuthOperations } from '@auth-management/hooks'
import { TOKEN_VALIDATION_STATE } from '@auth-management/constants'
import { TokenValidationState } from '@auth-management/types'

/* Reset Password page component */
const ResetPasswordPage: React.FC = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [tokenValidationState, setTokenValidationState] = useState<TokenValidationState>(TOKEN_VALIDATION_STATE.PENDING)

  /* Auth operations hook */
  const { validateResetToken, isValidatingToken, tokenValidationErrorCode, tokenValidationErrorMsg } = useAuthOperations()

  /* Validate token on component mount */
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        const isValid = await validateResetToken(token)
        setTokenValidationState(isValid ? TOKEN_VALIDATION_STATE.VALID : TOKEN_VALIDATION_STATE.INVALID)
      } else {
        setTokenValidationState(TOKEN_VALIDATION_STATE.INVALID)
      }
    }

    validateToken()
  }, [token, validateResetToken]);

  return (
    <AuthLayout>
      <ResetPasswordForm
        token={token}
        tokenValidationState={tokenValidationState}
        isValidatingToken={isValidatingToken}
        tokenValidationErrorCode={tokenValidationErrorCode}
        tokenValidationErrorMsg={tokenValidationErrorMsg}
      />
    </AuthLayout>
  )
}

export default ResetPasswordPage