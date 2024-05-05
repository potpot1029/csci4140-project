// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/embeddingManager.ts
import type {LangChainParams} from '@shared/models';
import type {Embeddings} from 'langchain/embeddings/base';
import {OllamaEmbeddings} from 'langchain/embeddings/ollama';

export default class EmbeddingManager {
  private static instance: EmbeddingManager;
  private constructor(private langChainParams: LangChainParams) {}

  static getInstance(langChainParams: LangChainParams): EmbeddingManager {
    if (!EmbeddingManager.instance) {
      EmbeddingManager.instance = new EmbeddingManager(langChainParams);
    }
    return EmbeddingManager.instance;
  }

  static getModelName(embeddingsInstance: Embeddings): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embedding = embeddingsInstance as any;
    if ('model' in embedding && embedding.model) {
      return embedding.model as string;
    } else {
      throw new Error('Embeddings instance does not have a model name');
    }
  }

  getEmbeddingsAPI(): Embeddings | undefined {
    return new OllamaEmbeddings({
      ...(this.langChainParams.ollamaBaseUrl ? {baseUrl: this.langChainParams.ollamaBaseUrl} : {}),
      model: 'nomic-embed-text',
    });
  }
}
