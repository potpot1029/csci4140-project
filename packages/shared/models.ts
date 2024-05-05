import type {ChatPromptTemplate} from 'langchain/prompts';
export type NoteFile = {
  path: string;
  basename: string;
  mtime: number;
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
};


export type NoteContent = string;

export type ChatMessage = {
  message: string;
  sender: 'user' | 'ai';
  isVisible: boolean;
}


// config
export type Config = {
  vaultDirectory: string;
  chatHistory: ChatMessage[];
}

export type LangChainParams = {
  model: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  chainType: ChainType;
  chatContextTurns: number;
  systemMessage: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  abortController: AbortController;
  options: ChainOptions;
}

export enum ChainType {
  LLM_CHAIN = "llm_chain",
  LONG_NOTE_QA_CHAIN = "long_note_qa_chain",
  VAULT_QA_CHAIN = "vault_qa_chain",
}

export type ModelConfig = {
  modelName: string;
  temperature: number;
  streaming: boolean;
  maxRetries: number;
  maxConcurrency: number;
  maxTokens?: number;
  ollmaModel?: string;
  baseUrl?: string;
}

export type ChainOptions = {
  prompt?: ChatPromptTemplate;
  noteFile?: NoteFile;
  forceNewChain?: boolean;
  abortController?: AbortController;
  debug?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Document<T = Record<string, any>> = {
  pageContent: string;
  metadata: T;
};