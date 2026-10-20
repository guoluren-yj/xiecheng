import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

export default function EnableTag({ enabledFlag = 1 }) {
  return enabledFlag === 0 ? (
    <Tag color="red" style={{ fontWeight: 600, border: 'none' }}>
      {intl.get('hzero.common.button.disable').d('禁用')}
    </Tag>
  ) : (
    <Tag color="green" style={{ border: 'none', fontWeight: 600 }}>
      {intl.get('hzero.common.button.enable').d('启用')}
    </Tag>
  );
}
