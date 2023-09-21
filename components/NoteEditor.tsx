import { useEffect, useState } from 'react';
import { Input, Modal, Select, Space, message } from 'antd';
import { INote } from '../types/note';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { APIClient } from '../lib/api_client';
import { IPatient } from '../types/patient';

interface INoteEditorProps {
  patients: IPatient[];
  note?: INote | Omit<INote, 'id'>;
  trigger: JSX.Element;
  onSave?: (note: INote, type: 'update' | 'create') => void;
}

const noteTemplate: Omit<INote, 'id'> & Partial<Pick<INote, 'id'>> = {
  title: '',
  content: '',
  patient_id: '',
  created_at: '',
  updated_at: '',
};

const api = new APIClient();

export function NoteEditor({
  patients,
  note = noteTemplate,
  trigger,
  onSave,
}: INoteEditorProps): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<INote | typeof noteTemplate>(
    note
  );
  const [savingNote, setSavingNote] = useState<boolean>(false);
  useEffect(() => {
    setCurrentNote(visible ? note : noteTemplate);
  }, [visible]);
  // Overriding the note prop with the current note state on change
  const updateNoteProp = (prop: keyof INote, value: string) => {
    setCurrentNote({
      ...currentNote,
      [prop]: value,
    });
  };
  // Call method based on note save type (has id or not)
  const saveNote = async (): Promise<void> => {
    setSavingNote(true);
    try {
      const res = currentNote.id
        ? await api.call('updateNote', { body: currentNote })
        : await api.call('createNote', { body: currentNote });
      // Fire callback from props
      onSave && onSave(res, currentNote.id ? 'update' : 'create');
      message.success(
        `Note ${currentNote.id ? 'updated' : 'created'} successfully!`
      );
      setCurrentNote(res);
    } catch (err: any) {
      message.error(`Failed to save note: ${err.message}`);
    }
    setSavingNote(false);
  };
  return (
    <>
      <Modal
        title='Note Editor'
        open={visible}
        okText='Save'
        cancelText='Close'
        okButtonProps={{
          disabled:
            !currentNote.patient_id ||
            !currentNote.title ||
            !currentNote.content ||
            currentNote.content.length < 20 ||
            savingNote,
          icon: savingNote ? <LoadingOutlined /> : <CheckOutlined />,
        }}
        onOk={() => {
          saveNote();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Space
          direction='vertical'
          size='large'
          style={{ width: '100%', margin: '1rem 0 2em 0' }}
        >
          <Select
            value={currentNote.patient_id}
            onChange={value => updateNoteProp('patient_id', value)}
            placeholder='Select Patient'
            style={{ width: '100%' }}
            options={patients.map((p: IPatient) => ({
              label: `${p.first_name} ${p.last_name}`,
              value: p.id,
              key: p.id,
            }))}
            status={currentNote.patient_id ? '' : 'error'}
          />
          <Input
            value={currentNote.title}
            onChange={e => {
              updateNoteProp('title', e.target.value);
            }}
            placeholder='Title'
            status={currentNote.title ? '' : 'error'}
          />
          <Input.TextArea
            value={currentNote.content}
            onChange={e => updateNoteProp('content', e.target.value)}
            showCount
            maxLength={300}
            minLength={20}
            rows={7}
          />
          <p
            style={{
              fontSize: '0.9em',
              color: currentNote.content.length < 20 ? '#cd5454' : '#ccc',
              margin: '-1.35rem 0 0 .5em',
              padding: 0,
            }}
          >
            Must be at least 20 characters
          </p>
        </Space>
      </Modal>
      <span onClick={() => setVisible(true)}>{trigger}</span>
    </>
  );
}
