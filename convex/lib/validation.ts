/**
 * Input validation utilities for preventing XSS and ensuring data quality
 *
 * SECURITY: These validators prevent:
 * - XSS attacks via excessively long inputs
 * - Database bloat from huge strings
 * - Invalid data formats
 */

// Maximum length constants
export const MAX_LENGTHS = {
  TITLE: 200,
  DESCRIPTION: 10000,
  CONTENT: 100000, // Blog posts can be long
  TAG: 50,
  URL: 2000,
  EMAIL: 320, // RFC 5321 max email length
  USERNAME: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
} as const;

export const MAX_TAGS = 20;

/**
 * Validates and trims a string to max length
 * @throws Error if string exceeds max length
 */
export function validateString(value: string, fieldName: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less (got ${trimmed.length})`);
  }

  return trimmed;
}

/**
 * Validates an optional string (can be empty/undefined)
 */
export function validateOptionalString(
  value: string | undefined,
  fieldName: string,
  maxLength: number
): string | undefined {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less (got ${trimmed.length})`);
  }

  return trimmed;
}

/**
 * Validates URL format
 */
export function validateUrl(url: string | undefined, fieldName: string): string | undefined {
  if (!url || url.trim().length === 0) {
    return undefined;
  }

  const trimmed = url.trim();

  if (trimmed.length > MAX_LENGTHS.URL) {
    throw new Error(`${fieldName} URL too long (max ${MAX_LENGTHS.URL} characters)`);
  }

  // Basic URL validation
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > MAX_LENGTHS.EMAIL) {
    throw new Error(`Email too long (max ${MAX_LENGTHS.EMAIL} characters)`);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }

  return trimmed;
}

/**
 * Validates array of tags
 */
export function validateTags(tags: string[]): string[] {
  if (tags.length > MAX_TAGS) {
    throw new Error(`Too many tags (max ${MAX_TAGS})`);
  }

  const validatedTags: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();

    if (trimmed.length === 0) {
      continue; // Skip empty tags
    }

    if (trimmed.length > MAX_LENGTHS.TAG) {
      throw new Error(`Tag "${trimmed.substring(0, 20)}..." is too long (max ${MAX_LENGTHS.TAG} characters)`);
    }

    validatedTags.push(trimmed);
  }

  return validatedTags;
}

/**
 * Validates password requirements
 */
export function validatePassword(password: string): void {
  if (password.length < MAX_LENGTHS.PASSWORD_MIN) {
    throw new Error(`Password must be at least ${MAX_LENGTHS.PASSWORD_MIN} characters`);
  }

  if (password.length > MAX_LENGTHS.PASSWORD_MAX) {
    throw new Error(`Password must be ${MAX_LENGTHS.PASSWORD_MAX} characters or less`);
  }
}
