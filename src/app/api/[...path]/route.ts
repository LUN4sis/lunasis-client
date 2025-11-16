import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * API Route Handler for proxying requests to backend
 *
 * This replaces the rewrites in next.config.ts to avoid ROUTER_EXTERNAL_TARGET_HANDSHAKE_ERROR
 * on Vercel deployments. Route Handlers provide better control over error handling and timeouts.
 */
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = path.join('/');

  try {
    // Construct the target URL
    const targetUrl = new URL(`${API_BASE_URL}/${pathname}`);

    // Forward query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Prepare headers - forward relevant headers from the original request
    const headers = new Headers();

    // Forward authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // Forward content-type
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    // Forward cookies
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }

    // Set standard headers
    headers.set('Accept', request.headers.get('accept') || 'application/json');
    headers.set('User-Agent', request.headers.get('user-agent') || 'Next.js API Proxy');

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    };

    // Include body for POST, PUT, PATCH, DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Make the request to the backend
    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Get response body
    const responseBody = await response.text();

    // Create NextResponse with the same status
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward relevant response headers
    const headersToForward = [
      'content-type',
      'cache-control',
      'set-cookie',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
    ];

    headersToForward.forEach((headerName) => {
      const value = response.headers.get(headerName);
      if (value) {
        nextResponse.headers.set(headerName, value);
      }
    });

    return nextResponse;
  } catch (error) {
    logger.error('[API Proxy Error]', {
      path: pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout', message: 'The backend service took too long to respond' },
        { status: 504 },
      );
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Unable to connect to the backend service' },
        { status: 503 },
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
