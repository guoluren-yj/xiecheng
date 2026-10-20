import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ModalProvider, useModal } from 'choerodon-ui/pro';
import styles from './index.less';

// 替换标准Content
export function EmbedContent({ children, className = '' }) {
  return (
    <div className={styles['embed-container']}>
      <div className={`${className} ${styles['embed-content']}`}>{children}</div>
    </div>
  );
}

// 高阶组件注入Modal
export default function withEmbedModal(PageComponent) {
  // 注入Modal
  const InjectModal = ({ ...props }) => {
    const Modal = useModal();
    return <PageComponent {...props} Modal={Modal} />;
  };

  // 绑定容器
  const EmbedWrapper = (props) => {
    const currentRef = useRef();
    const [containerRef, setContainerRef] = useState(null);

    const getContainer = useCallback(() => containerRef, [containerRef]);

    useEffect(() => {
      setContainerRef(currentRef.current);
    }, []);

    return (
      <div ref={currentRef} style={{ height: 'calc((100vh - 0.35rem) - 0.48rem)' }}>
        <ModalProvider getContainer={getContainer}>
          <InjectModal {...props} />
        </ModalProvider>
      </div>
    );
  };
  return EmbedWrapper;
}
