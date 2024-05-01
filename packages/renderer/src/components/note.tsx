import {useAtomValue, useSetAtom} from 'jotai';
import React, {ComponentProps, useState, useCallback} from 'react';
import {saveNoteAtom, selectedNoteAtom} from '/@/store';
import {Editor, Preview} from '/@/components';
import lodash from 'lodash';
import {NoteContent} from '@shared/models';
const {throttle} = lodash;
import {autoSavingTime} from '@shared/constants';

export const Note = () => {
  const selectedNote = useAtomValue(selectedNoteAtom);
  const saveNote = useSetAtom(saveNoteAtom);

  if (!selectedNote) return null;

  const handleAutoSaving = throttle(
    async (content: NoteContent) => {
      if (!selectedNote) return;
      console.log('Auto Saving Note:', selectedNote.title);
      await saveNote(content);
    },
    autoSavingTime,
    {
      leading: false,
      trailing: true,
    },
  );

  return (
    <div className="flex flex-row">
      <Editor
        key={selectedNote.title}
        onChange={handleAutoSaving}
      />
      <Preview
        className="bg-transparent p-2 overflow-auto text-slate-300"
        content={selectedNote.content}
      />
    </div>
  );
};
