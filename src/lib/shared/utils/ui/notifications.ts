/* UI notification and toast utilities */

/* External library imports */
import { toaster } from '@/components/ui/toaster';

/* Toast configuration interface */
interface ToastConfig {
  title: string;
  description: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}

/* Create standardized toast notification */
export const createToastNotification = ({
  title,
  description,
  type = 'success',
  duration = 7000,
  closable = true
}: ToastConfig) => {
  /* Use queueMicrotask to avoid flushSync warnings during render */
  queueMicrotask(() => {
    toaster.create({
      title,
      description,
      type,
      duration,
      closable
    })
  })
};