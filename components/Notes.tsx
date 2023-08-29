'use client';
import { useEffect, useState } from 'react';
import { APIClient } from '../lib/api_client';
import { INote } from '../types/note';

import { Table } from 'antd';

const api = new APIClient();

export function Notes(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false); // @TODO fix render flash
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<INote[]>([]);
  const getNotes = async () => {
    setLoading(true);
    const res = await api.call('getNotes', { limit: 10 });
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
        <Table
          style={{ width: '100%' }}
          bordered
          loading={loading}
          dataSource={notes}
          columns={[{ title: 'ID', dataIndex: 'id' }]}
          rowKey={note => note.id}
        />
      )}
    </div>
  );
}
