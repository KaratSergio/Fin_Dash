import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { serverRoutes } from '@app/routes/app.routes.server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
