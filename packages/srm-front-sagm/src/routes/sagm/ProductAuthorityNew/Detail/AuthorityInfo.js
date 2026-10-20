// 权限信息表单
import React, { memo } from 'react';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import FormPro from '../../SagmWorkbench/Comps/FormPro';
import { renderAuthorityStatus } from '../render';

export default memo(function AuthorityInfo(props) {
  const { initDs, readOnly, useWidthPercent, onRangeChange = () => null } = props;
  return (
    <FormPro
      readOnly={readOnly}
      useWidthPercent={useWidthPercent}
      fields={[
        { name: 'authorityListCode' },
        { name: 'authorityListName' },
        {
          name: 'statusCode',
          renderer: ({ record }) =>
            renderAuthorityStatus({ record, value: record?.get('statusCodeMeaning') }),
          show: readOnly,
        },
        { name: 'agreementType', _type: 'Select' },
        { name: 'agreementHeaderNum' },
        { name: 'versionNum', show: readOnly },
        { name: 'realName' },
        {
          name: 'creationDate',
          renderer: ({ value }) => dateTimeRender(value),
        },
        {
          name: 'controlWayCode',
          _type: 'Select',
          clearButton: false,
          help: intl.get('sagm.common.view.controlMethodTip').d('排除优先级高于包含'),
          showHelp: 'tooltip',
        },
        { name: 'controlRange', _type: 'Select', clearButton: false, onChange: onRangeChange },
        {
          name: 'operationAuth',
          _type: 'Select',
          clearButton: false,
          showHelp: 'tooltip',
          help: intl.get('sagm.common.view.operationAuthTip').d('仅浏览优先级高于下单'),
        },
        { name: 'effectiveDate', _type: 'DatePicker' },
        { name: 'empty1', _type: 'empty' },
        { name: 'empty2', _type: 'empty' },
        { name: 'empty2', _type: 'empty', show: readOnly },
        {
          name: 'remarkMeaning',
          renderer: ({ value, record }) => (record ? value || record.get('remark') : value),
          _type: 'TextArea',
          colSpan: 2,
          rowSpan: 2,
          resize: 'both',
        },
        // {
        //   name: 'enableFlag',
        //   _type: 'Switch',
        //   renderer: ({ value }) =>
        //     value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否'),
        // },
      ].filter((f) => f.show !== false)}
      dataSet={initDs}
      columns={3}
    />
  );
});
