import React, { useMemo } from 'react';
import {
  useDataSet,
  Table,
} from 'choerodon-ui/pro';
import { PriceSourceType } from '../../enum';

import { TableDS } from './store';

const Index = (props) => {
  const { record: propsRecord } = props;
  const { recordId, priceSourceType } = propsRecord?.toData() || {};
  const tableDs = useDataSet(() => TableDS(recordId), [recordId]);

  const columns = useMemo(
    () => [
      // {
      //   name: 'sourceNum',
      //   width: 150,
      // },
      // {
      //   name: 'sourceLineNum',
      //   width: 150,
      // },
      priceSourceType === PriceSourceType.SOURCE_PRICE ? {
        name: 'sourceBenchmarkPrice',
        width: 150,
      } : {
        name: 'priceLibCode',
        width: 150,
      },
      {
        name: 'discountRuleCode',
        width: 150,
      },
      {
        name: 'discountRuleVersion',
        width: 150,
      },
      {
        name: 'discountScenarioName',
        width: 150,
      },
      {
        name: 'cumulativePrice',
        width: 150,
      },
      {
        name: 'discountPrice',
        width: 150,
      },
    ],
    []
  );

  return (
    <Table
      customizable
      customizedCode={`SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.${priceSourceType}_TABLE`}
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 178px)' }}
    />
  );
};

export default Index;
