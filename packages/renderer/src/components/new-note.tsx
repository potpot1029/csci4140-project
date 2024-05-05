import {Button, Modal} from '/@/components';
import Textarea from '@mui/joy/Textarea';
import React from 'react';
import {useSetAtom} from 'jotai';
import {createEmptyNoteAtom} from '/@/store';

export type NewNoteProps = {
  isOpen: boolean;
  setIsNewNoteOpen: (isOpen: boolean) => void;
} & React.ComponentProps<'div'>;

export const NewNote = ({isOpen, setIsNewNoteOpen, className, ...props}: NewNoteProps) => {
  const [userInput, setUserInput] = React.useState('');
  const createNote = useSetAtom(createEmptyNoteAtom);

  const handleCreation = async () => {
    if (!userInput) {
      return;
    }
    // check invalid characters
    if (userInput.match(/[\\/:*?"<>|]/)) {
      return;
    }
    await createNote(userInput);
    setIsNewNoteOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsNewNoteOpen}
      className={className}
    >
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-bold">New Note</h2>
        <Textarea
          name="outlined"
          variant="outlined"
          placeholder="New File name..."
          value={userInput}
          color="neutral"
          required
          style={{
            backgroundColor: 'transparent',
            color: 'white',
          }}
          className="flex-grow"
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreation();
            }
          }}
        />
        <div className="flex justify-end space-x-2">
          <Button
            className="p-2  bg-red-800"
            onClick={() => setIsNewNoteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="p-2  bg-sky-700"
            onClick={handleCreation}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
