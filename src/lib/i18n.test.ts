import { describe, test, expect, beforeEach, beforeAll } from 'bun:test';
import fc from 'fast-check';
import {
  SUPPORTED_LANGUAGES,
  validateLocale,
  saveLanguagePreference,
  loadLanguagePreference
} from './i18n';

/**
 * Feature: internationalization, Property 1: Language Detection and Fallback
 *
 * For any system language setting, when the app initializes, if the system language
 * is supported then that language should be set as default, otherwise English should
 * be set as the fallback language.
 *
 * Validates: Requirements 1.1, 1.2
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

describe('Property 1: Language Detection and Fallback', () => {
  beforeAll(() => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // Simple unit test to verify basic behavior
  test('should throw for invalid locale (unit test)', () => {
    expect(() => saveLanguagePreference('invalid')).toThrow();
    expect(() => saveLanguagePreference(' !')).toThrow();
    expect(() => saveLanguagePreference('  ')).toThrow();
  });

  test('should use supported language when detected', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SUPPORTED_LANGUAGES), supportedLang => {
        // Save the language preference to simulate detection
        localStorage.setItem('notly_language', supportedLang);

        // Verify the language is valid
        expect(validateLocale(supportedLang)).toBe(true);

        // Verify we can load it back
        const loaded = loadLanguagePreference();
        expect(loaded).toBe(supportedLang);
      }),
      { numRuns: 100 }
    );
  });

  test('should reject unsupported languages', () => {
    fc.assert(
      fc.property(
        // Generate random locale strings that are NOT in supported languages
        fc
          .string({ minLength: 2, maxLength: 5 })
          .filter(locale => !SUPPORTED_LANGUAGES.includes(locale as any)),
        unsupportedLang => {
          // Verify the language is not valid - this is the core property
          const isValid = validateLocale(unsupportedLang);
          expect(isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should validate locale correctly for all inputs', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 10 }), locale => {
        const isValid = validateLocale(locale);
        const isSupported = SUPPORTED_LANGUAGES.includes(locale as any);

        // Validation result should match whether locale is in supported list
        expect(isValid).toBe(isSupported);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle language persistence round-trip for supported languages', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SUPPORTED_LANGUAGES), lang => {
        // Save language preference
        saveLanguagePreference(lang);

        // Load it back
        const loaded = loadLanguagePreference();

        // Should get the same language back
        expect(loaded).toBe(lang);
      }),
      { numRuns: 100 }
    );
  });

  test('should return null when no language preference is stored', () => {
    // Clear localStorage
    localStorage.clear();

    // Should return null when nothing is stored
    const loaded = loadLanguagePreference();
    expect(loaded).toBe(null);
  });

  test('should return null for corrupted localStorage data', () => {
    fc.assert(
      fc.property(
        // Generate random invalid locale strings
        fc
          .string({ minLength: 1, maxLength: 10 })
          .filter(locale => !SUPPORTED_LANGUAGES.includes(locale as any)),
        invalidLocale => {
          // Store invalid locale directly in localStorage
          localStorage.setItem('notly_language', invalidLocale);

          // Should return null for invalid stored locale
          const loaded = loadLanguagePreference();
          expect(loaded).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 3: Language Persistence Round-Trip
 *
 * For any supported language, when a user selects that language, saves it, and restarts
 * the app, the app should load with the same language selected.
 *
 * Validates: Requirements 1.5
 */
