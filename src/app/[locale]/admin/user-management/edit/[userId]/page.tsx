/* Libraries imports */
import React from 'react'

/* User module imports */
import EditUserPage from '@user-management/pages/edit'

/* Dynamic route params interface */
interface EditUserRouteProps {
  params: Promise<{ userId: string }>
}

/* Next.js page component for editing users */
const UserEditRoute: React.FC<EditUserRouteProps> = async ({ params }) => {
  const { userId } = await params
  return <EditUserPage userId={userId} />
}

export default UserEditRoute