import React, { ComponentProps } from 'react';
import * as prod from 'react/jsx-runtime';
import Markdown from 'react-markdown';
import {defaultSchema} from 'hast-util-sanitize';
import RemarkCode from './remark-code';
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link';
import 'github-markdown-css/github-markdown.css';
import {useAtomValue} from 'jotai';
import {selectedNoteAtom} from '../store';
import { twMerge } from 'tailwind-merge';

export type PreviewProps = {
  content: string;
} & ComponentProps<'div'>;

export const Preview = ({content, className, ...props}: PreviewProps) => {
  return (
    <Markdown
      className={twMerge("markdown-body", className)}
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
      {content}
    </Markdown>
  );
};
