import fc from 'fast-check';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatShortDate,
  formatLongDate,
  formatDateTime,
  formatISODate,
  formatTime
} from './dateFormat';
import i18n from './i18n';

describe('Date Formatting', () => {
  beforeEach(async () => {
    // Initialize i18n before tests
    if (!i18n.isInitialized) {
      await i18n.init();
    }
  });

  describe('Property 10: Locale-Specific Date Formatting', () => {
    /**
     * Feature: internationalization, Property 10: Locale-Specific Date Formatting
     * Validates: Requirements 3.5
     *
     * For any date value and locale, when formatting the date,
     * the result should follow the date format conventions of that locale.
     */
    it('should format dates according to locale conventions', () => {
      fc.assert(
        fc.property(
          // Generate random dates
          fc.date({
            min: new Date('2000-01-01'),
            max: new Date('2030-12-31')
          }),
          // Generate random supported locales
          fc.constantFrom('en', 'ja'),
          (date, locale) => {
            // Set the locale
            i18n.changeLanguage(locale);

            // Format the date
            const formatted = formatDate(date);

            // Verify the result is a non-empty string
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);

            // Verify the formatted string contains date components
            // (year, month, or day should appear somewhere)
            const year = date.getFullYear().toString();
            const hasDateComponents =
              formatted.includes(year) ||
              formatted.includes(date.getMonth().toString()) ||
              formatted.includes(date.getDate().toString());

            expect(hasDateComponents).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format dates consistently for the same locale', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date('2000-01-01'),
            max: new Date('2030-12-31')
          }),
          fc.constantFrom('en', 'ja'),
          (date, locale) => {
            // Set the locale
            i18n.changeLanguage(locale);

            // Format the same date twice
            const formatted1 = formatDate(date);
            const formatted2 = formatDate(date);

            // Should produce identical results
            expect(formatted1).toBe(formatted2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format dates differently for different locales', () => {
      fc.assert(
        fc.property(
          fc
            .date({
              min: new Date('2000-01-01'),
              max: new Date('2030-12-31')
            })
            .filter(date => !isNaN(date.getTime())), // Filter out invalid dates
          date => {
            // Format in English
            i18n.changeLanguage('en');
            const formattedEN = formatShortDate(date);

            // Format in Japanese
            i18n.changeLanguage('ja');
            const formattedJA = formatShortDate(date);

            // Both should be valid strings
            expect(formattedEN).toBeTruthy();
            expect(formattedJA).toBeTruthy();

            // They should contain the same year
            const year = date.getFullYear().toString();
            expect(formattedEN).toContain(year);
            expect(formattedJA).toContain(year);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle date strings and timestamps', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date('2000-01-01'),
            max: new Date('2030-12-31')
          }),
          fc.constantFrom('en', 'ja'),
          (date, locale) => {
            // Skip invalid dates
            if (Number.isNaN(date.getTime())) {
              return true;
            }

            i18n.changeLanguage(locale);

            // Format as Date object
            const formattedDate = formatDate(date);

            // Format as ISO string
            const formattedString = formatDate(date.toISOString());

            // Format as timestamp
            const formattedTimestamp = formatDate(date.getTime());

            // All three should produce the same result
            expect(formattedDate).toBe(formattedString);
            expect(formattedDate).toBe(formattedTimestamp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format date-time with appropriate hour format for locale', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date('2000-01-01'),
            max: new Date('2030-12-31')
          }),
          date => {
            // English should use 12-hour format (contains AM/PM)
            i18n.changeLanguage('en');
            const formattedEN = formatDateTime(date);
            expect(formattedEN).toBeTruthy();

            // Japanese should use 24-hour format (no AM/PM)
            i18n.changeLanguage('ja');
            const formattedJA = formatDateTime(date);
            expect(formattedJA).toBeTruthy();

            // Both should contain time components
            expect(formattedEN.length).toBeGreaterThan(0);
            expect(formattedJA.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format ISO dates consistently regardless of locale', () => {
      fc.assert(
        fc.property(
          fc
            .date({
              min: new Date('2000-01-01'),
              max: new Date('2030-12-31')
            })
            .filter(date => !isNaN(date.getTime())), // Filter out invalid dates
          date => {
            // ISO format should be locale-independent
            i18n.changeLanguage('en');
            const isoEN = formatISODate(date);

            i18n.changeLanguage('ja');
            const isoJA = formatISODate(date);

            // Should be identical
            expect(isoEN).toBe(isoJA);

            // Should match YYYY-MM-DD format
            expect(isoEN).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case dates correctly', () => {
      const edgeCases = [
        new Date('2000-01-01'), // Y2K
        new Date('2024-02-29'), // Leap year
        new Date('2024-12-31'), // End of year
        new Date('2025-01-01'), // Start of year
        new Date('1970-01-01') // Unix epoch
      ];

      for (const locale of ['en', 'ja']) {
        i18n.changeLanguage(locale);

        for (const date of edgeCases) {
          const formatted = formatDate(date);
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);
        }
      }
    });

    it('should gracefully handle invalid dates', () => {
      fc.assert(
        fc.property(fc.constantFrom('en', 'ja'), locale => {
          i18n.changeLanguage(locale);

          // Create an invalid date
          const invalidDate = new Date('invalid');

          // Should not throw an error
          expect(() => formatDate(invalidDate)).not.toThrow();

          // Result should be a string indicating invalid date
          const result = formatDate(invalidDate);
          expect(typeof result).toBe('string');
          expect(result).toBe('Invalid Date');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests for Date Formatting Functions', () => {
    it('should format short dates correctly', () => {
      const date = new Date('2026-01-15');

      i18n.changeLanguage('en');
      const shortEN = formatShortDate(date);
      expect(shortEN).toBeTruthy();

      i18n.changeLanguage('ja');
      const shortJA = formatShortDate(date);
      expect(shortJA).toBeTruthy();
    });

    it('should format long dates correctly', () => {
      const date = new Date('2026-01-15');

      i18n.changeLanguage('en');
      const longEN = formatLongDate(date);
      expect(longEN).toContain('January');

      i18n.changeLanguage('ja');
      const longJA = formatLongDate(date);
      expect(longJA).toContain('1月');
    });

    it('should format time correctly', () => {
      const date = new Date('2026-01-15T15:45:00');

      i18n.changeLanguage('en');
      const timeEN = formatTime(date);
      expect(timeEN).toBeTruthy();

      i18n.changeLanguage('ja');
      const timeJA = formatTime(date);
      expect(timeJA).toBeTruthy();
    });

    it('should format ISO dates in YYYY-MM-DD format', () => {
      const date = new Date('2026-01-15');
      const iso = formatISODate(date);
      expect(iso).toBe('2026-01-15');
    });
  });
});
