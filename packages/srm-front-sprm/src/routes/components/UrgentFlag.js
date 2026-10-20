import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const commonPrompt = 'sprm.common.model.common';

export const UrgentFlag = () => {
  return (
    <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
      <Icon type="priority" style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }} />
    </Tooltip>
  );
};
