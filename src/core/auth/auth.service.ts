import { Injectable, signal } from '@angular/core';
import { FineractAuthResponse } from '@server/types/api-types';
import { Permission } from '@domains/roles/interfaces/permission.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<FineractAuthResponse | null>(null);
  permissions = signal<string[]>([]);

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

    await this.loadPermissions();

    return data;
  }

  async logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    this.user.set(null);
    this.permissions.set([]);
  }

  async loadPermissions() {
    const roleId = this.user()?.roles?.[0]?.id;
    if (!roleId) return;

    try {
      const res = await fetch(`/api/fineract/roles/${roleId}/permissions`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('Failed to load permissions:', err?.message || res.statusText);
        this.permissions.set([]);
        return;
      }

      const roleData = await res.json();
      const perms: Permission[] = Array.isArray(roleData.permissionUsageData)
        ? roleData.permissionUsageData
        : [];

      const codes = perms.filter((p) => p.selected).map((p) => p.code);

      this.permissions.set(codes);
    } catch (err) {
      console.error('Failed to load permissions', err);
      this.permissions.set([]);
    }
  }

  // Checks
  hasPermission(code: string) {
    // if super-user
    if (this.isAdmin) return true;

    return this.permissions().includes(code);
  }

  get isAdmin() {
    return this.user()?.roles.some((r) => r.name === 'Super user') ?? false;
  }
}
