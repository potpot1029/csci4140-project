import React, {useRef} from 'react';
import {RootLayout, Sidebar, Content, Note, NotesList, NoteTitle} from '/@/components';
import { ButtonsRow } from './components/buttons-row';

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null);

  return (
    <RootLayout>
      <Sidebar className="p-2 flex-[0_0_15%]">
        <ButtonsRow />
        <NotesList
          className="mt-3 space-y-1"
          onSelect={() => contentContainerRef.current?.scrollTo(0, 0)}
        />
      </Sidebar>
      <Content ref={contentContainerRef} className="flex-[0_0_65%]">
        <NoteTitle className="pt-2" />
        <Note />
      </Content>
      <Sidebar className="p-2 flex-[0_0_20%]">Chatbot</Sidebar>
    </RootLayout>
  );
};

export default App;
