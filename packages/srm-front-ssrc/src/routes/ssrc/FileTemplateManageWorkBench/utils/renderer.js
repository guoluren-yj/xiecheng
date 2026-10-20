import React from 'react';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import { ListStatusColor } from './enum';

// render status tag
const renderStatusTag = (value) => {
  const tagMeaning = value
    ? intl.get('hzero.common.enable').d('启用')
    : intl.get('hzero.common.button.disable').d('禁用');

  return (
    <Tag border={false} color={ListStatusColor[value]}>
      {tagMeaning}
    </Tag>
  );
};

export { renderStatusTag };
