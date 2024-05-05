import React, {useEffect, useRef} from 'react';

export type ModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
} & React.ComponentProps<'div'>;

export const Modal = ({isOpen, setIsOpen, className, ...props}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        console.log("Clicked")
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // click outside the modal to close it
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-zinc-800 m-auto  p-4 rounded-lg w-1/2"
      >
        {props.children}
      </div>
    </div>
  );
};
