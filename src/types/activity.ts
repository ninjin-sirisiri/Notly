export type ActivityLogItem = {
  date: string;
  count: number;
  level: number; // 0-4, for heatmap intensity
};

export type UserGoal = {
  daily_char_count: number;
  daily_note_count: number;
};

export type DailyProgress = {
  char_count: number;
  note_count: number;
};
