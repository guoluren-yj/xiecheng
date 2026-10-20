/*
 * @Date: 2023-10-20 17:14:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { renderStatus } from '@/routes/components/utils';
import GeneralForm from '@/routes/components/GeneralForm';
import { rangeDateRender } from '@/routes/components/utils/utils';

const Basic = observer(({ dataSet, custLoading, customizeForm }) => {
  const { evalTplType, evalStatus, allowAppealFlag } =
    dataSet?.current?.get(['evalTplType', 'evalStatus', 'allowAppealFlag']) || {};
  const showFlag = useMemo(
    () => ['FINAL_COLLECTED', 'APPROVING', 'PUBLISHED', 'COMPLETED'].includes(evalStatus),
    [evalStatus]
  );

  const fields = [
    {
      name: 'evalNum',
    },
    {
      name: 'evalName',
    },
    {
      name: 'evalStatus',
      renderer: renderStatus,
    },
    {
      name: 'evalTplName',
    },
    {
      name: 'evalDimensionMeaning',
    },
    {
      name: 'evalDimensionValueMeaning',
    },
    {
      name: 'evalCycleMeaning',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'createdUserName',
    },
    {
      name: 'evalDate',
      renderer: ({ record }) => {
        const { evalDateFrom, evalDateTo } = record?.get(['evalDateFrom', 'evalDateTo']) || {};
        return rangeDateRender(evalDateFrom, evalDateTo, DEFAULT_DATE_FORMAT);
      },
    },
    {
      name: 'docTypeMeaning',
      hidden: evalTplType !== 'BDKPI_EVAL',
    },
    {
      name: 'docNum',
      hidden: evalTplType !== 'BDKPI_EVAL',
    },
    {
      name: 'appealDeadlineMeaning',
      hidden: !allowAppealFlag,
    },
    {
      name: 'appealDeadlineTime',
      hidden: !allowAppealFlag,
    },
    {
      name: 'appealLimitMeaning',
      hidden: !allowAppealFlag,
    },
    {
      name: 'useTimes',
      hidden: !allowAppealFlag,
    },
    {
      name: 'evalRuleRemark',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'remark',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'evalResultRemark',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
      hidden: !showFlag,
    },
  ];

  return (
    <GeneralForm
      dataSet={dataSet}
      fields={fields}
      isEdit={false}
      custLoading={custLoading}
      customizeForm={customizeForm}
      customizeUnitCode="SSLM.APPRAISAL_SUPPLIER_DETAIL.BASIC"
    />
  );
});

export default Basic;
