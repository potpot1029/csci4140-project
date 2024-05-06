import React, {ComponentProps} from 'react';
import * as prod from 'react/jsx-runtime';
import Markdown from 'react-markdown';
import {defaultSchema} from 'hast-util-sanitize';
import RemarkCode from './remark-code';
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link';
import 'github-markdown-css/github-markdown.css';
import {useAtomValue, useSetAtom} from 'jotai';
import {createEmptyNoteAtom, selectedNoteAtom} from '../store';
import {twMerge} from 'tailwind-merge';
import emoji from 'remark-emoji';
import {useNotesList} from '../hooks/useNotesList';

export type PreviewProps = {
  content: string;
} & ComponentProps<'div'>;

export const Preview = ({content, className, ...props}: PreviewProps) => {
  return (
    <Markdown
      className={twMerge('markdown-body', className)}
      remarkPlugins={[
        remarkGfm,
        emoji,
        [
          wikiLinkPlugin,
          {
            aliasDivider: '|',
            pageResolver: (name: string) => [name.replace(/ /g, ' ')],
            hrefTemplate: (link: any) => `#/${link}`,
          },
        ],
      ]}
      components={{
        code(props) {
          return <RemarkCode {...props} />;
        },
        a(props) {
          // if className includes internal then it's a link to a note
          if (props.className && props.className.includes('internal')) {
            const {notes, selectedNoteIndex, handleNoteSelect} = useNotesList({});
            const note = notes!.find(note => note.metadata.title === props.href!.slice(2));
            if (note) {
              return (
                <a
                  {...props}
                  href={`#`}
                  onClick={handleNoteSelect(notes!.indexOf(note))}
                />
              );
            } else {
              // create a new note
              const createNote = useSetAtom(createEmptyNoteAtom);

              return (
                <a
                  {...props}
                  className='color-gray-500 hover:underline'
                  href={`#`}
                  onClick={() => {
                    console.log('create note', props.href!.slice(2));
                    createNote(props.href!.slice(2));
                  }}
                />
              );
            }
          } else {
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              />
            );
          }
        },
      }}
    >
      {content}
    </Markdown>
  );
};
