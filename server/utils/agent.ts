import https from 'https';
import fetch, { RequestInit } from 'node-fetch';

// Helper for dev: ignore self-signed SSL
export const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function fetchFineract(url: string, options: RequestInit = {}) {
    return fetch(url, { ...options, agent: httpsAgent });
}