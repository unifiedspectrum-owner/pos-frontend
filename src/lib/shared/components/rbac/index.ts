/* RBAC (Role-Based Access Control) component exports */

/* Route protection components */
export { ClientRouteGuard } from './client-route-guard'; /* Client-side route protection */
export { AdminRouteGuard } from './admin-route-guard'; /* Admin route protection wrapper */
export { default as AuthRouteGuard } from './auth-route-guard'; /* Authentication route protection */

/* Error page components */
export { ForbiddenPage } from './forbidden-page'; /* 403 Forbidden error page */