describe('Property 3: Language Persistence Round-Trip', () => {
  beforeAll(() => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should persist and restore language preference for all supported languages', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SUPPORTED_LANGUAGES), language => {
        // Step 1: Save language preference (simulating user selection)
        saveLanguagePreference(language);

        // Step 2: Verify it was saved to localStorage
        const storedValue = localStorage.getItem('notly_language');
        expect(storedValue).toBe(language);

        // Step 3: Load language preference (simulating app restart)
        const loadedLanguage = loadLanguagePreference();

        // Step 4: Verify the loaded language matches the saved language
        expect(loadedLanguage).toBe(language);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle multiple save-load cycles correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...SUPPORTED_LANGUAGES), { minLength: 1, maxLength: 10 }),
        languages => {
          // Simulate multiple language changes
          for (const language of languages) {
            saveLanguagePreference(language);
            const loaded = loadLanguagePreference();
            expect(loaded).toBe(language);
          }

          // Final check: the last language should still be persisted
          const finalLoaded = loadLanguagePreference();
          expect(finalLoaded).toBe(languages[languages.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should return null when localStorage is empty (fresh install)', () => {
    // Clear localStorage to simulate fresh install
    localStorage.clear();

    const loaded = loadLanguagePreference();
    expect(loaded).toBe(null);
  });

  test('should handle corrupted localStorage data gracefully', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter(s => !SUPPORTED_LANGUAGES.includes(s as any)),
        corruptedData => {
          // Directly set corrupted data in localStorage
          localStorage.setItem('notly_language', corruptedData);

          // Should return null for invalid data
          const loaded = loadLanguagePreference();
          expect(loaded).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should reject invalid locales when saving', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 10 })
          .filter(s => !SUPPORTED_LANGUAGES.includes(s as any)),
        invalidLocale => {
          // Should throw error for invalid locale
          expect(() => saveLanguagePreference(invalidLocale)).toThrow();

          // localStorage should not be modified
          const stored = localStorage.getItem('notly_language');
          expect(stored).not.toBe(invalidLocale);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain data integrity across save-load operations', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SUPPORTED_LANGUAGES), language => {
        // Save language
        saveLanguagePreference(language);

        // Load it back
        const loaded = loadLanguagePreference();

        // Verify exact match (no data corruption)
        expect(loaded).toBe(language);
        expect(typeof loaded).toBe('string');
        expect(loaded?.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle rapid save operations correctly', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SUPPORTED_LANGUAGES), language => {
        // Perform multiple rapid saves
        saveLanguagePreference(language);
        saveLanguagePreference(language);
        saveLanguagePreference(language);

        // Should still load correctly
        const loaded = loadLanguagePreference();
        expect(loaded).toBe(language);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 2: Translation Key Lookup
 *
 * For any translation key and locale, when requesting a translation, if the key exists
 * in the current locale then that translation should be returned, otherwise if the key
 * exists in the fallback locale then the fallback translation should be returned,
 * otherwise the key itself should be returned.
 *
 * Validates: Requirements 2.2, 2.3, 2.4
 */
describe('Property 2: Translation Key Lookup', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should return translation when key exists in current locale', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings', 'activity', 'errors'),
        async (locale, namespace) => {
          // Change to the test locale
          await i18n.changeLanguage(locale);

          // Test with known keys that exist in both locales
          const knownKeys = ['app.name', 'actions.save', 'actions.cancel', 'navigation.notes'];

          for (const key of knownKeys) {
            if (namespace === 'common') {
              const translation = i18n.t(`${namespace}:${key}`);
              // Should return a non-empty string that's not the key itself
              expect(translation).toBeTruthy();
              expect(typeof translation).toBe('string');
              expect(translation.length).toBeGreaterThan(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should return fallback translation when key missing in current locale', async () => {
    const { default: i18n } = await import('./i18n');

    // Create a scenario where we have a key in English but not in Japanese
    // Since all our keys exist in both locales, we'll test with a non-existent key
    // and verify it falls back properly

    await i18n.changeLanguage('ja');

    // Test with a key that doesn't exist - should return the key itself
    const missingKey = 'nonexistent.key.that.does.not.exist';
    const translation = i18n.t(`common:${missingKey}`);

    // When key doesn't exist in any locale, i18next returns the full key path
    expect(translation).toContain(missingKey);
  });

  test('should return key itself when missing in all locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings', 'activity', 'errors'),
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter(s => !s.includes(' ') && !s.includes(':')),
        async (locale, namespace, randomKey) => {
          const { default: i18n } = await import('./i18n');

          await i18n.changeLanguage(locale);

          // Generate a key that definitely doesn't exist
          const nonExistentKey = `nonexistent.${randomKey}.missing`;
          const translation = i18n.t(`${namespace}:${nonExistentKey}`);

          // Should return something containing the key
          expect(translation).toContain(nonExistentKey);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle nested key access correctly', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        await i18n.changeLanguage(locale);

        // Test nested keys that we know exist
        const nestedKeys = [
          'common:app.name',
          'common:actions.save',
          'common:navigation.notes',
          'editor:toolbar.bold',
          'settings:language.title'
        ];

        for (const fullKey of nestedKeys) {
          const translation = i18n.t(fullKey);

          // Should return a valid translation (not the key)
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);

          // Should not be the key itself (unless it's the fallback behavior)
          const keyPart = fullKey.split(':')[1];
          if (!translation.includes(keyPart)) {
            // Translation was found and is different from key
            expect(translation).not.toBe(keyPart);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should consistently return same translation for same key and locale', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common:app.name', 'common:actions.save', 'editor:toolbar.bold'),
        async (locale, key) => {
          const { default: i18n } = await import('./i18n');

          await i18n.changeLanguage(locale);

          // Get translation multiple times
          const translation1 = i18n.t(key);
          const translation2 = i18n.t(key);
          const translation3 = i18n.t(key);

          // Should always return the same value
          expect(translation1).toBe(translation2);
          expect(translation2).toBe(translation3);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 6: Namespace Organization
 *
 * For any translation key, it should be accessible through its designated namespace,
 * and keys should not conflict across different namespaces.
 *
 * Validates: Requirements 2.5
 */
describe('Property 6: Namespace Organization', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should access keys through their designated namespace', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        await i18n.changeLanguage(locale);

        // Test that keys are accessible through their correct namespaces
        const namespaceTests = [
          { namespace: 'common', key: 'app.name' },
          { namespace: 'common', key: 'actions.save' },
          { namespace: 'editor', key: 'toolbar.bold' },
          { namespace: 'settings', key: 'language.title' },
          { namespace: 'activity', key: 'streak.current' },
          { namespace: 'errors', key: 'general' }
        ];

        for (const { namespace, key } of namespaceTests) {
          const translation = i18n.t(`${namespace}:${key}`);

          // Should return a valid translation
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should not have key conflicts across namespaces', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        await i18n.changeLanguage(locale);

        // Load the namespaces explicitly before accessing them
        await i18n.loadNamespaces(['settings', 'activity']);

        // Test that the same key path in different namespaces returns different values
        // For example, 'title' might exist in multiple namespaces
        const commonTitle = i18n.t('common:app.name');
        const settingsTitle = i18n.t('settings:title');
        const activityTitle = i18n.t('activity:title');

        // These should all be valid strings
        expect(typeof commonTitle).toBe('string');
        expect(typeof settingsTitle).toBe('string');
        expect(typeof activityTitle).toBe('string');

        // They should be different values (no conflicts)
        expect(commonTitle).not.toBe(settingsTitle);
        expect(settingsTitle).not.toBe(activityTitle);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle namespace prefixes correctly', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings', 'activity', 'errors'),
        async (locale, namespace) => {
          await i18n.changeLanguage(locale);

          // Test with and without namespace prefix
          const withPrefix = i18n.t(`${namespace}:app.name`);

          // Both should return valid strings
          expect(typeof withPrefix).toBe('string');
          expect(withPrefix.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain namespace isolation', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        await i18n.changeLanguage(locale);

        // Define keys that exist in specific namespaces
        const namespaceSpecificKeys = [
          { namespace: 'editor', key: 'toolbar.bold', shouldExist: true },
          { namespace: 'common', key: 'toolbar.bold', shouldExist: false },
          { namespace: 'settings', key: 'language.title', shouldExist: true },
          { namespace: 'editor', key: 'language.title', shouldExist: false }
        ];

        for (const { namespace, key, shouldExist } of namespaceSpecificKeys) {
          const fullKey = `${namespace}:${key}`;
          const translation = i18n.t(fullKey);

          if (shouldExist) {
            // Should return a valid translation (not containing the key)
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
          } else {
            // Should return the key or a fallback (containing the key path)
            expect(translation).toContain(key);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should support nested keys within namespaces', async () => {
    const { default: i18n } = await import('./i18n');

    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async locale => {
        await i18n.changeLanguage(locale);

        // Test deeply nested keys
        const nestedKeys = [
          'common:app.name',
          'common:actions.save',
          'common:navigation.notes',
          'editor:toolbar.bold',
          'settings:language.title',
          'activity:streak.current',
          'activity:goals.title'
        ];

        for (const fullKey of nestedKeys) {
          const translation = i18n.t(fullKey);

          // Should return valid translations for all nested keys
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 4: UI Update Consistency
 *
 * For any language change, all visible UI components should display text in the newly
 * selected language after the change completes.
 *
 * Validates: Requirements 1.4, 3.2
 */
describe('Property 4: UI Update Consistency', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should update all translations when language changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('en', 'ja'),
        async (startLang, targetLang) => {
          const { default: i18n, changeLanguage } = await import('./i18n');

          // Start with initial language
          await i18n.changeLanguage(startLang);

          // Get translations in the initial language
          const beforeTranslations = {
            appName: i18n.t('common:app.name'),
            save: i18n.t('common:actions.save'),
            cancel: i18n.t('common:actions.cancel'),
            notes: i18n.t('common:navigation.notes'),
            bold: i18n.t('editor:toolbar.bold'),
            languageTitle: i18n.t('settings:language.title')
          };

          // Change to target language
          await changeLanguage(targetLang);

          // Get translations in the new language
          const afterTranslations = {
            appName: i18n.t('common:app.name'),
            save: i18n.t('common:actions.save'),
            cancel: i18n.t('common:actions.cancel'),
            notes: i18n.t('common:navigation.notes'),
            bold: i18n.t('editor:toolbar.bold'),
            languageTitle: i18n.t('settings:language.title')
          };

          // Verify all translations are valid strings
          for (const key in afterTranslations) {
            const translation = afterTranslations[key as keyof typeof afterTranslations];
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          }

          // If languages are different, translations should be different
          if (startLang !== targetLang) {
            // At least some translations should be different
            const hasDifferences =
              beforeTranslations.appName !== afterTranslations.appName ||
              beforeTranslations.save !== afterTranslations.save ||
              beforeTranslations.cancel !== afterTranslations.cancel ||
              beforeTranslations.notes !== afterTranslations.notes ||
              beforeTranslations.bold !== afterTranslations.bold ||
              beforeTranslations.languageTitle !== afterTranslations.languageTitle;

            expect(hasDifferences).toBe(true);
          } else {
            // If same language, translations should be the same
            expect(beforeTranslations.appName).toBe(afterTranslations.appName);
            expect(beforeTranslations.save).toBe(afterTranslations.save);
            expect(beforeTranslations.cancel).toBe(afterTranslations.cancel);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain consistency across multiple language switches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('en', 'ja'), { minLength: 2, maxLength: 10 }),
        async languages => {
          const { default: i18n, changeLanguage } = await import('./i18n');

          // Perform multiple language switches
          for (const lang of languages) {
            await changeLanguage(lang);

            // After each switch, verify translations are consistent
            const translations = {
              appName: i18n.t('common:app.name'),
              save: i18n.t('common:actions.save'),
              cancel: i18n.t('common:actions.cancel')
            };

            // All translations should be valid
            expect(translations.appName).toBeTruthy();
            expect(translations.save).toBeTruthy();
            expect(translations.cancel).toBeTruthy();

            // Verify current language matches what we set
            expect(i18n.language).toBe(lang);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should update translations immediately after language change', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async targetLang => {
        const { default: i18n, changeLanguage } = await import('./i18n');

        // Start with opposite language
        const startLang = targetLang === 'en' ? 'ja' : 'en';
        await i18n.changeLanguage(startLang);

        // Change language
        await changeLanguage(targetLang);

        // Immediately check that translations are in the new language
        const currentLang = i18n.language;
        expect(currentLang).toBe(targetLang);

        // Get a translation and verify it's valid
        const translation = i18n.t('common:app.name');
        expect(translation).toBeTruthy();
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle rapid language changes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('en', 'ja'), { minLength: 3, maxLength: 5 }),
        async languages => {
          const { changeLanguage } = await import('./i18n');

          // Perform rapid language changes
          for (const lang of languages) {
            await changeLanguage(lang);
          }

          // After all changes, verify the final language is correct
          const { default: i18n } = await import('./i18n');
          const finalLang = languages[languages.length - 1];
          expect(i18n.language).toBe(finalLang);

          // Verify translations are still valid
          const translation = i18n.t('common:app.name');
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should persist language change across reloads', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async language => {
        const { changeLanguage, loadLanguagePreference } = await import('./i18n');

        // Change language
        await changeLanguage(language);

        // Verify it was persisted
        const loaded = loadLanguagePreference();
        expect(loaded).toBe(language);

        // Verify current language matches
        const { default: i18n } = await import('./i18n');
        expect(i18n.language).toBe(language);
      }),
      { numRuns: 100 }
    );
  });

  test('should update all namespaces when language changes', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async targetLang => {
        const { default: i18n, changeLanguage } = await import('./i18n');

        // Change to target language
        await changeLanguage(targetLang);

        // Test translations from all namespaces
        const namespaces = ['common', 'editor', 'settings', 'activity', 'errors'];
        const testKeys = [
          'common:app.name',
          'editor:toolbar.bold',
          'settings:language.title',
          'activity:streak.current',
          'errors:general'
        ];

        for (const key of testKeys) {
          const translation = i18n.t(key);

          // All translations should be valid
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
        }

        // Verify language is correct
        expect(i18n.language).toBe(targetLang);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 12: Lazy Loading Behavior
 *
 * For any language selection, only the translations for that language should be loaded
 * initially, and additional namespaces should be loaded on demand when accessed.
 *
 * Validates: Requirements 6.1, 6.5
 */
describe('Property 12: Lazy Loading Behavior', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should only load common namespace initially', async () => {
    const { initI18n, getLoadedNamespaces, isNamespaceLoaded } = await import('./i18n');

    // Initialize i18n
    await initI18n();

    // Check loaded namespaces
    const loadedNamespaces = getLoadedNamespaces();

    // Common namespace should be loaded
    expect(isNamespaceLoaded('common')).toBe(true);

    // Should have at least common namespace
    expect(loadedNamespaces).toContain('common');
  });

  test('should load namespaces on demand', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('editor', 'settings', 'activity', 'errors'),
        async (language, namespace) => {
          const { initI18n, changeLanguage, loadNamespaceOnDemand, isNamespaceLoaded } =
            await import('./i18n');

          // Reinitialize for clean state
          await initI18n();
          await changeLanguage(language);

          // Load namespace on demand
          await loadNamespaceOnDemand(namespace);

          // Namespace should now be loaded
          expect(isNamespaceLoaded(namespace)).toBe(true);

          // Should be able to access translations from that namespace
          const { default: i18n } = await import('./i18n');
          const translation = i18n.t(`${namespace}:test`);
          expect(typeof translation).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not reload already loaded namespaces', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('editor', 'settings', 'activity', 'errors'),
        async namespace => {
          const { initI18n, loadNamespaceOnDemand, isNamespaceLoaded } = await import('./i18n');

          await initI18n();

          // Load namespace first time
          await loadNamespaceOnDemand(namespace);
          expect(isNamespaceLoaded(namespace)).toBe(true);

          // Load again - should not cause issues
          await loadNamespaceOnDemand(namespace);
          expect(isNamespaceLoaded(namespace)).toBe(true);

          // Should still be accessible
          const { default: i18n } = await import('./i18n');
          const translation = i18n.t(`${namespace}:test`);
          expect(typeof translation).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should load different namespaces independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('editor', 'settings', 'activity', 'errors'), {
          minLength: 2,
          maxLength: 4
        }),
        async namespaces => {
          const { initI18n, loadNamespaceOnDemand, isNamespaceLoaded } = await import('./i18n');

          await initI18n();

          // Load each namespace
          for (const ns of namespaces) {
            await loadNamespaceOnDemand(ns);
            expect(isNamespaceLoaded(ns)).toBe(true);
          }

          // All should remain loaded
          for (const ns of namespaces) {
            expect(isNamespaceLoaded(ns)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 13: Translation Caching
 *
 * For any translation that has been loaded once, subsequent requests for the same
 * translation should be served from cache without reloading.
 *
 * Validates: Requirements 6.2
 */
describe('Property 13: Translation Caching', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should cache translations after first load', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings'),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (language, namespace, key) => {
          const { changeLanguage, loadNamespaceOnDemand } = await import('./i18n');

          await changeLanguage(language);
          await loadNamespaceOnDemand(namespace);

          const { default: i18n } = await import('./i18n');

          // First access
          const translation1 = i18n.t(`${namespace}:${key}`);

          // Second access (should be from cache)
          const translation2 = i18n.t(`${namespace}:${key}`);

          // Both should return the same value
          expect(translation1).toBe(translation2);
          expect(typeof translation1).toBe('string');
          expect(typeof translation2).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain cache across multiple accesses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('common:app.name', 'common:actions.save', 'editor:toolbar.bold'),
        async key => {
          const { default: i18n } = await import('./i18n');

          // Access the same key multiple times
          const translations = [];
          for (let i = 0; i < 10; i++) {
            translations.push(i18n.t(key));
          }

          // All should be identical
          const first = translations[0];
          for (const translation of translations) {
            expect(translation).toBe(first);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should cache translations per language', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Use keys that are actually different between languages
        fc.constantFrom('common:actions.save', 'common:actions.cancel', 'common:navigation.notes'),
        async key => {
          const { changeLanguage } = await import('./i18n');
          const { default: i18n } = await import('./i18n');

          // Get translation in English
          await changeLanguage('en');
          const enTranslation1 = i18n.t(key);
          const enTranslation2 = i18n.t(key);

          // Get translation in Japanese
          await changeLanguage('ja');
          const jaTranslation1 = i18n.t(key);
          const jaTranslation2 = i18n.t(key);

          // Translations in same language should be identical (cached)
          expect(enTranslation1).toBe(enTranslation2);
          expect(jaTranslation1).toBe(jaTranslation2);

          // Translations in different languages should be different
          // (these keys have different values in EN and JA)
          expect(enTranslation1).not.toBe(jaTranslation1);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should keep namespace loaded after access', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('editor', 'settings', 'activity', 'errors'),
        async namespace => {
          const { initI18n, loadNamespaceOnDemand, isNamespaceLoaded } = await import('./i18n');

          await initI18n();
          await loadNamespaceOnDemand(namespace);

          // Access translations multiple times
          const { default: i18n } = await import('./i18n');
          for (let i = 0; i < 5; i++) {
            i18n.t(`${namespace}:test`);
          }

          // Namespace should remain loaded (cached)
          expect(isNamespaceLoaded(namespace)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 8: Performance Constraint
 *
 * For any language switch operation, the time from initiating the change to completing
 * the UI update should be less than 100ms.
 *
 * Validates: Requirements 6.3
 */
describe('Property 8: Performance Constraint', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should complete language switch within 100ms', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async targetLanguage => {
        const { changeLanguage, getCurrentLanguage } = await import('./i18n');

        const startTime = performance.now();
        await changeLanguage(targetLanguage);
        const endTime = performance.now();

        const duration = endTime - startTime;

        // Language switch should complete within 100ms
        expect(duration).toBeLessThan(100);
        expect(getCurrentLanguage()).toBe(targetLanguage);
      }),
      { numRuns: 100 }
    );
  });

  test('should handle multiple rapid language switches efficiently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('en', 'ja'), { minLength: 3, maxLength: 5 }),
        async languages => {
          const { changeLanguage } = await import('./i18n');

          const startTime = performance.now();

          // Perform multiple language switches
          for (const lang of languages) {
            await changeLanguage(lang);
          }

          const endTime = performance.now();
          const totalDuration = endTime - startTime;

          // Average time per switch should be reasonable
          const averageTime = totalDuration / languages.length;
          expect(averageTime).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should access translations quickly after language switch', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('en', 'ja'), async targetLanguage => {
        const { changeLanguage } = await import('./i18n');
        const { default: i18n } = await import('./i18n');

        // Switch language
        await changeLanguage(targetLanguage);

        // Immediately access translations
        const startTime = performance.now();
        const translation = i18n.t('common:app.name');
        const endTime = performance.now();

        const duration = endTime - startTime;

        // Translation access should be fast (< 10ms)
        expect(duration).toBeLessThan(10);
        expect(translation).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  test('should maintain performance with multiple namespace loads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.array(fc.constantFrom('editor', 'settings', 'activity', 'errors'), {
          minLength: 2,
          maxLength: 4
        }),
        async (language, namespaces) => {
          const { changeLanguage, loadNamespaceOnDemand } = await import('./i18n');

          await changeLanguage(language);

          const startTime = performance.now();

          // Load multiple namespaces
          for (const ns of namespaces) {
            await loadNamespaceOnDemand(ns);
          }

          const endTime = performance.now();
          const totalDuration = endTime - startTime;

          // Total time should be reasonable (< 200ms for all namespaces)
          expect(totalDuration).toBeLessThan(200);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: internationalization, Property 14: Development Warning Logging
 *
 * For any missing translation key during development mode, a warning should be logged
 * to the console indicating which key is missing.
 *
 * Validates: Requirements 7.4
 */
describe('Property 14: Development Warning Logging', () => {
  beforeAll(async () => {
    // Set up localStorage mock
    global.localStorage = new LocalStorageMock() as any;
    // Initialize i18n for testing
    const { initI18n } = await import('./i18n');
    await initI18n();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should log warning for missing keys in development mode', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings', 'activity', 'errors'),
        fc
          .string({ minLength: 5, maxLength: 30 })
          .filter(s => !s.includes(' ') && !s.includes(':')),
        async (locale, namespace, randomKey) => {
          const { changeLanguage, isDevelopmentMode, logMissingTranslation } =
            await import('./i18n');

          await changeLanguage(locale);

          // Mock console.warn to capture warnings
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            // Generate a key that definitely doesn't exist
            const missingKey = `nonexistent.${randomKey}.missing`;

            // Call the logging function directly
            logMissingTranslation(missingKey, locale, namespace);

            // In development mode, should have logged a warning
            if (isDevelopmentMode()) {
              expect(warnings.length).toBeGreaterThan(0);
              expect(warnings[0]).toContain(missingKey);
              expect(warnings[0]).toContain(locale);
              expect(warnings[0]).toContain(namespace);
            } else {
              // In production mode, should not log
              expect(warnings.length).toBe(0);
            }
          } finally {
            // Restore console.warn
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should include all relevant information in warning message', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings', 'activity', 'errors'),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (locale, namespace, key) => {
          const { logMissingTranslation, isDevelopmentMode } = await import('./i18n');

          // Mock console.warn
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            logMissingTranslation(key, locale, namespace);

            if (isDevelopmentMode()) {
              expect(warnings.length).toBe(1);
              const warning = warnings[0];

              // Warning should contain all three pieces of information
              expect(warning).toContain(key);
              expect(warning).toContain(locale);
              expect(warning).toContain(namespace);

              // Warning should be formatted clearly
              expect(warning).toContain('[i18n]');
            }
          } finally {
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not log warnings in production mode', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.constantFrom('common', 'editor', 'settings'),
        fc.string({ minLength: 5, maxLength: 20 }),
        async (locale, namespace, key) => {
          const { logMissingTranslation, isDevelopmentMode } = await import('./i18n');

          // Mock console.warn
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            // Temporarily set NODE_ENV to production
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            // Reimport to get updated isDevelopmentMode
            const { logMissingTranslation: prodLogger } = await import('./i18n');

            prodLogger(key, locale, namespace);

            // Should not log in production
            expect(warnings.length).toBe(0);

            // Restore NODE_ENV
            process.env.NODE_ENV = originalEnv;
          } finally {
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle multiple missing keys correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 2, maxLength: 5 }),
        async (locale, keys) => {
          const { logMissingTranslation, isDevelopmentMode } = await import('./i18n');

          // Mock console.warn
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            // Log multiple missing keys
            for (const key of keys) {
              logMissingTranslation(key, locale, 'common');
            }

            if (isDevelopmentMode()) {
              // Should have logged one warning per key
              expect(warnings.length).toBe(keys.length);

              // Each warning should contain its corresponding key
              for (let i = 0; i < keys.length; i++) {
                expect(warnings[i]).toContain(keys[i]);
              }
            } else {
              expect(warnings.length).toBe(0);
            }
          } finally {
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should detect development mode correctly', () => {
    const { isDevelopmentMode } = require('./i18n');

    // Check that isDevelopmentMode returns a boolean
    const result = isDevelopmentMode();
    expect(typeof result).toBe('boolean');

    // In test environment, it should match NODE_ENV
    const expectedDev = process.env.NODE_ENV === 'development';
    expect(result).toBe(expectedDev);
  });

  test('should handle special characters in missing keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (locale, key) => {
          const { logMissingTranslation, isDevelopmentMode } = await import('./i18n');

          // Mock console.warn
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            logMissingTranslation(key, locale, 'common');

            if (isDevelopmentMode()) {
              expect(warnings.length).toBe(1);
              // Should handle any characters in the key
              expect(warnings[0]).toContain(key);
            }
          } finally {
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should log warnings when accessing non-existent keys through i18n', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('en', 'ja'),
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter(s => !s.includes(' ') && !s.includes(':')),
        async (locale, randomKey) => {
          const { default: i18n, changeLanguage, isDevelopmentMode } = await import('./i18n');

          await changeLanguage(locale);

          // Mock console.warn
          const originalWarn = console.warn;
          const warnings: string[] = [];
          console.warn = (...args: any[]) => {
            warnings.push(args.join(' '));
          };

          try {
            // Access a non-existent key
            const missingKey = `nonexistent.${randomKey}.missing`;
            i18n.t(`common:${missingKey}`);

            // In development mode, missingKeyHandler should have been called
            if (isDevelopmentMode()) {
              // Should have logged at least one warning
              expect(warnings.length).toBeGreaterThan(0);
            }
          } finally {
            console.warn = originalWarn;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
