// src/electron/handlers/stats-handlers.ts
import { ipcMain } from "electron";
import { getPrismaClient } from "../database";
import type { StatsResponse } from "../../types/api";

export function registerStatsHandlers() {
  const prisma = getPrismaClient();

  ipcMain.handle("STATS_GET", async (): Promise<StatsResponse> => {
    const totalNotes = await prisma.note.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await prisma.stat.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: "asc" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const allStats = await prisma.stat.findMany({
      orderBy: { date: "desc" },
    });

    for (let i = 0; i < allStats.length; i++) {
      const stat = allStats[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (
        stat.date.getTime() === expectedDate.getTime() &&
        stat.noteCount > 0
      ) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return {
      currentStreak,
      longestStreak,
      totalNotes,
      monthlyStats: stats.map((stat) => ({
        date: stat.date.toISOString(),
        count: stat.noteCount,
      })),
    };
  });
}
