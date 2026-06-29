// Sanitization helper for any user-supplied or IPFS-sourced HTML content.
// DOMPurify is browser-only — import this module only in 'use client' components.
import DOMPurify from 'dompurify';

/** Strip all tags and attributes — safe for rendering IPFS text as plain text. */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/** Allow a restricted set of HTML tags for rich IPFS description rendering. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORCE_BODY: true,
  });
}
