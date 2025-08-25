/* Toast notification utilities for tenant management */
import { toaster } from '@/components/ui/toaster'

/* Create standardized toast notification */
export const createTenantToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  description: string,
  duration?: number
) => {
  toaster.create({
    title,
    description,
    type,
    duration: duration || (type === 'error' ? 7000 : 5000),
    closable: true
  })
};