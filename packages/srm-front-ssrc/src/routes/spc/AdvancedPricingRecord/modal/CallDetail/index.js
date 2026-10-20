import React, { useMemo, useCallback } from 'react';
import {
  useDataSet,
} from 'choerodon-ui/pro';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { ViewLinkRender } from '../../utils';

import { TableDS } from './store';
import CalcDetail from '../CalcDetail';

const Index = (props) => {
  const { record: propsRecord, isAdjust } = props;
  const { recordId, callResult } = propsRecord?.get(['recordId', 'callResult']);
  const tableDs = useDataSet(() => TableDS(recordId, isAdjust), [recordId, isAdjust]);

  const getModalpRrops = useCallback(() => {
    if (!tableDs?.current) return;
    const record = tableDs.current;
    return {
      title: intl.get(`spc.advancedPricingRecord.model.calcDetail`).d('计算明细'),
      children: <CalcDetail record={record} isAdjust={isAdjust} />,
      width: '1090px',
    };
  });

  const columns = useMemo(
    () => [
      {
        name: 'lineNum',
        width: 150,
      },
      ...isAdjust ? [
        {
          name: 'priceTemplateCode',
          width: 150,
        },
        {
          name: 'priceLibCode',
          width: 150,
        }] :
        [
          //   {
          //   name: 'sourceNum',
          //   width: 150,
          // },
          // {
          //   name: 'sourceLineNum',
          //   width: 150,
          // }
        ]
      ,
      {
        name: 'calcDetail',
        width: 130,
        renderer: ({ record }) => {
          // if (callResult === 'ERROR' || isNil(record.get('calculatePrice'))) { return '-'; }
          return ViewLinkRender(getModalpRrops());
        },
      },
      {
        name: 'calculatePrice',
        width: 130,
      },
    ],
    []
  );

  return (
    <FilterBarTable
      customizable
      customizedCode={`SPC.ADVANCED_PRICING_RECORD.${isAdjust ? 'ADJUST' : 'ADVANCED'}_TAB.CAll_DETAIL_TABLE`}
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 178px)' }}
      filterBarConfig={{
        autoQuery: true,
        collpaseble: false,
        sortFieldName: 'orderField',
        defaultSortedField: 'lineNum',
        defaultSortedOrder: 'asc',
      }}
    />
  );
};

export default Index;
