import React, {ComponentProps, forwardRef} from 'react';
import {twMerge} from 'tailwind-merge';
import {cn} from '../utils';

export const RootLayout = ({children, className, ...props}: ComponentProps<'main'>) => {
  return (
    <main
      className={twMerge('flex flex-row h-full', className)}
      {...props}
    >
      {children}
    </main>
  );
};

export const Sidebar = ({className, children, ...props}: ComponentProps<'aside'>) => {
  return (
    <aside
      className={twMerge('w-[250px] bg-zinc-800 h-full overflow-auto', className)}
      {...props}
    >
      {children}
    </aside>
  );
};

export const Content = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({children, className, ...props}, ref) => (
    <div
      ref={ref}
      className={cn(twMerge('overflow-auto', className), {
        'bg-transparent': navigator.userAgent.includes('Mac'),
        'bg-zinc-800': !navigator.userAgent.includes('Mac'),
      })}
      {...props}
    >
      {children}
    </div>
  ),
);

Content.displayName = 'Content';
