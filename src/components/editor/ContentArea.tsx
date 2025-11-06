type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
};

export function ContentArea({ content, setContent, handleSave }: Props) {
  return (
    <textarea
      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-auto rounded-t-none rounded-b-lg bg-background-light dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white focus:outline-0 focus:ring-0 border border-[#EAEAEA] dark:border-[#333333] focus:border-[#666666] dark:focus:border-[#666666] min-h-36 placeholder:text-[#666666] p-3 md:p-4 text-sm md:text-base font-normal leading-normal"
      placeholder="ここにノートを入力..."
      value={content}
      onChange={e => setContent(e.target.value)}
      onBlur={handleSave}
    />
  );
}
