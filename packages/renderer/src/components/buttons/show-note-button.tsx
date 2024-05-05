import React from 'react';
import {useSetAtom} from 'jotai';
import {Button, ButtonProps} from '/@/components';
import { MdOutlineEdit } from "react-icons/md";

export type ShowNoteButtonProps = {
  showNotes: boolean;
  setShowNotes: (showChat: boolean) => void;
} & ButtonProps;

export const ShowNoteButton = ({ showNotes, setShowNotes, ...props}: ShowNoteButtonProps) => {
  const handleShowNotes = async () => {
    setShowNotes(!showNotes);
  };

  return (
    <Button
      onClick={handleShowNotes}
      {...props}
    >
      <MdOutlineEdit className="w-4 h-4 text-zinc-300" />
    </Button>
  );
};
