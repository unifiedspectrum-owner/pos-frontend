"use client"

/* Libraries imports */
import React from 'react'

/* Shared module imports */
import { LoaderWrapper } from '@shared/components/common'

/* Auth management module imports */
import { Setup2FAForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components/layout'

/* 2FA setup page component */
const Setup2FAPage: React.FC = () => {
  return (
    <AuthLayout>
      <Setup2FAForm />
    </AuthLayout>
  )
}

export default Setup2FAPage
