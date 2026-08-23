/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts.
 * Self-pings every 10 minutes to prevent Render free tier from sleeping.
 */

export async function register() {
  // Only run on the server (Node.js runtime), not during build or on the client
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    const SITE_URL = process.env.SITE_URL || 'https://www.nahraf.tech';
    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    console.log(`[Keep-Alive] Starting self-ping every 10 minutes to ${SITE_URL}`);

    setInterval(async () => {
      try {
        const res = await fetch(SITE_URL);
        console.log(`[Keep-Alive] Pinged ${SITE_URL} — Status: ${res.status}`);
      } catch (error: any) {
        console.log(`[Keep-Alive] Ping failed: ${error.message}`);
      }
    }, INTERVAL_MS);
  }
}
