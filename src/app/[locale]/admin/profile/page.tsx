/* Libraries imports */
import { Metadata } from 'next'

/* Auth module imports */
import { UpdateProfilePage } from '@auth-management/pages'

/* Page metadata */
export const metadata: Metadata = {
  title: 'Update Profile',
  description: 'Update your profile information and settings'
}

/* Profile update page route component */
export default function ProfileUpdatePageRoute() {
  return <UpdateProfilePage />
}