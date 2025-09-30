// server imports
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import fetch, { RequestInit } from 'node-fetch';
import https from 'https';
import cors from 'cors';
import { env } from './env/env.dev';

// Angular SSR imports
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

// Routes imports
import { authRoutes } from './routes/auth.routes';
import { proxyRoutes } from './routes/proxy.routes';

const app = express();
const angularApp = new AngularNodeAppEngine();
const browserDistFolder = join(import.meta.dirname, '../browser');

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({
  origin: `${env.clientUrl}`,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// log all requests
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ---------------------------
// API Routes
// ---------------------------
app.use('/api', authRoutes);
app.use('/api/fineract', proxyRoutes);

// ---------------------------
// Static Files (Angular browser build)
// ---------------------------
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y', // dev: '0'
    index: false,
    redirect: false,
  }),
);

// ---------------------------
// SSR Middleware
// ---------------------------
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await angularApp.handle(req);
    if (response) {
      writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (err) {
    console.error('SSR Error:', err);
    next(err);
  }
});

// ---------------------------
// Start Server
// ---------------------------
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] ?? 4000;
  app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
}

// ---------------------------
// Export for serverless / reqHandler
export const reqHandler = createNodeRequestHandler(app);

// ---------------------------
// Helper for dev: ignore self-signed SSL
// ---------------------------
export const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ---------------------------
// Auth Service (can move to separate file)
// ---------------------------
export interface FineractAuthResponse {
  username: string;
  base64EncodedAuthenticationKey: string;
  roles: { id: number; name: string; description?: string; disabled?: boolean }[];
  permissions: string[];
}

export async function fetchFineract(url: string, options: RequestInit = {}) {
  return fetch(url, { ...options, agent: httpsAgent });
}

// Type guard
export function isFineractAuthResponse(obj: any): obj is FineractAuthResponse {
  return (
    obj &&
    typeof obj.username === 'string' &&
    typeof obj.base64EncodedAuthenticationKey === 'string' &&
    Array.isArray(obj.roles) &&
    Array.isArray(obj.permissions)
  );
}
