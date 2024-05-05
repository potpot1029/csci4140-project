/**
 * @module preload
 */

import {sha256sum} from './nodeCrypto';
import {versions} from './versions';
export {sha256sum, versions};

import type {
  CreateNote,
  DeleteNote,
  GetChatHistory,
  GetNotes,
  GetVaultDirectory,
  ReadNote,
  RenameNote,
  SelectDirectory,
  SetVaultDirectory,
  ShowFileItemContextMenu,
  UpdateChatHistory,
  WriteNote,
} from '@shared/types';
import type {IpcRendererEvent} from 'electron';
import { contextBridge, ipcRenderer} from 'electron';

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args),
    readNote: (...args: Parameters<ReadNote>) => ipcRenderer.invoke('readNote', ...args),
    writeNote: (...args: Parameters<WriteNote>) => ipcRenderer.invoke('writeNote', ...args),
    createNote: (...args: Parameters<CreateNote>) => ipcRenderer.invoke('createNote', ...args),
    deleteNote: (...args: Parameters<DeleteNote>) => ipcRenderer.invoke('deleteNote', ...args),
    renameNote: (...args: Parameters<RenameNote>) => ipcRenderer.invoke('renameNote', ...args),
  });
  contextBridge.exposeInMainWorld('contextMenu', {
    showFileItemContextMenu: (...args: Parameters<ShowFileItemContextMenu>) =>
      ipcRenderer.invoke('showFileItemContextMenu', ...args),
  });

  contextBridge.exposeInMainWorld('electron', {
    setVaultDirectory: (...args: Parameters<SetVaultDirectory>) =>
      ipcRenderer.invoke('setVaultDirectory', ...args),
    getVaultDirectory: (...args: Parameters<GetVaultDirectory>) =>
      ipcRenderer.invoke('getVaultDirectory', ...args),
    getChatHistory: (...args: Parameters<GetChatHistory>) =>
      ipcRenderer.invoke('getChatHistory', ...args),
    updateChatHistory: (...args: Parameters<UpdateChatHistory>) =>
      ipcRenderer.invoke('updateChatHistory', ...args),
  });

  contextBridge.exposeInMainWorld('files', {
    selectDirectory: (...args: Parameters<SelectDirectory>) =>
      ipcRenderer.invoke('selectDirectory', ...args),
  });

  contextBridge.exposeInMainWorld('ipcRenderer', {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
    receive: (channel: string, callback: (...args: unknown[]) => void) => {
      // this creates a constant copy of the callback, thus ensuring that the removed listener is the same as the one added
      const subscription = (event: IpcRendererEvent, ...args: unknown[]) => callback(...args);

      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
  });
} catch (error) {
  console.error(error);
}
