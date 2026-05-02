export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function toHttpError(error: unknown, fallbackStatus = 500, fallbackMessage = 'Internal server error') {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpError(fallbackStatus, error.message || fallbackMessage);
  }

  return new HttpError(fallbackStatus, fallbackMessage);
}