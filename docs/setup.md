# Setup Guide

This guide explains how to set up the Notly development environment.

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **pnpm**

## Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/ninjin-sirisiri/notly.git
    cd notly
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Set up Prisma**
    This command generates the Prisma Client based on your schema.
    ```bash
    pnpx prisma generate
    ```
    This command applies the initial migration to create the database schema.
    ```bash
    pnpx prisma migrate dev --name init
    ```

## Run in Development

To start the application in development mode, run the following command:

```bash
pnpm run dev
```

This will concurrently start:

- The Next.js frontend development server (available at `http://localhost:3000`)
- The Electron main process

## Build for Production

To build the application for production, use the following commands:

1.  **Build the app**
    This command builds both the Next.js frontend and the Electron main process.

    ```bash
    pnpm run build
    ```

2.  **Create a distributable package**
    This command packages the built application into an installer for your current operating system.

    ```bash
    pnpm run dist
    ```

    You can also create platform-specific builds:

    ```bash
    pnpm run dist:mac    # For macOS
    pnpm run dist:win    # For Windows
    pnpm run dist:linux  # For Linux
    ```
