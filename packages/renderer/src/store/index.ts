import type {NoteContent, NoteInfo} from '@shared/models';
import {atom} from 'jotai';
import {unwrap} from 'jotai/utils';

const loadNotes = async () => {
  const notes = await window.context.getNotes();
  // sorted by last edit time
  return notes.sort((a, b) => b.lastEditTime - a.lastEditTime);
};

const notesAtomAsync = atom<NoteInfo[] | Promise<NoteInfo[]>>(loadNotes());
export const notesAtom = unwrap(notesAtomAsync, prev => prev);
export const selectedNoteIndexAtom = atom<number | null>(null);

const selectedNoteAtomAsync = atom(async get => {
  const notes = get(notesAtom);
  const selectedNoteIndex = get(selectedNoteIndexAtom);

  if (!notes || selectedNoteIndex == null) return null;
  const selectedNote = notes[selectedNoteIndex];
  console.log('selectedNote', selectedNote.title);

  const noteContent = await window.context.readNote(selectedNote.title)

  return {
    ...selectedNote,
    content: noteContent,
  };
});
export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  prev =>
    prev ?? {
      title: '',
      content: '',
      lastEditTime: Date.now(),
    },
);

export const saveNoteAtom = atom(null, async (get, set, content: NoteContent) => {
  const notes = get(notesAtom);
  const selectedNote = get(selectedNoteAtom);
  if (!selectedNote || !notes) return;

  if (!selectedNote.title) {
    console.error('No selected note');
    return;
  }
  await window.context.writeNote(selectedNote.title, content);

  set(
    notesAtom,
    notes.map(note => {
      if (note.title === selectedNote.title) {
        return {
          ...note,
          lastEditTime: Date.now(),
        };
      }
      return note;
    }),
  );
});

export const createEmptyNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom);
  if (!notes) return;

  const title = await window.context.createNote();

  if (!title) {
    console.error('Failed to create note');
    return;
  }

  const newNote: NoteInfo = {
    title,
    lastEditTime: Date.now(),
  };
  set(notesAtom, [newNote, ...notes.filter((note) => note.title !== newNote.title)]);
  set(selectedNoteIndexAtom, 0);
})
