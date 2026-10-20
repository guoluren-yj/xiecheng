/*
 * @Date: 2023-11-03 17:06:52
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isNil } from 'lodash';
import { observer } from 'mobx-react-lite';

import { yesOrNoRender } from 'utils/renderer';

import { renderStatus } from '@/routes/components/utils';
import GeneralForm from '@/routes/components/GeneralForm';

const Basic = observer(
  ({ dataSet, baseInfoEdit, readOnlyFlag, custLoading, customizeForm, customizeUnitCode }) => {
    const { evalCycle, evalStatus, evalTplType, allowAppealFlag, evalDimension } =
      dataSet?.current?.get([
        'evalCycle',
        'evalStatus',
        'evalTplType',
        'allowAppealFlag',
        'evalDimension',
      ]) || {};

    const fields = [
      {
        name: 'evalNum',
      },
      {
        name: 'evalName',
      },
      {
        name: 'evalStatus',
        componentType: 'SELECT',
        renderer: renderStatus,
      },
      {
        name: 'evalTplId',
        componentType: 'LOV',
      },
      {
        name: 'evalDimension',
        componentType: 'SELECT',
      },
      {
        name: 'evalDimensionValue',
        componentType: 'LOV',
        hidden: isNil(evalDimension),
      },
      {
        name: 'evalCycle',
        componentType: 'SELECT',
        optionsFilter: record => {
          // 模板类型为“供应商自动考评”时,过滤掉“自定义”
          if (evalTplType === 'GYSKP_AUTO') {
            return !['CUSTOM'].includes(record.get('value'));
          } else {
            return record.get('value');
          }
        },
      },
      {
        name: 'combineTimeUnit',
        componentType: 'SELECT',
        hidden: !evalCycle || evalCycle === 'CUSTOM',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'createdUserName',
      },
      {
        name: 'evalDate',
        componentType: 'DATEPICKER',
      },
      {
        name: 'kpiMethod',
        componentType: 'SELECT',
      },
      {
        name: 'docType',
        componentType: 'SELECT',
        hidden: evalTplType !== 'BDKPI_EVAL',
      },
      {
        name: 'docNum',
        componentType: 'LOV',
        hidden: evalTplType !== 'BDKPI_EVAL',
      },
      {
        name: 'autoPushVendorFlag',
        componentType: 'CHECKBOX',
        renderer: ({ value }) => yesOrNoRender(value),
        hidden: !['APPROVING', 'PUBLISHED', 'COMPLETED'].includes(evalStatus),
      },
      {
        name: 'processUnitId',
        componentType: 'LOV',
      },
      {
        name: 'informUserIds',
        componentType: 'LOV',
        hidden: ![
          'FINAL_COLLECTED',
          'APPROVING',
          'REJECTED',
          'PUBLISHED',
          'COMPLETED',
          'PARTIAL_PUBLISHED',
          'SUPPLIER_CONFIRMED',
          'APPEALING',
        ].includes(evalStatus),
      },
      {
        name: 'appealDeadline',
        hidden: !allowAppealFlag,
        componentType: 'SELECT',
      },
      {
        name: 'appealDeadlineTime',
        hidden: !allowAppealFlag,
        componentType: 'DATETIMEPICKER',
      },
      {
        name: 'appealLimit',
        hidden: !allowAppealFlag,
        componentType: 'SELECT',
      },
      {
        name: 'evalRuleRemark',
        newLine: true,
        rows: 3,
        colSpan: 2,
        resize: 'vertical',
        componentType: 'TEXTAREA',
      },
      {
        name: 'remark',
        newLine: true,
        rows: 3,
        colSpan: 2,
        resize: 'vertical',
        componentType: 'TEXTAREA',
      },
      {
        name: 'evalResultRemark',
        newLine: true,
        rows: 3,
        colSpan: 2,
        resize: 'vertical',
        componentType: 'TEXTAREA',
        hidden: !['FINAL_COLLECTED', 'APPROVING', 'PUBLISHED', 'COMPLETED', 'REJECTED'].includes(
          evalStatus
        ),
      },
    ];

    return (
      <GeneralForm
        dataSet={dataSet}
        fields={fields}
        isEdit={baseInfoEdit}
        custLoading={custLoading}
        readOnlyFlag={readOnlyFlag}
        customizeForm={customizeForm}
        customizeUnitCode={customizeUnitCode}
      />
    );
  }
);

export default Basic;
