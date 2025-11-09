import { Editable, useEditor } from 'wysimark-lite';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export function MarkdownEditor({ content, setContent }: Props) {
  const editor = useEditor({});

  return (
    <Editable
      className="h-[70vh]"
      editor={editor}
      value={content}
      onChange={setContent}
    />
  );
}
