// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/LLMProviders/chainManager.ts
import ChainFactory from './chain-factory';
import type {Document} from '@shared/models';
import type {MemoryVectorStore} from 'langchain/vectorstores/memory';
import type {MemoryVector, VectorStoreDocument} from './vectorDB-manager';
import VectorDBManager from './vectorDB-manager';
import type {RunnableSequence} from '@langchain/core/runnables';
import type {ChatOllama} from '@langchain/community/chat_models/ollama';
import type {ChainOptions, ChatMessage, LangChainParams, NoteFile} from '@shared/models';
import { ChainType} from '@shared/models';
import EmbeddingManager from './embedding-manager';
import {MultiQueryRetriever} from 'langchain/retrievers/multi_query';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import ChatModelManager from './chat-model';
import MemoryManager from './memory-manager';
import {HybridRetriever} from './hybrid-retriever';
import PromptManager from './prompt-manager';
import type {BaseChatMemory} from 'langchain/memory';
import {extractChatHistory, extractUniqueTitlesFromDocs} from './utils';
import { loadNotes } from '/@/store';

export default class ChainManager {
  private static chain: RunnableSequence;
  private static retrievalChain: RunnableSequence;
  private static retrievedDocuments: Document[] = [];

  private static isModelActive = false;

  // private app: App;
  private vectorStore!: MemoryVectorStore;
  private promptManager: PromptManager;
  private embeddingsManager: EmbeddingManager | undefined;
  public chatModelManager: ChatModelManager;
  public langChainParams: LangChainParams;
  public memoryManager: MemoryManager;
  private getDbVectorStores: () => PouchDB.Database<VectorStoreDocument>;

  constructor(
    langChainParams: LangChainParams,
    getDbVectorStores: () => PouchDB.Database<VectorStoreDocument>,
  ) {
    this.langChainParams = langChainParams;
    this.memoryManager = MemoryManager.getInstance(this.langChainParams);
    this.chatModelManager = ChatModelManager.getInstance(
      this.langChainParams
    );
    this.promptManager = PromptManager.getInstance(this.langChainParams);
    this.getDbVectorStores = getDbVectorStores;
    this.createChain();
  }



  private setNoteFile(noteFile: NoteFile): void {
    this.langChainParams.options.noteFile = noteFile;
  }

  createChain() {
    ChainManager.isModelActive = true;
    console.info('[createChain] Creating chain with: ', this.langChainParams);
    const newModel = this.langChainParams.ollamaModel;

    try {
      this.chatModelManager.setChatModel();

      this.initChain(this.langChainParams.chainType, {
        ...this.langChainParams.options,
        forceNewChain: true,
      });
      console.log(`Set new model: ${newModel}`);
    } catch (error) {
      console.error('Error setting new model:', error);
    }
  }

  initChain(chainType: ChainType, options?: ChainOptions): void {
    this.validateChainType(chainType);
    try {
      this.setChain(chainType, options);
    } catch (error) {
      console.error('Error initializing chain:', error);
    }
  }

