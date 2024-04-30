import React from 'react';
import * as prod from 'react/jsx-runtime';
import Markdown from 'react-markdown';
import {defaultSchema} from 'hast-util-sanitize';
import RemarkCode from './remark-code';
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link';
import 'github-markdown-css/github-markdown.css';
import {useAtomValue} from 'jotai';
import {selectedNoteAtom} from '../store';

export const Preview: React.FC = props => {
  const selectedNote = useAtomValue(selectedNoteAtom);
  const md = selectedNote?.content || '';

  return (
    <Markdown
      className="markdown-body bg-transparent p-2 overflow-auto text-slate-300"
      remarkPlugins={[
        remarkGfm,
        [
          wikiLinkPlugin,
          {
            aliasDivider: '|',
            pageResolver: (name: string) => [name.replace(/ /g, '_')],
            hrefTemplate: (link: any) => `#/${link}`,
          },
        ],
      ]}
      components={{
        code(props) {
          return <RemarkCode {...props} />;
        },
        a(props) {
          return (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          );
        }
      }}
    >
      {md}
    </Markdown>
  );
};
