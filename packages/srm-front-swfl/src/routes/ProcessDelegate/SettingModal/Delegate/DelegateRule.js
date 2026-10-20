import React, { memo } from 'react';
import { Form, Lov, DateTimePicker, Switch, Tooltip, Output } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { renderDelegateStatus } from '@/utils/util';

const DelegateRule = ({ dataSet, isEdit }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <Output name="delegateStatus" renderer={renderDelegateStatus} />
      <Lov name="employeeLov" disabled={isEdit} />
      <DateTimePicker name="delegateStartDate" />
      <DateTimePicker name="delegateEndDate" />
      <Lov name="delegateUserLov" />
      <Switch
        name="hisDelegateFlag"
        label={
          <>
            {intl.get('hwfp.common.delegate.documentAutoDelegate').d('未审批单据自动转交')}
            <Tooltip
              title={intl
                .get('hwfp.common.delegate.documentAutoDelegate.help')
                .d('开启未审批单据自动转交，则到达转交开始时间，未审批单据会自动转交转交人')}
            >
              <Icon type="help" />
            </Tooltip>
          </>
        }
      />
    </Form>
  );
};

export default memo(DelegateRule);
