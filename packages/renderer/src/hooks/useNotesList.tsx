import {indexOf} from 'lodash';
import {deleteNoteAtom, notesAtom, selectedNoteIndexAtom} from '/@/store';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {useEffect} from 'react';

export const useNotesList = ({onSelect}: {onSelect?: () => void}) => {
  const notes = useAtomValue(notesAtom);

  const [selectedNoteIndex, setSelectedNoteIndex] = useAtom(selectedNoteIndexAtom);
  const deleteNote = useSetAtom(deleteNoteAtom);

  const handleNoteSelect = (index: number) => async () => {
    console.log('handleNoteSelect', index);
    setSelectedNoteIndex(index);
    onSelect && onSelect();
  };

  useEffect(() => {
    const handleDeleteNote = async (file: string) => {
      console.log('handleDeleteNote', file);
      await deleteNote(file);
    };
    const deleteNoteListener = window.ipcRenderer.receive('delete-note', handleDeleteNote);
    return () => {
      deleteNoteListener();
    };
  }, [selectedNoteIndex]);

  return {
    notes,
    selectedNoteIndex,
    handleNoteSelect,
  };
};
