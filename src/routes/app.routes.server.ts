import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // enter App
  { path: 'login', renderMode: RenderMode.Prerender },

  // SPA
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'overview', renderMode: RenderMode.Prerender },
  { path: 'accounts', renderMode: RenderMode.Prerender },
  { path: 'transactions', renderMode: RenderMode.Prerender },
  { path: 'payments', renderMode: RenderMode.Prerender },
  { path: 'analytics', renderMode: RenderMode.Prerender },
  { path: 'clients', renderMode: RenderMode.Prerender },

  // admin
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: 'admin/offices', renderMode: RenderMode.Prerender },
  { path: 'admin/users', renderMode: RenderMode.Prerender },
  { path: 'admin/logs', renderMode: RenderMode.Prerender },
  { path: 'admin/roles', renderMode: RenderMode.Prerender },
  { path: 'admin/settings', renderMode: RenderMode.Prerender },

  // fallback
  { path: '**', renderMode: RenderMode.Prerender },
];
