import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language storage key
const LANGUAGE_KEY = 'notly_language';

// Lazy loading function for translation resources
async function loadNamespace(lng: string, ns: string): Promise<Record<string, unknown>> {
  try {
    // Dynamic import for lazy loading
    const module = await import(`../locales/${lng}/${ns}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load namespace ${ns} for language ${lng}:`, error);
    // Return empty object as fallback
    return {};
  }
}

// Custom backend for lazy loading
const customBackend = {
  type: 'backend' as const,
  init: () => {
    // No initialization needed
  },
  read: async (
    language: string,
    namespace: string,
    callback: (error: Error | null, data: Record<string, unknown> | null) => void
  ) => {
    try {
      const data = await loadNamespace(language, namespace);
      callback(null, data);
    } catch (error) {
      callback(error as Error, null);
    }
  }
};

// Development mode detection
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Missing translation key logger
export function logMissingTranslation(key: string, locale: string, namespace: string): void {
  if (isDevelopmentMode()) {
    console.warn(
      `[i18n] Missing translation key: "${key}" | Locale: "${locale}" | Namespace: "${namespace}"`
    );
  }
}

// Initialize i18next with lazy loading
export async function initI18n(): Promise<void> {
  await i18n
    .use(customBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES,
      defaultNS: 'common',
      ns: ['common'], // Start with only common namespace
      // React already escapes values
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: LANGUAGE_KEY
      },
      react: {
        useSuspense: false
      },
      // Enable caching
      cache: {
        enabled: true
      },
      // Preload common namespace for current language
      preload: [i18n.language || 'en'],
      // Log missing keys in development
      saveMissing: isDevelopmentMode(),
      missingKeyHandler: (lngs, ns, key) => {
        logMissingTranslation(key, lngs[0], ns);
      },
      // Lazy load other namespaces
      partialBundledLanguages: true
    });

  // Preload common namespace for better initial performance
  await i18n.loadNamespaces('common');
}

// Get current language
export function getCurrentLanguage(): string {
  return i18n.language;
}

// Change language
export async function changeLanguage(lng: string): Promise<void> {
  if (!SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage)) {
    throw new Error(`Unsupported locale: ${lng}`);
  }
  await i18n.changeLanguage(lng);
  localStorage.setItem(LANGUAGE_KEY, lng);
}

// Validate locale
export function validateLocale(locale: string): boolean {
  return SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage);
}

// Save language preference
export function saveLanguagePreference(locale: string): void {
  if (!validateLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  localStorage.setItem(LANGUAGE_KEY, locale);
}

// Load language preference
export function loadLanguagePreference(): string | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && validateLocale(stored)) {
      return stored;
    }
    return null;
  } catch (error) {
    console.error('Failed to load language preference:', error);
    return null;
  }
}

// Load namespace on demand
export async function loadNamespaceOnDemand(ns: string): Promise<void> {
  if (!i18n.hasLoadedNamespace(ns)) {
    await i18n.loadNamespaces(ns);
  }
}

// Check if namespace is loaded
export function isNamespaceLoaded(ns: string): boolean {
  return i18n.hasLoadedNamespace(ns);
}

// Get loaded namespaces
export function getLoadedNamespaces(): string[] {
  return i18n.options.ns as string[];
}

export default i18n;
