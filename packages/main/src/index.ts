import {Menu, MenuItem, app, ipcMain} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {
  createNote,
  deleteNote,
  getNotes,
  getVaultDirectory,
  readNote,
  renameNote,
  selectDirectory,
  writeNote,
} from './lib';
import type {
  CreateNote,
  DeleteNote,
  GetNotes,
  GetVaultDirectory,
  ReadNote,
  RenameNote,
  SelectDirectory,
  WriteNote,
} from '@shared/types';
import {platform} from 'node:process';
import updater from 'electron-updater';

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */

app
  .whenReady()
  .then(() => {
    restoreOrCreateWindow();
  })
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS3_DEVTOOLS} =
//         // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => updater.autoUpdater.checkForUpdatesAndNotify())
    .catch(e => console.error('Failed check and install updates:', e));
}

ipcMain.handle('getNotes', (_, ...args: Parameters<GetNotes>) => getNotes(...args));
ipcMain.handle('readNote', (_, ...args: Parameters<ReadNote>) => readNote(...args));
ipcMain.handle('writeNote', (_, ...args: Parameters<WriteNote>) => writeNote(...args));
ipcMain.handle('createNote', (_, ...args: Parameters<CreateNote>) => createNote(...args));
ipcMain.handle('deleteNote', (_, ...args: Parameters<DeleteNote>) => deleteNote(...args));
ipcMain.handle('selectDirectory', (_, ...args: Parameters<SelectDirectory>) =>
  selectDirectory(...args),
);
ipcMain.handle('getVaultDirectory', (_, ...args: Parameters<GetVaultDirectory>) =>
  getVaultDirectory(...args),
);
ipcMain.handle('renameNote', (_, ...args: Parameters<RenameNote>) => renameNote(...args));

ipcMain.handle('show-note-item-context-menu', (event, file: string) => {
  console.log('showNoteItemContextMenu', file);
  const menu = new Menu();

  // delete selected note
  menu.append(
    new MenuItem({
      label: 'Delete',
      click: async () => {
        console.info('delete-note', file);
        event.sender.send('delete-note', file);
      },
    }),
  );

  menu.popup();
});

ipcMain.handle('show-ai-context-menu', (event, selectedText) => {
  console.log('showAIContextMenu');
  const menu = new Menu();

  // summarize selected text
  menu.append(
    new MenuItem({
      label: 'Summarize',
      click: async () => {
        console.info('summarize: ', selectedText);
        event.sender.send('ai-text', selectedText, 'Summarize');
      },
    }),
  );
  menu.append(
    new MenuItem({
      label: 'Simplify',
      click: async () => {
        console.info('simplify: ', selectedText);
        event.sender.send('ai-text', selectedText, 'Simplify');
      },
    }),
  );
  menu.append(
    new MenuItem({
      label: 'Paraphrase',
      click: async () => {
        console.info('paraphrase: ', selectedText);
        event.sender.send('ai-text', selectedText, 'Paraphrase');
      },
    }),
  );
  menu.append(
    new MenuItem({
      label: 'Expand',
      click: async () => {
        console.info('paraphrase: ', selectedText);
        event.sender.send('ai-text', selectedText, 'Expand');
      },
    }),
  );
  menu.append(
    new MenuItem({
      label: 'Fix Grammar',
      click: async () => {
        console.info('fix grammar: ', selectedText);
        event.sender.send('ai-text', selectedText, 'Fix Grammar');
      },
    }),
  );
  menu.popup();
});
