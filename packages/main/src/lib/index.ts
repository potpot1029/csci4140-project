import {appDirectoryName, fileEncoding, welcomeNoteFilename} from '@shared/constants';
import type {NoteFile} from '@shared/models';
import type {CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote} from '@shared/types';
import {dialog} from 'electron';
import fs_extra from 'fs-extra';
const {ensureDir, readFile, readdir, remove, stat, writeFile} = fs_extra;
import lodash from 'lodash';
const {isEmpty} = lodash;
import {basename} from 'path';

export const getRootDir = () => {
  return `${appDirectoryName}`;
};

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir();

  await ensureDir(rootDir);

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false,
  });

  const notes = notesFileNames.filter(fileName => fileName.endsWith('.md'));
  // console.info('Found notes:', notes);

  if (isEmpty(notes)) {
    console.info('No notes found, creating a welcome note');

    const content = await readFile(`${rootDir}/buildResources/helloWorld.md`, {
      encoding: fileEncoding,
    });

    // create the welcome note
    await writeFile(`${rootDir}/${welcomeNoteFilename}`, content, {encoding: fileEncoding});

    notes.push(welcomeNoteFilename);
  }

  const noteInfos = await Promise.all(notes.map(getNoteInfoFromFilename));
  // console.info('noteInfos', noteInfos);
  return noteInfos;
};

export const getNoteInfoFromFilename = async (filename: string): Promise<NoteFile> => {
  const fileStats = await stat(`${getRootDir()}/${filename}`);
  const fileContent = await readFile(`${getRootDir()}/${filename}`, {encoding: fileEncoding});

  if (!fileStats.isFile()) {
    throw new Error(`File ${filename} is not a file`);
  }

  return {
    path: `${getRootDir()}/${filename}`,
    basename: basename(filename),
    mtime: fileStats.mtimeMs,
    content: fileContent,
    metadata: {
      title: filename.replace(/\.md$/, ''),
      path: basename(filename),
    },
  };
};

export const readNote: ReadNote = async filename => {
  const rootDir = getRootDir();

  return readFile(`${rootDir}/${filename}.md`, {encoding: fileEncoding});
};

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir();

  console.info(`Writing note ${filename} in ${rootDir}`);
  writeFile(`${rootDir}/${filename}.md`, content, {encoding: fileEncoding});

  return getNoteInfoFromFilename(`${filename}.md`);
};

export const renameNote = async (oldFilename: string, newFilename: string) => {
  const rootDir = getRootDir();

  console.info(`Renaming note ${oldFilename} to ${newFilename}`);
  await fs_extra.rename(`${rootDir}/${oldFilename}.md`, `${rootDir}/${newFilename}.md`);

  return getNoteInfoFromFilename(`${newFilename}.md`);
}

export const createNote: CreateNote = async filename => {
  const rootDir = getRootDir();

  await ensureDir(rootDir);

  const filePath = `${rootDir}/${filename}.md`;
  // check if the file already exists
  if (
    await stat(filePath)
      .then(() => true)
      .catch(() => false)
  ) {
    console.info(`Note ${filename} already exists`);
    return getNoteInfoFromFilename(`${filename}.md`);
  }

  await writeFile(filePath, `# ${filename}\n\n`, {encoding: fileEncoding});

  return getNoteInfoFromFilename(`${filename}.md`);
};

export const deleteNote: DeleteNote = async filename => {
  const rootDir = getRootDir();

  const {response} = await dialog.showMessageBox({
    type: 'warning',
    title: 'Delete note',
    message: `Are you sure you want to delete ${filename}?`,
    buttons: ['Delete', 'Cancel'], // 0 is Delete, 1 is Cancel
    defaultId: 1,
    cancelId: 1,
  });

  if (response === 1) {
    console.info('Note deletion canceled');
    return false;
  }

  console.info(`Deleting note: ${filename}`);
  await remove(`${rootDir}/${filename}.md`);
  return true;
};

export const setVaultDirectory = async (directory: string) => {
  console.info('Setting vault directory to: ', directory);
};

export const getVaultDirectory = async () => {
  console.info('Getting vault directory');
  return getRootDir();
};

export const selectDirectory = async () => {
  console.info('Getting vault directory');
  const result = await dialog.showOpenDialog({
    title: 'Select vault directory',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (result.canceled) {
    console.info('No directory selected');
    return null;
  } else {
    console.info('Selected directory:', result.filePaths[0]);
    return result.filePaths[0];
  }
};
