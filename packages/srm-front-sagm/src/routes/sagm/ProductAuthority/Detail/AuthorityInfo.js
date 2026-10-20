// 权限信息表单
import React, { memo } from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import FormPro from '../../SagmWorkbench/Comps/FormPro';

export default memo(function AuthorityInfo(props) {
  const { initDs, readOnly, onRangeChange } = props;
  const Tips = (title) => (
    <Tooltip title={title} placement="topRight">
      <Icon type="help" />
    </Tooltip>
  );
  return (
    <FormPro
      readOnly={readOnly}
      fields={[
        { name: 'authorityListCode' },
        { name: 'authorityListName' },
        { name: 'agreementType', _type: 'Select' },
        { name: 'agreementHeaderNum' },
        { name: 'realName' },
        { name: 'creationDate' },
        { name: 'statusCode' },
        {
          name: 'controlWayCode',
          _type: 'Select',
          clearButton: false,
          addonAfter: Tips(intl.get('sagm.common.view.controlMethodTip').d('排除优先级高于包含')),
        },
        { name: 'controlRange', _type: 'Select', clearButton: false, onChange: onRangeChange },
        {
          name: 'operationAuth',
          _type: 'Select',
          clearButton: false,
          addonAfter: Tips(intl.get('sagm.common.view.operationAuthTip').d('仅浏览优先级高于下单')),
        },
        { name: 'effectiveDate', _type: 'DatePicker' },
        {
          name: 'remarkMeaning',
          renderer: ({ value, record }) => (record ? value || record.get('remark') : value),
        },
        {
          name: 'enableFlag',
          _type: 'Switch',
          renderer: ({ value }) =>
            value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否'),
        },
      ]}
      dataSet={initDs}
      columns={2}
      style={{ width: '75%' }}
    />
  );
});
