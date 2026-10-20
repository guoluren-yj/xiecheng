import React, { useMemo } from 'react';
import { yesOrNoRender } from 'utils/renderer';
import { Table, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = ({
  dimensionGroupLineDs,
  // budgetTemplateId,
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'budgetItemCode',
        width: 150,
      },
      {
        name: 'budgetItemName',
        width: 150,
      },
      {
        name: 'gridSeq',
        width: 80,
      },
      {
        name: 'gridWidth',
        width: 80,
      },
      {
        name: 'requiredFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'queryFlag',
        width: 160,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'multipleFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'budgetFlag',
        width: 160,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
  });

  return (
    <Table
      style={{ maxHeight: '420px' }}
      dataSet={dimensionGroupLineDs}
      columns={columns}
      buttons={[]}
      customizable
      customizedCode="SBUD_BUDGET_TEMPLATE.GROUP_LIST"
    />
  );
};

export default Index;
