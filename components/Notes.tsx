'use client';
import { useEffect, useState } from 'react';
import { APIClient } from '../lib/api_client';
import { INote } from '../types/note';
import { applyStandardDateTimeFormat } from '../lib/date_time';

import { Table } from 'antd';
import { SearchBar } from './SearchBar';

const api = new APIClient();

interface INoteState extends INote {
  hidden: boolean; // Control search visibility
}

export function Notes(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false); // @TODO fix render flash
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<INoteState[]>([]);
  const getNotes = async () => {
    setLoading(true);
    const res = await api.call('getNotes', {});
    setNotes(res);
    setLoading(false);
    setMounted(true);
  };
  useEffect(() => {
    getNotes();
  }, []);
  return (
    <div className='notes'>
      {mounted && (
        <>
          <SearchBar
            onSearch={(str: string) => {
              setNotes(
                notes.map(note =>
                  note.title.includes(str)
                    ? { ...note, hidden: false }
                    : { ...note, hidden: true }
                )
              );
            }}
          />
          <Table
            style={{ width: '100%' }}
            bordered
            loading={loading}
            dataSource={notes.filter(note => !note.hidden)}
            columns={[
              {
                title: 'Title',
                dataIndex: 'title',
                ellipsis: {
                  showTitle: false,
                },
                sorter: {
                  compare: (a, b) => (a.title > b.title ? -1 : 1),
                },
              },
              {
                title: 'Created',
                render: note => applyStandardDateTimeFormat(note.created_at),
                width: 200,
                sorter: {
                  compare: (a, b) =>
                    Date.parse(a.created_at) - Date.parse(b.created_at),
                },
              },
              {
                title: 'Updated',
                render: note => applyStandardDateTimeFormat(note.updated_at),
                width: 200,
                sorter: {
                  compare: (a, b) =>
                    Date.parse(a.updated_at) - Date.parse(b.updated_at),
                },
              },
            ]}
            rowKey={note => note.id}
          />
        </>
      )}
    </div>
  );
}
