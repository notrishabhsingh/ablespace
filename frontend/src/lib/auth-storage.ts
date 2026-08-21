/**
 * Tiny wrapper around localStorage for the JWT session token. Kept in one place
 * so the axios client, the auth hook and the login flow all agree on the key.
 * All access is guarded for SSR (no `window` on the server).
 */
const TOKEN_KEY = 'pyramid.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}
