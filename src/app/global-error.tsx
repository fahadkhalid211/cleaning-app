'use client';

// Last-resort page if the root layout itself fails. Self-contained: no app CSS or components.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '5rem 1rem' }}>
        <h1>Something went wrong</h1>
        <p>Please try again, or go back to the home page.</p>
        <p>
          <button type="button" onClick={reset} style={{ padding: '0.8rem 1.6rem', marginRight: 8 }}>Try again</button>
          {/* Plain anchor on purpose: forces a full reload past the broken layout. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">Back to home</a>
        </p>
      </body>
    </html>
  );
}
