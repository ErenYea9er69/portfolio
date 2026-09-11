import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'visitor_counted';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  return neon(databaseUrl);
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ count: 0, error: 'DATABASE_URL not configured' });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS site_stats (
        key VARCHAR(50) PRIMARY KEY,
        count BIGINT NOT NULL DEFAULT 0
      );
    `;

    const alreadyCounted = request.cookies.get(COOKIE_NAME)?.value === 'true';

    if (alreadyCounted) {
      const rows = await sql`
        SELECT count FROM site_stats WHERE key = 'visitors' LIMIT 1;
      `;
      const currentCount = rows[0]?.count ? Number(rows[0].count) : 0;
      return NextResponse.json({ count: currentCount, incremented: false });
    }

    const rows = await sql`
      INSERT INTO site_stats (key, count)
      VALUES ('visitors', 1)
      ON CONFLICT (key)
      DO UPDATE SET count = site_stats.count + 1
      RETURNING count;
    `;

    const newCount = rows[0]?.count ? Number(rows[0].count) : 1;

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
    return NextResponse.json({ count: 0, error: 'Failed to fetch count' });
  }
}
