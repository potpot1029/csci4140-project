import {chatHistoryAtom, addChatMessageAtom, clearChatHistoryAtom} from '/@/store';
import {useAtomValue, useSetAtom} from 'jotai';

export const useChatHistory = () => {
  const chatHistory = useAtomValue(chatHistoryAtom);
  const addChatMessage = useSetAtom(addChatMessageAtom);
  const clearChatHistory = useSetAtom(clearChatHistoryAtom);

  return {
    chatHistory,
    addChatMessage,
    clearChatHistory,
  };
};
