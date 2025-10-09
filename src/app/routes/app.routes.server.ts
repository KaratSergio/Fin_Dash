import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // enter App
  { path: 'login', renderMode: RenderMode.Prerender },

  { path: '', renderMode: RenderMode.Prerender },
  { path: 'dashboard', renderMode: RenderMode.Prerender },
  { path: 'accounts', renderMode: RenderMode.Prerender },
  { path: 'clients', renderMode: RenderMode.Prerender },

  // Credits group
  { path: 'loans', renderMode: RenderMode.Prerender },
  { path: 'loans/list', renderMode: RenderMode.Prerender },
  { path: 'loans/products', renderMode: RenderMode.Prerender },

  // admin
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: 'admin/offices', renderMode: RenderMode.Prerender },
  { path: 'admin/users', renderMode: RenderMode.Prerender },
  { path: 'admin/roles', renderMode: RenderMode.Prerender },

  // fallback
  { path: '**', renderMode: RenderMode.Prerender },
];
