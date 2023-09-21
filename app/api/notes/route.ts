import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import MockDB from '../../../__mocks/mockdb';
import { INote } from '../../../types/note';
import { IPatient } from '../../../types/patient';

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
    return fn();
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
  if (!note.patient_id) {
    throw new ValidationError('Note must have a patient associated');
  }
  if (!note.title) {
    throw new ValidationError('Note must have a title');
  }
  if (!note.content || note.content.length < 20 || note.content.length > 300) {
    throw new ValidationError('Note must be between 20 and 300 characters');
  }
};

interface INoteWithPatient extends INote {
  patient: IPatient;
}

export async function GET(request: NextRequest): Promise<NextResponse | void> {
  return await handler(async () => {
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 1000;
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const merge = request.nextUrl.searchParams.get('merge');
    const data = (await db.find({
      table: 'notes',
      limit,
      page,
    })) as INote[];
    // Really rough, but works for our purposes
    if (merge && merge === 'patient') {
      const patients = await db.find({ table: 'patients' });
      data.forEach((note: INote) => {
        const patient = patients.find(
          patient => (patient as IPatient).id === note.patient_id
        );
        (note as INoteWithPatient).patient = patient as IPatient;
      });
    }
    return NextResponse.json(data, { status: 200 });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse | void> {
  return handler(async () => {
    const body = await request.json();
    validateNote(body);
    const data = await db.insert('notes', {
      ...body,
      id: body.id || uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json(data, { status: 201 });
  });
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse | void> {
  return handler(async () => {
    const body = await request.json();
    validateNote(body);
    const data = await db.update(
      'notes',
      { id: body.id },
      {
        ...body,
        updated_at: new Date().toISOString(),
      }
    );
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
