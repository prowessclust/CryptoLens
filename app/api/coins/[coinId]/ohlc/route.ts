import { fetcher } from '@/lib/coingecko.actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '1';
    const vs_currency = searchParams.get('vs_currency') || 'usd';
    
    const data = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
      vs_currency,
      days,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OHLC data' },
      { status: 500 }
    );
  }
}
