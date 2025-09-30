import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { App } from './app/app';
import { appConfig } from './config/app.config';
import { routes } from './routes/app.routes';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err));