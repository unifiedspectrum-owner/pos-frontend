/* Libraries imports */
import { Metadata } from 'next'

/* User module imports */
import CreateUserPage from '@user-management/pages/create'

/* Page metadata */
export const metadata: Metadata = {
  title: 'Create New User',
  description: 'Create a new user account with role assignment'
}

/* User creation page route component */
export default function CreateUserPageRoute() {
  return <CreateUserPage />
}