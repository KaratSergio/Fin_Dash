import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const user = auth.user();
    const userKey = user?.base64EncodedAuthenticationKey;

    if (userKey) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Basic ${userKey}`,
                'Fineract-Platform-TenantId': 'default',
            }
        });
        return next(cloned);
    }
    return next(req);
};
