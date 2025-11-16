import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * OAuth Login Route Handler
 *
 * Handles OAuth login redirects and callbacks
 * Replaces rewrite: /login/oauth2/:path* -> ${apiUrl}/login/oauth2/:path*
 */
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = path.join('/');

  try {
    // Remove /api from the base URL for OAuth endpoints
    const baseUrl = API_BASE_URL.replace('/api', '');
    const targetUrl = new URL(`${baseUrl}/login/oauth2/${pathname}`);

    // Forward all query parameters (important for OAuth flow)
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    logger.log('[OAuth Login Proxy]', {
      method: request.method,
      targetUrl: targetUrl.toString(),
    });

    // For OAuth redirects, we typically want to redirect rather than proxy
    if (request.method === 'GET') {
      // Make a HEAD request first to check if this is a redirect
      const headResponse = await fetch(targetUrl.toString(), {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      // If the backend returns a redirect, follow it
      if (headResponse.status >= 300 && headResponse.status < 400) {
        const location = headResponse.headers.get('location');
        if (location) {
          return NextResponse.redirect(location, headResponse.status);
        }
      }

      // Otherwise, make the actual GET request
      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          return NextResponse.redirect(location, response.status);
        }
      }

      // Return the response
      const body = await response.text();
      return new NextResponse(body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') || 'text/html',
        },
      });
    }

    // For other methods, proxy normally
    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    logger.error('[OAuth Login Proxy Error]', {
      path: pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout', message: 'OAuth service took too long to respond' },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: 'OAuth service unavailable', message: 'Unable to connect to OAuth service' },
      { status: 503 },
    );
  }
}

export { handler as GET, handler as POST };
