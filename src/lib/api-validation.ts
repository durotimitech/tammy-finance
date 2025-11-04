import { NextRequest, NextResponse } from 'next/server';

export const MAX_BODY_SIZE = 1048576; // 1MB in bytes

export function validateContentType(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid Content-Type. Expected application/json' },
      { status: 415 },
    );
  }
  return null;
}

export function validateBodySize(
  request: NextRequest,
  maxSize: number = MAX_BODY_SIZE,
): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSize) {
      return NextResponse.json(
        { error: `Request body too large. Maximum size is ${Math.floor(maxSize / 1024)}KB.` },
        { status: 413 },
      );
    }
  }
  return null;
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T | NextResponse> {
  const bodySizeError = validateBodySize(request);
  if (bodySizeError) {
    return bodySizeError;
  }

  const validationError = validateContentType(request);
  if (validationError) {
    return validationError;
  }

  try {
    const body = await request.json();
    return body as T;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }
}
