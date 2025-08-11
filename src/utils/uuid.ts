/**
 * UUID generation utility with cross-platform compatibility
*/
/**
 * Generates a UUID v4 string with fallback for environments without crypto.randomUUID
*/
export function generateUUID(): string {
  // Try to use the native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // Warning logged silently
    }
  }
  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
/**
 * Generates a short UUID (8 characters) for cases where a full UUID is not needed
*/
export function generateShortUUID(): string {
  return generateUUID().substring(0, 8);
}
/**
 * Validates if a string is a valid UUID v4
*/
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
