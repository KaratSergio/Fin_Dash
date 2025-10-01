import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const credentials: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    // clone the request with withCredentials
    const clone = req.clone({ withCredentials: true });
    return next(clone);
};