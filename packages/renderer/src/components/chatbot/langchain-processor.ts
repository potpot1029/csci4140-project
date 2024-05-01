import {ChatOllama} from '@langchain/community/chat_models/ollama';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {SystemMessage, HumanMessage} from '@langchain/core/messages';
import type {ChatMessage} from '@shared/models';

export const LangchainProcesser = async (newMessage: ChatMessage, oldMessages: ChatMessage[]) => {
  const model = new ChatOllama({
    baseUrl: 'http://localhost:11434', // Default value
    model: 'llama3', // Default value
  });

  try {
    const formattedMessages = oldMessages.map(message => {
      if (message.type === 'bot') {
        return new SystemMessage(message.content);
      } else {
        return new HumanMessage(message.content);
      }
    });
    const stream = await model.pipe(new StringOutputParser()).stream(formattedMessages);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return chunks.join('');
  } catch (error) {
    console.error('Error processing message: ', error);
    return "Sorry, I couldn't process your message. Please try again later.";
  }
};
