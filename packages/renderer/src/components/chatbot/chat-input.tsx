import React from 'react';
import Textarea from '@mui/joy/Textarea';
import { CircularProgress } from "@mui/material";

export type ChatInputProps = {
  userInput: string;
  setUserInput: (input: string) => void;
  isLoading: boolean;
  handleSubmitMessage: () => void;
} & React.ComponentProps<'div'>;

export const ChatInput = ({
  userInput,
  setUserInput,
  isLoading,
  handleSubmitMessage,
  ...props
}: ChatInputProps) => {
  return (
    <div className="items-end flex flex-row w-full">
      <Textarea
        name="outlined"
        variant="outlined"
        placeholder="Ask question here..."
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
          if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            handleSubmitMessage();
          }
        }}
      />
      <div className="ml-2 flex justify-center items-center h-full">
        {isLoading ? (
          <CircularProgress
            size={32}
            thickness={5}
            style={{ color: "rgb(209 213 219 / var(--tw-bg-opacity))" }}
            className="color-zinc-800"
          />
        ) : (
          <button
            className="bg-sky-700 text-white rounded-md h-full px-2 hover:bg-sky-800"
            onClick={handleSubmitMessage}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
};
