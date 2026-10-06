/**
 * Firestore Helper to ensure no `undefined` values are ever passed to setDoc or updateDoc.
 * Firestore throws a fatal error if any property in an object is `undefined`.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      // Omit undefined keys so Firestore never encounters them
      continue;
    } else if (value === null) {
      result[key] = null;
    } else if (Array.isArray(value)) {
      result[key] = value
        .filter((item) => item !== undefined)
        .map((item) => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item));
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
