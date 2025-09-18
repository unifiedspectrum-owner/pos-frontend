/* Libraries imports */
import { notFound } from 'next/navigation'

/* Role module imports */
import { EditRolePage } from '@role-management/pages'

/* Props interface for role edit page route */
interface EditRolePageRouteProps {
  params: Promise<{
    roleId: string
  }>
}

/* Role editing page route component */
export default async function EditRolePageRoute({
  params
}: EditRolePageRouteProps) {
  const { roleId } = await params

  /* Validate roleId parameter */
  if (!roleId || isNaN(Number(roleId))) {
    notFound()
  }

  return <EditRolePage roleId={roleId} />
}