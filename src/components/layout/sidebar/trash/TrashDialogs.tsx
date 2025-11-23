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

type TrashDialogsProps = {
  confirmEmptyTrash: boolean;
  setConfirmEmptyTrash: (open: boolean) => void;
  handleEmptyTrash: () => void;
  confirmDeleteSelected: boolean;
  setConfirmDeleteSelected: (open: boolean) => void;
  selectedCount: number;
  handleDeleteSelected: () => void;
  confirmDeleteItem: { type: 'note' | 'folder'; id: number } | null;
  setConfirmDeleteItem: (item: { type: 'note' | 'folder'; id: number } | null) => void;
  handlePermanentlyDelete: () => void;
};

export function TrashDialogs({
  confirmEmptyTrash,
  setConfirmEmptyTrash,
  handleEmptyTrash,
  confirmDeleteSelected,
  setConfirmDeleteSelected,
  selectedCount,
  handleDeleteSelected,
  confirmDeleteItem,
  setConfirmDeleteItem,
  handlePermanentlyDelete
}: TrashDialogsProps) {
  return (
    <>
      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setConfirmEmptyTrash}
        open={confirmEmptyTrash}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ゴミ箱を空にしますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。ゴミ箱内のすべてのアイテムが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmptyTrash}>空にする</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setConfirmDeleteSelected}
        open={confirmDeleteSelected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>選択した項目を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。選択した{selectedCount}個のアイテムが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={() => setConfirmDeleteItem(null)}
        open={confirmDeleteItem !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>完全に削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。このアイテムは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentlyDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
