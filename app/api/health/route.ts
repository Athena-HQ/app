import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Health check endpoint hit!');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
