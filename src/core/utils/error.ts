import { HttpErrorResponse } from '@angular/common/http';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export function handleError(err: unknown, fallbackMessage = 'Something went wrong'): AppError {
  if (err instanceof HttpErrorResponse) {
    return {
      message: err.error?.message || err.message || fallbackMessage,
      code: err.error?.code,
      status: err.status,
    };
  }

  if (err instanceof Error) return { message: err.message, code: 'GENERIC_ERROR' };

  if (typeof err === 'string') return { message: err, code: 'STRING_ERROR' };

  return { message: fallbackMessage, code: 'UNKNOWN_ERROR' };
}
