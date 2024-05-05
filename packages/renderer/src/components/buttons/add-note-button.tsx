import React from 'react';

import {Button, ButtonProps} from '/@/components';

import {LuFileSignature} from 'react-icons/lu';

export type AddNoteButtonProps = {
  isOpen: boolean;
  setIsNewNoteOpen: (isOpen: boolean) => void;
} & ButtonProps;

export const AddNoteButton = ({isOpen, setIsNewNoteOpen, ...props}: AddNoteButtonProps) => {

  const handleCreation = async () => {
    setIsNewNoteOpen(true);
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
