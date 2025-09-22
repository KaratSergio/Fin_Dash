import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'overview', renderMode: RenderMode.Prerender },
  { path: 'accounts', renderMode: RenderMode.Prerender },
  { path: 'transactions', renderMode: RenderMode.Prerender },
  { path: 'payments', renderMode: RenderMode.Prerender },
  { path: 'analytics', renderMode: RenderMode.Prerender },
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },
];
