/* Libraries imports */
import { lighten } from 'polished'
import { FaCheckCircle, FaTimesCircle, FaBan, FaClock, FaPause, FaQuestionCircle } from 'react-icons/fa'

/* Shared module imports */
import { GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, ERROR_RED_COLOR, WARNING_ORANGE_COLOR } from '@shared/config'
import { IconType } from 'react-icons'

/* Badge color and icon interface */
interface BadgeColorsWithIcon {
  color: string
  bg: string
  borderColor: string
  icon: IconType
  colorScheme: string
}

/* Get status badge colors and icon based on status value */
export const getStatusBadgeColor = (status: string): BadgeColorsWithIcon => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        color: SUCCESS_GREEN_COLOR2,
        bg: lighten(0.45, SUCCESS_GREEN_COLOR),
        borderColor: lighten(0.35, SUCCESS_GREEN_COLOR),
        icon: FaCheckCircle,
        colorScheme: 'green'
      }
    case 'inactive':
      return {
        color: lighten(0.2, GRAY_COLOR),
        bg: lighten(0.4, GRAY_COLOR),
        borderColor: lighten(0.3, GRAY_COLOR),
        icon: FaTimesCircle,
        colorScheme: 'gray'
      }
    case 'suspended':
      return {
        color: ERROR_RED_COLOR,
        bg: lighten(0.35, ERROR_RED_COLOR),
        borderColor: lighten(0.3, ERROR_RED_COLOR),
        icon: FaBan,
        colorScheme: 'red'
      }
    case 'locked':
      return {
        color: WARNING_ORANGE_COLOR,
        bg: lighten(0.4, WARNING_ORANGE_COLOR),
        borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
        icon: FaClock,
        colorScheme: 'orange'
      }
    case 'hold':
      return {
        color: WARNING_ORANGE_COLOR,
        bg: lighten(0.4, WARNING_ORANGE_COLOR),
        borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
        icon: FaPause,
        colorScheme: 'orange'
      }
    case 'pending':
      return {
        color: WARNING_ORANGE_COLOR,
        bg: lighten(0.4, WARNING_ORANGE_COLOR),
        borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
        icon: FaClock,
        colorScheme: 'orange'
      }
    default:
      return {
        color: lighten(0.2, GRAY_COLOR),
        bg: lighten(0.4, GRAY_COLOR),
        borderColor: lighten(0.3, GRAY_COLOR),
        icon: FaQuestionCircle,
        colorScheme: 'gray'
      }
  }
}