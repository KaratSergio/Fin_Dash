export interface AuthError {
    message: string;
    code?: string;
}

export function handleError(err: unknown, fallbackMessage = 'Something went wrong'): AuthError {
    if (err instanceof Error) return { message: err.message };
    return { message: fallbackMessage };
}