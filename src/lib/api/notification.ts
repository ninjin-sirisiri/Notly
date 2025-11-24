import { invoke } from '@tauri-apps/api/core';
import {
  type NotificationSettings,
  type UpdateNotificationSettingsInput
} from '../../types/notification';

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return await invoke<NotificationSettings>('get_notification_settings');
}

export async function updateNotificationSettings(
  input: UpdateNotificationSettingsInput
): Promise<NotificationSettings> {
  return await invoke<NotificationSettings>('update_notification_settings', {
    input
  });
}
