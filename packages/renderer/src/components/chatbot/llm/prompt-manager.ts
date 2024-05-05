// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/promptManager.ts
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import type {LangChainParams} from '@shared/models';

export class PromptManager {
  private static instance: PromptManager;
  private chatPrompt: ChatPromptTemplate | undefined;

  private constructor(private langChainParams: LangChainParams) {
    this.initChatPrompt();
  }

  static getInstance(langChainParams: LangChainParams): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager(langChainParams);
    }
    return PromptManager.instance;
  }

  private initChatPrompt(): void {
    this.chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(this.langChainParams.systemMessage),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
  }

  getChatPrompt(): ChatPromptTemplate | undefined {
    return this.chatPrompt;
  }
}

export default PromptManager;
