import React, {ComponentProps} from 'react';
import {ShowChatButton, ShowListButton} from './buttons';
import {ShowNoteButton} from './buttons/show-note-button';
import {selectedNoteAtom} from '../store';
import {useAtomValue} from 'jotai';
import { twMerge } from 'tailwind-merge';

export type EditorButtonsRowProps = {
  showChat: boolean;
  setShowChat: (showChat: boolean) => void;
  showList: boolean;
  setShowList: (showList: boolean) => void;
} & ComponentProps<'div'>;

export const EditorButtonsRow = ({showChat, setShowChat, showList, setShowList, className, ...props}: EditorButtonsRowProps) => {
  const selectedNote = useAtomValue(selectedNoteAtom);
  return (
    <div
      className={twMerge("flex justify-between", className)}
      {...props}
    >
      <ShowListButton
        showList={showList}
        setShowList={setShowList}
      />
      <ShowChatButton
        className="mr-2"
        showChat={showChat}
        setShowChat={setShowChat}
      />
    </div>
  );
};
