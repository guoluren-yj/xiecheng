import React from 'react';
import { Alert } from 'choerodon-ui';
import styles from './index.less';

export default function AlertTips(props){
  return (
    <Alert
      className={styles['change-tips']}
      type="info"
      showIcon
      iconType='help'
      closable
      banner
      {...props}
    />
  );
}