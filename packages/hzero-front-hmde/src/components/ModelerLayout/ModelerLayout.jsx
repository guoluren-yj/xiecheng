import React, { forwardRef, useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';

import noPermissionImg from '@/assets/no-authority@3x.png';

import styles from './ModelerLayout.less';

// 覆盖hzero布局样式
export default forwardRef((props) => {
  const [noPermission, setNoPermission] = useState(false);
  const { children = null, className } = props;

  // 初始化
  const init = () => {
    // 预留鉴权请求
    setNoPermission(false);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Spin wrapperClassName={styles.layoutSpin} spinning={false} style={{ height: '100%' }}>
      <div className={`hmde ${styles.modelerLayout} ${className || ''}`}>
        <div className={`${styles.modelerPageContainer} page-container ant-layout-content`}>
          {noPermission ? (
            <div className={styles['no-permission']}>
              <img src={noPermissionImg} alt="没有权限" />
              <span>暂无权限，请联系平台管理员~</span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </Spin>
  );
});
