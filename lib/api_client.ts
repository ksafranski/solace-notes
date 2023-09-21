import { INote } from '../types/note';

interface IGetNotesParams {
  limit?: number;
  page?: number;
  merge?: string;
}

interface IPayloadNoteParams {
  body: INote;
}

interface IDefinitions {
  [key: string]: (params: any) => {
    url: string;
    method: string;
  };
}

const definitions: IDefinitions = {
  getNotes: (params: IGetNotesParams) => {
    return {
      url: `/api/notes?limit=${params.limit}&page=${params.page}&merge=${params.merge}`,
      method: 'get',
    };
  },
  createNote: (params: IPayloadNoteParams) => {
    return {
      url: '/api/notes',
      method: 'post',
      body: params.body,
    };
  },
  updateNote: (params: IPayloadNoteParams) => {
    return {
      url: `/api/notes/`,
      method: 'patch',
      body: params.body,
    };
  },
  deleteNote: (params: IPayloadNoteParams) => {
    return {
      url: `/api/notes/`,
      method: 'delete',
      body: params.body,
    };
  },
  getPatients: () => {
    return {
      url: `/api/patients`,
      method: 'get',
    };
  },
};

type IDefintionsKeys = keyof typeof definitions;

export class APIClient {
  [key: string]: any; // Call sig for dynamic methods

  async get(url: string): Promise<Response> {
    return await fetch(url);
  }

  async post(url: string, params: any): Promise<Response> {
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify(params.body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async patch(url: string, params: any): Promise<Response> {
    return await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(params.body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async delete(url: string, params: any): Promise<Response> {
    return await fetch(url, {
      method: 'DELETE',
      body: JSON.stringify(params.body),
    });
  }

  async call(name: IDefintionsKeys, params: object): Promise<any> {
    const { url, method } = definitions[name](params);
    const res = await this[method](url, params);
    return await res?.json();
  }
}
