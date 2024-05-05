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
} from '/@/components';
import {ButtonsRow} from '/@/components/buttons-row';
import {cn} from '../utils';
import {VectorStoreDocument} from './chatbot/llm/vectorDB-manager';
import ChainManager from './chatbot/llm/chain-manager';
import EmbeddingManager from './chatbot/llm/embedding-manager';

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

  return (
    <RootLayout>
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
