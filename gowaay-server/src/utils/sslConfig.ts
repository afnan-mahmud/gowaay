/**
 * SSLCommerz Configuration Utility
 * Validates and provides SSL payment gateway configuration
 */

interface SSLConfig {
  storeId: string;
  storePassword: string;
  isLive: boolean;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

/**
 * Mask sensitive string for logging
 * Shows first 4 and last 4 characters, masks the middle
 */
function maskSensitive(value: string): string {
  if (!value) return '[EMPTY]';
  if (value.length <= 8) return '****';
  const start = value.substring(0, 4);
  const end = value.substring(value.length - 4);
  const middle = '*'.repeat(Math.min(value.length - 8, 8));
  return `${start}${middle}${end}`;
}

/**
 * Validate that URL is HTTPS and not localhost
 */
function isValidLiveUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           !parsed.hostname.includes('localhost') && 
           !parsed.hostname.includes('127.0.0.1');
  } catch {
    return false;
  }
}

/**
 * Load and validate SSLCommerz configuration
 * Throws error if required variables are missing
 */
export function loadSSLConfig(): SSLConfig {
  console.log('\n🔐 Loading SSLCommerz Configuration...');
  console.log('==========================================');

  // Read environment variables
  const storeId = process.env.SSL_STORE_ID;
  const storePassword = process.env.SSL_STORE_PASSWD;
  const isLiveStr = process.env.SSL_IS_LIVE || 'false';
  const successUrl = process.env.SSL_SUCCESS_URL || '';
  const failUrl = process.env.SSL_FAIL_URL || '';
  const cancelUrl = process.env.SSL_CANCEL_URL || '';
  const ipnUrl = process.env.SSL_IPN_URL || '';

  // Validate required variables
  const missing: string[] = [];
  if (!storeId || storeId.trim() === '') missing.push('SSL_STORE_ID');
  if (!storePassword || storePassword.trim() === '') missing.push('SSL_STORE_PASSWD');
  if (!successUrl) missing.push('SSL_SUCCESS_URL');
  if (!failUrl) missing.push('SSL_FAIL_URL');
  if (!cancelUrl) missing.push('SSL_CANCEL_URL');
  if (!ipnUrl) missing.push('SSL_IPN_URL');

  if (missing.length > 0) {
    console.error('❌ Missing required SSL environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    throw new Error(`Missing SSL configuration: ${missing.join(', ')}`);
  }

  // Parse is_live flag
  const isLive = isLiveStr.toLowerCase() === 'true';

  // Log configuration (masked)
  console.log(`✅ SSL_STORE_ID: ${maskSensitive(storeId!)}`);
  console.log(`✅ SSL_STORE_PASSWD: ${maskSensitive(storePassword!)}`);
  console.log(`✅ SSL_IS_LIVE: ${isLive ? '🔴 LIVE MODE' : '🟡 SANDBOX MODE'}`);
  console.log(`✅ Success URL: ${successUrl}`);
  console.log(`✅ Fail URL: ${failUrl}`);
  console.log(`✅ Cancel URL: ${cancelUrl}`);
  console.log(`✅ IPN URL: ${ipnUrl}`);

  // Validate HTTPS for live mode
  if (isLive) {
    console.log('\n⚠️  Live Mode Validation:');
    const urlsToValidate = [
      { name: 'Success URL', url: successUrl },
      { name: 'Fail URL', url: failUrl },
      { name: 'Cancel URL', url: cancelUrl },
      { name: 'IPN URL', url: ipnUrl },
    ];

    const invalidUrls: string[] = [];
    urlsToValidate.forEach(({ name, url }) => {
      if (!isValidLiveUrl(url)) {
        invalidUrls.push(name);
        console.warn(`   ❌ ${name} must be public HTTPS (not localhost): ${url}`);
      } else {
        console.log(`   ✅ ${name} is valid HTTPS`);
      }
    });

    if (invalidUrls.length > 0) {
      console.warn('\n⚠️  WARNING: Live mode is enabled but some callback URLs are not public HTTPS!');
      console.warn('   SSLCommerz requires all callback URLs to be:');
      console.warn('   1. HTTPS (not HTTP)');
      console.warn('   2. Publicly accessible (not localhost)');
      console.warn('   Payment callbacks may fail with current configuration.');
      console.warn('   Invalid URLs:', invalidUrls.join(', '));
    }
  }

  console.log('==========================================\n');

  return {
    storeId: storeId!,
    storePassword: storePassword!,
    isLive,
    successUrl,
    failUrl,
    cancelUrl,
    ipnUrl,
  };
}

/**
 * Get masked store ID for logging
 */
export function getMaskedStoreId(storeId: string): string {
  return maskSensitive(storeId);
}

// Initialize and export config
export const sslConfig = loadSSLConfig();

