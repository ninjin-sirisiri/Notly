# Architecture

This document outlines the technical architecture of the Notly application.

## Philosophy

Notly is built with a modern technology stack that separates the user interface from the application's core logic. It uses a local-first approach, ensuring all data is stored on the user's machine for privacy and offline availability.

## Core Components

The application is composed of two main processes:

1.  **Frontend (Renderer Process)**: A Next.js application responsible for the user interface.
2.  **Backend (Main Process)**: An Electron process that manages the application window, native OS integrations, and backend logic, including database access.

These two processes communicate via an IPC (Inter-Process Communication) bridge defined in `src/electron/preload.ts`.

## Tech Stack

### Frontend

-   **Next.js 15.5**: The primary framework for building the React-based user interface. It handles routing, rendering, and the overall frontend structure.
-   **TypeScript**: Ensures type safety and improves code quality and maintainability.
-   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
-   **shadcn/ui**: A collection of reusable UI components built on top of Tailwind CSS.

### Desktop Framework

-   **Electron 38**: The framework used to create a cross-platform desktop application from the web-based frontend. It provides access to native functionalities.

### Database

-   **Prisma**: A modern ORM (Object-Relational Mapper) that simplifies database access. It is used to interact with the local SQLite database.
-   **SQLite**: A self-contained, serverless SQL database engine used for local data storage. The database file is stored on the user's local file system.

## Project Structure

The project is organized to maintain a clear separation of concerns between the web frontend and the desktop-specific code.

```
notly/
├── src/
│   ├── app/              # Next.js App Router (UI pages)
│   ├── components/       # Shared React components
│   ├── electron/         # Electron main process code
│   │   ├── main.ts       # Main entry point for Electron
│   │   ├── preload.ts    # IPC bridge between frontend and backend
│   │   ├── database.ts   # Prisma client setup and database utilities
│   │   └── handlers/     # IPC handlers for specific features (notes, folders, etc.)
│   ├── hooks/            # Custom React hooks for frontend logic
│   ├── types/            # TypeScript type definitions (shared across processes)
│   └── lib/              # Shared utility functions
├── prisma/
│   └── schema.prisma     # Prisma schema defining the database models
├── public/               # Static assets for the Next.js app
└── dist/                 # Build output directory
```

## Data Flow

1.  The **UI (React components)** triggers an action (e.g., saving a note).
2.  The action calls a function exposed on the `window.api` object, which is defined by the preload script.
3.  The **preload script (`preload.ts`)** sends an IPC message to the **main process (`main.ts`)**.
4.  The main process receives the message and routes it to the appropriate **IPC handler** in the `src/electron/handlers/` directory.
5.  The handler contains the business logic and uses **Prisma** to interact with the **SQLite database**.
6.  The result is returned to the UI through the same IPC channel.
