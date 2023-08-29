import { NextResponse } from 'next/server';
import MockDB from '../../../__mocks/mockdb';

const db = new MockDB();

export async function GET() {
  const data = await db.find({
    table: 'notes',
    query: { id: '37bac615-1a56-4aed-9a36-90594724af3a' },
  });
  return NextResponse.json(data);
}
