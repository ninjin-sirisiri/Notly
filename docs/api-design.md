# API Design

This document describes the API design for the Inter-Process Communication (IPC) between the Frontend (Renderer Process) and the Backend (Main Process) in Notly.

## Overview

Communication is handled via Electron's IPC mechanism. The frontend sends requests to the backend through channels defined in `src/types/ipc.ts`, and the backend processes these requests using handlers located in `src/electron/handlers/`.

All APIs are exposed to the frontend via the `window.api` object, which is configured in `src/electron/preload.ts`.

## API Channels

Here is a list of all available IPC channels, grouped by functionality.

### Note Operations (`note-handlers.ts`)

- `note:create`: Create a new note.
- `note:read`: Read the content of a specific note.
- `note:update`: Update an existing note.
- `note:delete`: Delete a note.
- `note:list`: Get a list of all notes, optionally filtered by folder or other criteria.
- `note:search`: Search for notes based on a query string.

### Folder Operations (`folder-handlers.ts`)

- `folder:create`: Create a new folder.
- `folder:read`: Get details for a specific folder.
- `folder:update`: Rename or update a folder.
- `folder:delete`: Delete a folder.
- `folder:list`: Get a list of all folders.
- `folder:move`: Move a note to a different folder.

### Tag Operations (`tag-handlers.ts`)

- `tag:create`: Create a new tag.
- `tag:list`: Get a list of all available tags.
- `tag:delete`: Delete a tag.
- `tag:attach`: Attach a tag to a note.
- `tag:detach`: Detach a tag from a note.

### Template Operations (`template-handlers.ts`)

- `template:create`: Create a new note template.
- `template:read`: Read a specific template.
- `template:update`: Update an existing template.
- `template:delete`: Delete a template.
- `template:list`: Get a list of all templates.

### Statistics (`stats-handlers.ts`)

- `stats:get`: Retrieve user statistics, such as writing streaks and note counts.
- `stats:update`: (Internal) Update statistics. This is likely called by other handlers.

### Settings (`settings-handlers.ts`)

- `settings:get`: Retrieve user settings.
- `settings:set`: Update user settings.

### Path Utilities

- `path:getUserData`: Get the absolute path to the user's data directory.
- `path:getNotes`: Get the absolute path to the directory where notes are stored.

## Usage Example

To call an API from the frontend, you would use the exposed methods on the `window.api` object.

```typescript
// Example: Creating a new note from a React component

const handleCreateNote = async () => {
  try {
    const newNote = await window.api.noteCreate({
      title: 'My New Note',
      content: '# Hello World',
      folderId: 'some-folder-id',
    });
    console.log('Note created:', newNote);
  } catch (error) {
    console.error('Failed to create note:', error);
  }
};
```

This call is received by the main process, which invokes the corresponding handler function to perform the database operation and returns the result.
