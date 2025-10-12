# Contributing Guide

Thank you for your interest in contributing to Notly! We welcome all contributions, from bug reports to new features.

## How to Contribute

1.  **Fork the repository**: Create your own copy of the project on GitHub.
2.  **Create a feature branch**:
    ```bash
    git checkout -b feature/YourAmazingFeature
    ```
3.  **Make your changes**: Implement your feature or bug fix.
4.  **Commit your changes**: Write a clear and descriptive commit message.
    ```bash
    git commit -m 'feat: Add some AmazingFeature'
    # Use 'fix:' for bug fixes, 'feat:' for new features, 'docs:' for documentation, etc.
    ```
5.  **Push to your branch**:
    ```bash
    git push origin feature/YourAmazingFeature
    ```
6.  **Create a Pull Request**: Open a pull request from your forked repository to the main Notly repository.

## Development Guidelines

To ensure code quality and consistency, please adhere to the following guidelines:

- **TypeScript**: Always use TypeScript and provide type definitions for new code. Avoid using `any` where possible.
- **Code Style**: Follow the existing code style. Run the linter and formatter to ensure your code is consistent.
- **Commit Messages**: Write clear, concise, and descriptive commit messages. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- **Documentation**: Add appropriate documentation for any new features or significant changes. This includes updating the `README.md` and any relevant files in the `/docs` folder.

## Available Scripts

Here are the most common scripts you will use during development.

### Core Development

```bash
# Start the development server (Next.js + Electron)
pnpm run dev

# Start only the Next.js server
pnpm run dev:next

# Start only the Electron process
pnpm run dev:electron
```

### Code Quality

Before committing, please run the following checks:

```bash
# Run ESLint to check for code style issues
pnpm run lint

# Run the TypeScript compiler to check for type errors
pnpm run type-check
```

### Database

If you make changes to the `prisma/schema.prisma` file, you will need to run a migration.

```bash
# Create a new migration file
pnpm run db:migrate "Your migration name"

# Apply migrations
pnpm run db:migrate

# Generate the Prisma Client (usually runs automatically with `install`)
pnpm run db:generate

# Open Prisma Studio to view and edit data in the database
pnpm run db:studio
```

## Getting Support

If you have questions or need help, feel free to:

- Open an issue on the [Issue Tracker](https://github.com/ninjin-sirisiri/Notly/issues).
- Start a discussion on the [Discussions](https://github.com/ninjin-sirisiri/Notly/discussions) page.
