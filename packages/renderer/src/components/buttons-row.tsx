import React, {ComponentProps} from 'react';
import { AddNoteButton } from './buttons/add-note-button';

export const ButtonsRow = ({ ...props }: ComponentProps<'div'>) => {
    return (
        <div {...props}>
            <AddNoteButton/>
        </div>
    )
}