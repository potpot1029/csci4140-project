import React, {useEffect, useState} from 'react';
import {Preview} from '/@/components';
import {ChatInput} from './chat-input';
import {ChainType, ChatMessage} from '@shared/models';
import {getAIAnswer} from './langchain-processor';
import {cn} from '/@/utils';
import {useChatHistory} from '/@/hooks/useChatHistory';
import ChainManager from './llm/chain-manager';
import {extractNoteTitles, getNoteByTitle} from './llm/utils';
import {useAtomValue} from 'jotai';
import {notesAtom} from '/@/store';
import {BaseChatMemory} from 'langchain/memory';
import VectorDBManager, {VectorStoreDocument} from './llm/vectorDB-manager';
import EmbeddingManager from './llm/embedding-manager';

export type ChatProps = {
  chainManager: ChainManager | null;
  dbVectorStores: PouchDB.Database<VectorStoreDocument> | null;
  embeddingsManager: EmbeddingManager | null;
};

export const Chat = ({chainManager, dbVectorStores, embeddingsManager}: ChatProps) => {
  const notes = useAtomValue(notesAtom);
  const {langChainParams} = chainManager as ChainManager;
  const [userInput, setUserInput] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const {chatHistory, addChatMessage, clearChatHistory} = useChatHistory();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [currentChain, setCurrentChain] = useState(langChainParams.chainType);
  const [, setChatMemory] = useState<BaseChatMemory | null>(
    chainManager!.memoryManager.getMemory(),
  );

  const handleClearMemory = () => {
    chainManager!.memoryManager.clearChatMemory();
    setChatMemory(chainManager!.memoryManager.getMemory());
  };

  const handleRefreshIndex = async () => {
    const indexVault = async (overwrite?: boolean): Promise<number> => {
      const embeddingInstance = embeddingsManager!.getEmbeddingsAPI();
      if (!embeddingInstance) {
        console.error('Embeddings API not found');
        return 0;
      }

      // check embedding model
      const prevEmbeddingModel = await VectorDBManager.checkEmbeddingModel(dbVectorStores!);
      const currEmeddingModel = EmbeddingManager.getModelName(embeddingInstance);

      console.info('Previous embedding model:', prevEmbeddingModel);
      console.info('Current embedding model:', currEmeddingModel);

      if (prevEmbeddingModel && prevEmbeddingModel !== currEmeddingModel) {
        console.info('Embedding model changed, re-indexing vault');
        overwrite = true;

        try {
          await dbVectorStores!.destroy();
          dbVectorStores = new PouchDB<VectorStoreDocument>('two_brain_vector_stores');
          console.log('rebuilding vector store');
        } catch (error) {
          console.error('Error destroying vector store:', error);
        }
      }

      // just index all notes

      const fileContents = await Promise.all(notes!.map(note => note.content));

      const totalFiles = notes!.length;
      if (totalFiles === 0) {
        console.info('No files to index');
        return 0;
      }

      let indexedCnt = 0;
      console.info('Indexing files...');
      const loadPromises = notes!.map(async (file, idx) => {
        try {
          const result = await VectorDBManager.indexFile(dbVectorStores!, embeddingInstance, file);

          indexedCnt++;
          console.info(`Indexed ${idx + 1}/${totalFiles} files`);
          return result;
        } catch (error) {
          console.error(`Error indexing file ${file.basename}:`, error);
        }
      });
      return notes!.length;
    };
    await indexVault();
  };

  const handleSelectChain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value as ChainType;
    if (newChain == 'vault_qa_chain') {
      const activeMessage: ChatMessage = {
        sender: 'ai',
        message: 'I have read your notes. Feel free to ask me anything about them\n\n',
        isVisible: true,
      };
      addChatMessage(activeMessage);
    }
    chainManager!.setChain(newChain);
    setCurrentChain(newChain);
  };

  const handleSubmitMessage = async () => {
    if (loadingResponse) return;
    if (!userInput.trim()) return;

    let processedUserMessage = userInput;
    if (currentChain === ChainType.LLM_CHAIN) {
      const noteTitles = extractNoteTitles(userInput);
      for (const noteTitle of noteTitles) {
        const noteFile = await getNoteByTitle(notes!, noteTitle);
        if (noteFile) {
          const noteContent = noteFile.content;
          processedUserMessage = `${processedUserMessage}\n\n[[${noteTitle}]]: \n${noteContent}`;
        }
      }
    }

    console.info('sending message:', userInput);
    // add user message to chat
    const userMessage: ChatMessage = {
      sender: 'user',
      message: userInput,
      isVisible: true,
    };
    const hiddenPromptMessage: ChatMessage = {
      sender: 'user',
      message: processedUserMessage,
      isVisible: false,
    };
    addChatMessage(userMessage);
    addChatMessage(hiddenPromptMessage);
    // clear user input
    setUserInput('');

    setLoadingResponse(true);
    // Send message to chatbot
    const response = await getAIAnswer(
      hiddenPromptMessage,
      chainManager!,
      addChatMessage,
      setAiAnswer,
      setAbortController,
      {debug: true},
    );
    setLoadingResponse(false);
  };

  useEffect(() => {
    // scroll to bottom
    const chat = document.querySelector('.chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [chatHistory]);

  return (
    <div className="chat flex flex-col h-full w-full">
      <div className="text-center h-10 w-full text-zinc-300 font-bold">Ollama Llama3</div>
      <div className="flex-grow">
        {chatHistory.map(
          (message, index) =>
            message.isVisible && (
              <div
                key={index}
                className={cn('my-2 w-full', {
                  'flex flex-col items-end': message.sender === 'user',
                })}
              >
                <div>{message.sender === 'user' ? 'You' : 'Llama3'}</div>
                <Preview
                  className={cn('p-2 rounded-md box-border max-w-full', {
                    'bg-sky-700': message.sender === 'user',
                    'bg-zinc-700': message.sender === 'ai',
                  })}
                  content={message.message}
                />
              </div>
            ),
        )}
        {aiAnswer ? (
          <div className="my-2 w-full flex flex-col items-start">
            <div>Llama3</div>
            <Preview
              className="p-2 rounded-md box-border bg-zinc-700"
              content={aiAnswer}
            />
          </div>
        ) : null}
      </div>

      <div className="w-full">
        <select
          className="bg-transparent"
          value={currentChain}
          onChange={handleSelectChain}
        >
          <option value="llm_chain">Chat</option>
          <option value="long_note_qa_chain">Long Note QA</option>
          <option value="vault_qa_chain">Vault QA</option>
        </select>
        <button onClick={clearChatHistory}>Clear Chat</button>
        <button onClick={handleClearMemory}>Clear Memory</button>
      </div>

      <ChatInput
        userInput={userInput}
        setUserInput={setUserInput}
        isLoading={loadingResponse}
        handleSubmitMessage={handleSubmitMessage}
      />
    </div>
  );
};
