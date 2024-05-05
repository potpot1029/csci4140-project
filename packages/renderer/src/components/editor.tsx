import React, {useCallback, useEffect} from 'react';
import useCodeMirror from './use-codemirror';
import {selectedNoteAtom} from '/@/store';
import {useAtomValue} from 'jotai';

interface Props {
  onChange: (doc: string) => void;
}

export const Editor: React.FC<Props> = props => {
  const selectedNote = useAtomValue(selectedNoteAtom);
  const {onChange} = props;
  const handleChange = useCallback((state: { doc: { toString: () => string; }; }) => onChange(state.doc.toString()), [onChange]);
  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: selectedNote?.content || '',
    onChange: handleChange,
  });

  useEffect(() => {
    if (editorView) {
      // Do nothing for now
    }
  }, [editorView]);

  return (
    <div
      className="flex-[0_0_50%] z-0 h-full"
      ref={refContainer}
    ></div>
  );
};
