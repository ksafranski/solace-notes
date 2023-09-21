'use client';
import { useEffect, useState } from 'react';
import { APIClient } from '../lib/api_client';
import { INote } from '../types/note';
import { IPatient } from '../types/patient';
import { applyStandardDateTimeFormat } from '../lib/date_time';
import { Col, Row, Popconfirm, Table, Button } from 'antd';
import { SearchBar } from './SearchBar';
import {
  DeleteTwoTone,
  EditTwoTone,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { NoteEditor } from './NoteEditor';

const api = new APIClient();

interface INoteStateItem extends INote {
  hidden?: boolean; // Control search visibility
  patient?: IPatient;
}

export function Notes(): JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false); // @TODO fix render flash hack
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<INoteStateItem[]>([]);
  const [patients, setPatients] = useState<IPatient[]>([]);

  const getNotes = async () => {
    setLoading(true);
    const res = await api.call('getNotes', { merge: 'patient' });
    setNotes(res);
    setLoading(false);
    setMounted(true);
  };

  const getPatients = async () => {
    const res = await api.call('getPatients', {});
    setPatients(res);
  };

  // Callback for NoteEditor to handle resync on state after create/update
  const onNoteSave = (note: INote, type: 'update' | 'create') => {
    const insertNote = Object.assign({}, note, {
      patient: patients.find(p => p.id === note.patient_id),
    });
    if (type === 'update') {
      setNotes(notes.map(n => (n.id === insertNote.id ? insertNote : n)));
    } else if (type === 'create') {
      setNotes([insertNote, ...notes]);
    }
  };

  useEffect(() => {
    getNotes();
    getPatients();
  }, []);

  return (
    <div className='notes'>
      {mounted && (
        <>
          <Row gutter={20}>
            <Col flex={0}>
              <NoteEditor
                onSave={onNoteSave}
                patients={patients}
                trigger={
                  <Button
                    style={{ fontSize: '1em' }}
                    size='large'
                    type='primary'
                    icon={<PlusCircleOutlined />}
                  >
                    Create New Note
                  </Button>
                }
              />
            </Col>
            <Col flex={1}>
              <SearchBar
                onSearch={(str: string) => {
                  setNotes(
                    notes.map(note =>
                      note.content.toLowerCase().includes(str.toLowerCase())
                        ? { ...note, hidden: false }
                        : { ...note, hidden: true }
                    )
                  );
                }}
              />
            </Col>
          </Row>
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
                title: 'Patient',
                dataIndex: 'patient',
                render: patient => (
                  <div>
                    {patient.first_name} {patient.last_name}
                  </div>
                ),
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
              {
                title: '',
                width: 50,
                render: note => (
                  <NoteEditor
                    patients={patients}
                    note={note}
                    trigger={<EditTwoTone style={{ cursor: 'pointer' }} />}
                    onSave={onNoteSave}
                  />
                ),
              },
              {
                title: '',
                width: 50,
                render: note => (
                  <Popconfirm
                    title='Delete this note?'
                    icon={false}
                    onConfirm={async () => {
                      await api.call('deleteNote', { body: { id: note.id } });
                      setNotes(notes.filter(n => n.id !== note.id));
                    }}
                  >
                    <DeleteTwoTone
                      twoToneColor={'#ff4d4f'}
                      style={{ cursor: 'pointer' }}
                    />
                  </Popconfirm>
                ),
              },
            ]}
            rowKey={note => note.id}
          />
        </>
      )}
    </div>
  );
}
