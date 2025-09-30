import fetch, { RequestInit } from 'node-fetch';

export async function safeFetch(url: string, options: RequestInit) {
    const res = await fetch(url, options);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fetch failed: ${res.status} ${text}`);
    }

    // We try to return JSON, otherwise text
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}
