# Notly Project Overview

## 概要
Notlyは、惰性に負けずノートを取ることを習慣化するためのデスクトップアプリケーションです。シンプルさ、プライバシー、パフォーマンスを重視して設計されています。

## 技術スタック

### フロントエンド
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **State Management:** Zustand
- **Icons:** Lucide React
- **Editor:** Tiptap (Markdown support)

### バックエンド / ネイティブ
- **Framework:** Tauri v2
- **Language:** Rust
- **Database:** SQLite (予定/一部実装)

### 開発ツール
- **Runtime/Package Manager:** Bun
- **Linter/Formatter:** Oxlint, Oxfmt

## ディレクトリ構造

### フロントエンド (`src/`)
- `components/`: Reactコンポーネント
  - `editor/`: エディタ関連 (MarkdownEditor, Toolbar, Headerなど)
  - `layout/`: レイアウト関連 (Sidebar, TitleBar, Header)
  - `ui/`: 汎用UIコンポーネント (Button, Input, Dialogなど - shadcn/uiベース)
  - `theme/`: テーマ関連
- `stores/`: Zustandによる状態管理
  - `files.ts`: ファイル操作の状態
  - `folders.ts`: フォルダ構造の状態
  - `notes.ts`: ノートの状態
- `lib/`: ユーティリティとAPIラッパー
  - `api/`: バックエンドAPIとの通信
  - `tauri.ts`: Tauri APIのラッパー
  - `utils.ts`: 汎用ユーティリティ
- `hooks/`: カスタムReactフック
- `types/`: TypeScript型定義

### バックエンド (`src-tauri/`)
- `src/`: Rustソースコード
  - `commands/`: フロントエンドから呼び出されるコマンド
  - `db/`: データベース接続と操作
  - `services/`: ビジネスロジック
  - `lib.rs`: アプリケーションのエントリーポイントと構成
  - `main.rs`: 実行ファイルのエントリーポイント
- `capabilities/`: Tauriの権限設定
- `tauri.conf.json`: Tauriの設定ファイル
- `icons/`: アプリアイコンリソース

## 主な機能 (実装済み/進行中)
- **ノート管理:** 作成、編集、削除、保存 (ローカルファイルシステム)
- **エディタ:** Markdown記法をサポート
- **フォルダ管理:** フォルダの作成と管理
- **検索:** ノートの検索機能

## 今後のロードマップ
- **習慣化支援:** 連続日数カウント、通知機能
- **整理機能:** タグ、ノート間リンク
- **拡張:** テンプレート、画像サポート、ダークモード
- **高度な機能:** グローバルホットキー、バックアップ

## 開発コマンド
- `bun install`: 依存関係のインストール
- `bun tauri dev`: 開発サーバーの起動 (Frontend + Tauri)
- `bun check`: フロントエンドとバックエンドのLint/Formatチェック

## エージェントへの指示
このプロジェクトは「習慣化」をテーマにしたシンプルかつ高速なノートアプリです。
UIはモダンでプレミアムなデザイン (Glassmorphism, Smooth animations) を心がけてください。
コードはTypeScriptとRustで記述し、安全性とパフォーマンスを重視してください。
