/* Badge color constants */

/* Libraries imports */
import { lighten } from 'polished'
import { FaCheckCircle, FaTimesCircle, FaBan, FaClock, FaPause, FaQuestionCircle, FaHourglassHalf, FaSpinner, FaExclamationTriangle, FaUserClock, FaUsers, FaFileAlt, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode } from 'react-icons/fa'
import { IconType } from 'react-icons'

/* Shared module imports */
import { GRAY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, ERROR_RED_COLOR, WARNING_ORANGE_COLOR } from '@shared/config'

/* Status color constants */
export const STATUS_COLORS = {
  BLUE: '#3b82f6',
  INDIGO: '#6366f1',
  AMBER: '#f59e0b',
  RED: '#ef4444',
  PURPLE: '#8b5cf6'
} as const

/* Status badge keys type */
export type StatusBadgeKey =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'locked'
  | 'hold'
  | 'pending'
  | 'pending_verification'
  | 'cancelled'
  | 'trial'
  | 'setup'
  | 'past_due'
  | 'incomplete'
  | 'paused'
  | 'new'
  | 'open'
  | 'in_progress'
  | 'pending_customer'
  | 'pending_internal'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'default'

/* Badge color and icon interface */
export interface BadgeColorsWithIcon {
  color: string
  bg: string
  borderColor: string
  icon: IconType
  colorScheme: string
}

/* Status badge configuration constants */
export const STATUS_BADGE_CONFIG: Record<StatusBadgeKey, BadgeColorsWithIcon> = {
  active: {
    color: SUCCESS_GREEN_COLOR2,
    bg: lighten(0.45, SUCCESS_GREEN_COLOR),
    borderColor: lighten(0.35, SUCCESS_GREEN_COLOR),
    icon: FaCheckCircle,
    colorScheme: 'green'
  },
  inactive: {
    color: lighten(0.2, GRAY_COLOR),
    bg: lighten(0.4, GRAY_COLOR),
    borderColor: lighten(0.3, GRAY_COLOR),
    icon: FaTimesCircle,
    colorScheme: 'gray'
  },
  suspended: {
    color: ERROR_RED_COLOR,
    bg: lighten(0.35, ERROR_RED_COLOR),
    borderColor: lighten(0.3, ERROR_RED_COLOR),
    icon: FaBan,
    colorScheme: 'red'
  },
  locked: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaClock,
    colorScheme: 'orange'
  },
  hold: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaPause,
    colorScheme: 'orange'
  },
  pending: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaClock,
    colorScheme: 'orange'
  },
  pending_verification: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaClock,
    colorScheme: 'orange'
  },
  cancelled: {
    color: ERROR_RED_COLOR,
    bg: lighten(0.35, ERROR_RED_COLOR),
    borderColor: lighten(0.3, ERROR_RED_COLOR),
    icon: FaTimesCircle,
    colorScheme: 'red'
  },
  trial: {
    color: STATUS_COLORS.BLUE,
    bg: lighten(0.4, STATUS_COLORS.BLUE),
    borderColor: lighten(0.3, STATUS_COLORS.BLUE),
    icon: FaClock,
    colorScheme: 'blue'
  },
  setup: {
    color: STATUS_COLORS.INDIGO,
    bg: lighten(0.4, STATUS_COLORS.INDIGO),
    borderColor: lighten(0.3, STATUS_COLORS.INDIGO),
    icon: FaClock,
    colorScheme: 'purple'
  },
  past_due: {
    color: STATUS_COLORS.AMBER,
    bg: lighten(0.4, STATUS_COLORS.AMBER),
    borderColor: lighten(0.3, STATUS_COLORS.AMBER),
    icon: FaClock,
    colorScheme: 'yellow'
  },
  incomplete: {
    color: STATUS_COLORS.RED,
    bg: lighten(0.4, STATUS_COLORS.RED),
    borderColor: lighten(0.3, STATUS_COLORS.RED),
    icon: FaTimesCircle,
    colorScheme: 'red'
  },
  paused: {
    color: STATUS_COLORS.PURPLE,
    bg: lighten(0.4, STATUS_COLORS.PURPLE),
    borderColor: lighten(0.3, STATUS_COLORS.PURPLE),
    icon: FaPause,
    colorScheme: 'purple'
  },
  new: {
    color: STATUS_COLORS.BLUE,
    bg: lighten(0.4, STATUS_COLORS.BLUE),
    borderColor: lighten(0.3, STATUS_COLORS.BLUE),
    icon: FaFileAlt,
    colorScheme: 'blue'
  },
  open: {
    color: STATUS_COLORS.BLUE,
    bg: lighten(0.4, STATUS_COLORS.BLUE),
    borderColor: lighten(0.3, STATUS_COLORS.BLUE),
    icon: FaHourglassHalf,
    colorScheme: 'blue'
  },
  in_progress: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaSpinner,
    colorScheme: 'orange'
  },
  pending_customer: {
    color: WARNING_ORANGE_COLOR,
    bg: lighten(0.4, WARNING_ORANGE_COLOR),
    borderColor: lighten(0.3, WARNING_ORANGE_COLOR),
    icon: FaUserClock,
    colorScheme: 'orange'
  },
  pending_internal: {
    color: STATUS_COLORS.AMBER,
    bg: lighten(0.4, STATUS_COLORS.AMBER),
    borderColor: lighten(0.3, STATUS_COLORS.AMBER),
    icon: FaUsers,
    colorScheme: 'yellow'
  },
  escalated: {
    color: ERROR_RED_COLOR,
    bg: lighten(0.35, ERROR_RED_COLOR),
    borderColor: lighten(0.3, ERROR_RED_COLOR),
    icon: FaExclamationTriangle,
    colorScheme: 'red'
  },
  resolved: {
    color: SUCCESS_GREEN_COLOR2,
    bg: lighten(0.45, SUCCESS_GREEN_COLOR),
    borderColor: lighten(0.35, SUCCESS_GREEN_COLOR),
    icon: FaCheckCircle,
    colorScheme: 'green'
  },
  closed: {
    color: lighten(0.2, GRAY_COLOR),
    bg: lighten(0.4, GRAY_COLOR),
    borderColor: lighten(0.3, GRAY_COLOR),
    icon: FaBan,
    colorScheme: 'gray'
  },
  default: {
    color: lighten(0.2, GRAY_COLOR),
    bg: lighten(0.4, GRAY_COLOR),
    borderColor: lighten(0.3, GRAY_COLOR),
    icon: FaQuestionCircle,
    colorScheme: 'gray'
  }
} as const

