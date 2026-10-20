/*
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isNil } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import GeneralForm from '@/routes/components/GeneralForm';

const SummaryRule = ({ dataSet, isEdit }) => {
  const fields = [
    {
      name: 'indCalMethod',
      componentType: 'SELECT',
    },
    {
      name: 'autoCollectFlag',
      componentType: 'CHECKBOX',
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
  ];

  return <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />;
};

export default SummaryRule;
