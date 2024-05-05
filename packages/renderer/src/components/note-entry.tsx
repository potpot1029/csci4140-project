import React, {ComponentProps} from 'react';
import {NoteFile} from '@shared/models';
import {cn, formatDateFromMs} from '/@/utils';
import {FaRegFileLines} from 'react-icons/fa6';

export type NoteEntryProps = NoteFile & {
  file: NoteFile;
  isActive?: boolean;
} & ComponentProps<'div'>;

export const NoteEntry = ({
  file,
  isActive = false,
  className,
  ...props
}: NoteEntryProps) => {

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    // show context menu
    window.contextMenu.showFileItemContextMenu(file);
  };
  return (
    <div
      className={cn(
        'cursor-pointer px-4 transition-colors duration-75 flex items-center h-full',
        {
          'bg-zinc-600/65': isActive,
          'hover:bg-zinc-700/65': !isActive,
          'font-bold': isActive,
        },
        className,
      )}
      onContextMenu={handleContextMenu}
      {...props}
    >
      <div className="h-full mr-1 flex items-center">
        <FaRegFileLines
          style={{
            fontSize: '14px',
          }}
        />
      </div>
      <div
        className="h-full"
        style={{
          fontSize: '16px',
        }}
      >
        {file.basename}
      </div>
    </div>
  );
};
