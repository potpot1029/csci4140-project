import React, {ComponentProps} from 'react';
import { AddNoteButton } from './buttons/add-note-button';
import { NewNote } from './new-note';

export const ButtonsRow = ({ ...props }: ComponentProps<'div'>) => {
    const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);



    return (
        <div {...props}>
            <AddNoteButton isOpen={isNewNoteOpen} setIsNewNoteOpen={setIsNewNoteOpen} />
            { isNewNoteOpen && (
                <NewNote isOpen={isNewNoteOpen} setIsNewNoteOpen={setIsNewNoteOpen} />
            )}
        </div>
    )
}