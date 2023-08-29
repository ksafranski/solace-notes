import mock_notes_table from './mock_notes_table.json';

interface IQuery {
  [key: string]: string | number | boolean | null | undefined;
}

interface IGetParams {
  table: string;
  query?: IQuery;
  page?: number;
  limit?: number;
}

// Create fake store of data as tables
const tables: any = {
  notes: mock_notes_table,
};

export default class MockDB {
  public async find<T>(params: IGetParams): Promise<T[]> {
    const { table, query, limit = 1000, page = 1 } = params;
    let data = tables[table];
    // Handle key/value query
    if (query) {
      const keys = Object.keys(query);
      const filteredData = data.filter((item: any) => {
        return keys.every(key => {
          return String(item[key]) === query[key];
        });
      });
      data = filteredData;
    }
    // Handle pagination
    if (page) {
      const start = (page - 1) * limit;
      const end = page * limit;
      data = data.slice(start, end);
    }
    // Handle limit
    if (limit && !page) {
      data = data.slice(0, limit);
    }
    return Promise.resolve(data);
  }

  public async insert<T>(table: string, data: T): Promise<T> {
    tables[table].push(data);
    return Promise.resolve(data);
  }

  public async update<T>(table: string, query: any, data: T): Promise<T> {
    const keys = Object.keys(query);
    const item = tables[table].find((item: any) => {
      return keys.every(key => {
        return String(item[key]) === query[key];
      });
    });
    if (item) {
      Object.assign(item, data);
    }
    return Promise.resolve(item);
  }

  public delete = async (table: string, query: any): Promise<void> => {
    const keys = Object.keys(query);
    const item = tables[table].find((item: any) => {
      return keys.every(key => {
        return String(item[key]) === query[key];
      });
    });
    if (item) {
      const index = tables[table].indexOf(item);
      tables[table].splice(index, 1);
    }
    return Promise.resolve();
  };
}
