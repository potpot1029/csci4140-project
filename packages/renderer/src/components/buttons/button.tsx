import React, {ComponentProps} from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = ComponentProps<'button'>;

export const Button = ({className, children, ...props}: ButtonProps) => {
    return (
        <button
            className={twMerge('ml-1 px-2 py-1 rounded-md hover:bg-zinc-600/50 transition-colors duration-100', className)}
            {...props}
        >
            {children}
        </button>
    );
}