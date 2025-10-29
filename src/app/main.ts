import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { credentials } from '@pages/auth/credentials.interceptor';

import { App } from './app';
import { appConfig } from '../core/config/app.config';
import { routes } from './routes/app.routes';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideHttpClient(withInterceptors([credentials])),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));
