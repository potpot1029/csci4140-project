import React, {ComponentProps} from 'react';
import {useNotesList} from '/@/hooks/useNotesList';
import lodash from 'lodash';
const {isEmpty} = lodash;
import {notesMock} from '/@/store/mocks';
import {NoteEntry} from './note-entry';
import { twMerge } from 'tailwind-merge';

export type NotesListProps = {
  onSelect: () => void;
} & ComponentProps<'ul'>;

export const NotesList = ({onSelect, className, ...props}: NotesListProps) => {
  const {notes, selectedNoteIndex, handleNoteSelect} = useNotesList({onSelect});

  if (!notes) return null;

  if (isEmpty(notes)) {
    return (
      <ul className={twMerge('text-center pt-4', className)}>
        <span>No Notes Found!</span>
      </ul>
    );
  }

  return (
    <ul
      className={className}
      {...props}
    >
      {notes.map((note, index) => (
        <NoteEntry
          key={note.title}
          isActive={index === selectedNoteIndex}
          onClick={handleNoteSelect(index)}
          {...note}
        />
      ))}
    </ul>
  );
};