  async setChain(chainType: ChainType, options: ChainOptions = {}): Promise<void> {
    console.info('Setting chain:', chainType);
    if (!this.chatModelManager.checkChatModel(this.chatModelManager.getChatModel())) {
      console.error('[setChain]: No chat model found');
      return;
    }

    this.validateChainType(chainType);
    if (chainType === ChainType.LONG_NOTE_QA_CHAIN || chainType === ChainType.VAULT_QA_CHAIN) {
      this.embeddingsManager = EmbeddingManager.getInstance(this.langChainParams);
    }

    const chatModel = this.chatModelManager.getChatModel();
    const memory = this.memoryManager.getMemory();
    const chatPrompt = this.promptManager.getChatPrompt();

    switch (chainType) {
      case ChainType.LLM_CHAIN: {
        if (options?.forceNewChain) {
          if (ChainManager.isModelActive) {
            (chatModel as ChatOllama).model = this.langChainParams.ollamaModel;
          }

          console.info('[setChain] Creating new LLM chain');
          console.info('model:', chatModel);
          console.info('memory:', memory);
          /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
          console.info('prompt:', options?.prompt! || chatPrompt);
          /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
          console.info('abortController:', options?.abortController!);
          /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
          ChainManager.chain = ChainFactory.createLLMChain({
          /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
            llm: chatModel,
          /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
            memory: memory,
            prompt: options?.prompt! || chatPrompt,
            abortController: options.abortController!,
          }) as RunnableSequence;
        } else {
          ChainManager.chain = ChainFactory.getLLMChain({
            llm: chatModel,
            memory: memory,
            prompt: options.prompt! || chatPrompt,
            abortController: options.abortController!,
          }) as RunnableSequence;
        }

        this.langChainParams.chainType = ChainType.LLM_CHAIN;
        break;
      }
      case ChainType.LONG_NOTE_QA_CHAIN: {
        if (!options?.noteFile) {
          console.error('No note file found');
          return;
        }

        this.setNoteFile(options.noteFile);
        const docHash = VectorDBManager.getDocumentHash(options.noteFile.path);
        const parsedMemoryVectors: MemoryVector[] | undefined =
          await VectorDBManager.getMemoryVectors(this.getDbVectorStores(), docHash);
        const embeddingsAPI = this.embeddingsManager!.getEmbeddingsAPI();

        if (!embeddingsAPI) {
          console.error('No embeddings API found');
          return;
        }
        if (parsedMemoryVectors) {
          // rebuild index
          const vectorStore = await VectorDBManager.rebuildMemoryVectorStore(
            parsedMemoryVectors,
            embeddingsAPI,
          );

          // create retrieval chain
          ChainManager.retrievalChain = ChainFactory.createRetrievalChain(
            {
              llm: chatModel,
              retriever: vectorStore.asRetriever(undefined, doc => {
                return doc.metadata.path === options.noteFile?.path;
              }),
            },
            ChainManager.storeRetrieverDocuments.bind(ChainManager),
          );
          console.info('Existing vector store for ', docHash);
        } else {
          // create index
          const vectorStoreDoc = await this.indexFile(options.noteFile);
          this.vectorStore = await VectorDBManager.getMemoryVectorStore(
            this.getDbVectorStores(),
            embeddingsAPI,
            vectorStoreDoc?._id,
          );
          if (!this.vectorStore) {
            console.error('Cannot create vector store');
            return;
          }

          const retriever = MultiQueryRetriever.fromLLM({
            llm: chatModel,
            retriever: this.vectorStore.asRetriever(undefined, doc => {
              console.log("doc", doc)
              console.log("options.noteFile?.path", options.noteFile?.path)
              return doc.metadata.path === options.noteFile?.path;
            }),
            verbose: false,
          });

          // create retrieval chain
          ChainManager.retrievalChain = ChainFactory.createRetrievalChain(
            {
              llm: chatModel,
              retriever: retriever,
            },
            ChainManager.storeRetrieverDocuments.bind(ChainManager),
          );
          console.info('New Long Note QA Chain created for ', docHash);
        }

        this.langChainParams.chainType = ChainType.LONG_NOTE_QA_CHAIN;
        console.info('Long Note QA Chain created');
        break;
      }
      case ChainType.VAULT_QA_CHAIN: {
        const embeddingsAPI = this.embeddingsManager!.getEmbeddingsAPI();
        if (!embeddingsAPI) {
          console.error('No embeddings API found');
          return;
        }
        const vectorStore = await VectorDBManager.getMemoryVectorStore(
          this.getDbVectorStores(),
          embeddingsAPI,
        );
        console.log(this.vectorStore)
        const notes = await loadNotes();
        console.log(notes)
        const retriever = new HybridRetriever(this.getDbVectorStores(), notes, {
          vectorStore: vectorStore,
          minSimilarityScore: 0.3,
          maxK: 3,
          kIncrement: 2,
        });

        // create retrieval chain
        ChainManager.retrievalChain = ChainFactory.createRetrievalChain(
          {
            llm: chatModel,
            retriever: retriever,
          },
          ChainManager.storeRetrieverDocuments.bind(ChainManager),
        );

        console.info('Vault QA Chain created');
        console.info("Retriever: ", retriever);

        this.langChainParams.chainType = ChainType.VAULT_QA_CHAIN;
        console.info('Set Vault QA Chain');
        break;
      }

      default:
        this.validateChainType(chainType);
        break;
    }
  }
  private validateChainType(chainType: ChainType): void {
    if (chainType === undefined || chainType === null) throw new Error('No chain type set');
  }

  static storeRetrieverDocuments(documents: Document[]) {
    ChainManager.retrievedDocuments = documents;
    console.log('Retrieved documents:', documents);
  }

