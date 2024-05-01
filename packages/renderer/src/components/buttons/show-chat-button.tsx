import React from 'react';
import {useSetAtom} from 'jotai';
import {Button, ButtonProps} from '/@/components';
import {LiaRobotSolid} from 'react-icons/lia';

export type ShowChatButtonProps = {
  showChat: boolean;
  setShowChat: (showChat: boolean) => void;
} & ButtonProps;

export const ShowChatButton = ({ showChat, setShowChat, ...props}: ShowChatButtonProps) => {
  const handleShowChat = async () => {
    setShowChat(!showChat);
  };

  return (
    <Button
      onClick={handleShowChat}
      {...props}
    >
      <LiaRobotSolid className="w-4 h-4 text-zinc-300" />
    </Button>
  );
};
