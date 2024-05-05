import React from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

export const ResizableComponent = () =>  {
  return (
    <div style={{ width: '100%', padding: 20 }}>
      <ResizableBox
        width={200}
        height={100}
        axis="x"
        minConstraints={[100, 100]}
        maxConstraints={[300, 100]}
        resizeHandles={['e']}
        handle = {
           <div className='absolute right-0 top-0 bottom-0 w-[10px] cursor-ew-resize'/>
        }
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: 'lightblue' }}>
          Try resizing me!
        </div>
      </ResizableBox>
    </div>
  );
}
