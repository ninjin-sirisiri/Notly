export type NotificationSettings = {
  id: number;
  enabled: boolean;
  notification_time: string;
  message: string;
  created_at: string;
  updated_at: string;
};

export type UpdateNotificationSettingsInput = {
  enabled: boolean;
  notification_time: string;
  message: string;
};
