import { type ActivityLogItem } from '@/types/activity';

type ActivityHeatmapProps = {
  data: ActivityLogItem[];
  className?: string;
};

function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return 'bg-gray-100 dark:bg-gray-800';
    case 1:
      return 'bg-green-200 dark:bg-green-900';
    case 2:
      return 'bg-green-300 dark:bg-green-700';
    case 3:
      return 'bg-green-400 dark:bg-green-600';
    case 4:
      return 'bg-green-500 dark:bg-green-500';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function ActivityHeatmap({ data, className = '' }: ActivityHeatmapProps) {
  // Create a map for quick lookup
  const activityMap = new Map(data.map(item => [item.date, item]));

  // Generate last 365 days
  const today = new Date();
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-flex gap-1">
        {weeks.map(week => (
          <div
            key={formatDate(week[0])}
            className="flex flex-col gap-1">
            {week.map(date => {
              const dateStr = formatDate(date);
              const activity = activityMap.get(dateStr);
              const level = activity?.level ?? 0;
              const count = activity?.count ?? 0;

              return (
                <div
                  key={dateStr}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(level)} transition-colors cursor-pointer hover:ring-2 hover:ring-green-500`}
                  title={`${dateStr}: ${count} activities`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityHeatmap;
