import {useAtomValue, useSetAtom} from 'jotai';
import React, {ComponentProps, useState, useCallback, useEffect} from 'react';
import {saveNoteAtom, selectedNoteAtom} from '/@/store';
import {Editor, Preview} from '/@/components';
import lodash from 'lodash';
import {NoteContent} from '@shared/models';
const {throttle} = lodash;
import {autoSavingTime} from '@shared/constants';
import { cn } from '../utils';

export type NoteProps = {
  showNotes: boolean;
} & ComponentProps<'div'>;
export const Note = ({showNotes, ...props}: NoteProps) => {
  const selectedNote = useAtomValue(selectedNoteAtom);
  const saveNote = useSetAtom(saveNoteAtom);

  useEffect(() => {
    if (!selectedNote) return;
    console.log('Selected Note:', selectedNote.metadata.title);
  }, [selectedNote]);

  if (!selectedNote) return null;

  const handleAutoSaving = throttle(
    async (content: NoteContent) => {
      if (!selectedNote) return;
      console.log('Auto Saving Note:', selectedNote.metadata.title);
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
      {showNotes ? (
        <Editor
          className="flex-[0_0_50%]"
          key={selectedNote.metadata.title}
          onChange={handleAutoSaving}
        />
      ) : null}
      <Preview
        className={cn("bg-transparent p-2 overflow-auto text-slate-300", 
          { 'flex-[0_0_50%]': showNotes, 'flex-1': !showNotes })}
        content={selectedNote.content}
      />
    </div>
  );
};
