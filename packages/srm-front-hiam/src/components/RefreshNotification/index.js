/**
 *  大刷提示
 * @date: 2023-1-9
 */
import React from 'react';
import { message } from 'choerodon-ui';

import intl from 'hzero-front/lib/utils/intl';

function showRefreshNotification() {
  const [before, after] = intl
    .get('hzero.common.refresh.prompt')
    .d('配置修改成功，请{refresh}生效')
    .split('{refresh}');

  return message.success(
    <span>
      {before}
      &nbsp;
      <a href={window.location.href}>{intl.get('hzero.common.button.refresh').d('刷新')}</a>
      &nbsp;
      {after}
    </span>,
    10,
    undefined,
    'top'
  );
}

export default showRefreshNotification;
