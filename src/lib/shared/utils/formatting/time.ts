/* Time and date formatting utilities */

/* Format seconds into MM:SS display format */
export const formatTimer = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  /* Pad seconds with leading zero if needed */
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}