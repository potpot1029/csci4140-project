import React from 'react';
import {useSetAtom} from 'jotai';
import {Button, ButtonProps} from '/@/components';
import {createEmptyNoteAtom} from '/@/store';
import {LuFileSignature} from 'react-icons/lu';

export const AddNoteButton = ({...props}: ButtonProps) => {
  const createNote = useSetAtom(createEmptyNoteAtom);

  const handleCreation = async () => {
    await createNote();
  };

  return (
    <Button
      onClick={handleCreation}
      {...props}
    >
      <LuFileSignature className="w-4 h-4 text-zinc-300" />
    </Button>
  );
};
