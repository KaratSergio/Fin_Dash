import { Request, Response } from 'express';
import { env } from '../env/env.dev';
import { isFineractAuthResponse } from '../types/api-types';
import { fetchFineract } from '../utils/agent';


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

    req.session.fineractToken = json.base64EncodedAuthenticationKey;

    return res.json({
      username: json.username,
      roles: json.roles,
      permissions: json.permissions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// LOGOUT
export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
}

