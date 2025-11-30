import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useTemplateStore } from '@/stores/templates';

import { EditorHeader } from './header/EditorHeader';
import { MarkdownEditor } from './MarkdownEditor';

export function TemplateEditor() {
  const { currentTemplate, createTemplate, updateTemplate, isLoading } = useTemplateStore();

  const [name, setName] = useState(currentTemplate?.name || '');
  const [content, setContent] = useState(currentTemplate?.content || '');

  useEffect(() => {
    if (currentTemplate) {
      setName(currentTemplate.name);
      setContent(currentTemplate.content);
    } else {
      setName('');
      setContent('');
    }
  }, [currentTemplate]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      if (currentTemplate) {
        await updateTemplate({
          id: currentTemplate.id,
          name,
          content,
          description: currentTemplate.description
        });
        toast.success('Template updated');
      } else {
        await createTemplate({
          name,
          content,
          description: null
        });
        toast.success('Template created');
      }
    } catch {
      toast.error('Failed to save template');
    }
  }

  return (
    <main className="flex-1 flex flex-col p-3 md:p-6">
      <EditorHeader
        title={name}
        setTitle={setName}
        handleSave={handleSave}
        created_at={currentTemplate?.createdAt ? new Date(currentTemplate.createdAt) : new Date()}
        isLoading={isLoading}
        isNewNote={!currentTemplate}
      />
      <MarkdownEditor
        content={content}
        onUpdate={setContent}
        handleSave={handleSave}
        isNewNote={!currentTemplate}
        noteId={currentTemplate?.id}
      />
    </main>
  );
}
