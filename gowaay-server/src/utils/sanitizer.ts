/**
 * Text sanitizer utility that detects and blocks contact information
 * Returns {clean: boolean, reason?: string}
 */

// Phone number patterns
const EN_PHONE_PATTERN = /(?<!\d)(\+?88)?0?1[3-9]\d{8}(?!\d)/g;
const URL_PATTERN = /\b(https?:\/\/|www\.)[^\s]+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// Obfuscated phone patterns (allows spaces, hyphens, dots between digits)
const OBFUSCATED_PHONE_PATTERN = /(\+?8?8?0?1[3-9](\D*\d){7,8})/gi;

// Additional patterns for better detection
const WWW_PATTERN = /\bwww\.[^\s]+/gi;
const SPACED_DIGITS_PATTERN = /(\d[\s\-\.]*){10,}/g; // 10 or more digits with optional spaces, hyphens, dots

// More flexible phone detection - extract digits and check if it's a valid phone
const FLEXIBLE_PHONE_PATTERN = /(\+?8?8?0(\D*1[3-9](\D*\d)+)|0?1[3-9](\D*\d)+)/gi;

// Bangla contact-related words
const BANGLA_CONTACT_WORDS = /(ফোন|নাম্বার|মোবাইল|ইমেইল|মেইল|ওয়েবসাইট|সাইট|কন্টাক্ট|যোগাযোগ)/gi;

// Bangla digit mapping
const BANGLA_TO_ENGLISH_DIGITS: { [key: string]: string } = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

/**
 * Convert Bangla digits to English digits
 */
function convertBanglaToEnglish(text: string): string {
  return text.replace(/[০-৯]/g, (match) => BANGLA_TO_ENGLISH_DIGITS[match] || match);
}

/**
 * Check if text contains Bangla contact words near digits or email symbols
 */
function hasBanglaContactWords(text: string): boolean {
  const words = BANGLA_CONTACT_WORDS;
  let match;
  
  while ((match = words.exec(text)) !== null) {
    const wordIndex = match.index;
    const wordEnd = wordIndex + match[0].length;
    
    // Check 20 characters before and after the word for digits or @/dot
    const contextStart = Math.max(0, wordIndex - 20);
    const contextEnd = Math.min(text.length, wordEnd + 20);
    const context = text.slice(contextStart, contextEnd);
    
    // Look for digits, @, or dots in the context
    if (/\d|@|\./.test(context)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for obfuscated phone numbers
 */
function hasObfuscatedPhone(text: string): boolean {
  return OBFUSCATED_PHONE_PATTERN.test(text);
}

/**
 * Check for English phone numbers
 */
function hasEnglishPhone(text: string): boolean {
  return EN_PHONE_PATTERN.test(text);
}

/**
 * Check for Bangla phone numbers (after converting to English)
 */
function hasBanglaPhone(text: string): boolean {
  const convertedText = convertBanglaToEnglish(text);
  return EN_PHONE_PATTERN.test(convertedText);
}

/**
 * Check for email addresses
 */
function hasEmail(text: string): boolean {
  return EMAIL_PATTERN.test(text);
}

/**
 * Check for URLs
 */
function hasUrl(text: string): boolean {
  return URL_PATTERN.test(text);
}

/**
 * Check for www URLs
 */
function hasWwwUrl(text: string): boolean {
  return WWW_PATTERN.test(text);
}

/**
 * Check for spaced digits (potential phone obfuscation)
 */
function hasSpacedDigits(text: string): boolean {
  const matches = text.match(SPACED_DIGITS_PATTERN);
  if (!matches) return false;
  
  for (const match of matches) {
    // Extract only digits
    const digitsOnly = match.replace(/\D/g, '');
    
    // Check if it's a valid phone number length and format
    if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
      // Check if it starts with valid Bangladesh mobile prefix
      if (/^01[3-9]/.test(digitsOnly) || /^8801[3-9]/.test(digitsOnly)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check for flexible phone patterns and validate
 */
function hasFlexiblePhone(text: string): boolean {
  const matches = text.match(FLEXIBLE_PHONE_PATTERN);
  if (!matches) return false;
  
  for (const match of matches) {
    // Extract only digits
    const digitsOnly = match.replace(/\D/g, '');
    
    // Check if it's a valid phone number length and format
    if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
      // Check if it starts with valid Bangladesh mobile prefix
      if (/^01[3-9]/.test(digitsOnly) || /^8801[3-9]/.test(digitsOnly)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Main sanitizer function
 * @param text - The text to sanitize
 * @returns {clean: boolean, reason?: string}
 */
export function sanitizeText(text: string): { clean: boolean; reason?: string } {
  if (!text || typeof text !== 'string') {
    return { clean: true };
  }

  // Check for English phone numbers
  if (hasEnglishPhone(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for Bangla phone numbers
  if (hasBanglaPhone(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for obfuscated phone numbers
  if (hasObfuscatedPhone(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for email addresses
  if (hasEmail(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for URLs
  if (hasUrl(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for www URLs
  if (hasWwwUrl(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for spaced digits (potential phone obfuscation)
  if (hasSpacedDigits(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for flexible phone patterns
  if (hasFlexiblePhone(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  // Check for Bangla contact words near digits or email symbols
  if (hasBanglaContactWords(text)) {
    return { clean: false, reason: 'contact-info' };
  }

  return { clean: true };
}

/**
 * Test function to validate sanitizer patterns
 */
export function testSanitizer() {
  const testCases = [
    // Should be blocked
    { text: '01712345678', expected: false },
    { text: 'Call me at 01712345678', expected: false },
    { text: '০১৭১২৩৪৫৬৭৮', expected: false },
    { text: 'test@example.com', expected: false },
    { text: 'Visit https://example.com', expected: false },
    { text: 'www.example.com', expected: false },
    { text: '0 1 7 1 2 3 4 5 6 7 8', expected: false },
    { text: '0-1-7-1-2-3-4-5-6-7-8', expected: false },
    { text: 'ফোন 01712345678', expected: false },
    { text: 'ইমেইল test@example.com', expected: false },
    { text: 'ওয়েবসাইট www.example.com', expected: false },
    { text: 'নাম্বার ০১৭১২৩৪৫৬৭৮', expected: false },
    
    // Should be allowed
    { text: 'Hello world', expected: true },
    { text: 'This is a normal message', expected: true },
    { text: 'I will call you later', expected: true },
    { text: 'ফোন কল করব', expected: true },
    { text: 'আমি তোমাকে দেখব', expected: true },
    { text: 'The price is 5000 taka', expected: true },
    { text: 'Room number 101', expected: true },
  ];

  console.log('🧪 Testing sanitizer...\n');
  
  testCases.forEach(({ text, expected }, index) => {
    const result = sanitizeText(text);
    const passed = result.clean === expected;
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} Test ${index + 1}: "${text}"`);
    console.log(`   Expected: ${expected ? 'clean' : 'blocked'}, Got: ${result.clean ? 'clean' : 'blocked'}`);
    if (!result.clean) {
      console.log(`   Reason: ${result.reason}`);
    }
    console.log('');
  });
}
