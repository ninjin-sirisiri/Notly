import i18n from './i18n';

/**
 * Date formatting options for different locales
 */
export type DateFormatOptions = {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
};

/**
 * Format a date according to the current locale
 * @param date - The date to format (Date object, string, or number)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options?: DateFormatOptions
): string {
  // Handle null or undefined
  if (date === null || date === undefined) {
    console.error('Null or undefined date provided to formatDate');
    return 'Invalid Date';
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const locale = i18n.language || 'en';

  // Check if date is valid
  if (Number.isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    // Fallback to English if formatting fails
    return new Intl.DateTimeFormat('en', options).format(dateObj);
  }
}

/**
 * Format a date as a short date string (e.g., "1/15/2026" or "2026/1/15")
 * @param date - The date to format
 * @returns Short date string
 */
export function formatShortDate(date: Date | string | number | null | undefined): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

/**
 * Format a date as a long date string (e.g., "January 15, 2026" or "2026年1月15日")
 * @param date - The date to format
 * @returns Long date string
 */
export function formatLongDate(date: Date | string | number | null | undefined): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date and time (e.g., "1/15/2026, 3:45 PM" or "2026/1/15 15:45")
 * @param date - The date to format
 * @returns Date and time string
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  const locale = i18n.language || 'en';

  return formatDate(date, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en' // Use 12-hour format for English, 24-hour for Japanese
  });
}

/**
 * Format a date for ISO string (YYYY-MM-DD)
 * This is locale-independent and used for data storage/comparison
 * @param date - The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date | string | number | null | undefined): string {
  // Handle null or undefined
  if (date === null || date === undefined) {
    console.error('Null or undefined date provided to formatISODate');
    return '';
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  // Check if date is valid
  if (Number.isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatISODate:', date);
    return '';
  }

  return dateObj.toISOString().split('T')[0];
}

/**
 * Format a time string (e.g., "3:45 PM" or "15:45")
 * @param date - The date to format
 * @returns Time string
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  const locale = i18n.language || 'en';

  return formatDate(date, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en'
  });
}
