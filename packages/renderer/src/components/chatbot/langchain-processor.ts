import type {ChatMessage} from '@shared/models';
import type ChainManager from './llm/chain-manager';
import {Ollama} from '@langchain/community/llms/ollama';
import type {SetStateAction} from 'react';
import {OllamaEmbeddings} from 'langchain/embeddings/ollama';


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
export const simpleAIAnswer = async (
  selectedText: string,
  type: string,
  setAnswer: {(value: SetStateAction<string>): void; (arg0: string): void},
) => {
  console.log('getting simple AI answer:', selectedText);

  // llama3
  const model = new Ollama({
    model: 'llama3',
  });

  let prompt = '';

  switch (type) {
    case 'Summarize':
      prompt = `Summarize the text in triple quotes.
      Keep it concise, but make sure to include all the important details. Use the same language and tone as the original text. 

      """
      ${selectedText}
      """
      
      No need to answer other thing other than the summary. And do not include the triple quotes in the answer.`;
      break;
    case 'Simplify':
      prompt = `Simplify and condense the text in triple quotes. Keep the meaning the same, but make it easier to understand. 
      Use the same language and tone as the original text.
      
      """
      ${selectedText}
      """
      
      No need to answer other thing other than the simplified text. And do not include the triple quotes in the answer.`;
      break;
    case 'Paraphrase':
      prompt = `Paraphrase the text in triple quotes. Use different words and sentence structure, but keep the same meaning. 
      Use the same language and tone as the original text.
      
      """
      ${selectedText}
      """
      
      No need to answer other thing other than the paraphrased text. And do not include the triple quotes in the answer.`;
      break;
    case 'Expand':
      prompt = `Expand on the text in triple quotes. Provide more information, examples, and details to elaborate on the text. 
      Use the same language and tone as the original text.
      
      """
      ${selectedText}
      """
      
      No need to answer other thing other than the expansion. And do not include the triple quotes in the answer.`;
      break;
    case 'Fix Grammar':
      prompt = `Correct the text in triple quotes into Standard English. 
      Fix any spelling, grammar, or punctuation mistakes. Do not change anything else.
      
      """
      ${selectedText}
      """
      
      No need to answer other thing other than the corrected text. And do not include the triple quotes in the answer.`;
      break;
    default:
      console.log('No type selected');
      return false;
  }
  const stream = await model.stream(prompt);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
    setAnswer(chunks.join(''));
  }
  return true;
};

export const testModelAndEmbedding = async () => {
  try {
    console.log('Testing model');
    const model = new Ollama({
      model: 'llama3',
    });
    await model.generate(['Hello, how are you?']);

    console.log('Testing embedding');
    const embedding = new OllamaEmbeddings({
      model: 'nomic-embed-text',
    });
    await embedding.embedQuery('Hello, how are you?');
    return true;
  } catch (error) {
    console.error('Error testing model.', error);
    throw error;
  }
};
