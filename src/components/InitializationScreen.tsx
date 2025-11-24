import { FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initializeApp } from '@/lib/api/app';
import { open } from '@tauri-apps/plugin-dialog';

type InitializationScreenProps = {
  onInitialized: () => void;
};

export function InitializationScreen({ onInitialized }: InitializationScreenProps) {
  const [dataDir, setDataDir] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectDirectory() {
    try {
      const selected = await open({
        directory: true,
        multiple: false
      });

      if (selected && typeof selected === 'string') {
        setDataDir(selected);
      }
    } catch {
      setError('ディレクトリの選択に失敗しました');
    }
  }

  async function handleInitialize() {
    if (!dataDir) {
      setError('データディレクトリを選択してください');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await initializeApp(dataDir);
      onInitialized();
    } catch (error) {
      setError(error instanceof Error ? error.message : '初期化に失敗しました');
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Notly へようこそ</h1>
          <p className="text-muted-foreground">
            ノートとメタデータを保存するディレクトリを選択してください
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="data-dir-input"
              className="text-sm font-medium">
              データディレクトリ
            </label>
            <div className="flex gap-2">
              <Input
                id="data-dir-input"
                value={dataDir}
                readOnly
                placeholder="ディレクトリを選択..."
                className="flex-1"
              />
              <Button
                onClick={handleSelectDirectory}
                variant="outline"
                size="icon">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <Button
            onClick={handleInitialize}
            disabled={!dataDir || isInitializing}
            className="w-full">
            {isInitializing ? '初期化中...' : '開始'}
          </Button>
        </div>
      </div>
    </div>
  );
}
