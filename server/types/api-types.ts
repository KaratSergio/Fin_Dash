// response user data (login)
export interface FineractAuthResponse {
    username: string;
    base64EncodedAuthenticationKey: string;
    roles: { id: number; name: string; description?: string; disabled?: boolean }[];
    permissions: string[];
}

// Type guard
export function isFineractAuthResponse(obj: any): obj is FineractAuthResponse {
    return (
        obj &&
        typeof obj.username === 'string' &&
        typeof obj.base64EncodedAuthenticationKey === 'string' &&
        Array.isArray(obj.roles) &&
        Array.isArray(obj.permissions)
    );
}