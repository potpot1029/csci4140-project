import React, {useRef, useState} from 'react';
import {
  RootLayout,
  Sidebar,
  Content,
  Note,
  NotesList,
  NoteTitle,
  Chat,
  ShowChatButton,
} from '/@/components';
import {ButtonsRow} from './components/buttons-row';
import {cn} from './utils';

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState<boolean>(false);

  return (
    <>
      <RootLayout id="app">
        <Sidebar className="p-2 flex-[0_0_15%]">
          <ButtonsRow />
          <NotesList
            className="mt-3 space-y-1"
            onSelect={() => contentContainerRef.current?.scrollTo(0, 0)}
          />
        </Sidebar>
        <Content
          ref={contentContainerRef}
          className={cn('', {'flex-[0_0_85%]': !showChat}, {'flex-[0_0_60%]': showChat})}
        >
          <div className='flex items-center justify-center w-full pt-2'>
            <NoteTitle className="flex justify-center flex-grow" />
            <ShowChatButton
              className="mr-2 ml-auto"
              showChat={showChat}
              setShowChat={setShowChat}
            />
          </div>
          <Note />
        </Content>
        {showChat ? (
          <Sidebar className="p-2 flex-[0_0_25%]">
            <Chat />
          </Sidebar>
        ) : (
          <div></div>
        )}
      </RootLayout>
    </>
  );
};

export default App;
