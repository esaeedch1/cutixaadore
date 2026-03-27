import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // 1. If visit .pk root, redirect to .pk/shop
    if (hostname.includes('cutixaadore.pk')) {
        if (url.pathname === '/') {
            return NextResponse.redirect(new URL('/shop', request.url));
        }
    }

    // 2. We can also handle potential 'pakistan' path if user wants
    // if (url.pathname === '/pakistan') {
    //   return NextResponse.redirect('https://cutixaadore.pk/shop');
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ['/'],
};
