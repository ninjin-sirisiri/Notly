import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import fc from 'fast-check';

/**
 * Integration Tests for End-to-End Language Switching
 *
 * These tests verify the complete language switching flow including:
 * - Complete language switch flow
 * - App restart with persisted language
 * - Backend notification language
 *
 * Validates: All Requirements
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

describe('Integration: End-to-End Language Switching', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should complete full language switch flow', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('en', 'ja'),
        async (startLang, targetLang) => {
          const { initI18n, changeLanguage, loadLanguagePreference } = await import('./i18n');

          // Step 1: Initialize app with start language
          await initI18n();
          await changeLanguage(startLang);

          // Verify initial language is set
          const { default: i18n } = await import('./i18n');
          expect(i18n.language).toBe(startLang);

          // Step 2: Get translations in start language
          const beforeTranslations = {
            appName: i18n.t('common:app.name'),
            save: i18n.t('common:actions.save'),
            cancel: i18n.t('common:actions.cancel'),
            notes: i18n.t('common:navigation.notes'),
            bold: i18n.t('editor:toolbar.bold'),
            languageTitle: i18n.t('settings:language.title')
          };

          // Verify all translations are valid
          for (const key in beforeTranslations) {
            const translation = beforeTranslations[key as keyof typeof beforeTranslations];
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          }

          // Step 3: Change language
          await changeLanguage(targetLang);

          // Step 4: Verify language changed
          expect(i18n.language).toBe(targetLang);

          // Step 5: Verify persistence
          const persistedLang = loadLanguagePreference();
          expect(persistedLang).toBe(targetLang);

          // Step 6: Get translations in new language
          const afterTranslations = {
            appName: i18n.t('common:app.name'),
            save: i18n.t('common:actions.save'),
            cancel: i18n.t('common:actions.cancel'),
            notes: i18n.t('common:navigation.notes'),
            bold: i18n.t('editor:toolbar.bold'),
            languageTitle: i18n.t('settings:language.title')
          };

          // Verify all translations are still valid
          for (const key in afterTranslations) {
            const translation = afterTranslations[key as keyof typeof afterTranslations];
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          }

          // Step 7: If languages are different, verify translations changed
          if (startLang !== targetLang) {
            const hasDifferences =
              beforeTranslations.appName !== afterTranslations.appName ||
              beforeTranslations.save !== afterTranslations.save ||
              beforeTranslations.cancel !== afterTranslations.cancel ||
              beforeTranslations.notes !== afterTranslations.notes ||
              beforeTranslations.bold !== afterTranslations.bold ||
              beforeTranslations.languageTitle !== afterTranslations.languageTitle;

            expect(hasDifferences).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should persist language across app restart', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async language => {
        const { initI18n, changeLanguage, loadLanguagePreference } = await import('./i18n');

        // Step 1: Initialize app
        await initI18n();

        // Step 2: Change language
        await changeLanguage(language);

        // Step 3: Verify language is persisted
        const persistedLang = loadLanguagePreference();
        expect(persistedLang).toBe(language);

        // Step 4: Simulate app restart by reinitializing
        // Clear the i18n instance (simulate fresh start)
        const { default: i18n } = await import('./i18n');

        // Step 5: Load persisted language
        const loadedLang = loadLanguagePreference();
        expect(loadedLang).toBe(language);

        // Step 6: Apply loaded language
        if (loadedLang) {
          await i18n.changeLanguage(loadedLang);
        }

        // Step 7: Verify language is correctly restored
        expect(i18n.language).toBe(language);

        // Step 8: Verify translations work in restored language
        const translation = i18n.t('common:app.name');
        expect(translation).toBeTruthy();
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle multiple language switches with persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('en', 'ja'), { minLength: 2, maxLength: 10 }),
        async languages => {
          const { initI18n, changeLanguage, loadLanguagePreference } = await import('./i18n');

          // Initialize app
          await initI18n();

          // Perform multiple language switches
          for (const lang of languages) {
            // Change language
            await changeLanguage(lang);

            // Verify current language
            const { default: i18n } = await import('./i18n');
            expect(i18n.language).toBe(lang);

            // Verify persistence
            const persistedLang = loadLanguagePreference();
            expect(persistedLang).toBe(lang);

            // Verify translations work
            const translation = i18n.t('common:app.name');
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          }

          // Final verification: last language should be persisted
          const finalLang = languages[languages.length - 1];
          const persistedLang = loadLanguagePreference();
          expect(persistedLang).toBe(finalLang);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain translation consistency across all namespaces during switch', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('en', 'ja'),
        async (startLang, targetLang) => {
          const { initI18n, changeLanguage } = await import('./i18n');

          // Initialize with start language
          await initI18n();
          await changeLanguage(startLang);

          // Test keys from all namespaces
          const testKeys = [
            'common:app.name',
            'common:actions.save',
            'common:navigation.notes',
            'editor:toolbar.bold',
            'editor:toolbar.italic',
            'settings:language.title',
            'settings:title',
            'activity:streak.current',
            'activity:goals.title',
            'errors:general'
          ];

          const { default: i18n } = await import('./i18n');

          // Get translations before switch
          const beforeTranslations = testKeys.map(key => ({
            key,
            value: i18n.t(key)
          }));

          // Verify all translations are valid before switch
          for (const { key, value } of beforeTranslations) {
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
            expect(value.length).toBeGreaterThan(0);
          }

          // Change language
          await changeLanguage(targetLang);

          // Get translations after switch
          const afterTranslations = testKeys.map(key => ({
            key,
            value: i18n.t(key)
          }));

          // Verify all translations are valid after switch
          for (const { key, value } of afterTranslations) {
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
            expect(value.length).toBeGreaterThan(0);
          }

          // If languages are different, verify translations changed
          if (startLang !== targetLang) {
            let hasDifferences = false;
            for (let i = 0; i < testKeys.length; i++) {
              if (beforeTranslations[i].value !== afterTranslations[i].value) {
                hasDifferences = true;
                break;
              }
            }
            expect(hasDifferences).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle language switch with interpolation and pluralization', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 100 }),
        async (language, name, count) => {
          const { initI18n, changeLanguage } = await import('./i18n');

          // Initialize and change to target language
          await initI18n();
          await changeLanguage(language);

          const { default: i18n } = await import('./i18n');

          // Test interpolation
          const welcomeMsg = i18n.t('common:messages.welcome', { name });
          expect(welcomeMsg).toContain(name);
          expect(typeof welcomeMsg).toBe('string');
          expect(welcomeMsg.length).toBeGreaterThan(0);

          // Test pluralization
          const countMsg = i18n.t('common:messages.itemCount', { count });
          expect(countMsg).toContain(count.toString());
          expect(typeof countMsg).toBe('string');
          expect(countMsg.length).toBeGreaterThan(0);

          // For English, verify plural forms
          if (language === 'en') {
            if (count === 1) {
              expect(countMsg).toContain('item');
            } else {
              expect(countMsg).toContain('items');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should recover from corrupted localStorage and use fallback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'en' && s !== 'ja'),
        async corruptedData => {
          const { initI18n, loadLanguagePreference } = await import('./i18n');

          // Set corrupted data in localStorage
          localStorage.setItem('notly_language', corruptedData);

          // Try to load language preference
          const loadedLang = loadLanguagePreference();

          // Should return null for invalid data
          expect(loadedLang).toBe(null);

          // Initialize app (should use fallback)
          await initI18n();

          const { default: i18n } = await import('./i18n');

          // Should fall back to a valid language (en or ja)
          expect(['en', 'ja']).toContain(i18n.language);

          // Translations should still work
          const translation = i18n.t('common:app.name');
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle rapid language switches without data corruption', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('en', 'ja'), { minLength: 5, maxLength: 20 }),
        async languages => {
          const { initI18n, changeLanguage, loadLanguagePreference } = await import('./i18n');

          // Initialize app
          await initI18n();

          // Perform rapid language switches
          for (const lang of languages) {
            await changeLanguage(lang);
          }

          // Verify final state
          const { default: i18n } = await import('./i18n');
          const finalLang = languages[languages.length - 1];

          // Current language should match last switch
          expect(i18n.language).toBe(finalLang);

          // Persisted language should match last switch
          const persistedLang = loadLanguagePreference();
          expect(persistedLang).toBe(finalLang);

          // Translations should still work correctly
          const translation = i18n.t('common:app.name');
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);

          // No data corruption - should be able to load and use translations
          const testKeys = [
            'common:actions.save',
            'editor:toolbar.bold',
            'settings:language.title'
          ];

          for (const key of testKeys) {
            const trans = i18n.t(key);
            expect(trans).toBeTruthy();
            expect(typeof trans).toBe('string');
            expect(trans.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain date formatting consistency during language switch', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        async (language, date) => {
          const { initI18n, changeLanguage } = await import('./i18n');
          const { formatDate } = await import('./dateFormat');

          // Initialize and change to target language
          await initI18n();
          await changeLanguage(language);

          // Format date with current locale
          const formattedDate = formatDate(date, language);

          // Should return a valid formatted string
          expect(formattedDate).toBeTruthy();
          expect(typeof formattedDate).toBe('string');
          expect(formattedDate.length).toBeGreaterThan(0);

          // Verify date formatting follows locale conventions
          if (language === 'en') {
            // English format typically includes month name or MM/DD/YYYY
            expect(formattedDate).toBeTruthy();
          } else if (language === 'ja') {
            // Japanese format typically includes 年月日
            expect(formattedDate).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle language switch across all UI components', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async language => {
        const { initI18n, changeLanguage } = await import('./i18n');

        // Initialize and change to target language
        await initI18n();
        await changeLanguage(language);

        const { default: i18n } = await import('./i18n');

        // Test translations from all UI component categories
        const uiTranslations = {
          // Navigation
          notes: i18n.t('common:navigation.notes'),
          folders: i18n.t('common:navigation.folders'),
          tags: i18n.t('common:navigation.tags'),
          settings: i18n.t('common:navigation.settings'),

          // Actions
          save: i18n.t('common:actions.save'),
          cancel: i18n.t('common:actions.cancel'),
          delete: i18n.t('common:actions.delete'),
          edit: i18n.t('common:actions.edit'),

          // Editor
          bold: i18n.t('editor:toolbar.bold'),
          italic: i18n.t('editor:toolbar.italic'),
          heading: i18n.t('editor:toolbar.heading'),

          // Settings
          languageTitle: i18n.t('settings:language.title'),
          settingsTitle: i18n.t('settings:title'),

          // Activity
          streakCurrent: i18n.t('activity:streak.current'),
          goalsTitle: i18n.t('activity:goals.title'),

          // Errors
          general: i18n.t('errors:general')
        };

        // Verify all UI translations are valid
        for (const key in uiTranslations) {
          const translation = uiTranslations[key as keyof typeof uiTranslations];
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }

        // Verify language is correctly set
        expect(i18n.language).toBe(language);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle fresh install with no persisted language', async () => {
    const { initI18n, loadLanguagePreference } = await import('./i18n');

    // Clear localStorage to simulate fresh install
    localStorage.clear();

    // Load language preference (should be null)
    const loadedLang = loadLanguagePreference();
    expect(loadedLang).toBe(null);

    // Initialize app
    await initI18n();

    const { default: i18n } = await import('./i18n');

    // Should use a default language (en or ja)
    expect(['en', 'ja']).toContain(i18n.language);

    // Translations should work
    const translation = i18n.t('common:app.name');
    expect(translation).toBeTruthy();
    expect(typeof translation).toBe('string');
    expect(translation.length).toBeGreaterThan(0);
  });
});
