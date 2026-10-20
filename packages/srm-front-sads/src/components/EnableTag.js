import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

export default function EnableTag({ enabledFlag = 1 }) {
  return enabledFlag === 0 ? (
    <Tag color="#FEE7E5" style={{ color: '#F44336', margin: 0 }}>
      {intl.get('hzero.common.button.disable').d('禁用')}
    </Tag>
  ) : (
    <Tag color="#D9F6F2" style={{ color: '#00BFA5', margin: 0 }}>
      {intl.get('hzero.common.button.enable').d('启用')}
    </Tag>
  );
}
