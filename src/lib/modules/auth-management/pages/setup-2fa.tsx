"use client"

/* Libraries imports */
import React from 'react'

/* Auth management module imports */
import { Setup2FAForm } from '@auth-management/forms'
import { AuthLayout } from '@auth-management/components'

/* 2FA setup page component */
const Setup2FAPage: React.FC = () => {
  return (
    <AuthLayout>
      <Setup2FAForm />
    </AuthLayout>
  )
}

export default Setup2FAPage
