/* Libraries imports */
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, ERROR_RED_COLOR, WARNING_ORANGE_COLOR } from '@shared/config'

/* Badge color interface */
interface BadgeColors {
  color: string
  bg: string
  borderColor: string
}

/* Get status badge colors based on status value */
export const getStatusBadgeColor = (status: string): BadgeColors => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        color: SUCCESS_GREEN_COLOR2,
        bg: lighten(0.45, SUCCESS_GREEN_COLOR),
        borderColor: lighten(0.35, SUCCESS_GREEN_COLOR)
      }
    case 'inactive':
      return {
        color: lighten(0.2, GRAY_COLOR),
        bg: lighten(0.4, GRAY_COLOR),
        borderColor: lighten(0.3, GRAY_COLOR)
      }
    case 'suspended':
      return {
        color: ERROR_RED_COLOR,
        bg: lighten(0.35, ERROR_RED_COLOR),
        borderColor: lighten(0.3, ERROR_RED_COLOR)
      }
    case 'hold':
      return {
        color: WARNING_ORANGE_COLOR,
        bg: lighten(0.4, WARNING_ORANGE_COLOR),
        borderColor: lighten(0.3, WARNING_ORANGE_COLOR)
      }
    case 'pending':
      return {
        color: WARNING_ORANGE_COLOR,
        bg: lighten(0.4, WARNING_ORANGE_COLOR),
        borderColor: lighten(0.3, WARNING_ORANGE_COLOR)
      }
    default:
      return {
        color: lighten(0.2, GRAY_COLOR),
        bg: lighten(0.4, GRAY_COLOR),
        borderColor: lighten(0.3, GRAY_COLOR)
      }
  }
}