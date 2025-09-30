import { Request, Response } from 'express';
import { env } from '../env/env.dev';
import {
  FineractAuthResponse,
  fetchFineract,
  isFineractAuthResponse
} from '../server';

// LOGIN
export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const fineractRes = await fetchFineract(`${env.apiBase}${env.authPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!fineractRes.ok) {
      return res.status(fineractRes.status).json({ message: 'Invalid credentials' });
    }

    const json = await fineractRes.json();

    if (!isFineractAuthResponse(json)) {
      return res.status(500).json({ message: 'Invalid response from Fineract' });
    }

    const data: FineractAuthResponse = json;

    // Store token in HttpOnly cookie
    res.cookie('auth', data.base64EncodedAuthenticationKey, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return res.json({
      username: data.username,
      roles: data.roles,
      permissions: data.permissions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// LOGOUT
export function logout(req: Request, res: Response): Response<any, Record<string, any>> {
  res.clearCookie('auth');
  return res.json({ success: true });
}

// CHECK AUTH
// export async function checkAuth(
//   req: Request
// ): Promise<{ user: FineractAuthResponse | null; authenticated: boolean }> {
//   const token = req.cookies['auth'];
//   console.log('[checkAuth] incoming cookies:', req.cookies);
//   console.log('[checkAuth] extracted token:', token);

//   if (!token) {
//     console.warn('[checkAuth] no auth token found');
//     return { user: null, authenticated: false };
//   }

//   try {
//     console.log('[checkAuth] validating token against Fineract...');
//     const res = await fetch(`${env.apiBase}${env.checkAuth}`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Basic ${token}`,
//         'Content-Type': 'application/json',
//       },
//       agent: httpsAgent,
//     });

//     console.log('[checkAuth] Fineract response status:', res.status);

//     if (!res.ok) {
//       const text = await res.text();
//       console.warn('[checkAuth] invalid response:', text);
//       return { user: null, authenticated: false };
//     }

//     const json = await res.json();
//     console.log('[checkAuth] Fineract response JSON:', json);

//     if (!isFineractAuthResponse(json)) {
//       console.error('[checkAuth] response is not FineractAuthResponse');
//       return { user: null, authenticated: false };
//     }

//     return { user: json, authenticated: true };
//   } catch (err) {
//     console.error('[checkAuth] error while validating:', err);
//     return { user: null, authenticated: false };
//   }
// }

