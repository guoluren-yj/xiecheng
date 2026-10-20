/*
 * @Date: 2024-03-15 10:32:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import GeneralForm from '@/routes/components/GeneralForm';

const Index = ({ dataSet, isEdit }) => {
  const fields = [
    {
      name: 'strategyCode',
    },
    {
      name: 'strategyName',
      componentType: 'INTLFIELD',
    },
    {
      name: 'orderSeq',
      componentType: 'NUMBERFIELD',
    },
    {
      name: 'mustProcess',
      componentType: 'SELECT',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: intl
        .get('sslm.supplierLifePolicyConfig.modal.field.strategyControlModeHelp')
        .d(
          '配置两个阶段之间如果未创建流程线时，是否允许手工发起升降级。如果管控要求不严格，大多数阶段之间都无条件允许手工发起，建议选择“无流程线时允许手工发起”'
        ),
    },
  ];
  return (
    <Spin dataSet={dataSet}>
      <GeneralForm dataSet={dataSet} fields={fields} isEdit={isEdit} />
    </Spin>
  );
};

export default Index;
