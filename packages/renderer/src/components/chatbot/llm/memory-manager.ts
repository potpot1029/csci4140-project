// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/memoryManager.ts
import type {LangChainParams} from '@shared/models';
import type {BaseChatMemory} from 'langchain/memory';
import { BufferWindowMemory} from 'langchain/memory';

export default class MemoryManager {
  private static instance: MemoryManager;
  private memory: BaseChatMemory | undefined;

  private constructor(private langChainParams: LangChainParams) {
    this.initMemory();
  }

  static getInstance(langChainParams: LangChainParams): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(langChainParams);
    }
    return MemoryManager.instance;
  }

  private initMemory(): void {
    this.memory = new BufferWindowMemory({
      k: this.langChainParams.chatContextTurns * 2,
      memoryKey: 'history',
      inputKey: 'input',
      returnMessages: true,
    });
  }

  getMemory(): BaseChatMemory {
    return this.memory!;
  }

  clearChatMemory(): void {
    console.log('clearing chat memory');
    if (this.memory) {
      this.memory.clear();
    }
  }
}
