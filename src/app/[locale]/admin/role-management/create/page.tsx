/* Libraries imports */
import { Metadata } from 'next'

/* Role module imports */
import { CreateRolePage } from '@role-management/pages'

/* Page metadata */
export const metadata: Metadata = {
  title: 'Create New Role',
  description: 'Create a new role with module assignments and permissions'
}

/* Role creation page route component */
export default function CreateRolePageRoute() {
  return <CreateRolePage />
}