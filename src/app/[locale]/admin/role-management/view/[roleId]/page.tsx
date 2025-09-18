/* Libraries imports */
import { notFound } from 'next/navigation'

/* Role module imports */
import { ViewRolePage } from '@role-management/pages'

/* Props interface for role details page route */
interface ViewRolePageRouteProps {
  params: Promise<{
    roleId: string
  }>
}

/* Role viewing page route component */
export default async function ViewRolePageRoute({
  params
}: ViewRolePageRouteProps) {
  const { roleId } = await params

  /* Validate roleId parameter */
  if (!roleId || isNaN(Number(roleId))) {
    notFound()
  }

  return <ViewRolePage roleId={roleId} />
}