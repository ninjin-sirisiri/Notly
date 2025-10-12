import { Editor } from './components/editor';

export default async function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
  return <Editor noteId={(await params).noteId} />;
}
