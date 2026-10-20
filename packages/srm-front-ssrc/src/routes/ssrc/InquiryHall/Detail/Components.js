// 页面组件
import React from 'react';
import { TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const RoundQuotationDurationFields = (props) => {
  const { round } = props;
  return (
    <React.Fragment>
      <TextField disabled name={`roundDay${round}`} />
      {intl.get('hzero.common.date.unit.day').d('天')}
      <TextField disabled name={`roundHour${round}`} />
      {intl.get('hzero.common.date.unit.hours').d('小时')}
      <TextField disabled name={`roundMinute${round}`} />
      {intl.get('hzero.common.date.unit.minutes').d('分钟')}
    </React.Fragment>
  );
};

export { RoundQuotationDurationFields };
