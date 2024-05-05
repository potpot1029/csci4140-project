import type {ChatMessage} from '@shared/models';
import type ChainManager from './llm/chain-manager';

export const getAIAnswer = async (
  userMessage: ChatMessage,
  chainManager: ChainManager,
  addMessage: (message: ChatMessage) => void,
  updateAiAnswer: (message: string) => void,
  updateShouldAbort: (abortController: AbortController) => void,
  options: {
    debug?: boolean;
    ignoreSystemMessages?: boolean;
    updateLoading?: (loading: boolean) => void;
  },
) => {
  const abortController = new AbortController();
  console.log('getting AI answer:', userMessage.message)
  updateShouldAbort(abortController);
  try {
    await chainManager.runChain(
      userMessage.message,
      abortController,
      updateAiAnswer,
      addMessage,
      options,
    );
  } catch (error) {
    console.error('Error processing message:', error);
  }
};
