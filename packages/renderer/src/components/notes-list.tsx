import React, {ComponentProps} from 'react';
import {useNotesList} from '/@/hooks/useNotesList';
import lodash from 'lodash';
const {isEmpty} = lodash;
import {NoteEntry} from './note-entry';

export type NotesListProps = {
  onSelect: () => void;
} & ComponentProps<'ul'>;

export const NotesList = ({onSelect, className, ...props}: NotesListProps) => {
  const {notes, selectedNoteIndex, handleNoteSelect} = useNotesList({onSelect});

  if (!notes) return null;

  if (isEmpty(notes)) {
    return (
      <div>
          <span>No Notes Found!</span>
      </div>
    );
  }

  return (
    <div>
        {notes.map((note, index) => (
          <NoteEntry
            key={note.basename}
            file={note}
            isActive={index === selectedNoteIndex}
            onClick={handleNoteSelect(index)}
            className='mb-2'
            {...note}
          />
        ))}
    </div>
  );
};
