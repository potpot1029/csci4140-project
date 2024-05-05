import React, {useEffect, useRef, useState} from 'react';
import {
  RootLayout,
  Sidebar,
  Content,
  Note,
  NotesList,
  NoteTitle,
  Chat,
  ShowChatButton,
  EditorButtonsRow,
  simpleAIAnswer,
  Modal,
} from '/@/components';
import {ButtonsRow} from '/@/components/buttons-row';
import {cn} from '../utils';
import {VectorStoreDocument} from './chatbot/llm/vectorDB-manager';
import ChainManager from './chatbot/llm/chain-manager';
import EmbeddingManager from './chatbot/llm/embedding-manager';
import {set} from 'lodash';

export type MainPageProps = {
  dbVectorStores: PouchDB.Database<VectorStoreDocument> | null;
  chainManager: ChainManager | null;
  embeddingsManager: EmbeddingManager | null;
};

export const MainPage = ({dbVectorStores, chainManager, embeddingsManager}: MainPageProps) => {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [showList, setShowList] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');

  // handle selecting text, open context menu when right click on the note area
  useEffect(() => {
    // right click event listener
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      const selectedText = window.getSelection()?.toString();
      console.log('Selected Text:', selectedText);
      if (!selectedText) return;
      window.ipcRenderer.invoke('show-ai-context-menu', selectedText);
    };
    window.addEventListener('contextmenu', handleContextMenu);
  }, []);

  // react to summarize text event
  useEffect(() => {
    const handleSummarize = async selectedText => {
      console.log('[handle Sumamrize] Selected Text:', selectedText);
      if (!selectedText) return;
      setUserInput(selectedText);
      setShowModal(true);
      const summary = await simpleAIAnswer(selectedText, 'summarize', setAiResponse);
      console.log('Summary:', summary);
    };
    const summarizeListener = window.ipcRenderer.receive('summarize-text', handleSummarize);

    return () => {
      summarizeListener();
    };
  }, []);

  return (
    <RootLayout>
      {showModal ? (
        <Modal
          title="Summary"
          isOpen={showModal}
          setIsOpen={setShowModal}
        >
          <h3 className='font-bold italic'>Summary by Llama3</h3>
          <div>{aiResponse == '' ? 'Summarizing...' : aiResponse}</div>
        </Modal>
      ) : null}
      <header className="absolute inset-0 h-8 bg-transparent  w-0" />
      {showList ? (
        <Sidebar className="pt-7 flex-[0_0_15%] border-[0.001px] border-neutral-700 z-50">
          <ButtonsRow className="bg-zinc-800 px-1 py-1 sticky self-start overflow-y-auto top-0" />
          <NotesList
            className="space-y-1"
            onSelect={() => contentContainerRef.current?.scrollTo(0, 0)}
          />
        </Sidebar>
      ) : null}
      <Content
        ref={contentContainerRef}
        className={cn('', {
          'flex-[0_0_100%]': !showChat && !showList,
          'flex-[0_0_85%]': !showChat && showList,
          'flex-[0_0_60%]': showChat && showList,
          'flex-[0_0_75%]': showChat && !showList,
        })}
      >
        <div className="py-1 flex flex-col bg-zinc-800 border-b-[0.001px] border-neutral-700 z-30">
          <EditorButtonsRow
            showChat={showChat}
            setShowChat={setShowChat}
            showList={showList}
            setShowList={setShowList}
            className={cn('', {
              'pl-16': !showList,
            })}
          />
        </div>
        <NoteTitle
          showNotes={showNotes}
          setShowNotes={setShowNotes}
        />
        <Note showNotes={showNotes} />
      </Content>
      {showChat ? (
        <Sidebar className="p-2 flex-[0_0_25%] border-l-[0.001px] border-neutral-700">
          <Chat
            chainManager={chainManager}
            dbVectorStores={dbVectorStores}
            embeddingsManager={embeddingsManager}
          />
        </Sidebar>
      ) : (
        <div></div>
      )}
    </RootLayout>
  );
};
