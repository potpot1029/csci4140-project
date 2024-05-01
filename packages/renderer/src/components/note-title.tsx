import {selectedNoteAtom} from '/@/store';
import {useAtomValue} from 'jotai';
import React, {ComponentProps} from 'react';
import {twMerge} from 'tailwind-merge';

export const NoteTitle = ({className, ...props}: ComponentProps<'div'>) => {
  const selectedNote = useAtomValue(selectedNoteAtom);

  if (!selectedNote) return null;

  return (
    <div
      className={twMerge('', className)}
      {...props}
    >
      <span className="text-gray-400">{selectedNote.title}</span>
    </div>
  );
};
