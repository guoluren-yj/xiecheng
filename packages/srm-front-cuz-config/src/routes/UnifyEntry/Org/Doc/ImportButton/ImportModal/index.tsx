import React, { useState, useCallback, useRef, useMemo } from 'react';
import classnames from 'classnames';
import { Icon } from 'choerodon-ui';

import styles from '../index.less';
import ImportHistory from './ImportHistory';
import ImportDetail from './ImportDetail';

const ImportModal = ({isInDetail, templateCode, docCode}: {isInDetail?, templateCode?, docCode?}) => {
  const lineRef = useRef();
  const [headerData, setHeaderData] = useState({} as any);
  const [collpaseLeft, setCollpaseLeft] = useState(false);
  const containerLeftCls = useMemo(
    () =>
      classnames(styles['container-left'], { [styles['container-left-collpase']]: collpaseLeft }),
    [collpaseLeft]
  );

  const fetchLinesData = useCallback(
    data => {
      // 第一次先清空headerId保证右侧区域重新渲染
      setTimeout(() => setHeaderData({}));
      setTimeout(() => setHeaderData(data));
    },
    [headerData]
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
        <ImportHistory fetchLinesData={fetchLinesData} isInDetail={isInDetail} templateCode={templateCode} docCode={docCode} />
      </div>
      <div className={styles['container-right']}>
        {collpaseLeft && (
          <div className={styles['collapse-icon']}>
            <Icon type="baseline-arrow_right" onClick={handleCollpaseLeft} />
          </div>
        )}
        <ImportDetail headerData={headerData} lineRef={lineRef} />
      </div>
    </div>
  );
};

export default ImportModal;
