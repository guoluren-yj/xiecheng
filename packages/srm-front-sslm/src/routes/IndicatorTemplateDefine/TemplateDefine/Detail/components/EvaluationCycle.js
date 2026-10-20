/*
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import GeneralForm from '@/routes/components/GeneralForm';

const EvaluationCycle = observer(({ dataSet, isEdit }) => {
  const initiateType = dataSet?.current?.get('initiateType');
  const manualFlag = initiateType === 'MANUAL'; // 手工发起
  const fields = [
    {
      name: 'initiateType',
      componentType: 'SELECT',
    },
    {
      name: 'evalCycle',
      componentType: 'SELECT',
      optionsFilter: record => record.get('value') !== 'CUSTOM',
    },
    {
      name: 'evalName',
    },
    {
      name: 'leadingCadreId',
      componentType: 'LOV',
      hidden: manualFlag,
    },
    {
      name: 'evalDateFrom',
      componentType: 'DATEPICKER',
      hidden: manualFlag,
    },
    {
      name: 'evalDateTo',
      componentType: 'DATEPICKER',
      hidden: manualFlag,
    },
    {
      name: 'evalInitTgrDate',
      componentType: 'DATEPICKER',
      hidden: manualFlag,
    },
    {
      name: 'evalTgrHour',
      componentType: 'SELECT',
      hidden: manualFlag,
    },
    {
      name: 'evalTgrExecuteDate',
      hidden: manualFlag,
      componentType: 'DATEPICKER',
    },
    {
      name: 'evalDimension',
      componentType: 'SELECT',
      hidden: manualFlag,
    },
    {
      name: 'evalDimensionValue',
      componentType: 'LOV',
      hidden: manualFlag,
    },
  ];

  return <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />;
});

export default EvaluationCycle;
