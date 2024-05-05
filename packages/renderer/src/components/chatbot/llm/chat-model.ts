// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/chatModelManager.ts
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import type { LangChainParams, ModelConfig } from "@shared/models";
import type { BaseChatModel } from 'langchain/chat_models/base';

export default class ChatModelManager {
    private static instance: ChatModelManager;
    private static chatModel: BaseChatModel;
  
    private constructor(private langChainParams: LangChainParams) {
    }
  
    static getInstance(langChainParams: LangChainParams): ChatModelManager {
      if (!ChatModelManager.instance) {
        ChatModelManager.instance = new ChatModelManager(langChainParams);
      }
      return ChatModelManager.instance;
    }
  
    private getModelConfig(): ModelConfig {
      const params = this.langChainParams;
      const baseConfig: ModelConfig = {
        modelName: params.model,
        temperature: params.temperature,
        streaming: true,
        maxRetries: 3,
        maxConcurrency: 3,
      };

      const ollamaConfig = {
        ...(params.ollamaBaseUrl ? { baseUrl: params.ollamaBaseUrl } : {}),
        modelName: params.ollamaModel,
      };
  
      return { ...baseConfig, ...ollamaConfig || {} };
    }
  
    getChatModel(): BaseChatModel {
      return ChatModelManager.chatModel;
    }

    setChatModel(): void {
      this.langChainParams.model = 'ollama';
      const modelConfig = this.getModelConfig();

      // create a new model
      try {
        console.info(modelConfig)
        this.langChainParams.model = 'ollama';
        const newModelInstance = new ChatOllama(modelConfig);
        console.info(newModelInstance)
        ChatModelManager.chatModel = newModelInstance;
      } catch (error) {
        console.error('Error creating a new model:', error);
      }
    }

    checkChatModel(chatModel: BaseChatModel): boolean {
      if (!chatModel) {
        return false;
      }
      return true;
    }
  }
  