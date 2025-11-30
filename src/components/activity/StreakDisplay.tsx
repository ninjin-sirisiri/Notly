import { Flame } from 'lucide-react';

type StreakDisplayProps = {
  streak: number;
  className?: string;
};

function StreakDisplay({ streak, className = '' }: StreakDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{streak}</span>
        <span className="text-xs text-muted-foreground">日連続</span>
      </div>
    </div>
  );
}

export default StreakDisplay;
