/*
 * @Date: 2022-10-30 14:55:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, useState } from 'react';
import { Button } from 'choerodon-ui/pro';

import styles from './index.less';

const minZoom = 50; // 最小缩放值
const maxZoom = 200; // 最大缩放值
const defaultZoom = 100; // 默认缩放值

const ZoomToolbar = ({ graph, customRef }) => {
  const [displayZoom, setDisplayZoom] = useState(defaultZoom);

  const handleZoom = useCallback(
    code => {
      if (graph || customRef.current) {
        const finallyGraph = graph || customRef.current.customGraph;
        const currentZoom = finallyGraph.getZoom();
        if (code === 'zoomIn') {
          if (displayZoom >= 60) {
            setDisplayZoom(displayZoom - 10);
            finallyGraph.zoomTo(currentZoom - 0.1);
          } else {
            setDisplayZoom(minZoom);
            finallyGraph.zoomTo(currentZoom);
          }
        } else if (code === 'zoomOut') {
          if (displayZoom <= 190) {
            setDisplayZoom(displayZoom + 10);
            finallyGraph.zoomTo(currentZoom + 0.1);
          } else {
            setDisplayZoom(maxZoom);
            finallyGraph.zoomTo(currentZoom);
          }
        }
      }
    },
    [graph, customRef, displayZoom]
  );

  return (
    <span className={styles['zoom-toolbar']}>
      <Button
        funcType="link"
        icon="remove"
        disabled={displayZoom === minZoom}
        onClick={() => handleZoom('zoomIn')}
      />
      <span className={styles['zoom-toolbar-label']}>{displayZoom}%</span>
      <Button
        funcType="link"
        icon="add"
        disabled={displayZoom === maxZoom}
        onClick={() => handleZoom('zoomOut')}
      />
    </span>
  );
};

export default ZoomToolbar;