/* File type icon mapping based on MIME type */
export const FILE_TYPE_ICONS: Record<string, IconType> = {
  /* Image files */
  'image/jpeg': FaFileImage,
  'image/jpg': FaFileImage,
  'image/png': FaFileImage,
  'image/gif': FaFileImage,
  'image/svg+xml': FaFileImage,
  'image/webp': FaFileImage,

  /* PDF files */
  'application/pdf': FaFilePdf,

  /* Word documents */
  'application/msword': FaFileWord,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FaFileWord,

  /* Excel spreadsheets */
  'application/vnd.ms-excel': FaFileExcel,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FaFileExcel,

  /* PowerPoint presentations */
  'application/vnd.ms-powerpoint': FaFilePowerpoint,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': FaFilePowerpoint,

  /* Video files */
  'video/mp4': FaFileVideo,
  'video/mpeg': FaFileVideo,
  'video/quicktime': FaFileVideo,
  'video/x-msvideo': FaFileVideo,
  'video/webm': FaFileVideo,

  /* Audio files */
  'audio/mpeg': FaFileAudio,
  'audio/mp3': FaFileAudio,
  'audio/wav': FaFileAudio,
  'audio/ogg': FaFileAudio,

  /* Archive files */
  'application/zip': FaFileArchive,
  'application/x-zip-compressed': FaFileArchive,
  'application/x-rar-compressed': FaFileArchive,
  'application/x-7z-compressed': FaFileArchive,
  'application/gzip': FaFileArchive,

  /* Code files */
  'text/html': FaFileCode,
  'text/css': FaFileCode,
  'text/javascript': FaFileCode,
  'application/javascript': FaFileCode,
  'application/json': FaFileCode,
  'application/xml': FaFileCode,
  'text/xml': FaFileCode,

  /* Text files */
  'text/plain': FaFileAlt,

  /* Default fallback */
  default: FaFileAlt
}

/* Helper function to get file type icon */
export const getFileTypeIcon = (mimeType: string): IconType => {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS.default
}
