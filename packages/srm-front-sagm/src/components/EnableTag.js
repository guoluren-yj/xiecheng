import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

export default function EnableTag({ enabledFlag = 1 }) {
  return enabledFlag === 0 ? (
    <Tag color="red" border={false}>
      {intl.get('hzero.common.button.disable').d('禁用')}
    </Tag>
  ) : enabledFlag === 1 ? (
    <Tag color="green" border={false}>
      {intl.get('hzero.common.button.enable').d('启用')}
    </Tag>
  ) : (
    <Tag color="#fca0001a" style={{ color: '#f88d10' }}>
      {intl.get('hzero.common.button.waiting').d('启用中')}
    </Tag>
  );
}
