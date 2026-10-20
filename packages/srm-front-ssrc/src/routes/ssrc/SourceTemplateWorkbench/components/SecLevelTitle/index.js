import React from 'react';
import { Divider } from 'choerodon-ui';
import intl from 'utils/intl';

import Style from './index.less';

export default function SecLevelTitle(props) {
  const { title = intl.get('hzero.common.button.title').d('标题'), ...otherProps } = props || {};

  return (
    <div className={Style['ssrc-second-level']} {...otherProps}>
      <Divider type="vertical" />
      <span className={Style['ssrc-second-level-title']}>{title}</span>
    </div>
  );
}
