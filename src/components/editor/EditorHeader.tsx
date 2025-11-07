type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  created_at: Date;
};

export function EditorHeader({
  title,
  setTitle,
  handleSave,
  created_at
}: Props) {
  return (
    <div className="shrink-0 mb-4">
      <div className="flex sm:items-baseline sm:justify-between gap-2">
        <input
          className="w-full text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-primary dark:text-white p-0.5"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleSave}
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {created_at.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
