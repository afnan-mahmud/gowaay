/**
 * Client-side environment variables utility
 * Only exposes public environment variables (NEXT_PUBLIC_*)
 */

export function getEnv() {
  return {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    IMG_BASE_URL: process.env.NEXT_PUBLIC_IMG_BASE_URL || 'http://localhost:8080',
    FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_DB_URL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  };
}

export const env = getEnv();
