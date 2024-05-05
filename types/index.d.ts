import type {
  CreateNote,
  DeleteNote,
  GetNotes,
  ReadNote,
  ShowFileItemContextMenu,
  WriteNote,
} from '@shared/types';

declare global {
  interface Window {
    // electron: ElectronAPI
    ipcRenderer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoke: (channel:string, ...args: any[]) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receive: (channel:string, callback: ReceiveCallback) => () => void;
    };
    context: {
      locale: string;
      getNotes: GetNotes;
      readNote: ReadNote;
      writeNote: WriteNote;
      createNote: CreateNote;
      deleteNote: DeleteNote;
    };
    contextMenu: {
      showFileItemContextMenu: ShowFileItemContextMenu;
    };
    electron: {
      setVaultDirectory: SetVaultDirectory;
      getVaultDirectory: GetVaultDirectory;
      getChatHistory: GetChatHistory;
      updateChatHistory: UpdateChatHistory;
    };
    files: {
      selectDirectory: SelectDirectory;
    };
    ai: {
      getSummary: GetSummary;
      simplifyText: SimplifyText;
    }
  }
}
