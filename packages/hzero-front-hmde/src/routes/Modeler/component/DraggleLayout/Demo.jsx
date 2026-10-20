import React, { useRef, useEffect, useState } from 'react';

import DraggleLayout from './DraggleLayout';
import './demo.less';

export default function Demo() {
  const contentRef = useRef();
  const leftDomRef = useRef();
  const rightDomRef = useRef();
  const [init, setInit] = useState(false);

  useEffect(() => {
    setInit(true);
  }, []);

  const draggleLayoutProps = {
    contentDom: contentRef.current,
    leftDom: leftDomRef.current,
    rightDom: rightDomRef.current,
  };
  return (
    <div className="content-wrapper" ref={contentRef}>
      <div className="left" ref={leftDomRef}>
        左侧
      </div>
      {/* 父组件加载完再加载子组件 从而通过ref拿到父组件的dom节点 */}
      {init && <DraggleLayout {...draggleLayoutProps} />}
      <div className="right" ref={rightDomRef}>
        右侧
      </div>
    </div>
  );
}
