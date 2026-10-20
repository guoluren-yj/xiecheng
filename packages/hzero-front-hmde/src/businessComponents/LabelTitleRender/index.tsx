import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

import styles from './index.less';

const Index = ({ value, help }: { value: any; help?: any }) => {
  return (
    <span className={styles['label-contain']}>
      <span>
        {value}
        {help && (
          <Tooltip title={help}>
            <Icon type="help" style={{ color: '#868d9c' }} />
          </Tooltip>
        )}
      </span>
    </span>
  );
};
export default Index;
