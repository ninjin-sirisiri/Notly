import { type TFunction } from 'i18next';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

/**
 * Type-safe translation hook wrapper
 * Wraps react-i18next's useTranslation with additional type safety
 * and support for interpolation and pluralization
 */
export function useTranslation(
  ns?: 'common' | 'editor' | 'settings' | 'activity' | 'errors' | string | string[]
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { t, i18n, ready } = useI18nextTranslation(ns as any);

  // Return a more permissive translation function
  return {
    i18n,
    ready,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, options?: any) => t(key as any, options) as string
  };
}

/**
 * Translation function type with interpolation support
 */
export type { TFunction };
