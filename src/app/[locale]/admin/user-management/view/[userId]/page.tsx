/* Libraries imports */
import { notFound } from 'next/navigation'

/* User module imports */
import UserDetailsPage from '@user-management/pages/view'

/* Props interface for user details page route */
interface UserDetailsPageRouteProps {
  params: Promise<{
    userId: string
  }>
}

/* User details page route component */
export default async function UserDetailsPageRoute({
  params
}: UserDetailsPageRouteProps) {
  const { userId } = await params

  /* Validate userId parameter */
  if (!userId || isNaN(Number(userId))) {
    notFound()
  }

  return <UserDetailsPage userId={userId} />
}