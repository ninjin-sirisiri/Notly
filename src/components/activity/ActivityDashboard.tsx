import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useActivityStore } from '@/stores/activity';
import ActivityHeatmap from './ActivityHeatmap';
import DailyGoals from './DailyGoals';
import StreakDisplay from './StreakDisplay';

function ActivityDashboard() {
  const { t } = useTranslation('activity');
  const {
    streak,
    activityLog,
    goals,
    dailyProgress,
    fetchStreak,
    fetchActivityLog,
    fetchGoals,
    fetchDailyProgress
  } = useActivityStore();

  useEffect(() => {
    fetchStreak();
    fetchActivityLog();
    fetchGoals();
    fetchDailyProgress();
  }, [fetchStreak, fetchActivityLog, fetchGoals, fetchDailyProgress]);

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.streakCard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay streak={streak} />
            <p className="text-sm text-muted-foreground mt-4">
              {streak > 0 ? t('streak.messageActive', { count: streak }) : t('streak.messageStart')}
            </p>
          </CardContent>
        </Card>

        {goals && dailyProgress && (
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.todayProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyGoals
                progress={dailyProgress}
                goals={goals}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activityCard')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activityLog} />
          <p className="text-xs text-muted-foreground mt-4">{t('dashboard.activityDescription')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityDashboard;
