"use client"

/* Libraries imports */
import React from 'react'

/* Auth management module imports */
import { ForgotPasswordForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components/layout'

/* Forgot Password page component */
const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

export default ForgotPasswordPage