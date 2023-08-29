import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // @TODO: Add auth logic here
  // const authHeader = request.headers.get('authorization');
  Promise.resolve();
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
