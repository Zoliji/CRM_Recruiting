import { NextResponse } from 'next/server';

export function middleware(request) {
  // Authentication is handled client-side in AppLayout.jsx
  // because we are using Supabase v2 client which uses localStorage.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
