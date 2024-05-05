import React, {useEffect} from 'react';
import {Button} from '/@/components';

export type DirectorySelectorProps = {
  setError: (error: string) => void;
} & React.ComponentProps<'div'>;

export const DirectorySelector = ({setError, ...props}: DirectorySelectorProps) => {
  const [selectedDirectory, setSelectedDirectory] = React.useState<string | null>(null);

  const handleDirectorySelection = async () => {
    const path = await window.files.selectDirectory();
    setSelectedDirectory(path);
  };

  useEffect(() => {
    if (!selectedDirectory) {
      setError('Please select a directory to continue');
    } else {
      window.electron.setVaultDirectory(selectedDirectory);
      setError('');
    }
  }, [selectedDirectory]);

  return (
    <div {...props}>
      <Button
        className="bg-sky-700"
        onClick={handleDirectorySelection}
      >
        Select Directory
      </Button>
      {selectedDirectory ? <span>Selected: {selectedDirectory}</span> : null}
    </div>
  );
};
