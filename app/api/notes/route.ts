import { NextRequest, NextResponse } from 'next/server';
import MockDB from '../../../__mocks/mockdb';
import { INote } from '../../../types/note';

/**
 * This is a custom error class that we will use to throw validation errors
 * from our API routes. This will allow us to return a 400 response with a
 * custom error message.
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * This is a wrapper function that will handle any errors thrown by the
 * function passed to it. If the function throws a ValidationError, it will
 * return a 400 response with the error message. Otherwise, it will return a
 * Goal is to abstract repetitive error handling logic from our API routes.
 */
const handler = async (fn: () => void): Promise<NextResponse | void> => {
  try {
    return await fn();
  } catch (e) {
    return e instanceof ValidationError
      ? NextResponse.json({ error: e.message }, { status: 400 })
      : NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * NOTE: Everything above here could be moved to a shared file and imported, but
 * for the sake of brevity, we will leave it here.
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

const db = new MockDB();

// Basic server-side validation will throw up to handler
const validateNote = (note: INote): ValidationError | void => {
  if (!note.title) {
    throw new ValidationError('Note must have a title');
  }
  if (!note.content || note.content.length < 20 || note.content.length > 300) {
    throw new ValidationError('Note must be between 20 and 300 characters');
  }
};

export async function GET(request: NextRequest): Promise<NextResponse | void> {
  return await handler(async () => {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 1000;
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const data = await db.find({
      table: 'notes',
      limit,
      page,
    });
    return NextResponse.json(data, { status: 200 });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse | void> {
  return handler(async () => {
    const body = await request.json();
    validateNote(body);
    const data = await db.insert('notes', body);
    return NextResponse.json(data, { status: 201 });
  });
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse | void> {
  return handler(async () => {
    const body = await request.json();
    validateNote(body);
    const data = await db.update('notes', { id: body.id }, body);
    return NextResponse.json(data, { status: 200 });
  });
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse | void> {
  return handler(async () => {
    const body = await request.json();
    await db.delete('notes', { id: body.id });
    return NextResponse.json({ deleted: 1 }, { status: 200 });
  });
}
