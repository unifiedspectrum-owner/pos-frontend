/* Time and date formatting utilities */

/* Format seconds into MM:SS display format */
export const formatTimer = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  /* Pad seconds with leading zero if needed */
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatDate = (date: string) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}