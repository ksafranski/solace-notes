import { NextRequest, NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';
import MockDB from '../../../__mocks/mockdb';
import { IPatient } from '../../../types/patient';

/**
 * This is a wrapper function that will handle any errors thrown by the
 * function passed to it. If the function throws a ValidationError, it will
 * return a 400 response with the error message. Otherwise, it will return a
 * Goal is to abstract repetitive error handling logic from our API routes.
 */
const handler = async (fn: () => void): Promise<NextResponse | void> => {
  try {
    return fn();
  } catch (e: any) {
    NextResponse.json({ error: e.message }, { status: 400 });
  }
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * NOTE: Everything above here could be moved to a shared file and imported, but
 * for the sake of brevity, we will leave it here.
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

const db = new MockDB();

export async function GET(request: NextRequest): Promise<NextResponse | void> {
  return await handler(async () => {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 1000;
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const qId = request.nextUrl.searchParams.get('id');
    const data = await db.find({
      table: 'patients',
      limit,
      page,
      query: qId ? { id: qId } : undefined,
    });
    return NextResponse.json(data, { status: 200 });
  });
}
