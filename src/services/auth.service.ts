import { Injectable, signal } from '@angular/core';
import { FineractAuthResponse } from '../../server/server';

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = signal<FineractAuthResponse | null>(null);

    async login(username: string, password: string): Promise<FineractAuthResponse | undefined> {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || 'Login failed');
        }

        const data: FineractAuthResponse = await res.json();
        this.user.set(data);
        return data;
    }

    async logout() {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        this.user.set(null);
    }

    get isAdmin() {
        return this.user()?.roles.some(r => r.name === 'Super user') ?? false;
    }
}