  async runChain(
    userMessage: string,
    abortController: AbortController,
    updateCurrentAIMessage: (message: string) => void,
    addMessage: (message: ChatMessage) => void,
    options: {
      debug?: boolean;
      ignoreSystemMessage?: boolean;
      updateLoading?: (loading: boolean) => void;
    } = {},
  ) {
    const { ignoreSystemMessage = false} = options;

    if (!this.chatModelManager.checkChatModel(this.chatModelManager.getChatModel())) {
      console.error('No chat model found');
      return;
    }

    if (!ChainManager.chain) {
      console.error('[runChain] No chain found. reinitializing...');
      this.setChain(this.langChainParams.chainType, this.langChainParams.options);
    }

    const {temperature, maxTokens, systemMessage, chatContextTurns, chainType} =
      this.langChainParams;

    const memory = this.memoryManager.getMemory();
    const chatPrompt = this.promptManager.getChatPrompt();
    const systemPrompt = ignoreSystemMessage ? '' : systemMessage;
    if (ignoreSystemMessage) {
      const effectivePrompt = ignoreSystemMessage
        ? ChatPromptTemplate.fromMessages([
            new MessagesPlaceholder('history'),
            HumanMessagePromptTemplate.fromTemplate('{input}'),
          ])
        : chatPrompt;

      this.setChain(chainType, {
        ...this.langChainParams.options,
        prompt: effectivePrompt,
      });
    } else {
      this.setChain(chainType, this.langChainParams.options);
    }

    let fullAIResponse = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatModel = (ChainManager.chain as any).last.bound;
    const chatStream = await ChainManager.chain.stream({
      input: userMessage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    try {
      switch (chainType) {
        case ChainType.LLM_CHAIN: {
          // DEBUG
          console.info('Running LLM chain');
          console.info('user message:', userMessage);
          console.info('model:', chatModel);
          console.info('chain type:', chainType);
          console.info('system message:', systemPrompt);
          console.info('chat context turns:', chatContextTurns);
          console.info('temperature:', temperature);
          console.info('max tokens:', maxTokens);
          console.info('memory:', memory);
          console.info('chain: ', ChainManager.chain);

          // get AI response
          for await (const chunk of chatStream) {
            if (abortController.signal.aborted) {
              break;
            }
            const newAiResponse = chunk.content;
            fullAIResponse += newAiResponse;
            updateCurrentAIMessage(fullAIResponse);
            console.info('AI response:', fullAIResponse);
          }
          break;
        }
        case ChainType.LONG_NOTE_QA_CHAIN:
        case ChainType.VAULT_QA_CHAIN: {
          // DEBUG
          console.info('Running QA chain');
          console.info('user message:', userMessage);
          console.info('model:', chatModel.model);
          console.info('chain type:', chainType);
          console.info('system message:', systemPrompt);
          console.info('chat context turns:', chatContextTurns);
          console.info('temperature:', temperature);
          console.info('max tokens:', maxTokens);
          console.info('memory:', memory);
          console.info('chain: ', ChainManager.chain);

          // get AI response
          fullAIResponse = await this.runRetrievalChain(
            userMessage,
            memory,
            updateCurrentAIMessage,
            abortController,
            options,
          );
          break;
        }
        default:
          this.validateChainType(this.langChainParams.chainType);
          break;
      }
    } catch (error) {
      console.error('Error running chain:', error);
    } finally {
      if (fullAIResponse) {
        await memory.saveContext({input: userMessage}, {output: fullAIResponse});
        addMessage({
          message: fullAIResponse,
          sender: 'ai',
          isVisible: true,
        });
      }
      updateCurrentAIMessage('');
    }
    return fullAIResponse;
  }

  private async runRetrievalChain(
    userMessage: string,
    memory: BaseChatMemory,
    updateCurrentAIMessage: (message: string) => void,
    abortController: AbortController,
    options: {
      debug?: boolean;
    } = {},
  ): Promise<string> {
    if (options.debug) {
      console.info('Running retrieval chain');
    }
    const loadMemoryVariables = await memory.loadMemoryVariables({});
    const chatHistory = extractChatHistory(loadMemoryVariables);
    const qaStream = await ChainManager.retrievalChain.stream({
      question: userMessage,
      chat_history: chatHistory,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    let fullAIResponse = '';

    for await (const chunk of qaStream) {
      if (abortController.signal.aborted) {
        break;
      }
      fullAIResponse += chunk.content;
      updateCurrentAIMessage(fullAIResponse);
    }


    if (this.langChainParams.chainType === ChainType.VAULT_QA_CHAIN) {
      const docTitles = extractUniqueTitlesFromDocs(ChainManager.retrievedDocuments);
      // replace .md with empty string
      const docPaths = docTitles.map(doc => doc.replace('.md', ''));
      const markdownLinks = docPaths.map(title => `[[${title}]]`).join('\n');
      fullAIResponse += '\n\n**Sources**:\n' + markdownLinks;
    }

    return fullAIResponse;
  }

  async indexFile(noteFile: NoteFile): Promise<VectorStoreDocument | undefined> {
    const embeddingsAPI = this.embeddingsManager!.getEmbeddingsAPI();
    if (!embeddingsAPI) {
      console.error('No embeddings API found');
      return;
    }
    return await VectorDBManager.indexFile(this.getDbVectorStores(), embeddingsAPI, noteFile);
  }
}
