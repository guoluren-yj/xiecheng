import React, { useState, useCallback, useRef, useMemo } from 'react';
import classnames from 'classnames';
import { Icon } from 'choerodon-ui';

import styles from '../index.less';
import ImportHistory from './ImportHistory';
import ImportDetail from './ImportDetail';

const ImportModal = () => {
  const lineRef = useRef();
  const [headerId, setHeaderId] = useState(null);
  const [collpaseLeft, setCollpaseLeft] = useState(false);
  const containerLeftCls = useMemo(
    () =>
      classnames(styles['container-left'], { [styles['container-left-collpase']]: collpaseLeft }),
    [collpaseLeft]
  );

  const fetchLinesData = useCallback(
    id => {
      // 第一次先清空headerId保证右侧区域重新渲染
      setTimeout(() => setHeaderId(null));
      setTimeout(() => setHeaderId(id));
    },
    [headerId]
  );

  const handleCollpaseLeft = () => setCollpaseLeft(!collpaseLeft);
  return (
    <div className={styles.container}>
      <div className={containerLeftCls}>
        {/* {!collpaseLeft && (
          <div className={styles['collapse-icon']}>
            <Icon type="baseline-arrow_left" onClick={handleCollpaseLeft} />
          </div>
        )} */}
        <ImportHistory fetchLinesData={fetchLinesData} />
      </div>
      <div className={styles['container-right']} style={{ overflow: 'hidden' }}>
        {collpaseLeft && (
          <div className={styles['collapse-icon']}>
            <Icon type="baseline-arrow_right" onClick={handleCollpaseLeft} />
          </div>
        )}
        {headerId && <ImportDetail headerId={headerId} lineRef={lineRef} />}
      </div>
    </div>
  );
};

export default ImportModal;
