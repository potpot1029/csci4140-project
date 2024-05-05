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
