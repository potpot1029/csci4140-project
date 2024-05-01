/**
 * @module preload
 */

import {sha256sum} from './nodeCrypto';
import {versions} from './versions';
export {sha256sum, versions};

import type {CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote} from '@shared/types';
import {contextBridge, ipcRenderer} from 'electron';


try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args),
    readNote: (...args: Parameters<ReadNote>) => ipcRenderer.invoke('readNote', ...args),
    writeNote: (...args: Parameters<WriteNote>) => ipcRenderer.invoke('writeNote', ...args),
    createNote: (...args: Parameters<CreateNote>) => ipcRenderer.invoke('createNote', ...args),
    deleteNote: (...args: Parameters<DeleteNote>) => ipcRenderer.invoke('deleteNote', ...args),
  });
} catch (error) {
  console.error(error);
}
