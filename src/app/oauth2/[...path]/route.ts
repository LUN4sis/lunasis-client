import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * OAuth2 Authorization Route Handler
 *
 * Handles OAuth2 authorization endpoints
 * Replaces rewrite: /oauth2/:path* -> ${apiUrl}/oauth2/:path*
 */
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = path.join('/');

  try {
    // Remove /api from the base URL for OAuth endpoints
    const baseUrl = API_BASE_URL.replace('/api', '');
    const targetUrl = new URL(`${baseUrl}/oauth2/${pathname}`);

    // Forward all query parameters (critical for OAuth flow)
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    logger.log('[OAuth2 Authorization Proxy]', {
      method: request.method,
      targetUrl: targetUrl.toString(),
    });

    // Prepare headers
    const headers = new Headers();

    // Forward cookies (important for OAuth state)
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual', // Handle redirects manually
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    };

    // Include body for POST requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Make the request
    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Handle redirects (common in OAuth flows)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Create a proper redirect response
        return NextResponse.redirect(location, response.status);
      }
    }

    // Get response body
    const responseBody = await response.text();

    // Create response
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward important headers
    const headersToForward = ['content-type', 'set-cookie', 'cache-control', 'location'];

    headersToForward.forEach((headerName) => {
      const value = response.headers.get(headerName);
      if (value) {
        nextResponse.headers.set(headerName, value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error('[OAuth2 Authorization Proxy Error]', {
      path: pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout', message: 'OAuth2 service took too long to respond' },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: 'OAuth2 service unavailable', message: 'Unable to connect to OAuth2 service' },
      { status: 503 },
    );
  }
}

export { handler as GET, handler as POST };
