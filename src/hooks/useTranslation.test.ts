import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import fc from 'fast-check';

/**
 * Feature: internationalization, Property 5: Translation Interpolation
 *
 * For any translation with variables, when providing values for those variables,
 * the returned string should contain the interpolated values in the correct positions.
 *
 * Validates: Requirements 3.3
 */

// Mock localStorage for testing
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

describe('Property 5: Translation Interpolation', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('../lib/i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should interpolate single variable correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (locale, name) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test interpolation with welcome message
          const translation = i18n.t('common:messages.welcome', { name });

          // Should contain the interpolated name
          expect(translation).toContain(name);
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should interpolate multiple variables correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 1, maxLength: 15 }),
        fc.string({ minLength: 1, maxLength: 15 }),
        async (locale, firstName, lastName) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test interpolation with greeting message
          const translation = i18n.t('common:messages.greeting', { firstName, lastName });

          // Should contain both interpolated values
          expect(translation).toContain(firstName);
          expect(translation).toContain(lastName);
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle interpolation with special characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (locale, name) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with special characters
          const translation = i18n.t('common:messages.welcome', { name });

          // Should still contain the name even with special characters
          expect(translation).toContain(name);
          expect(typeof translation).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should interpolate numeric values correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: 0, max: 1000 }),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test interpolation with count
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should contain the count value
          expect(translation).toContain(count.toString());
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle mixed string and numeric interpolation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: 1, max: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (locale, count, author) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test interpolation with both count and author
          const translation = i18n.t('common:messages.notesByUser', { count, author });

          // Should contain both values
          expect(translation).toContain(count.toString());
          expect(translation).toContain(author);
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain interpolation consistency across languages', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 20 }), async name => {
        const { default: i18n } = await import('../lib/i18n');

        // Test in English
        await i18n.changeLanguage('en');
        const enTranslation = i18n.t('common:messages.welcome', { name });

        // Test in Japanese
        await i18n.changeLanguage('ja');
        const jaTranslation = i18n.t('common:messages.welcome', { name });

        // Both should contain the name
        expect(enTranslation).toContain(name);
        expect(jaTranslation).toContain(name);

        // Translations should be different (different languages)
        expect(enTranslation).not.toBe(jaTranslation);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle empty string interpolation', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        const { default: i18n } = await import('../lib/i18n');

        await i18n.changeLanguage(locale);

        // Test with empty string
        const translation = i18n.t('common:messages.welcome', { name: '' });

        // Should still return a valid string
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle missing interpolation variables gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        const { default: i18n } = await import('../lib/i18n');

        await i18n.changeLanguage(locale);

        // Test without providing the required variable
        const translation = i18n.t('common:messages.welcome');

        // Should still return a string (i18next handles missing variables)
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should preserve interpolation order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        // Generate strings that are unlikely to appear in the template text
        fc.string({ minLength: 3, maxLength: 15 }).filter(s => {
          const trimmed = s.trim();
          // Avoid strings that might appear in "Hello" or common words
          return (
            trimmed.length >= 3 &&
            !trimmed.toLowerCase().includes('hello') &&
            !trimmed.toLowerCase().includes('こんにちは')
          );
        }),
        fc.string({ minLength: 3, maxLength: 15 }).filter(s => {
          const trimmed = s.trim();
          return (
            trimmed.length >= 3 &&
            !trimmed.toLowerCase().includes('hello') &&
            !trimmed.toLowerCase().includes('こんにちは')
          );
        }),
        async (locale, firstName, lastName) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test that variables appear in the correct order
          const translation = i18n.t('common:messages.greeting', { firstName, lastName });

          // Find positions of the interpolated values
          const firstNameIndex = translation.indexOf(firstName);
          const lastNameIndex = translation.indexOf(lastName);

          // Both should be found
          expect(firstNameIndex).toBeGreaterThanOrEqual(0);
          expect(lastNameIndex).toBeGreaterThanOrEqual(0);

          // For English, firstName should come before lastName (unless they're the same)
          if (locale === 'en' && firstName !== lastName) {
            expect(firstNameIndex).toBeLessThan(lastNameIndex);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle interpolation with whitespace', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (locale, name) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with whitespace in the value
          const nameWithSpaces = `  ${name}  `;
          const translation = i18n.t('common:messages.welcome', { name: nameWithSpaces });

          // Should contain the name (with or without trimming)
          expect(translation).toContain(name);
          expect(typeof translation).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 9: Pluralization Support
 *
 * For any translation with pluralization rules and any count value, the returned string
 * should use the correct plural form according to the language's pluralization rules.
 *
 * Validates: Requirements 3.4
 */
describe('Property 9: Pluralization Support', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('../lib/i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should use singular form for count of 1', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        const { default: i18n } = await import('../lib/i18n');

        await i18n.changeLanguage(locale);

        // Test with count = 1
        const translation = i18n.t('common:messages.itemCount', { count: 1 });

        // Should contain "1"
        expect(translation).toContain('1');
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);

        // For English, should use singular form "item"
        if (locale === 'en') {
          expect(translation).toContain('item');
          expect(translation).not.toContain('items');
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should use plural form for count greater than 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: 2, max: 1000 }),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with count > 1
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should contain the count
          expect(translation).toContain(count.toString());
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);

          // For English, should use plural form "items"
          if (locale === 'en') {
            expect(translation).toContain('items');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle count of 0 correctly', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        const { default: i18n } = await import('../lib/i18n');

        await i18n.changeLanguage(locale);

        // Test with count = 0
        const translation = i18n.t('common:messages.itemCount', { count: 0 });

        // Should contain "0"
        expect(translation).toContain('0');
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);

        // For English, 0 uses plural form "items"
        if (locale === 'en') {
          expect(translation).toContain('items');
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should handle pluralization with additional variables', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: 1, max: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (locale, count, author) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test pluralization with additional interpolation
          const translation = i18n.t('common:messages.notesByUser', { count, author });

          // Should contain both values
          expect(translation).toContain(count.toString());
          expect(translation).toContain(author);
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);

          // For English, check plural form based on count
          if (locale === 'en') {
            if (count === 1) {
              expect(translation).toContain('note');
            } else {
              expect(translation).toContain('notes');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain pluralization consistency across language changes', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 100 }), async count => {
        const { default: i18n } = await import('../lib/i18n');

        // Test in English
        await i18n.changeLanguage('en');
        const enTranslation = i18n.t('common:messages.itemCount', { count });

        // Test in Japanese
        await i18n.changeLanguage('ja');
        const jaTranslation = i18n.t('common:messages.itemCount', { count });

        // Both should contain the count
        expect(enTranslation).toContain(count.toString());
        expect(jaTranslation).toContain(count.toString());

        // Both should be valid strings
        expect(typeof enTranslation).toBe('string');
        expect(typeof jaTranslation).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  test('should handle edge case counts correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom(0, 1, 2, 10, 100, 1000),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with edge case counts
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should contain the count
          expect(translation).toContain(count.toString());
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should apply correct pluralization rules for each language', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 100 }), async count => {
        const { default: i18n } = await import('../lib/i18n');

        // English pluralization rules
        await i18n.changeLanguage('en');
        const enTranslation = i18n.t('common:messages.itemCount', { count });

        // English: 1 is singular, everything else is plural
        if (count === 1) {
          expect(enTranslation).toContain('item');
          expect(enTranslation).not.toContain('items');
        } else {
          expect(enTranslation).toContain('items');
        }

        // Japanese doesn't have plural forms in the same way
        // but should still handle the count correctly
        await i18n.changeLanguage('ja');
        const jaTranslation = i18n.t('common:messages.itemCount', { count });
        expect(jaTranslation).toContain(count.toString());
      }),
      { numRuns: 100 }
    );
  });

  test('should handle large count values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: 1000, max: 1000000 }),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with large counts
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should contain the count
          expect(translation).toContain(count.toString());
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle negative counts gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.integer({ min: -100, max: -1 }),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with negative counts (edge case)
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should still return a valid string
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle decimal counts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.float({ min: 0, max: 100, noNaN: true }),
        async (locale, count) => {
          const { default: i18n } = await import('../lib/i18n');

          await i18n.changeLanguage(locale);

          // Test with decimal counts
          const translation = i18n.t('common:messages.itemCount', { count });

          // Should still return a valid string
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
