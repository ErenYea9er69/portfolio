import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE_NAME = 'site_visitor_session_v3';
const COOKIE_MAX_AGE = 60 * 3; // 3-minute session cooldown
const BASELINE_VISITORS = 290;

function getDb() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!databaseUrl) return null;
  return neon(databaseUrl);
}

function setNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('CDN-Cache-Control', 'no-store');
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

function clearLegacyCookies(response: NextResponse) {
  // Clear any legacy 24-hour cookies that might be blocking test devices
  response.cookies.delete('visitor_counted');
  response.cookies.delete('visitor_session');
  response.cookies.delete('site_visitor_session');
  response.cookies.delete('site_visitor_session_v2');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    if (!sql) {
      const fallbackResponse = NextResponse.json({
        count: BASELINE_VISITORS,
        incremented: false,
        fallback: true,
        warning: 'DATABASE_URL / POSTGRES_URL not configured in environment',
      });
      clearLegacyCookies(fallbackResponse);
      return setNoCacheHeaders(fallbackResponse);
    }

    const forceIncrement = request.nextUrl.searchParams.get('force') === '1';
    const alreadyCounted = !forceIncrement && request.cookies.get(COOKIE_NAME)?.value === 'true';

    let rows: any;
    if (alreadyCounted) {
      try {
        rows = await sql`
          SELECT count FROM site_stats WHERE key = 'visitors' LIMIT 1;
        `;
      } catch {
        await sql`
          CREATE TABLE IF NOT EXISTS site_stats (
            key VARCHAR(50) PRIMARY KEY,
            count BIGINT NOT NULL DEFAULT ${BASELINE_VISITORS}
          );
        `;
        rows = await sql`
          SELECT count FROM site_stats WHERE key = 'visitors' LIMIT 1;
        `;
      }

      let currentCount = rows[0]?.count ? Number(rows[0].count) : BASELINE_VISITORS;
      if (currentCount < BASELINE_VISITORS) {
        try {
          const updateRows = await sql`
            INSERT INTO site_stats (key, count)
            VALUES ('visitors', ${BASELINE_VISITORS})
            ON CONFLICT (key)
            DO UPDATE SET count = GREATEST(COALESCE(site_stats.count, ${BASELINE_VISITORS}), ${BASELINE_VISITORS})
            RETURNING count;
          `;
          currentCount = updateRows[0]?.count ? Number(updateRows[0].count) : BASELINE_VISITORS;
        } catch {
          currentCount = BASELINE_VISITORS;
        }
      }

      const response = NextResponse.json({ count: currentCount, incremented: false });
      clearLegacyCookies(response);
      return setNoCacheHeaders(response);
    }

    // New visitor session: increment count
    try {
      rows = await sql`
        INSERT INTO site_stats (key, count)
        VALUES ('visitors', ${BASELINE_VISITORS + 1})
        ON CONFLICT (key)
        DO UPDATE SET count = GREATEST(COALESCE(site_stats.count, ${BASELINE_VISITORS}) + 1, ${BASELINE_VISITORS + 1})
        RETURNING count;
      `;
    } catch {
      await sql`
        CREATE TABLE IF NOT EXISTS site_stats (
          key VARCHAR(50) PRIMARY KEY,
          count BIGINT NOT NULL DEFAULT ${BASELINE_VISITORS}
        );
      `;
      rows = await sql`
        INSERT INTO site_stats (key, count)
        VALUES ('visitors', ${BASELINE_VISITORS + 1})
        ON CONFLICT (key)
        DO UPDATE SET count = GREATEST(COALESCE(site_stats.count, ${BASELINE_VISITORS}) + 1, ${BASELINE_VISITORS + 1})
        RETURNING count;
      `;
    }

    const newCount = rows[0]?.count ? Number(rows[0].count) : BASELINE_VISITORS + 1;

    const response = NextResponse.json({ count: newCount, incremented: true });
    response.cookies.set(COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    clearLegacyCookies(response);
    return setNoCacheHeaders(response);
  } catch (error) {
    console.error('Visitor count error:', error);
    const errorResponse = NextResponse.json({
      count: BASELINE_VISITORS,
      incremented: false,
      fallback: true,
      error: 'Database connection failed',
    });
    clearLegacyCookies(errorResponse);
    return setNoCacheHeaders(errorResponse);
  }
}
