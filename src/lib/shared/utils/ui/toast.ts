/* Toast notification utilities for tenant management */
import { toaster } from '@/components/ui/toaster';

interface ToastConfig {
  title: string;
  description: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}

/* Create standardized toast notification */
export const createToastMessage = ( {
  title,
  description,
  type = 'success',
  duration = 7000,
  closable = true
}: ToastConfig) => {
  toaster.create({
    title,
    description,
    type,
    duration,
    closable
  })
};