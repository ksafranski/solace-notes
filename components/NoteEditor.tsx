/**
 * Note: this could be more atomic with a separate modal wrapper but
 * keeping it simple for now
 */

import { useEffect, useState } from 'react';
import { Input, Modal, Space, message } from 'antd';
import { INote } from '../types/note';
import TextArea from 'antd/es/input/TextArea';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { APIClient } from '../lib/api_client';

interface INoteEditorProps {
  note?: INote | Omit<INote, 'id'>;
  trigger: JSX.Element;
  onSave?: (note: INote, type: 'update' | 'create') => void;
}

const noteTemplate: Omit<INote, 'id'> & Partial<Pick<INote, 'id'>> = {
  title: '',
  content: '',
  created_at: '',
  updated_at: '',
};

const api = new APIClient();

export function NoteEditor({
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
      onSave && onSave(res, currentNote.id ? 'update' : 'create');
      message.success(`Note saved ${currentNote.id ? 'updated' : 'created'}!`);
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
          style={{ width: '100%', margin: '1rem 0' }}
        >
          <Input
            value={currentNote.title}
            onChange={e => {
              updateNoteProp('title', e.target.value);
            }}
            placeholder='Title'
          />
          <TextArea
            value={currentNote.content}
            onChange={e => updateNoteProp('content', e.target.value)}
            showCount
            maxLength={300}
            minLength={20}
            rows={7}
          />
        </Space>
      </Modal>
      <span onClick={() => setVisible(true)}>{trigger}</span>
    </>
  );
}
