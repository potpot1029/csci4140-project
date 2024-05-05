import type {ChatMessage} from '@shared/models';
import type ChainManager from './llm/chain-manager';
import {Ollama} from '@langchain/community/llms/ollama';

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
  console.log('getting AI answer:', userMessage.message);
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

// don't need chain for simple AI
export const simpleAIAnswer = async (selectedText, type, setAnswer) => {
  console.log('getting simple AI answer:', selectedText);

  // llama3
  const model = new Ollama({
    model: 'llama3',
  });

  if (type == 'summarize') {
    const stream = await model.stream(`Summarize the text in triple quotes.
    Keep it concise, but make sure to include all the important details. Use the same language and tone as the original text. 

    """
    ${selectedText}
    """
    
    No need to answer other thing other than the summary. And do not include the triple quotes in the answer.`);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
      setAnswer(chunks.join(''));
    }
    return chunks.join('');
  } else if (type == 'simplify') {
    return 'This is a simplified version of the selected text.';
  }
  return selectedText;
};
