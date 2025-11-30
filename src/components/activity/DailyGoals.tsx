import { FileText, Type } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { type DailyProgress, type UserGoal } from '@/types/activity';

type DailyGoalsProps = {
  progress: DailyProgress;
  goals: UserGoal;
  className?: string;
};

function DailyGoals({ progress, goals, className = '' }: DailyGoalsProps) {
  const charProgress =
    goals.daily_char_count > 0
      ? Math.min((progress.char_count / goals.daily_char_count) * 100, 100)
      : 0;

  const noteProgress =
    goals.daily_note_count > 0
      ? Math.min((progress.note_count / goals.daily_note_count) * 100, 100)
      : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium">今日の目標</h3>

      {goals.daily_char_count > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span>文字数</span>
            </div>
            <span className="text-muted-foreground">
              {progress.char_count.toLocaleString()} / {goals.daily_char_count.toLocaleString()}
            </span>
          </div>
          <Progress
            value={charProgress}
            className="h-2"
          />
        </div>
      )}

      {goals.daily_note_count > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>ノート数</span>
            </div>
            <span className="text-muted-foreground">
              {progress.note_count} / {goals.daily_note_count}
            </span>
          </div>
          <Progress
            value={noteProgress}
            className="h-2"
          />
        </div>
      )}

      {goals.daily_char_count === 0 && goals.daily_note_count === 0 && (
        <p className="text-sm text-muted-foreground">目標が設定されていません</p>
      )}
    </div>
  );
}

export default DailyGoals;
