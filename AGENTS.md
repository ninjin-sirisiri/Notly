# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

Notly is a desktop note-taking application built with Tauri 2.x that emphasizes simplicity and habit formation. It stores notes locally as markdown files with metadata tracked in SQLite.

## Key Technologies

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Rust + Tauri 2.x + SQLite (rusqlite)
- **State Management**: Zustand
- **Package Manager**: Bun (NOT npm or yarn)
- **Linting/Formatting**: oxlint + oxfmt (NOT ESLint/Prettier for frontend)

## Commands

### Development
```bash
bun tauri dev          # Start development server with Tauri
bun dev                # Start Vite dev server only
```

### Building
```bash
bun build              # Build frontend (runs tsc && vite build)
```

### Linting & Formatting

**Frontend:**
```bash
bun format:front       # Format with oxfmt
bun lint:front         # Lint with oxlint
bun lint:front:fix     # Auto-fix lint issues
bun check:front        # Format + lint
bun check:front:fix    # Format + lint with auto-fix
```

**Backend:**
```bash
bun format:back        # Format Rust code with cargo fmt
bun lint:back          # Lint Rust code with cargo clippy
bun check:back         # Format + lint backend
```

**Combined:**
```bash
bun format             # Format both frontend and backend
bun lint               # Lint both frontend and backend
bun check              # Format + lint everything
```

### Testing
No test framework is currently configured.

## Architecture

### Frontend Structure (`src/`)

- **State Management (Zustand stores in `src/stores/`):**
  - `notes.ts` - Note CRUD operations and current note state
  - `folders.ts` - Folder management and open/closed folder state
  - `files.ts` - Hierarchical file tree combining notes and folders

- **API Layer (`src/lib/api/`):**
  - Wrappers around Tauri `invoke` commands
  - Communicates with Rust backend

- **Components:**
  - `layout/sidebar/` - File tree, note/folder items with drag-and-drop support
  - `editor/` - Markdown editor using wysimark-lite
  - `ui/` - shadcn/ui components

- **Path Aliases:**
  - `@/*` maps to `./src/*` (configured in tsconfig.json)

### Backend Structure (`src-tauri/src/`)

- **Entry Point:** `lib.rs`
  - Initializes SQLite database in app data directory
  - Sets up two directories: `metadata/` (for SQLite) and `notes/` (for markdown files)
  - Runs migrations on startup
  - Manages `AppState` with shared database connection

- **Database (`db/`):**
  - `connect.rs` - Database connection wrapper
  - `migrate.rs` - Schema migrations
  - `models.rs` - Serde-serializable data structures (Note, Folder, FileItem, etc.)

- **Services (`services/`):**
  - Business logic layer
  - `note.rs` - Note CRUD, file I/O for markdown content
  - `folder.rs` - Folder CRUD, directory operations
  - `files.rs` - Builds hierarchical file tree from database

- **Commands (`commands/`):**
  - Tauri command handlers (exposed to frontend via `invoke`)
  - Thin wrappers around service layer
  - `note.rs`, `folder.rs`, `files.rs`

### Data Flow

1. Frontend Zustand store calls API function from `src/lib/api/`
2. API function invokes Tauri command via `invoke()`
3. Command handler in `src-tauri/src/commands/` receives request
4. Service layer in `src-tauri/src/services/` handles business logic
5. Database operations via rusqlite + file I/O for markdown content
6. Response flows back through service → command → frontend

### Storage

- **SQLite Database**: `{APP_DATA}/metadata/app.db`
  - Stores note/folder metadata (id, title, timestamps, parent relationships)
- **Markdown Files**: `{APP_DATA}/notes/{folder_path}/{filename}.md`
  - Actual note content stored as plain markdown files
  - File paths stored in database

## Important Conventions

- **Always use Bun** for package management and running scripts (NOT npm/yarn)
- **Frontend linting uses oxlint/oxfmt**, not ESLint/Prettier
- **Backend uses standard Rust tooling** (cargo fmt, cargo clippy)
- **Path imports** use `@/` alias for `src/`
- **Data models are shared** between Rust (via Serde) and TypeScript (via type definitions)
- When creating new Tauri commands, remember to:
  1. Add command to `src-tauri/src/commands/`
  2. Register in `invoke_handler![]` macro in `lib.rs`
  3. Add corresponding TypeScript API wrapper in `src/lib/api/`
