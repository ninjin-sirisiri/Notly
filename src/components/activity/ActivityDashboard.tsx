import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityStore } from '@/stores/activity';
import ActivityHeatmap from './ActivityHeatmap';
import DailyGoals from './DailyGoals';
import StreakDisplay from './StreakDisplay';

function ActivityDashboard() {
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
            <CardTitle>連続記録</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay streak={streak} />
            <p className="text-sm text-muted-foreground mt-4">
              {streak > 0
                ? `素晴らしい！${streak}日間連続でノートを書いています！`
                : '今日からノートを書いて、連続記録を始めましょう！'}
            </p>
          </CardContent>
        </Card>

        {goals && dailyProgress && (
          <Card>
            <CardHeader>
              <CardTitle>今日の進捗</CardTitle>
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
          <CardTitle>アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activityLog} />
          <p className="text-xs text-muted-foreground mt-4">
            過去1年間のアクティビティを表示しています
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityDashboard;
