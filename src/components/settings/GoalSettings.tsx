import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActivityStore } from '@/stores/activity';
import { type UserGoal } from '@/types/activity';

function GoalSettings() {
  const { goals, fetchGoals, updateGoals, isLoading } = useActivityStore();
  const [localGoals, setLocalGoals] = useState<UserGoal>({
    daily_char_count: 0,
    daily_note_count: 0
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    if (goals) {
      setLocalGoals(goals);
    }
  }, [goals]);

  async function handleSave() {
    await updateGoals(localGoals);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">目標設定</h3>
        <p className="text-sm text-muted-foreground mb-6">
          1日の執筆目標を設定して、継続的な習慣化をサポートします。
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily_char_count">1日の目標文字数</Label>
          <Input
            id="daily_char_count"
            type="number"
            min="0"
            value={localGoals.daily_char_count}
            onChange={e =>
              setLocalGoals({ ...localGoals, daily_char_count: Number(e.target.value) })
            }
            placeholder="例: 1000"
          />
          <p className="text-xs text-muted-foreground">0に設定すると目標として表示されません</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily_note_count">1日の目標ノート数</Label>
          <Input
            id="daily_note_count"
            type="number"
            min="0"
            value={localGoals.daily_note_count}
            onChange={e =>
              setLocalGoals({ ...localGoals, daily_note_count: Number(e.target.value) })
            }
            placeholder="例: 3"
          />
          <p className="text-xs text-muted-foreground">0に設定すると目標として表示されません</p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}>
        {isLoading ? '保存中...' : '保存'}
      </Button>
    </div>
  );
}

export default GoalSettings;
