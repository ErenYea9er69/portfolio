import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'visitor_counted';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
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

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    if (!sql) {
      // Graceful fallback to baseline if environment variable is not yet applied
      return NextResponse.json({
        count: BASELINE_VISITORS,
        incremented: false,
        fallback: true,
        warning: 'DATABASE_URL / POSTGRES_URL not configured in environment',
      });
    }

    const alreadyCounted = request.cookies.get(COOKIE_NAME)?.value === 'true';

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

      let currentCount = rows[0]?.count ? Number(rows[0].count) : 0;
      if (currentCount < BASELINE_VISITORS) {
        // Ensure baseline 290 is established in database
        try {
          const updateRows = await sql`
            INSERT INTO site_stats (key, count)
            VALUES ('visitors', ${BASELINE_VISITORS})
            ON CONFLICT (key)
            DO UPDATE SET count = GREATEST(site_stats.count, ${BASELINE_VISITORS})
            RETURNING count;
          `;
          currentCount = updateRows[0]?.count ? Number(updateRows[0].count) : BASELINE_VISITORS;
        } catch {
          currentCount = BASELINE_VISITORS;
        }
      }

      return NextResponse.json({ count: currentCount, incremented: false });
    }

    // New visitor: increment from at least BASELINE_VISITORS
    try {
      rows = await sql`
        INSERT INTO site_stats (key, count)
        VALUES ('visitors', ${BASELINE_VISITORS + 1})
        ON CONFLICT (key)
        DO UPDATE SET count = GREATEST(site_stats.count + 1, ${BASELINE_VISITORS + 1})
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
        DO UPDATE SET count = GREATEST(site_stats.count + 1, ${BASELINE_VISITORS + 1})
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

    return response;
  } catch (error) {
    console.error('Visitor count error:', error);
    // Return baseline count on connection / cold start error so UI never breaks
    return NextResponse.json({
      count: BASELINE_VISITORS,
      incremented: false,
      fallback: true,
      error: 'Database connection failed',
    });
  }
}
