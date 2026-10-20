import React from 'react';
import { Tag } from 'choerodon-ui';

import styles from './index.less';

export const StatusTag = (props) => {
  return <Tag className={styles['status-tag']} {...props} />;
};
