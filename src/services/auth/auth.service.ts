import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../env/env.dev';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface AuthResponse {
  username: string;
  base64EncodedAuthenticationKey: string;
  roles: { id: number; name: string }[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<AuthResponse | null>(null);

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) {
    const saved = this.storage.getItem('user');
    if (saved) this.user.set(JSON.parse(saved));
  }

  login(username: string, password: string) {
    const url = env.apiBase + env.authPath;
    return this.http.post<AuthResponse>(url, { username, password }).pipe(
      tap((res) => {
        this.user.set(res);
        this.storage.setItem('user', JSON.stringify(res));
      }),
    );
  }

  logout() {
    this.user.set(null);
    this.storage.removeItem('user');
  }

  get isAdmin() {
    return this.user()?.roles.some((r) => r.name === 'Super user') ?? false;
  }
}
