import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@src/core/services/auth/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data?.['permission'];

  // if !permission skip
  if (!requiredPermission) return true;

  // Admin have all permissions
  if (auth.isAdmin) return true;

  // check permission
  if (!auth.hasPermission(requiredPermission)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
