import 'i18next';
import type activity from '../locales/en/activity.json';
import type common from '../locales/en/common.json';
import type editor from '../locales/en/editor.json';
import type errors from '../locales/en/errors.json';
import type settings from '../locales/en/settings.json';

declare module 'i18next' {
  type CustomTypeOptions = {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      editor: typeof editor;
      settings: typeof settings;
      activity: typeof activity;
      errors: typeof errors;
    };
  };
}
