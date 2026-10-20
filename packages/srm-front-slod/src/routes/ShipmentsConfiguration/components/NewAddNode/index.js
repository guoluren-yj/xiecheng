import React, { useEffect } from 'react';

import { Table } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { observer } from 'mobx-react-lite';

function NewAddNode(props) {
  const {
    urlFlag,
    strategyLineId,
    strategyHeaderId,
    useSpin = (e) => e,
    destroyModal = (e) => e,
    saveLineCharts = (e) => e,
    publicuFunction = (e) => e,
    queryFlowChartsInfo = (e) => e,
  } = props;

  useEffect(() => {
    props.tableDs.reset();
    props.tableDs.setQueryParameter('params', {
      asyncCountFlag: 'DEFAULT',
      lovCode: 'SLOD.NODE_CONFIG',
    });
    props.tableDs.query();
  }, []);

  const onRows = (record) => {
    const { nodeConfigId, nodeTemplateCode } = record.data || {};
    const params = {
      nodeConfigId,
      strategyHeaderId,
      sourceStrategyLineId: strategyLineId,
      receiveStrategyFlag: ['ASN'].includes(nodeTemplateCode) ? '1' : '0',
      overReceiveRule: ['ASN', 'PLAN'].includes(nodeTemplateCode) ? 'NOT_ALLOWED' : 'NONE',
      nodeQuantityOccupyStrategy: ['ASN', 'PLAN'].includes(nodeTemplateCode)
        ? 'CUR_AND_DOWNSTREAM'
        : 'CURRENT',
    };
    return {
      onClick: () => props.tableDs.select(record),
      onDoubleClick: async () => {
        useSpin(true);
        try {
          const returnedValue = await saveLineCharts(params);
          const res = getResponse(returnedValue);
          if (getResponse(res)) {
            const dataValue = await queryFlowChartsInfo({ urlFlag, strategyHeaderId });
            const rec = getResponse(dataValue);
            if (getResponse(rec)) {
              publicuFunction(rec);
              destroyModal();
            }
          }
        } catch (e) {
          throw e;
        } finally {
          useSpin(false);
        }
      },
    };
  };

  const columns = [
    {
      name: 'nodeConfigCode',
      with: 100,
    },
    {
      name: 'nodeConfigName',
      with: 100,
    },
  ];

  return (
    <>
      <Table
        onRow={({ record }) => onRows(record)}
        queryFieldsLimit={2}
        columns={columns}
        dataSet={props.tableDs}
      />
    </>
  );
}

export default observer(NewAddNode);
