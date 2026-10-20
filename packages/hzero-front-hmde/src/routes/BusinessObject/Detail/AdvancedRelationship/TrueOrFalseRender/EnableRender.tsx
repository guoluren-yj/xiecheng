import React, { memo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from './index.less';

interface IEnableRender {
  enabledFlag?: boolean;
}
function EnableRender({ enabledFlag }: IEnableRender) {
  if (enabledFlag) {
    return (
      <div className={styles['enable-content']}>
        {intl.get('hzero.common.model.status.enable').d('启用')}
      </div>
    );
  } else {
    return (
      <div className={styles['disable-content']}>
        {intl.get('hzero.common.model.status.disable').d('禁用')}
      </div>
    );
  }
}
export default memo(EnableRender);
