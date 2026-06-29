// Thin wrapper around Sentry so components don't import @sentry/nextjs directly.
// No-ops when NEXT_PUBLIC_SENTRY_DSN is absent.
import * as Sentry from '@sentry/nextjs';

export type ErrorContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function captureError(err: unknown, ctx?: ErrorContext): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    if (ctx?.tags)  Object.entries(ctx.tags).forEach(([k, v]) => scope.setTag(k, v));
    if (ctx?.extra) Object.entries(ctx.extra).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(err);
  });
}
