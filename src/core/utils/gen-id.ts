const DEFAULT_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const ALPHABETS = {
  URL_SAFE: DEFAULT_ALPHABET,
  NUMERIC: '0123456789',
  LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz0123456789',
  HEX: '0123456789abcdef',
} as const;

/**
 * Generate a compact, URL-safe ID in NanoID style
 * @param size Length of the ID (default: 10)
 * @param alphabet Custom alphabet (default: URL-safe)
 * @returns Compact ID string
 */
export function genId(size: number = 10, alphabet: string = DEFAULT_ALPHABET): string {
  if (size <= 0) throw new Error('Size must be positive');
  if (alphabet.length === 0 || alphabet.length > 256) {
    throw new Error('Alphabet must contain 1-256 symbols');
  }

  let id = '';
  const randomArray = new Uint8Array(size);

  // Use cryptographically secure random generator
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomArray);
  } else {
    // Fallback for Node.js or older browsers
    for (let i = 0; i < size; i += 1) {
      randomArray[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < size; i += 1) {
    id += alphabet[randomArray[i] % alphabet.length];
  }

  return id;
}

/**
 * Generate a numeric ID (for cases where only numbers are needed)
 * @param size Length of the numeric ID (default: 8)
 * @returns Numeric ID string
 */
export function genNumId(size: number = 8): string {
  const numbers = ALPHABETS.NUMERIC;
  return genId(size, numbers);
}

/**
 * Generate a readable ID with only letters (no numbers)
 * @param size Length of the ID (default: 10)
 * @returns Letters-only ID
 */
export function genLetId(size: number = 10): string {
  const letters = ALPHABETS.LETTERS;
  return genId(size, letters);
}

/**
 * Generate ID with custom requirements
 * @param options Configuration options
 * @returns Custom ID
 */
export interface Options {
  size: number;
  prefix: string;
  suffix: string;
  alphabet: string;
}

export function genCustomId(options: Partial<Options> = {}): string {
  const { size = 10, prefix = '', suffix = '', alphabet = DEFAULT_ALPHABET } = options;
  const id = genId(size, alphabet);
  return `${prefix}${id}${suffix}`;
}

/**
 * Validate if string matches NanoID pattern
 * @param id String to validate
 * @param alphabet Expected alphabet (default: URL-safe)
 * @returns true if valid NanoID
 */
export function isValidExId(id: string, alphabet: string = DEFAULT_ALPHABET): boolean {
  if (!id || typeof id !== 'string') return false;

  const regex = new RegExp(`^[${alphabet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`);
  return regex.test(id);
}


// ---------------------------
// USE CASES
// ---------------------------

// Basic usage (10 characters)
genId(); // "A3b9Kx2mNp"

// Short ID (8 characters)
genId(8); // "A3b9Kx2m"

// Long ID (16 characters)
genId(16); // "A3b9Kx2mNpQ8rT1w"

// Numeric only
genNumId(8); // "42981736"

// Letter only
genLetId(10); // "KxmLpQrTwN"

// Custom ID
genCustomId({
  size: 12,
  prefix: 'office_',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}); // "office_A3B9KX2MNPQ8"