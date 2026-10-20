/**
 * 聊天列表没有选中房间时展示的空页面
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { memo } from 'react';
import CLN from 'classnames';
import { Button } from 'choerodon-ui/pro';
import EmptyPanelSvg from '@/assets/empty_panel.svg';
import styles from './index.less';

const EmptyPanel = (props) => {
  const { className, showClose, onClose } = props;
  return (
    <div className={CLN(styles['empty-panel'], 'flex flex-center', className)}>
      <img src={EmptyPanelSvg} style={{ width: 220 }} alt="" />
      {showClose && (
        <div className={styles['empty-panel-close-wrap']}>
          <Button
            className={styles['empty-panel-close']}
            funcType="flat"
            icon="close"
            onClick={onClose}
          />
        </div>
      )}
    </div>
  );
};

export default memo(EmptyPanel);
