<a id="readme-top"></a>

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-7.0.4-blue?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Rust](https://img.shields.io/badge/Rust-latest-orange?style=flat&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1.16-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-v2.1.10-black?style=flat&logo=shadcn&logoColor=white)](https://ui.shadcn.com/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0.8-brown?style=flat&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?style=flat&logo=tauri&logoColor=white)](https://tauri.app/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vitest](https://img.shields.io/badge/Vitest-v2.5.1-blue?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Prettier](https://img.shields.io/badge/Prettier-v3.6.2-60A5FA?style=flat&logo=prettier&logoColor=white)](https://prettier.io/)
[![ESLint](https://img.shields.io/badge/ESLint-v9.38.0-4B32C3?style=flat&logo=eslint&logoColor=white)](https://eslint.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](https://opensource.org/licenses/MIT)

  <img src="public/logo.png" alt="Logo" width="80" height="80">

</div>

# Notly

<details>
  <summary>目次</summary>
  <ol>
    <li>
      <a href="#overview">overview</a>
      <ul>
      	<li><a href="#core-concepts">core concepts</a></li>
        <li><a href="#technology-stack">technology stack</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">getting started</a>
      <ul>
        <li><a href="#prerequisites">prerequisites</a></li>
        <li><a href="#installation">installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">roadmap</a></li>
    <li><a href="#license">license</a></li>
    <li><a href="#contact">contact</a></li>
    <li><a href="#acknowledgments">acknowledgments</a></li>
  </ol>
</details>

## Overview

<div align="center">
<img src="https://github.com/ninjin-sirisiri/my-images/blob/main/Notly-image.png" alt="概要" width="600"/>
</div>

惰性が勝ってノートをつけることが習慣化しない人のためのアプリ

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

### Core Concepts

- **シンプルさ**: アプリはシンプルで使いやすいように設計されています。UIもミニマルでフラットなデザインにしています。
- **習慣化**: ノートの習慣化を支援するための機能が含まれています。
- **プライバシー**: データはローカルに保存され、プライバシーが確保されています。
- **パフォーマンス**: 習慣化の邪魔をしないために、このアプリはパフォーマンスを重視しています

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

### Technology Stack

#### フロントエンド

- **Vite** – 高速な開発環境とビルドを実現する次世代フロントエンドツール。
- **TypeScript** – 静的型付けにより安全で保守性の高いJavaScript開発を可能にする言語。
- **Tailwind CSS** – ユーティリティクラスベースで効率的にデザインを構築できるCSSフレームワーク。
- **shadcn/ui** – Tailwindベースの高品質でカスタマイズ性に優れたUIコンポーネントライブラリ。
- **Zustand** – シンプルかつ軽量な状態管理ライブラリ。

#### バックエンド / ネイティブ

- **Rust** – 高速かつ安全性の高いシステムプログラミング言語。
- **Tauri** – Rust製の軽量・セキュアなデスクトップアプリケーションフレームワーク。
- **SQLite** – 軽量で組み込み可能なリレーショナルデータベース。

#### 開発支援 / 品質管理

- **Prettier** – コードフォーマットを自動化し、統一されたスタイルを維持。
- **ESLint** – コード品質を保ち、潜在的なバグを防ぐための静的解析ツール。

#### テスト

- **Vitest** – ブラウザ環境やNode.js環境で高速で効率的なテストを実行するためのテストフレームワーク。

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

## Getting Started

これは、プロジェクトをローカルにセットアップする際の指示の例です。ローカルコピーを立ち上げて実行するには、以下の簡単な例の手順に従ってください。

### Prerequisites

ソフトウェアを使用するために必要なもののリストです。

- **Node.js** [Node.js](https://nodejs.org/)
- **Bun** [Bun](https://bun.sh/)
- **Rust** [Rust](https://www.rust-lang.org/)

### Installation

1. このリポジトリをローカルにクローンします

   ```bash
   git clone https://github.com/ninjin-sirisiri/Notly.git
   ```

2. パッケージをインストールします

   ```bash
   bun install
   ```

3. 開発者サーバーを立ち上げます

   ```bash
   bun tauri dev
   ```

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

## Roadmap

### Phase 1 (MVP) - 完了予定: TBD

- [x] プロジェクトセットアップ
- [x] ローカルファイル保存
- [x] 基本的なノート作成・編集・削除機能
- [x] Markdownエディタ
- [x] フォルダ管理

### Phase 2 - 完了予定: TBD

- [ ] 連続日数カウント機能
- [ ] 通知機能
- [x] 検索機能
- [x] ノート間リンク機能

### Phase 3 - 完了予定: TBD

- [ ] テンプレート機能
- [ ] タグ機能
- [x] WYSIWYGエディタモード
- [ ] 画像サポート
- [x] ダークモード

### Phase 4 - 完了予定: TBD

- [ ] グローバルホットキー
- [ ] パフォーマンス最適化
- [ ] バックアップ機能

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

## Contact

- [GitHub](https://github.com/ninjin-sirisiri)
- [Note](https://note.com/ubsa_17)
- [X](https://x.com/Ubsa461108)
- [Qiita](https://qiita.com/Ubsa)

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

## License

本プロジェクトは [MITライセンス](https://opensource.org/licenses/MIT) の下で公開されています。

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>

## Acknowledgments

このプロジェクトは以下のオープンソース技術に支えられています：

- [Bun](https://bun.sh/)
- [Vite](https://vite.dev/)
- [React](https://react.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tauri](https://tauri.app/)
- [Rust](https://www.rust-lang.org/)
- [SQLite](https://sqlite.org/)
- [Zed](https://zed.dev/)

<p align="right">(<a href="#readme-top">トップへ戻る</a>)</p>
