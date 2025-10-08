// src/lib/error-handler.ts
export class NotlyError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = "NotlyError";
  }
}

export function handleError(error: unknown): NotlyError {
  if (error instanceof NotlyError) {
    return error;
  }

  if (error instanceof Error) {
    return new NotlyError(error.message, "UNKNOWN_ERROR");
  }

  return new NotlyError("An unknown error occurred", "UNKNOWN_ERROR");
}