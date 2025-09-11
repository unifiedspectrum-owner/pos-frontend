/* Backend API base URL */
export const BACKEND_BASE_URL = 'http://127.0.0.1:8787'; /* Local development server */
// export const BACKEND_BASE_URL = 'https://pos-backend.jrbofficial31.workers.dev'; /* Production server */

/* Loading states configuration */
export const LOADING_DELAY = 2000; /* Artificial loading delay in milliseconds */
export const LOADING_DELAY_ENABLED = true; /* Enable/disable loading delay for testing */

/* Cache configuration */
export const COUNTRIES_CACHE_DURATION = 1000 * 60 * 60 * 24; /* Countries cache duration: 24 hours */

/* Currency and formatting */
export const CURRENCY_SYMBOL = '$'; /* Default currency symbol */

/* Primary brand colors */
export const PRIMARY_COLOR = '#562dc6'; /* Main brand color */
export const SECONDARY_COLOR = '#885CF7'; /* Secondary brand color */

/* Base colors */
export const BG_COLOR = '#FCFCFF'; /* Background color */
export const WHITE_COLOR = '#FFFFFF'; /* Pure white */
export const DARK_COLOR = '#17171A'; /* Dark text/background */
export const GRAY_COLOR = '#39393E'; /* Neutral gray */

/* Status colors */
export const SUCCESS_GREEN_COLOR = '#00FF41'; /* Success state (bright) */
export const SUCCESS_GREEN_COLOR2 = '#30cb57ff'; /* Success state (muted) */
export const WARNING_ORANGE_COLOR = '#f59e0b'; /* Warning state */
export const ERROR_RED_COLOR = '#ef4444'; /* Error state */