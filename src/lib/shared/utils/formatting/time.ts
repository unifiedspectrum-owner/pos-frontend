/* Time and date formatting utilities */

/* Convert minutes to seconds */
export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60
}

/* Convert seconds to minutes */
export const secondsToMinutes = (seconds: number): number => {
  return Math.floor(seconds / 60)
}

/* Format seconds into MM:SS display format */
export const formatTimer = (seconds: number): string => {
  const minutes = secondsToMinutes(seconds)
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

/* Format date and time into DD-MM-YYYY HH:MM AM/PM format */
export const formatDateTime = (date: string) => {
  if (!date) return null;

  const dateObj = new Date(date);

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
}

/* Time calculation utilities for authentication operations */

/* Get current timestamp in Unix format (seconds) */
export const getCurrentUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/* Get current timestamp in milliseconds */
export const getCurrentTimestampMs = (): number => {
  return Date.now();
};

/* Get current date as ISO string */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

/* Add minutes to current timestamp and return Unix timestamp */
export const addMinutesToCurrentTime = (minutes: number): number => {
  const currentTime = getCurrentUnixTimestamp();
  return currentTime + (minutes * 60);
};

/* Add hours to current timestamp and return Unix timestamp */
export const addHoursToCurrentTime = (hours: number): number => {
  const currentTime = getCurrentUnixTimestamp();
  // return currentTime + 60;
  return currentTime + (hours * 60 * 60);
};

/* Add days to current timestamp and return Unix timestamp */
export const addDaysToCurrentTime = (days: number): number => {
  const currentTime = getCurrentUnixTimestamp();
  return currentTime + (days * 24 * 60 * 60);
};

/* Add minutes to current date and return ISO string */
export const addMinutesToCurrentDate = (minutes: number): string => {
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() + minutes);
  return currentDate.toISOString();
};

/* Add hours to current date and return ISO string */
export const addHoursToCurrentDate = (hours: number): string => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + hours);
  return currentDate.toISOString();
};

/* Add days to current date and return ISO string */
export const addDaysToCurrentDate = (days: number): string => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate.toISOString();
};

/* Check if Unix timestamp is expired (past current time) */
export const isUnixTimestampExpired = (timestamp: number): boolean => {
  return timestamp < getCurrentUnixTimestamp();
};

/* Check if ISO date string is expired (past current time) */
export const isISODateExpired = (isoDateString: string): boolean => {
  const expirationDate = new Date(isoDateString);
  const currentDate = new Date();
  return expirationDate < currentDate;
};

/* Check if JWT expiration timestamp is expired */
export const isJWTTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  return isUnixTimestampExpired(exp);
};

/* Convert Unix timestamp to ISO string */
export const unixToISOString = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

/* Convert ISO string to Unix timestamp */
export const isoStringToUnix = (isoString: string): number => {
  return Math.floor(new Date(isoString).getTime() / 1000);
};