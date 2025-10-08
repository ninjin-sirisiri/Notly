// src/electron/handlers/settings-handlers.ts
import { ipcMain } from "electron";
import { getPrismaClient } from "../database";
import type { SettingsResponse, UpdateSettingsRequest } from "../../types/api";

export function registerSettingsHandlers() {
  const prisma = getPrismaClient();

  ipcMain.handle("SETTINGS_GET", async (): Promise<SettingsResponse> => {
    const settings = await prisma.setting.findMany();

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    return {
      notificationEnabled: settingsMap.get("notification_enabled") === "true",
      notificationTimes: JSON.parse(
        settingsMap.get("notification_times") || '["09:00", "21:00"]'
      ),
      theme:
        (settingsMap.get("theme") as "light" | "dark" | "system") || "system",
    };
  });

  ipcMain.handle(
    "SETTINGS_SET",
    async (_, data: UpdateSettingsRequest): Promise<SettingsResponse> => {
      if (data.notificationEnabled !== undefined) {
        await prisma.setting.upsert({
          where: { key: "notification_enabled" },
          update: { value: String(data.notificationEnabled) },
          create: {
            key: "notification_enabled",
            value: String(data.notificationEnabled),
          },
        });
      }

      if (data.notificationTimes !== undefined) {
        await prisma.setting.upsert({
          where: { key: "notification_times" },
          update: { value: JSON.stringify(data.notificationTimes) },
          create: {
            key: "notification_times",
            value: JSON.stringify(data.notificationTimes),
          },
        });
      }

      if (data.theme !== undefined) {
        await prisma.setting.upsert({
          where: { key: "theme" },
          update: { value: data.theme },
          create: { key: "theme", value: data.theme },
        });
      }

      // 更新後の設定を取得
      const settings = await prisma.setting.findMany();
      const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

      return {
        notificationEnabled: settingsMap.get("notification_enabled") === "true",
        notificationTimes: JSON.parse(
          settingsMap.get("notification_times") || '["09:00", "21:00"]'
        ),
        theme:
          (settingsMap.get("theme") as "light" | "dark" | "system") || "system",
      };
    }
  );
}
