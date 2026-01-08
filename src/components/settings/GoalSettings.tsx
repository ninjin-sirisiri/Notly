import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { useActivityStore } from '@/stores/activity';
import { type UserGoal } from '@/types/activity';

function GoalSettings() {
  const { t } = useTranslation('settings');
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
        <h3 className="text-lg font-medium mb-4">{t('goals.title')}</h3>
        <p className="text-sm text-muted-foreground mb-6">{t('goals.description')}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily_char_count">{t('goals.dailyCharCount')}</Label>
          <Input
            id="daily_char_count"
            type="number"
            min="0"
            value={localGoals.daily_char_count}
            onChange={e =>
              setLocalGoals({ ...localGoals, daily_char_count: Number(e.target.value) })
            }
            placeholder={t('goals.dailyCharCountPlaceholder')}
          />
          <p className="text-xs text-muted-foreground">{t('goals.dailyCharCountHelp')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily_note_count">{t('goals.dailyNoteCount')}</Label>
          <Input
            id="daily_note_count"
            type="number"
            min="0"
            value={localGoals.daily_note_count}
            onChange={e =>
              setLocalGoals({ ...localGoals, daily_note_count: Number(e.target.value) })
            }
            placeholder={t('goals.dailyNotePlaceholder')}
          />
          <p className="text-xs text-muted-foreground">{t('goals.dailyNoteCountHelp')}</p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}>
        {isLoading ? t('goals.saving') : t('goals.save')}
      </Button>
    </div>
  );
}

export default GoalSettings;
