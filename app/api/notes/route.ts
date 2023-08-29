import { NextResponse } from 'next/server';
import MockDB from '../../../__mocks/mockdb';

const db = new MockDB();

export async function GET() {
  const data = await db.find({
    table: 'notes',
  });
  return NextResponse.json(data);
}
