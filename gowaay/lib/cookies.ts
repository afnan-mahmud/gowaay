/**
 * Cookie utilities for pixel tracking
 */

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function getFBP(): string | null {
  return getCookie('_fbp');
}

export function getFBC(): string | null {
  return getCookie('_fbc');
}

export function getPixelCookies(): { fbp: string | null; fbc: string | null } {
  return {
    fbp: getFBP(),
    fbc: getFBC(),
  };
}
