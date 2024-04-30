import React, {ComponentProps} from 'react';
import {NoteInfo} from '@shared/models';
import {cn, formatDateFromMs} from '/@/utils';

export type NoteEntryProps = NoteInfo & {
  isActive?: boolean;
} & ComponentProps<'div'>;

export const NoteEntry = ({
  title,
  lastEditTime,
  isActive = false,
  className,
  ...props
}: NoteEntryProps) => {
  return (
    <div
      className={cn(
        'cursor-pointer px-2.5 py-3 rounded-md transition-colors duration-75',
        {
          'bg-zinc-600/65': isActive,
          'hover:bg-zinc-700/65': !isActive,
        },
        className,
      )}
      {...props}
    >
      <h3 className='mb-1 font-bold truncate'>{title}</h3>
         <span className='inline-block w-full mb-2 text-xs font-light text-left'>{formatDateFromMs(lastEditTime)}</span>
    </div>
  );
};
