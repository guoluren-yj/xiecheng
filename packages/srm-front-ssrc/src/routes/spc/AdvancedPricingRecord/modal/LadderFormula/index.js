import React, { useMemo, useEffect } from 'react';
import {
  useDataSet,
  Table,
} from 'choerodon-ui/pro';
import { FormulaRender } from '@/routes/spc/FormulaManage/utils';

import { TableDS } from './store';

const Index = (props) => {
  const { record } = props;
  const tableDs = useDataSet(() => TableDS());

  useEffect(() => {
    tableDs.loadData(record.get('priceLadderLineList') || []);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'ladderFrom',
        width: 150,
      },
      {
        name: 'ladderTo',
        width: 150,
      },
      {
        name: 'operationalFormulaName',
        renderer: ({ value }) => FormulaRender(value),
      },
      {
        name: 'calculatePrice',
        width: 150,
      },
    ],
    []
  );

  return (
    <Table
      customizable
      customizedCode="SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.LADDER_FORMULA_TABLE"
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 178px)' }}
    />
  );
};

export default Index;
