import React from 'react';
import {useSetAtom} from 'jotai';
import {Button, ButtonProps} from '/@/components';
import { FaList } from "react-icons/fa";

export type ShowListButtonProps = {
  showList: boolean;
  setShowList: (showChat: boolean) => void;
} & ButtonProps;

export const ShowListButton = ({ showList, setShowList, ...props}: ShowListButtonProps) => {
  const handleShowList = async () => {
    setShowList(!showList);
  };

  return (
    <Button
      onClick={handleShowList}
      {...props}
    >
      <FaList className="w-4 h-4 text-zinc-300" />
    </Button>
  );
};
