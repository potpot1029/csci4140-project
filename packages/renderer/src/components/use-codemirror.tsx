import {useEffect, useState, useRef} from 'react';
import {EditorState} from '@codemirror/state';
import {
  EditorView,
  keymap,
  highlightActiveLineGutter,
  highlightActiveLine,
  lineNumbers,
} from '@codemirror/view';
import {history, defaultKeymap, historyKeymap} from '@codemirror/commands';
import {
  indentOnInput,
  defaultHighlightStyle,
  HighlightStyle,
  syntaxHighlighting,
  bracketMatching,
} from '@codemirror/language';
import {tags} from "@lezer/highlight";
// Theme
import {oneDark} from '@codemirror/theme-one-dark';
// languages
import {javascript} from '@codemirror/lang-javascript';
import {markdown, markdownLanguage} from '@codemirror/lang-markdown';
import {languages} from '@codemirror/language-data';

export const transparentTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent !important',
    height: '100%',
  },
});

const markdownHightlightStyle = HighlightStyle.define([
    {
        tag: tags.heading1,
        fontSize: '1.6em',
        fontWeight: 'bold',
    },
    {
        tag:tags.heading2,
        fontSize: '1.4em',
        fontWeight: 'bold',
    },
    {
        tag: tags.heading3,
        fontSize: '1.2em',
        fontWeight: 'bold'
    }
]);

import type React from 'react';

interface Props {
  initialDoc: string;
  onChange?: (state: EditorState) => void;
}

const useCodeMirror = <T extends Element>(
  props: Props,
): [React.MutableRefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const {onChange} = props;

  useEffect(() => {
    if (!refContainer.current) return;

    const startState = EditorState.create({
      doc: props.initialDoc,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
        highlightActiveLine(),
        markdown({
            base: markdownLanguage,
            codeLanguages: languages,
            addKeymap: true,
        }),
        oneDark,
        transparentTheme,
        syntaxHighlighting(markdownHightlightStyle),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.changes) {
            onChange && onChange(update.state);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
    });
    setEditorView(view);
  }, [refContainer]);

  return [refContainer, editorView];
};

export default useCodeMirror;
