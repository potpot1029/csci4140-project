import {selectedNoteAtom} from '/@/store';
import {useAtomValue} from 'jotai';
import React, {ComponentProps} from 'react';
import {ShowNoteButton} from './buttons/show-note-button';

export type NoteTitleProps = {
  showNotes: boolean;
  setShowNotes: (showNotes: boolean) => void;
} & ComponentProps<'div'>;

export const NoteTitle = ({showNotes, setShowNotes, className, ...props}: NoteTitleProps) => {
  const selectedNote = useAtomValue(selectedNoteAtom);

  if (!selectedNote) return null;

  return (
<div className="flex items-center justify-center relative w-full" {...props}>
  <div className="absolute inset-0 flex justify-center items-center z-0">
    <span className="text-gray-400">{selectedNote.metadata.title}</span>
  </div>
  <div className="ml-auto mr-2 z-10 mt-1">
    <ShowNoteButton 
      showNotes={showNotes}
      setShowNotes={setShowNotes}
    />
  </div>
</div>
  );
};
