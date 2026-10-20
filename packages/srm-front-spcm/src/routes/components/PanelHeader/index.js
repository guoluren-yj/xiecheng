import React, { Fragment } from 'react';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';

const PanelHeader = (props) => {
  const { title, targetKey = '', collapseKeys = [] } = props;
  return (
    <Fragment>
      <h3>{title}</h3>
      <a>
        {collapseKeys.includes(targetKey)
          ? intl.get(`hzero.common.button.up`).d('收起')
          : intl.get(`hzero.common.button.expand`).d('展开')}
      </a>
      <Icon type={collapseKeys.includes(targetKey) ? 'up' : 'down'} />
    </Fragment>
  );
};

export default PanelHeader;
