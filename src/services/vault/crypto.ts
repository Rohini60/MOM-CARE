/**
 * Web Crypto API implementation for My Health Vault:
 * - PBKDF2 with SHA-256 and >= 200,000 iterations for key derivation and salted hash verification
 * - AES-GCM 256-bit encryption for local files and extracted health data
 * - Never stores plaintext passwords, PINs, or pattern sequences
 */

const PBKDF2_ITERATIONS = 210000;

export function generateRandomSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bufferToHex(salt);
}

export function generateRandomIV(): Uint8Array {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Derives a salted verification hash for comparing lock attempts without storing plaintext.
 */
export async function deriveVerificationHash(secret: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = hexToBuffer(saltHex);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return bufferToHex(derivedBits);
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from user lock string and salt.
 * Key is held ONLY in memory while vault is active.
 */
export async function deriveVaultAesKey(secret: string, saltHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const saltBytes = hexToBuffer(saltHex);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable from memory
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string (e.g. JSON data) with AES-GCM using in-memory CryptoKey.
 * Returns { ciphertextBase64, ivHex }
 */
export async function encryptText(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertextBase64: string; ivHex: string }> {
  const enc = new TextEncoder();
  const iv = generateRandomIV();
  const encoded = enc.encode(plaintext);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  );

  const bytes = new Uint8Array(encryptedBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const ciphertextBase64 = btoa(binary);

  return {
    ciphertextBase64,
    ivHex: bufferToHex(iv),
  };
}

/**
 * Decrypts a ciphertextBase64 string back to plaintext using in-memory CryptoKey.
 */
export async function decryptText(
  key: CryptoKey,
  ciphertextBase64: string,
  ivHex: string
): Promise<string> {
  const iv = hexToBuffer(ivHex);
  const binary = atob(ciphertextBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    bytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Encrypts raw binary ArrayBuffer (e.g. PDF / image) with AES-GCM.
 */
export async function encryptArrayBuffer(
  key: CryptoKey,
  buffer: ArrayBuffer
): Promise<{ encryptedBuffer: ArrayBuffer; ivHex: string }> {
  const iv = generateRandomIV();
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    buffer
  );

  return {
    encryptedBuffer,
    ivHex: bufferToHex(iv),
  };
}

/**
 * Decrypts raw encrypted binary ArrayBuffer back to original ArrayBuffer.
 */
export async function decryptArrayBuffer(
  key: CryptoKey,
  encryptedBuffer: ArrayBuffer,
  ivHex: string
): Promise<ArrayBuffer> {
  const iv = hexToBuffer(ivHex);
  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedBuffer
  );
}
