import React, {useEffect, useState} from 'react';
import {Button, Preview} from '/@/components';
import {ChatInput} from './chat-input';
import {ChainType, ChatMessage, NoteFile} from '@shared/models';
import {getAIAnswer} from './langchain-processor';
import {cn} from '/@/utils';
import {useChatHistory} from '/@/hooks/useChatHistory';
import ChainManager from './llm/chain-manager';
import {extractNoteTitles, getNoteByTitle} from './llm/utils';
import {useAtomValue} from 'jotai';
import {notesAtom, selectedNoteIndexAtom} from '/@/store';
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
  const selectedNoteIndex = useAtomValue(selectedNoteIndexAtom);
  const [activeNote, setActiveNote] = useState<NoteFile | null>();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [currentChain, setCurrentChain] = useState(langChainParams.chainType);
  const [systemMessage, setSystemMessage] = useState('');
  const [, setChatMemory] = useState<BaseChatMemory | null>(
    chainManager!.memoryManager.getMemory(),
  );

  const showMessage = (message: string) => {
    setSystemMessage(message);
    setTimeout(() => setSystemMessage(''), 2000);
  };

  const handleClearMemory = () => {
    chainManager!.memoryManager.clearChatMemory();
    setChatMemory(chainManager!.memoryManager.getMemory());
    showMessage('Memory cleared!');
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
    showMessage('Indexing notes...');
    clearChatHistory();
    await indexVault();
    showMessage('Indexing done!');
  };

  const handleSelectChain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value as ChainType;
    if (newChain == 'vault_qa_chain') {
      const activeMessage: ChatMessage = {
        sender: 'ai',
        message: 'I have read through your notes. Feel free to ask me anything about them!\n\n',
        isVisible: true,
      };
      addChatMessage(activeMessage);
      handleRefreshIndex();
    } else if (newChain == 'long_note_qa_chain') {
      // get current active note
      const activeNote = notes[selectedNoteIndex!];
      if (!activeNote) {
        showMessage('No active note!');
        return;
      }
      setActiveNote(activeNote);
      const activeMessage: ChatMessage = {
        sender: 'ai',
        message: `I have read through [[${activeNote.metadata.title}]]. Feel free to ask me anything about it!\n\n`,
        isVisible: true,
      };
      addChatMessage(activeMessage);
      if (activeNote.content) {
        console.log('setting active note:', activeNote);
        chainManager!.setChain(newChain, {noteFile: activeNote});
        setCurrentChain(newChain);
      }
    }
    chainManager!.setChain(newChain);
    setCurrentChain(newChain);
    showMessage(`Switched to ${newChain}`);
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

  const handleClearHistory = () => {
    clearChatHistory();
    showMessage('Chat history cleared!');
  };

  useEffect(() => {
    // scroll to bottom
    const chat = document.querySelector('.chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [aiAnswer]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-center h-10 w-full text-zinc-300 font-bold">Ollama Llama3</div>
      <div
        id="chat"
        className="flex-grow"
      >
        {systemMessage !== '' ? (
          <div className="w-full h-10 flex items-center justify-center text-zinc-300">
            {systemMessage}
          </div>
        ) : null}
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

      <div className="w-full mb-2 flex flex-col">
        <select
          className="bg-transparent text-zinc-300 border border-zinc-300 rounded-md p-1"
          value={currentChain}
          onChange={handleSelectChain}
        >
          <option className="bg-zinc-700" value="llm_chain">Chat</option>
          <option className="bg-zinc-700" value="long_note_qa_chain">Chat with a long note</option>
          <option className="bg-zinc-700" value="vault_qa_chain">Chat with your vault</option>
        </select>
        <div className="w-full mt-2 flex flex-row">
          <Button
            className="p-1 text-zinc-300 border border-zinc-300"
            onClick={handleClearHistory}
          >
            Clear Chat
          </Button>
          <Button
            className="p-1 text-zinc-300 border border-zinc-300"
            onClick={handleClearMemory}
          >
            Clear Memory
          </Button>
          <Button
            className="p-1 text-zinc-300 border border-zinc-300"
            onClick={handleRefreshIndex}
          >
            Refresh Index
          </Button>
        </div>
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
