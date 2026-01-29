/**
 * Input sanitization utility for dashboard.
 *
 * This module provides functions to sanitize user inputs, API responses,
 * URL parameters, and any user-generated content to prevent XSS attacks.
 */

import DOMPurify from "dompurify";

// Configure DOMPurify with safe settings
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [], // Strip all HTML by default
  ALLOWED_ATTR: [], // Strip all attributes by default
  KEEP_CONTENT: true, // Keep text content
  SANITIZE_DOM: true,
  USE_PROFILES: { html: false },
};

/**
 * Sanitize text input - removes all HTML tags
 * Use for: Form inputs, text fields, search queries
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, PURIFY_CONFIG);
}

/**
 * Sanitize text but preserve line breaks
 * Use for: Textareas, multi-line inputs
 */
export function sanitizeTextWithLineBreaks(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ...PURIFY_CONFIG,
    ALLOWED_TAGS: ["br"],
  }).replace(/\n/g, "<br>");
}

/**
 * Sanitize rich text content
 * Use for: Content that might need basic formatting
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "p",
      "br",
      "ul",
      "ol",
      "li",
    ],
    ALLOWED_ATTR: [],
    SANITIZE_DOM: true,
  });
}

/**
 * Sanitize email address
 * Validates and sanitizes email format
 */
export function sanitizeEmail(input: string): string {
  if (!input) return "";
  const sanitized = sanitizeText(input).trim().toLowerCase();
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize URL parameter
 * Use for: URL params, query strings
 */
export function sanitizeUrlParam(input: string): string {
  if (!input) return "";
  return encodeURIComponent(sanitizeText(input));
}

/**
 * Sanitize number input
 * Validates and returns a safe number
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === "number") {
    return isFinite(input) ? input : null;
  }
  if (!input) return null;
  const num = parseFloat(sanitizeText(input));
  return isFinite(num) ? num : null;
}

/**
 * Sanitize integer input
 * Validates and returns a safe integer
 */
export function sanitizeInteger(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isInteger(input) && isFinite(input) ? input : null;
  }
  if (!input) return null;
  const num = parseInt(sanitizeText(input), 10);
  return Number.isInteger(num) && isFinite(num) ? num : null;
}

/**
 * Sanitize object recursively
 * Use for: API request/response objects
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeText(obj) as unknown as T;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Validate and sanitize password
 * Returns sanitized password or empty string if invalid
 */
export function sanitizePassword(input: string): string {
  if (!input) return "";
  // Remove control characters and trim
  return input.replace(/[\x00-\x1F\x7F]/g, "").trim();
}

/**
 * Sanitize filename
 * Use for: File uploads, file names
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";
  // Remove path traversal characters and sanitize
  return sanitizeText(filename)
    .replace(/[\\/:*?"<>|]/g, "") // Remove invalid filename characters
    .replace(/^\.+/, "") // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize ID/UUID
 * Use for: IDs, UUIDs, slugs
 */
export function sanitizeId(input: string): string {
  if (!input) return "";
  // Allow alphanumeric, hyphens, and underscores only
  return sanitizeText(input).replace(/[^a-zA-Z0-9-_]/g, "");
}

/**
 * Sanitize search query
 * Use for: Search inputs
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input) return "";
  return sanitizeText(input).trim().substring(0, 200); // Limit length
}

/**
 * Sanitize JSON string
 * Validates and sanitizes JSON input
 */
export function sanitizeJson(input: string): string {
  if (!input) return "";
  try {
    const parsed = JSON.parse(input);
    const sanitized = sanitizeObject(parsed);
    return JSON.stringify(sanitized);
  } catch {
    return "";
  }
}

/**
 * Strip all HTML and return plain text only
 * Use for: Titles, names, simple text fields
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = DOMPurify.sanitize(input);
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Sanitize API request body
 * Use before sending data to API
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(
  body: T
): T {
  return sanitizeObject(body);
}

/**
 * Sanitize API response data
 * Use when receiving data from API
 */
export function sanitizeResponseData<T>(data: T): T {
  return sanitizeObject(data);
}

/**
 * Validate and sanitize date string
 */
export function sanitizeDateString(input: string): string {
  if (!input) return "";
  const sanitized = sanitizeText(input).trim();
  // ISO 8601 date regex (basic validation)
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return dateRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize CSS class names
 */
export function sanitizeClassName(input: string): string {
  if (!input) return "";
  return sanitizeText(input)
    .replace(/[^a-zA-Z0-9-_\s]/g, "")
    .trim();
}

/**
 * Sanitize color value (hex, rgb, named colors)
 */
export function sanitizeColor(input: string): string {
  if (!input) return "";
  const sanitized = sanitizeText(input).trim();
  // Allow hex, rgb, rgba, hsl, and named colors
  const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|[a-zA-Z]+)$/;
  return colorRegex.test(sanitized) ? sanitized : "";
}

export default {
  sanitizeText,
  sanitizeTextWithLineBreaks,
  sanitizeRichText,
  sanitizeEmail,
  sanitizeUrlParam,
  sanitizeNumber,
  sanitizeInteger,
  sanitizeObject,
  sanitizePassword,
  sanitizeFilename,
  sanitizeId,
  sanitizeSearchQuery,
  sanitizeJson,
  stripHtml,
  sanitizeRequestBody,
  sanitizeResponseData,
  sanitizeDateString,
  sanitizeClassName,
  sanitizeColor,
};
