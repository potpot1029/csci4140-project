import React from 'react';
import {Preview} from '/@/components';
import {ChatInput} from './chat-input';
import {ChatMessage} from '@shared/models';
import {LangchainProcesser} from './langchain-processor';
import {cn} from '/@/utils';
import {chatMessagesMock} from '/@/store/mocks';

export const Chat = () => {
  const [userInput, setUserInput] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState([] as ChatMessage[]);
  const [loadingResponse, setLoadingResponse] = React.useState(false);

  const handleSubmitMessage = async () => {
    if (loadingResponse) return;
    if (!userInput.trim()) return;

    const question = {type: 'user', content: userInput} as ChatMessage;
    chatMessages.push(question);
    setUserInput('');

    setLoadingResponse(true);
    // Send message to chatbot
    const response = await LangchainProcesser(question, chatMessages);
    // Update chat messages
    chatMessages.push({type: 'bot', content: response});
    setChatMessages(chatMessages);

    setLoadingResponse(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-center h-10 w-full text-zinc-300 font-bold">Ollama Llama 3</div>
      <div className="flex-grow">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={cn('my-2', {
              'flex flex-col items-end': message.type === 'user',
            })}
          >
            <div>{message.type === 'user' ? 'You' : 'Llama3'}</div>
            <Preview
              className={cn('p-2 rounded-md inline-block w-auto', {
                'bg-sky-700': message.type === 'user',
                'bg-zinc-700': message.type === 'bot',
              })}
              content={message.content}
            />
          </div>
        ))}
      </div>

      <ChatInput
        userInput={userInput}
        setUserInput={setUserInput}
        isLoading={loadingResponse}
        handleSubmitMessage={handleSubmitMessage}
      />
    </div>
  );
};
