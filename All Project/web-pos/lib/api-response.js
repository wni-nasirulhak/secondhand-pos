import { NextResponse } from 'next/server';

export function success(data = {}, status = 200) {
  if (Array.isArray(data)) {
    return NextResponse.json(data, { status });
  }
  return NextResponse.json({ success: true, ...data }, { status });
}

export function error(message, status = 400) {
  console.error(`API Error [${status}]:`, message);
  return NextResponse.json({ 
    success: false, 
    error: message,
    timestamp: new Date().toISOString()
  }, { status });
}

export function serverError(err) {
  console.error('Critical Server error:', err);
  return error('Internal Server Error', 500);
}
