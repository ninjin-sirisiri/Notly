'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFolders } from '@/hooks/useFolders';
import { useNotesContext } from '@/context/notes-context';
import { FolderTreeHeader } from './folder-tree-header';
import { CreateFolderInput } from './create-folder-input';
import { CreateNoteInput } from './create-note-input';
import { FolderItem } from './folder-item';
import { NoteItem } from './note-item';

export function FolderTree() {
  const { folders, createFolder, deleteFolder } = useFolders();
  const { notes: allNotes, createNote, deleteNote } = useNotesContext();

  // フォルダ作成の状態
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderIdForNew, setParentFolderIdForNew] = useState<string | undefined>();

  // ノート作成の状態
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [folderIdForNewNote, setFolderIdForNewNote] = useState<string | undefined>();

  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();

  const rootNotes = allNotes.filter((note) => !note.folderId);

  // フォルダ作成ハンドラー
  const handleCreateFolder = async () => {
    if (newFolderName.trim() === '') return;
    await createFolder(newFolderName, parentFolderIdForNew);
    resetFolderCreation();
  };

  const resetFolderCreation = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
    setParentFolderIdForNew(undefined);
  };

  // ノートを作成
  const handleCreateNote = async () => {
    if (newNoteTitle.trim() === '') {
      resetNoteCreation();
      return;
    }
    const { note } = await createNote(newNoteTitle, '', folderIdForNewNote);
    router.push(`/note/${note.id}`);
    resetNoteCreation();
  };

  //ノートを削除
  const handleDeleteNote = async (noteId: string) => {
    if (confirm('ノートを削除しますか?')) {
      await deleteNote(noteId);
    }
  };

  const resetNoteCreation = () => {
    setIsCreatingNote(false);
    setNewNoteTitle('');
    setFolderIdForNewNote(undefined);
  };

  // フォルダ内にノートを作成
  const handleCreateNoteInFolder = (folderId: string) => {
    setFolderIdForNewNote(folderId);
    setIsCreatingNote(true);
  };

  // サブフォルダを作成
  const handleCreateSubfolder = (parentId: string) => {
    setParentFolderIdForNew(parentId);
    setIsCreatingFolder(true);
  };

  // フォルダ削除
  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('フォルダを削除しますか?')) {
      await deleteFolder(folderId);
    }
  };

  return (
    <div className="bg-gray-50 w-64 h-screen overflow-y-auto border-r border-gray-200 flex flex-col">
      {/* ヘッダー */}
      <FolderTreeHeader
        onCreateNote={() => setIsCreatingNote(true)}
        onCreateFolder={() => setIsCreatingFolder(true)}
      />

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* フォルダ作成入力 */}
        {isCreatingFolder && (
          <CreateFolderInput
            value={newFolderName}
            onChange={setNewFolderName}
            onSubmit={handleCreateFolder}
            onCancel={resetFolderCreation}
          />
        )}

        {/* ノート作成入力 */}
        {isCreatingNote && (
          <CreateNoteInput
            value={newNoteTitle}
            onChange={setNewNoteTitle}
            onSubmit={handleCreateNote}
            onCancel={resetNoteCreation}
          />
        )}

        {/* ルート直下のノート */}
        {rootNotes.length > 0 && (
          <div className="mb-2">
            {rootNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={noteId === note.id}
                level={0}
                onDeleteNote={handleDeleteNote}
              />
            ))}
          </div>
        )}

        {/* フォルダツリー */}
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={0}
            onCreateNote={handleCreateNoteInFolder}
            onDeleteNote={handleDeleteNote}
            onDeleteFolder={handleDeleteFolder}
            onCreateSubfolder={handleCreateSubfolder}
            selectedNoteId={noteId}
            allNotes={allNotes}
          />
        ))}
      </div>
    </div>
  );
}
