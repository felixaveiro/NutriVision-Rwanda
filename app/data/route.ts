import { NextResponse } from 'next/server'

// Redirect /data to the canonical /data-sources page
export async function GET() {
  return NextResponse.redirect(new URL('/data-sources', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}
