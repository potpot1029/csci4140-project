import {
  type ChatMessage,
  type NoteContent,
  type NoteFile,
} from '@shared/models';
import {atom} from 'jotai';
import {unwrap} from 'jotai/utils';
import type ChainManager from '../components/chatbot/llm/chain-manager';

export const loadNotes = async () => {
  const notes = await window.context.getNotes();
  // sorted by last edit time
  return notes.sort((a, b) => (b.basename > a.basename ? -1 : 1));
};

// All notes
const notesAtomAsync = atom<NoteFile[] | Promise<NoteFile[]>>(loadNotes());
export const notesAtom = unwrap(notesAtomAsync, prev => prev);

// Currently selected note
export const selectedNoteIndexAtom = atom<number | null>(null);
const selectedNoteAtomAsync = atom(async get => {
  const notes = get(notesAtom);
  const selectedNoteIndex = get(selectedNoteIndexAtom);

  if (!notes || selectedNoteIndex == null) return null;
  const selectedNote = notes[selectedNoteIndex];
  console.log('selectedNote', selectedNote.basename);


  return selectedNote
});
export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  prev =>
    prev ?? {
      path: '',
      basename: '',
      mtime: Date.now(),
      content: '',
      metadata: { title: '', path: ''},
    },
);

// Save the content of the selected note
export const saveNoteAtom = atom(null, async (get, set, content: NoteContent) => {
  const notes = get(notesAtom);
  const selectedNote = get(selectedNoteAtom);
  if (!selectedNote || !notes) return;

  if (!selectedNote.metadata.title) {
    console.error('No selected note');
    return;
  }

  console.info("New content:", content);
  await window.context.writeNote(selectedNote.metadata.title, content);

  set(
    notesAtom,
    notes.map(note => {
      if (note.metadata.title === selectedNote.metadata.title) {
        return {
          ...note,
          content: content,
          mtime: Date.now(),
        };
      }
      return note;
    }),
  );
});

export const getNoteByTitleAtom = atom(null, (get, set, title: string) => {
  const notes = get(notesAtom);
  if (!notes) return null;

  return notes.find(note => note.basename === title);
});

// Create a new note (or open an existing one with the same title)
export const createEmptyNoteAtom = atom(null, async (get, set, title: string) => {
  const notes = get(notesAtom);
  if (!notes) return;

  const newNote = await window.context.createNote(title);

  if (!newNote) {
    console.error('Failed to create note');
    return;
  }

  set(notesAtom, [newNote, ...notes.filter(note => note.basename !== newNote.basename)]);
  set(selectedNoteIndexAtom, 0);
});

export const chatHistoryAtom = atom<ChatMessage[]>([]);

export const addChatMessageAtom = atom(null, (get, set, message: ChatMessage) => {
  set(chatHistoryAtom, [...get(chatHistoryAtom), message]);
});

export const clearChatHistoryAtom = atom(null, (get, set) => {
  set(chatHistoryAtom, []);
});

export const chainManagerAtom = atom<ChainManager | null>(null);
