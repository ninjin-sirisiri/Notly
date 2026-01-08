import { FileText, Trash2, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { formatShortDate } from '@/lib/dateFormat';
import { useTemplateStore } from '@/stores/templates';
import { type Template } from '@/types/templates';

type TemplateManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateManagerDialog({ open, onOpenChange }: TemplateManagerDialogProps) {
  const {
    templates,
    loadTemplates,
    deleteTemplate,
    isLoading,
    setCurrentTemplate,
    setTemplateEditorOpen
  } = useTemplateStore();
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, loadTemplates]);

  function handleCreate() {
    setCurrentTemplate(null);
    setTemplateEditorOpen(true);
    onOpenChange(false);
  }

  function handleEdit(template: Template) {
    setCurrentTemplate(template);
    setTemplateEditorOpen(true);
    onOpenChange(false);
  }

  async function handleConfirmDelete() {
    if (deleteTemplateId === null) return;

    try {
      await deleteTemplate(deleteTemplateId);
      setDeleteTemplateId(null);
    } catch {
      // エラーは既にストアで処理されている
    }
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{t('dialogs.manageTemplates.loading')}</p>
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('dialogs.manageTemplates.noTemplates')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {templates.map(template => (
          <div
            key={template.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1 min-w-0">
                <h3 className="font-semibold truncate">{template.name}</h3>
                <div className="text-xs text-muted-foreground pt-1">
                  {t('dialogs.manageTemplates.updatedAt')} {formatShortDate(template.updatedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(template)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTemplateId(template.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{t('dialogs.manageTemplates.title')}</DialogTitle>
                <DialogDescription>{t('dialogs.manageTemplates.description')}</DialogDescription>
              </div>
              <Button
                onClick={handleCreate}
                size="sm"
                className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dialogs.manageTemplates.createNew')}
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">{renderContent()}</ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTemplateId !== null}
        onOpenChange={isOpen => !isOpen && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteTemplate.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.deleteTemplate.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
